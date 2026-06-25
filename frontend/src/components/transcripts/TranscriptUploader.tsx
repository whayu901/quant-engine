import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import {
  Upload, FileAudio, FileVideo, File, X, CheckCircle,
  AlertCircle, Zap, Clock, Globe, Smartphone, Loader
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
    if (type.startsWith('audio/')) return <FileAudio className="w-5 h-5" />;
    if (type.startsWith('video/')) return <FileVideo className="w-5 h-5" />;
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
        return <Loader className="w-5 h-5 text-velocity-blue animate-spin" />;
      default:
        return <Clock className="w-5 h-5 text-slate-400" />;
    }
  };

  const totalProgress = files.length > 0
    ? files.reduce((acc, f) => acc + f.progress, 0) / files.length
    : 0;

  const allCompleted = files.length > 0 && files.every(f => f.status === 'completed');
  const hasErrors = files.some(f => f.status === 'error');

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="w-full max-w-4xl mx-auto"
    >
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                Upload Transcripts
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Upload audio or video files for AI transcription
              </p>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            )}
          </div>
        </div>

        {/* Upload Area */}
        <div className="p-6">
          <div
            {...getRootProps()}
            className={cn(
              'relative border-2 border-dashed rounded-xl p-8',
              'transition-all cursor-pointer',
              isDragActive
                ? 'border-velocity-blue bg-velocity-blue/5'
                : 'border-slate-300 hover:border-velocity-blue hover:bg-slate-50'
            )}
          >
            <input {...getInputProps()} />

            <div className="text-center">
              <motion.div
                animate={isDragActive ? { scale: 1.1 } : { scale: 1 }}
                className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-velocity-blue/10 to-neural-purple/10 rounded-full mb-4"
              >
                <Upload className="w-8 h-8 text-velocity-blue" />
              </motion.div>

              <p className="text-lg font-medium text-slate-900 mb-2">
                {isDragActive
                  ? 'Drop your files here'
                  : 'Drag & drop your recordings here'
                }
              </p>
              <p className="text-sm text-slate-600 mb-4">
                or <span className="text-velocity-blue font-medium">browse files</span>
              </p>

              <div className="flex flex-wrap justify-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <FileAudio className="w-4 h-4" />
                  Audio: MP3, WAV, M4A
                </span>
                <span className="flex items-center gap-1">
                  <FileVideo className="w-4 h-4" />
                  Video: MP4, MOV, AVI
                </span>
                <span className="flex items-center gap-1">
                  <Globe className="w-4 h-4" />
                  All SEA languages
                </span>
              </div>

              {/* Mobile Upload Option */}
              <div className="mt-6 pt-6 border-t border-slate-200">
                <button
                  onClick={() => setShowMobileQR(true)}
                  className="inline-flex items-center gap-2 text-sm text-velocity-blue hover:text-velocity-blue-dark font-medium"
                >
                  <Smartphone className="w-4 h-4" />
                  Upload from phone
                </button>
              </div>
            </div>
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-slate-900">
                  Files ({files.length})
                </h3>
                {files.length > 0 && !isUploading && !allCompleted && (
                  <button
                    onClick={() => setFiles([])}
                    className="text-sm text-slate-500 hover:text-slate-700"
                  >
                    Clear all
                  </button>
                )}
              </div>

              <AnimatePresence>
                {files.map((file) => (
                  <motion.div
                    key={file.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    className="bg-slate-50 rounded-xl p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        {getFileIcon(file.type)}
                        <div>
                          <p className="text-sm font-medium text-slate-900">
                            {file.name}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-slate-500">
                            <span>{formatFileSize(file.size)}</span>
                            {file.duration && (
                              <span>{formatDuration(file.duration)}</span>
                            )}
                            {file.languagesDetected && (
                              <span className="flex items-center gap-1">
                                <Globe className="w-3 h-3" />
                                {file.languagesDetected.join(', ')}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {getStatusIcon(file.status)}
                        {file.status === 'waiting' && !isUploading && (
                          <button
                            onClick={() => removeFile(file.id)}
                            className="p-1 hover:bg-slate-200 rounded-lg transition-colors"
                          >
                            <X className="w-4 h-4 text-slate-500" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Progress Bar */}
                    {(file.status === 'uploading' || file.status === 'processing') && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                          <span>
                            {file.status === 'uploading' ? 'Uploading' : 'Processing'}
                          </span>
                          <span>{file.progress}%</span>
                        </div>
                        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-gradient-to-r from-velocity-blue to-neural-purple"
                            initial={{ width: '0%' }}
                            animate={{ width: `${file.progress}%` }}
                            transition={{ duration: 0.3 }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Status Messages */}
                    {file.status === 'completed' && (
                      <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
                        <Zap className="w-4 h-4" />
                        <span>Transcription complete!</span>
                      </div>
                    )}

                    {file.status === 'error' && (
                      <div className="mt-2 text-sm text-red-600">
                        {file.error}
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Overall Progress */}
              {isUploading && files.length > 1 && (
                <div className="mt-4 p-4 bg-gradient-to-r from-velocity-blue/5 to-neural-purple/5 rounded-xl">
                  <div className="flex items-center justify-between text-sm text-slate-700 mb-2">
                    <span className="font-medium">Overall Progress</span>
                    <span>{Math.round(totalProgress)}%</span>
                  </div>
                  <div className="h-2 bg-white rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-velocity-blue to-neural-purple"
                      initial={{ width: '0%' }}
                      animate={{ width: `${totalProgress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 rounded-b-2xl">
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-600">
              {allCompleted && (
                <span className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  All files transcribed successfully!
                </span>
              )}
              {hasErrors && (
                <span className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  Some files failed to process
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              {onClose && (
                <Button
                  variant="ghost"
                  onClick={onClose}
                  disabled={isUploading}
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
                >
                  {isUploading ? 'Processing...' : `Process ${files.length} ${files.length === 1 ? 'File' : 'Files'}`}
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
                >
                  View Transcripts
                  <Zap className="ml-2 w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile QR Modal */}
      {showMobileQR && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowMobileQR(false)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="bg-white rounded-2xl p-6 max-w-sm w-full"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Upload from Phone
            </h3>
            <div className="bg-slate-100 rounded-xl p-8 mb-4">
              {/* QR Code Placeholder */}
              <div className="w-48 h-48 bg-slate-300 rounded-lg mx-auto" />
            </div>
            <p className="text-sm text-slate-600 text-center mb-4">
              Scan this QR code with your phone to upload recordings directly
            </p>
            <Button
              variant="secondary"
              onClick={() => setShowMobileQR(false)}
              className="w-full"
            >
              Close
            </Button>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
};