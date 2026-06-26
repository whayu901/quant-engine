import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  X, Play, Pause, Volume2, Clock, User, Globe,
  MessageSquare, ChevronLeft, ChevronRight, ExternalLink,
  Copy, CheckCircle, TrendingUp, TrendingDown, Minus
} from 'lucide-react';
import { Evidence, Sentiment } from '../../types/api';
import { Button } from '../../components/ui/Button';
import { formatTimestamp } from '../../lib/utils/format';
import { cn } from '../../lib/utils';

interface EvidencePanelProps {
  evidence: Evidence[];
  onClose: () => void;
  projectId: string;
}

export const EvidencePanel: React.FC<EvidencePanelProps> = ({
  evidence,
  onClose,
  projectId
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const audioRef = React.useRef<HTMLAudioElement>(null);

  const currentEvidence = evidence[currentIndex];

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.currentTime = currentEvidence.timestamp;
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handlePrevious = () => {
    setCurrentIndex(prev => Math.max(0, prev - 1));
    setIsPlaying(false);
  };

  const handleNext = () => {
    setCurrentIndex(prev => Math.min(evidence.length - 1, prev + 1));
    setIsPlaying(false);
  };

  const handleCopyQuote = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const getSentimentIcon = (sentiment?: Sentiment) => {
    switch (sentiment) {
      case 'positive':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'negative':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      case 'neutral':
        return <Minus className="w-4 h-4 text-slate-500" />;
      default:
        return null;
    }
  };

  const getSentimentLabel = (sentiment?: Sentiment) => {
    switch (sentiment) {
      case 'positive':
        return 'Positive';
      case 'negative':
        return 'Negative';
      case 'neutral':
        return 'Neutral';
      case 'mixed':
        return 'Mixed';
      default:
        return 'Unknown';
    }
  };

  if (evidence.length === 0) {
    return (
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="w-96 bg-white border-l border-slate-200 flex flex-col"
      >
        <div className="px-6 py-4 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">Evidence</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">No evidence available</p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      className="w-[480px] bg-white border-l border-slate-200 flex flex-col shadow-xl"
    >
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-slate-900">
            Evidence ({evidence.length})
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Navigation */}
        {evidence.length > 1 && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">
              Quote {currentIndex + 1} of {evidence.length}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4 text-slate-500" />
              </button>
              <button
                onClick={handleNext}
                disabled={currentIndex === evidence.length - 1}
                className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Current Evidence */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          {/* Quote Card */}
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-6 mb-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-2 h-full bg-gradient-to-b from-velocity-blue to-neural-purple rounded-full" />
              <div className="flex-1">
                <p className="text-lg text-slate-900 leading-relaxed italic">
                  "{currentEvidence.text}"
                </p>
              </div>
            </div>

            {/* Quote Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopyQuote(currentEvidence.text, currentEvidence.segment_id)}
                className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg transition-colors"
              >
                {copiedId === currentEvidence.segment_id ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy quote
                  </>
                )}
              </button>
              <button className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg transition-colors">
                <ExternalLink className="w-4 h-4" />
                View in transcript
              </button>
            </div>
          </div>

          {/* Metadata */}
          <div className="space-y-4 mb-6">
            <div className="flex items-center gap-3">
              <User className="w-4 h-4 text-slate-400" />
              <span className="text-sm text-slate-600">Speaker:</span>
              <span className="text-sm font-medium text-slate-900">
                {currentEvidence.speaker}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-slate-400" />
              <span className="text-sm text-slate-600">Timestamp:</span>
              <span className="text-sm font-medium text-slate-900">
                {formatTimestamp(currentEvidence.timestamp)}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-4 h-4 flex items-center justify-center">
                {getSentimentIcon(currentEvidence.sentiment)}
              </div>
              <span className="text-sm text-slate-600">Sentiment:</span>
              <span className="text-sm font-medium text-slate-900">
                {getSentimentLabel(currentEvidence.sentiment)}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <Globe className="w-4 h-4 text-slate-400" />
              <span className="text-sm text-slate-600">Confidence:</span>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-velocity-blue to-neural-purple"
                    initial={{ width: '0%' }}
                    animate={{ width: `${currentEvidence.confidence * 100}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <span className="text-sm font-medium text-slate-900">
                  {Math.round(currentEvidence.confidence * 100)}%
                </span>
              </div>
            </div>
          </div>

          {/* Audio Player */}
          <div className="bg-slate-100 rounded-xl p-4">
            <div className="flex items-center gap-4">
              <button
                onClick={handlePlayPause}
                className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-velocity-blue to-neural-purple text-white rounded-full hover:shadow-lg transition-all"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5 ml-0.5" />
                )}
              </button>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Volume2 className="w-4 h-4 text-slate-500" />
                  <span className="text-sm text-slate-700">
                    Jump to audio at {formatTimestamp(currentEvidence.timestamp)}
                  </span>
                </div>
                <div className="h-8 bg-slate-200 rounded-lg overflow-hidden">
                  {/* Waveform visualization placeholder */}
                  <div className="h-full flex items-end gap-0.5 px-2">
                    {Array.from({ length: 30 }).map((_, i) => (
                      <div
                        key={i}
                        className="flex-1 bg-gradient-to-t from-velocity-blue to-neural-purple rounded-t"
                        style={{
                          height: `${Math.random() * 100}%`,
                          opacity: 0.3 + Math.random() * 0.7
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Hidden audio element */}
          <audio
            ref={audioRef}
            src={`/api/v1/transcripts/${currentEvidence.segment_id}/audio`}
            onEnded={() => setIsPlaying(false)}
          />
        </div>

        {/* Other Evidence in List */}
        {evidence.length > 1 && (
          <div className="px-6 pb-6">
            <h4 className="text-sm font-semibold text-slate-900 mb-3">
              All Evidence
            </h4>
            <div className="space-y-2">
              {evidence.map((item, index) => (
                <button
                  key={item.segment_id}
                  onClick={() => {
                    setCurrentIndex(index);
                    setIsPlaying(false);
                  }}
                  className={cn(
                    'w-full text-left p-3 rounded-lg border transition-all',
                    index === currentIndex
                      ? 'bg-velocity-blue/5 border-velocity-blue'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  )}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-xs font-medium text-slate-500">
                      {index + 1}.
                    </span>
                    <div className="flex-1">
                      <p className="text-sm text-slate-700 line-clamp-2">
                        "{item.text}"
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-slate-500">
                          {item.speaker}
                        </span>
                        <span className="text-xs text-slate-400">•</span>
                        <span className="text-xs text-slate-500">
                          {formatTimestamp(item.timestamp)}
                        </span>
                        {item.sentiment && (
                          <>
                            <span className="text-xs text-slate-400">•</span>
                            {getSentimentIcon(item.sentiment)}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="px-6 py-4 border-t border-slate-200 bg-slate-50">
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            className="flex-1"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Add to Report
          </Button>
          <Button
            variant="speed"
            size="sm"
            className="flex-1"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            View Full Transcript
          </Button>
        </div>
      </div>
    </motion.div>
  );
};