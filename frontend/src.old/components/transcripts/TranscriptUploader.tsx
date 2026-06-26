import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import {
  Upload, FileAudio, FileVideo, File, X, CheckCircle,
  AlertCircle, Zap, Clock, Globe, Smartphone, Loader,
  Sparkles, CloudUpload, Music, Film, Languages,
  Wifi, Shield, ArrowRight, Info, Mic, Headphones
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useWebSocket } from '../../hooks/useWebSocket';
import { formatFileSize, formatDuration } from '../../lib/utils/format';
import api from '../../lib/api/client';
import { cn } from '../../lib/utils';

interface UploadFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  status: 'waiting' | 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
  duration?: number;
  error?: string;
  transcriptId?: string;
  languagesDetected?: string[];
}

interface TranscriptUploaderProps {
  projectId: string;
  onUploadComplete?: (transcriptIds: string[]) => void;
  onClose?: () => void;
}

export const TranscriptUploader: React.FC<TranscriptUploaderProps> = ({
  projectId,
  onUploadComplete,
  onClose
}) => {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showMobileQR, setShowMobileQR] = useState(false);
  const [activeTab, setActiveTab] = useState<'upload' | 'record'>('upload');
  const uploadRef = useRef<AbortController | null>(null);

  // WebSocket for real-time progress
  const { sendMessage, lastMessage } = useWebSocket(`/ws/projects/${projectId}/upload`);

  // Handle WebSocket messages
  React.useEffect(() => {
    if (lastMessage) {
      const data = JSON.parse(lastMessage.data);
      if (data.type === 'transcription.progress') {
        updateFileProgress(data.fileId, data.progress, 'processing');
      } else if (data.type === 'transcription.complete') {
        updateFileComplete(data.fileId, data.transcriptId, data.languages);
      } else if (data.type === 'transcription.error') {
        updateFileError(data.fileId, data.error);
      }
    }
  }, [lastMessage]);

  const updateFileProgress = (fileId: string, progress: number, status: UploadFile['status']) => {
    setFiles(prev => prev.map(f =>
      f.id === fileId ? { ...f, progress, status } : f
    ));
  };

  const updateFileComplete = (fileId: string, transcriptId: string, languages?: string[]) => {
    setFiles(prev => prev.map(f =>
      f.id === fileId
        ? { ...f, status: 'completed', progress: 100, transcriptId, languagesDetected: languages }
        : f
    ));
  };

  const updateFileError = (fileId: string, error: string) => {
    setFiles(prev => prev.map(f =>
      f.id === fileId ? { ...f, status: 'error', error } : f
    ));
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: UploadFile[] = acceptedFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'waiting' as const,
      progress: 0
    }));

    setFiles(prev => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'audio/*': ['.mp3', '.wav', '.m4a', '.ogg', '.aac', '.wma'],
      'video/*': ['.mp4', '.avi', '.mov', '.mkv', '.webm']
    },
    maxSize: 500 * 1024 * 1024, // 500MB
    multiple: true
  });

  const uploadFile = async (uploadFile: UploadFile) => {
    const formData = new FormData();
    formData.append('file', uploadFile.file);
    formData.append('project_id', projectId);

    try {
      // Update status to uploading
      updateFileProgress(uploadFile.id, 0, 'uploading');

      // Create abort controller
      uploadRef.current = new AbortController();

      const response = await api.post(
        `/projects/${projectId}/media`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          signal: uploadRef.current.signal,
          onUploadProgress: (progressEvent) => {
            const progress = progressEvent.total
              ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
              : 0;
            updateFileProgress(uploadFile.id, progress, 'uploading');
          }
        }
      );

      // Update to processing
      updateFileProgress(uploadFile.id, 100, 'processing');

      // WebSocket will handle the rest
      sendMessage({
        type: 'track_transcription',
        fileId: uploadFile.id,
        mediaId: response.data.id
      });

    } catch (error: any) {
      if (error.name === 'AbortError') {
        updateFileError(uploadFile.id, 'Upload cancelled');
      } else {
        updateFileError(uploadFile.id, error.response?.data?.error || 'Upload failed');
      }
    }
  };

  const startUpload = async () => {
    setIsUploading(true);
    const waitingFiles = files.filter(f => f.status === 'waiting');

    // Upload files sequentially to avoid overwhelming the server
    for (const file of waitingFiles) {
      await uploadFile(file);
    }

    setIsUploading(false);

    // Check if all files are complete
    const completedFiles = files.filter(f => f.status === 'completed');
    if (completedFiles.length === files.length && onUploadComplete) {
      const transcriptIds = completedFiles
        .map(f => f.transcriptId)
        .filter(Boolean) as string[];
      onUploadComplete(transcriptIds);
    }
  };

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const cancelUpload = () => {
    if (uploadRef.current) {
      uploadRef.current.abort();
    }
    setIsUploading(false);
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('audio/')) return <Music className="w-5 h-5" />;
    if (type.startsWith('video/')) return <Film className="w-5 h-5" />;
    return <File className="w-5 h-5" />;
  };

  const getStatusIcon = (status: UploadFile['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'uploading':
      case 'processing':
        return <Loader className="w-5 h-5 text-primary-600 animate-spin" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const totalProgress = files.length > 0
    ? files.reduce((acc, f) => acc + f.progress, 0) / files.length
    : 0;

  const allCompleted = files.length > 0 && files.every(f => f.status === 'completed');
  const hasErrors = files.some(f => f.status === 'error');

  // Features showcase
  const features = [
    { icon: <Languages className="w-4 h-4" />, label: 'Multi-language', desc: 'SEA languages' },
    { icon: <Zap className="w-4 h-4" />, label: 'Fast Processing', desc: '10x faster' },
    { icon: <Shield className="w-4 h-4" />, label: 'Secure', desc: 'End-to-end encrypted' },
    { icon: <Wifi className="w-4 h-4" />, label: 'Real-time', desc: 'Live updates' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="w-full max-w-5xl mx-auto"
    >
      <div className="glass-card overflow-hidden">
        {/* Enhanced Header with Gradient */}
        <div className="relative px-6 py-6 border-b border-white/20 bg-gradient-to-r from-primary-50 to-purple-50">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 to-purple-500/5" />
          <div className="relative flex items-center justify-between">
            <div>
              <motion.h2
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent"
              >
                Upload & Transcribe
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="text-sm text-gray-600 mt-1"
              >
                AI-powered transcription with 98% accuracy across SEA languages
              </motion.p>
            </div>
            {onClose && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="p-2 hover:bg-white/50 rounded-xl transition-all"
              >
                <X className="w-5 h-5 text-gray-500" />
              </motion.button>
            )}
          </div>

          {/* Tab Navigation */}
          <div className="mt-4 flex gap-1 p-1 bg-white/50 backdrop-blur-sm rounded-xl w-fit">
            {[
              { id: 'upload', label: 'Upload Files', icon: <CloudUpload className="w-4 h-4" /> },
              { id: 'record', label: 'Record Audio', icon: <Mic className="w-4 h-4" /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'upload' | 'record')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-white text-primary-600 shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Features Bar */}
        <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {features.map((feature, index) => (
              <motion.div
                key={feature.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-2"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-primary-100 to-purple-100 rounded-lg flex items-center justify-center text-primary-600">
                  {feature.icon}
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-900">{feature.label}</p>
                  <p className="text-xs text-gray-500">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Upload Area */}
        <div className="p-6">
          {activeTab === 'upload' ? (
            <>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                {...getRootProps()}
                className={cn(
                  'relative border-2 border-dashed rounded-2xl p-8',
                  'transition-all cursor-pointer group',
                  isDragActive
                    ? 'border-primary-500 bg-gradient-to-br from-primary-50 to-purple-50'
                    : 'border-gray-300 hover:border-primary-400 hover:bg-gradient-to-br hover:from-gray-50 hover:to-primary-50'
                )}
              >
                <input {...getInputProps()} />

                <div className="text-center">
                  <motion.div
                    animate={isDragActive ? { scale: 1.2, rotate: 10 } : { scale: 1, rotate: 0 }}
                    transition={{ type: "spring", damping: 20 }}
                    className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-100 to-purple-100 rounded-2xl mb-4 group-hover:scale-110 transition-transform"
                  >
                    <CloudUpload className="w-10 h-10 text-primary-600" />
                  </motion.div>

                  <p className="text-xl font-bold text-gray-900 mb-2">
                    {isDragActive
                      ? '🎯 Drop your files here!'
                      : 'Drag & drop your recordings'}
                  </p>
                  <p className="text-sm text-gray-600 mb-6">
                    or <span className="text-primary-600 font-semibold cursor-pointer hover:text-primary-700">browse files</span> from your computer
                  </p>

                  <div className="flex flex-wrap justify-center gap-6 text-sm">
                    <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg">
                      <Music className="w-4 h-4 text-blue-600" />
                      <span className="text-blue-900 font-medium">Audio</span>
                      <span className="text-blue-700">MP3, WAV, M4A</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 bg-purple-50 rounded-lg">
                      <Film className="w-4 h-4 text-purple-600" />
                      <span className="text-purple-900 font-medium">Video</span>
                      <span className="text-purple-700">MP4, MOV, AVI</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-lg">
                      <Globe className="w-4 h-4 text-green-600" />
                      <span className="text-green-900 font-medium">Languages</span>
                      <span className="text-green-700">All SEA + Global</span>
                    </div>
                  </div>

                  {/* Mobile Upload Option */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="mt-6 pt-6 border-t border-gray-200"
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowMobileQR(true);
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all group"
                    >
                      <Smartphone className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                      <span className="font-medium">Upload from phone</span>
                      <Sparkles className="w-4 h-4" />
                    </button>
                  </motion.div>
                </div>
              </motion.div>

              {/* File List */}
              {files.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 space-y-3"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-gray-900">
                      Files Ready ({files.length})
                    </h3>
                    {files.length > 0 && !isUploading && !allCompleted && (
                      <button
                        onClick={() => setFiles([])}
                        className="text-sm text-gray-500 hover:text-red-600 transition-colors"
                      >
                        Clear all
                      </button>
                    )}
                  </div>

                  <AnimatePresence>
                    {files.map((file, index) => (
                      <motion.div
                        key={file.id}
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 50 }}
                        transition={{ delay: index * 0.05 }}
                        className={cn(
                          "relative rounded-xl p-4 border transition-all",
                          file.status === 'completed'
                            ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200"
                            : file.status === 'error'
                            ? "bg-gradient-to-r from-red-50 to-pink-50 border-red-200"
                            : file.status === 'processing' || file.status === 'uploading'
                            ? "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200"
                            : "bg-white border-gray-200 hover:border-primary-300"
                        )}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-10 h-10 rounded-lg flex items-center justify-center",
                              file.type.startsWith('audio/')
                                ? "bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-600"
                                : "bg-gradient-to-br from-purple-100 to-pink-100 text-purple-600"
                            )}>
                              {getFileIcon(file.type)}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-900">
                                {file.name}
                              </p>
                              <div className="flex items-center gap-3 text-xs text-gray-500">
                                <span className="font-medium">{formatFileSize(file.size)}</span>
                                {file.duration && (
                                  <>
                                    <span>•</span>
                                    <span className="flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {formatDuration(file.duration)}
                                    </span>
                                  </>
                                )}
                                {file.languagesDetected && file.languagesDetected.length > 0 && (
                                  <>
                                    <span>•</span>
                                    <span className="flex items-center gap-1">
                                      <Languages className="w-3 h-3" />
                                      {file.languagesDetected.join(', ')}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {getStatusIcon(file.status)}
                            {file.status === 'waiting' && !isUploading && (
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => removeFile(file.id)}
                                className="p-1 hover:bg-red-100 rounded-lg transition-colors group"
                              >
                                <X className="w-4 h-4 text-gray-500 group-hover:text-red-600" />
                              </motion.button>
                            )}
                          </div>
                        </div>

                        {/* Progress Bar */}
                        {(file.status === 'uploading' || file.status === 'processing') && (
                          <div className="mt-3">
                            <div className="flex items-center justify-between text-xs font-medium mb-1">
                              <span className="text-gray-700">
                                {file.status === 'uploading' ? 'Uploading...' : 'Processing with AI...'}
                              </span>
                              <span className="text-primary-600">{file.progress}%</span>
                            </div>
                            <div className="h-2 bg-white/80 rounded-full overflow-hidden">
                              <motion.div
                                className="h-full bg-gradient-to-r from-primary-500 to-purple-600"
                                initial={{ width: '0%' }}
                                animate={{ width: `${file.progress}%` }}
                                transition={{ duration: 0.3, ease: "easeOut" }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Status Messages */}
                        {file.status === 'completed' && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-3 flex items-center gap-2 text-sm text-green-700 font-medium"
                          >
                            <Sparkles className="w-4 h-4" />
                            <span>Transcription complete! Ready for analysis</span>
                          </motion.div>
                        )}

                        {file.status === 'error' && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-3 flex items-center gap-2 text-sm text-red-600"
                          >
                            <Info className="w-4 h-4" />
                            <span>{file.error}</span>
                          </motion.div>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {/* Overall Progress */}
                  {isUploading && files.length > 1 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 p-4 bg-gradient-to-r from-primary-50 to-purple-50 rounded-xl border border-primary-200"
                    >
                      <div className="flex items-center justify-between text-sm font-medium text-gray-700 mb-2">
                        <span className="flex items-center gap-2">
                          <Zap className="w-4 h-4 text-primary-600" />
                          Overall Progress
                        </span>
                        <span className="text-primary-600">{Math.round(totalProgress)}%</span>
                      </div>
                      <div className="h-3 bg-white rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-primary-500 to-purple-600"
                          initial={{ width: '0%' }}
                          animate={{ width: `${totalProgress}%` }}
                          transition={{ duration: 0.3, ease: "easeOut" }}
                        />
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </>
          ) : (
            /* Record Tab */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-100 to-pink-100 rounded-2xl mb-4">
                <Mic className="w-10 h-10 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Record Audio</h3>
              <p className="text-gray-600 mb-6">Direct recording feature coming soon</p>
              <Button variant="secondary" onClick={() => setActiveTab('upload')}>
                <CloudUpload className="w-4 h-4 mr-2" />
                Switch to Upload
              </Button>
            </motion.div>
          )}
        </div>

        {/* Enhanced Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-white rounded-b-2xl">
          <div className="flex items-center justify-between">
            <div className="text-sm">
              {allCompleted && (
                <motion.span
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2 text-green-600 font-medium"
                >
                  <CheckCircle className="w-4 h-4" />
                  All files transcribed successfully!
                </motion.span>
              )}
              {hasErrors && (
                <motion.span
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2 text-red-600 font-medium"
                >
                  <AlertCircle className="w-4 h-4" />
                  Some files failed to process
                </motion.span>
              )}
              {!allCompleted && !hasErrors && files.length > 0 && (
                <motion.span
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2 text-gray-600"
                >
                  <Info className="w-4 h-4" />
                  {isUploading ? 'Processing your files...' : 'Ready to process'}
                </motion.span>
              )}
            </div>

            <div className="flex items-center gap-3">
              {onClose && (
                <Button
                  variant="ghost"
                  onClick={onClose}
                  disabled={isUploading}
                  className="btn-ghost"
                >
                  {allCompleted ? 'Close' : 'Cancel'}
                </Button>
              )}

              {!allCompleted && files.length > 0 && (
                <Button
                  variant="speed"
                  onClick={isUploading ? cancelUpload : startUpload}
                  loading={isUploading}
                  disabled={files.every(f => f.status === 'completed' || f.status === 'error')}
                  className="btn-gradient"
                >
                  {isUploading ? (
                    <>
                      <Loader className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Process {files.length} {files.length === 1 ? 'File' : 'Files'}
                    </>
                  )}
                </Button>
              )}

              {allCompleted && (
                <Button
                  variant="speed"
                  onClick={() => {
                    const transcriptIds = files
                      .map(f => f.transcriptId)
                      .filter(Boolean) as string[];
                    if (onUploadComplete) {
                      onUploadComplete(transcriptIds);
                    }
                  }}
                  className="btn-gradient"
                >
                  View Transcripts
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile QR Modal with Enhanced Design */}
      <AnimatePresence>
        {showMobileQR && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowMobileQR(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
              className="glass-card max-w-sm w-full p-6"
              onClick={e => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-100 to-purple-100 rounded-2xl mb-4">
                  <Smartphone className="w-8 h-8 text-primary-600" />
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Upload from Phone
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                  Scan this QR code with your phone camera
                </p>

                <div className="bg-white rounded-2xl p-6 mb-6 border-2 border-gray-100">
                  {/* QR Code Placeholder */}
                  <div className="w-48 h-48 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl mx-auto animate-pulse" />
                </div>

                <div className="flex items-center justify-center gap-2 text-xs text-gray-500 mb-6">
                  <Shield className="w-3 h-3" />
                  <span>Secure end-to-end encrypted upload</span>
                </div>

                <Button
                  variant="secondary"
                  onClick={() => setShowMobileQR(false)}
                  className="w-full"
                >
                  Close
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};