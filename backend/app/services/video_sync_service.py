"""
Video Sync Service for Qual Engine
Synchronizes transcripts with video timeline for perfect alignment
Critical for SEA market with code-mixing text display
"""

import json
import logging
from pathlib import Path
from typing import Dict, List, Optional, Tuple
from datetime import datetime, timedelta
import re

from app.config import settings

logger = logging.getLogger(__name__)


class VideoSyncService:
    """
    Service for synchronizing transcripts with video timeline.
    Generates WebVTT, JSON timeline, and chapter markers.
    Handles SEA languages including code-mixing and RTL scripts.
    """

    def __init__(self):
        self.storage_path = Path(settings.STORAGE_PATH) / "sync"
        self.storage_path.mkdir(parents=True, exist_ok=True)

        # Language-specific settings
        self.rtl_languages = {'ar', 'he', 'ur'}  # Right-to-left languages
        self.sea_languages = {'id', 'ms', 'th', 'vi', 'tl', 'km', 'lo', 'my'}

    def sync_transcript_to_video(
        self,
        video_path: str,
        transcript_segments: List[Dict],
        language: str = 'en',
        include_speakers: bool = True,
        include_sentiment: bool = True
    ) -> Dict:
        """
        Create JSON timeline for frontend video player synchronization.
        Critical for SEA market: handles code-mixing text display.

        Args:
            video_path: Path to video file
            transcript_segments: List of transcript segments with timestamps
            language: Primary language code
            include_speakers: Include speaker labels
            include_sentiment: Include sentiment markers

        Returns:
            Dictionary with timeline, chapters, speakers, and VTT content
        """
        try:
            # Process segments
            timeline = self._create_timeline(transcript_segments, include_speakers, include_sentiment)

            # Generate chapters from significant moments
            chapters = self._generate_chapters(transcript_segments)

            # Extract unique speakers
            speakers = self._extract_speakers(transcript_segments)

            # Generate WebVTT content
            vtt_content = self._generate_webvtt(transcript_segments, language, include_speakers)

            # Generate SRT content (for compatibility)
            srt_content = self._generate_srt(transcript_segments, include_speakers)

            # Save files
            video_id = Path(video_path).stem
            vtt_path = self.storage_path / f"{video_id}.vtt"
            srt_path = self.storage_path / f"{video_id}.srt"
            timeline_path = self.storage_path / f"{video_id}_timeline.json"

            # Write VTT file
            with open(vtt_path, 'w', encoding='utf-8') as f:
                f.write(vtt_content)

            # Write SRT file
            with open(srt_path, 'w', encoding='utf-8') as f:
                f.write(srt_content)

            # Save timeline JSON
            timeline_data = {
                'timeline': timeline,
                'chapters': chapters,
                'speakers': speakers,
                'language': language,
                'has_code_mixing': self._detect_code_mixing(transcript_segments),
                'generated_at': datetime.utcnow().isoformat(),
                'version': '1.0.0'
            }

            with open(timeline_path, 'w', encoding='utf-8') as f:
                json.dump(timeline_data, f, ensure_ascii=False, indent=2)

            # Return complete sync data
            return {
                'timeline': timeline,
                'chapters': chapters,
                'speakers': speakers,
                'vtt_content': vtt_content,
                'srt_content': srt_content,
                'vtt_path': str(vtt_path),
                'srt_path': str(srt_path),
                'timeline_path': str(timeline_path),
                'has_code_mixing': timeline_data['has_code_mixing'],
                'language': language
            }

        except Exception as e:
            logger.error(f"Error syncing transcript to video: {str(e)}")
            return self._generate_fallback_sync()

    def _create_timeline(
        self,
        segments: List[Dict],
        include_speakers: bool,
        include_sentiment: bool
    ) -> List[Dict]:
        """Create detailed timeline with all metadata"""
        timeline = []

        for i, segment in enumerate(segments):
            entry = {
                'id': f"segment_{i}",
                'start': segment.get('start', 0),
                'end': segment.get('end', 0),
                'text': segment.get('text', ''),
                'words': segment.get('words', [])  # Word-level timing if available
            }

            # Add speaker info
            if include_speakers and 'speaker' in segment:
                entry['speaker'] = segment['speaker']

            # Add sentiment if available
            if include_sentiment and 'sentiment' in segment:
                entry['sentiment'] = segment['sentiment']
                entry['sentiment_score'] = segment.get('sentiment_score', 0)

            # Add language detection for code-mixing
            if 'language' in segment:
                entry['language'] = segment['language']
            elif 'languages' in segment:  # Multiple languages detected
                entry['languages'] = segment['languages']

            # Add confidence score
            if 'confidence' in segment:
                entry['confidence'] = segment['confidence']

            # Mark important segments
            if self._is_important_segment(segment):
                entry['important'] = True

            timeline.append(entry)

        return timeline

    def _generate_chapters(self, segments: List[Dict], min_chapter_duration: float = 60.0) -> List[Dict]:
        """
        Generate chapter markers from transcript segments.
        Identifies topic changes and significant moments.
        """
        chapters = []

        if not segments:
            return chapters

        current_chapter_start = 0
        current_texts = []
        last_speaker = None

        for i, segment in enumerate(segments):
            current_time = segment.get('start', 0)
            speaker = segment.get('speaker', 'Unknown')
            text = segment.get('text', '')

            # Detect chapter boundary conditions
            speaker_change = last_speaker and speaker != last_speaker
            time_gap = current_time - current_chapter_start >= min_chapter_duration
            topic_change = self._detect_topic_change(current_texts, text)

            if (speaker_change or time_gap or topic_change) and current_texts:
                # Create chapter
                chapter = {
                    'start': current_chapter_start,
                    'end': current_time,
                    'title': self._generate_chapter_title(current_texts),
                    'summary': self._generate_chapter_summary(current_texts),
                    'speaker': last_speaker or 'Multiple'
                }
                chapters.append(chapter)

                # Reset for next chapter
                current_chapter_start = current_time
                current_texts = [text]
            else:
                current_texts.append(text)

            last_speaker = speaker

        # Add final chapter
        if current_texts and segments:
            chapter = {
                'start': current_chapter_start,
                'end': segments[-1].get('end', current_chapter_start + 60),
                'title': self._generate_chapter_title(current_texts),
                'summary': self._generate_chapter_summary(current_texts),
                'speaker': last_speaker or 'Multiple'
            }
            chapters.append(chapter)

        return chapters

    def _extract_speakers(self, segments: List[Dict]) -> List[Dict]:
        """Extract unique speakers with statistics"""
        speaker_stats = {}

        for segment in segments:
            speaker = segment.get('speaker', 'Unknown')

            if speaker not in speaker_stats:
                speaker_stats[speaker] = {
                    'id': speaker,
                    'name': speaker,
                    'segment_count': 0,
                    'total_duration': 0,
                    'first_appearance': segment.get('start', 0)
                }

            speaker_stats[speaker]['segment_count'] += 1
            duration = segment.get('end', 0) - segment.get('start', 0)
            speaker_stats[speaker]['total_duration'] += duration

        # Convert to list and sort by appearance
        speakers = list(speaker_stats.values())
        speakers.sort(key=lambda x: x['first_appearance'])

        return speakers

    def _generate_webvtt(
        self,
        segments: List[Dict],
        language: str,
        include_speakers: bool
    ) -> str:
        """
        Generate WebVTT content with proper formatting.
        Supports SEA languages and code-mixing.
        """
        vtt_lines = ['WEBVTT', '', 'NOTE', 'Generated by Qual Engine', '']

        # Add language metadata
        vtt_lines.append(f'NOTE Language: {language}')
        vtt_lines.append('')

        for i, segment in enumerate(segments):
            # Format timestamp
            start_time = self._format_vtt_timestamp(segment.get('start', 0))
            end_time = self._format_vtt_timestamp(segment.get('end', 0))

            # Add cue identifier
            vtt_lines.append(str(i + 1))

            # Add timestamp line with optional settings
            timestamp_line = f"{start_time} --> {end_time}"

            # Add position for RTL languages
            if language in self.rtl_languages:
                timestamp_line += " align:right"

            vtt_lines.append(timestamp_line)

            # Format text with speaker
            text = segment.get('text', '')

            if include_speakers and 'speaker' in segment:
                speaker = segment['speaker']
                # Use v-tag for speaker identification
                text = f"<v {speaker}>{text}"

            # Add language tags for code-mixing
            if 'languages' in segment and len(segment['languages']) > 1:
                text = self._add_language_tags(text, segment['languages'])

            # Add sentiment coloring if available
            if 'sentiment' in segment:
                sentiment = segment['sentiment']
                if sentiment == 'positive':
                    text = f'<c.positive>{text}</c>'
                elif sentiment == 'negative':
                    text = f'<c.negative>{text}</c>'

            vtt_lines.append(text)
            vtt_lines.append('')  # Empty line between cues

        return '\n'.join(vtt_lines)

    def _generate_srt(self, segments: List[Dict], include_speakers: bool) -> str:
        """Generate SRT content for compatibility"""
        srt_lines = []

        for i, segment in enumerate(segments):
            # Cue number
            srt_lines.append(str(i + 1))

            # Timestamp
            start_time = self._format_srt_timestamp(segment.get('start', 0))
            end_time = self._format_srt_timestamp(segment.get('end', 0))
            srt_lines.append(f"{start_time} --> {end_time}")

            # Text with optional speaker
            text = segment.get('text', '')
            if include_speakers and 'speaker' in segment:
                text = f"[{segment['speaker']}] {text}"

            srt_lines.append(text)
            srt_lines.append('')  # Empty line between cues

        return '\n'.join(srt_lines)

    def _format_vtt_timestamp(self, seconds: float) -> str:
        """Format timestamp for WebVTT (HH:MM:SS.mmm)"""
        hours = int(seconds // 3600)
        minutes = int((seconds % 3600) // 60)
        secs = seconds % 60
        return f"{hours:02d}:{minutes:02d}:{secs:06.3f}"

    def _format_srt_timestamp(self, seconds: float) -> str:
        """Format timestamp for SRT (HH:MM:SS,mmm)"""
        hours = int(seconds // 3600)
        minutes = int((seconds % 3600) // 60)
        secs = int(seconds % 60)
        millis = int((seconds % 1) * 1000)
        return f"{hours:02d}:{minutes:02d}:{secs:02d},{millis:03d}"

    def _detect_code_mixing(self, segments: List[Dict]) -> bool:
        """Detect if transcript contains code-mixing"""
        for segment in segments:
            if 'languages' in segment and len(segment.get('languages', [])) > 1:
                return True

            # Simple heuristic: check for mixed scripts
            text = segment.get('text', '')
            if self._has_mixed_scripts(text):
                return True

        return False

    def _has_mixed_scripts(self, text: str) -> bool:
        """Check if text contains mixed scripts (e.g., Latin + Thai)"""
        has_latin = bool(re.search(r'[a-zA-Z]', text))
        has_thai = bool(re.search(r'[\u0E00-\u0E7F]', text))
        has_arabic = bool(re.search(r'[\u0600-\u06FF]', text))
        has_devanagari = bool(re.search(r'[\u0900-\u097F]', text))

        scripts_count = sum([has_latin, has_thai, has_arabic, has_devanagari])
        return scripts_count > 1

    def _is_important_segment(self, segment: Dict) -> bool:
        """Determine if segment is important for highlighting"""
        # High confidence
        if segment.get('confidence', 0) > 0.95:
            return True

        # Strong sentiment
        if abs(segment.get('sentiment_score', 0)) > 0.8:
            return True

        # Contains keywords (would need keyword list)
        # This is placeholder logic
        keywords = ['important', 'critical', 'key point', 'summary']
        text = segment.get('text', '').lower()
        if any(keyword in text for keyword in keywords):
            return True

        return False

    def _detect_topic_change(self, previous_texts: List[str], current_text: str) -> bool:
        """Detect if there's a topic change (simplified heuristic)"""
        # This would ideally use NLP/embeddings
        # For now, use simple heuristics

        if not previous_texts:
            return False

        # Check for transition phrases
        transition_phrases = [
            'moving on', 'next topic', 'let\'s talk about',
            'another point', 'switching gears', 'now regarding'
        ]

        current_lower = current_text.lower()
        for phrase in transition_phrases:
            if phrase in current_lower:
                return True

        return False

    def _generate_chapter_title(self, texts: List[str]) -> str:
        """Generate concise chapter title from texts"""
        # In production, this would use NLP/summarization
        # For now, use first significant sentence

        combined = ' '.join(texts[:3])  # First 3 segments

        # Truncate to reasonable length
        if len(combined) > 50:
            combined = combined[:47] + "..."

        return combined

    def _generate_chapter_summary(self, texts: List[str]) -> str:
        """Generate chapter summary"""
        # Simplified version - in production would use AI
        word_count = sum(len(text.split()) for text in texts)
        duration_estimate = word_count / 150 * 60  # Assuming 150 wpm

        return f"{len(texts)} segments, ~{duration_estimate:.1f} seconds"

    def _add_language_tags(self, text: str, languages: List[str]) -> str:
        """Add language tags for code-mixing display"""
        # This would need more sophisticated language detection
        # For now, return text as-is
        return text

    def _generate_fallback_sync(self) -> Dict:
        """Generate fallback sync data when processing fails"""
        return {
            'timeline': [],
            'chapters': [],
            'speakers': [],
            'vtt_content': 'WEBVTT\n\n',
            'srt_content': '',
            'error': 'Failed to sync transcript with video'
        }

    def create_highlight_reel_timeline(
        self,
        highlights: List[Dict],
        transition_duration: float = 0.5
    ) -> Dict:
        """
        Create timeline for highlight reel compilation

        Args:
            highlights: List of highlight segments with start/end times
            transition_duration: Duration of transitions between clips

        Returns:
            Timeline data for highlight reel
        """
        reel_timeline = []
        current_time = 0

        for i, highlight in enumerate(highlights):
            # Add transition (except for first clip)
            if i > 0:
                reel_timeline.append({
                    'type': 'transition',
                    'start': current_time,
                    'duration': transition_duration,
                    'effect': 'crossfade'
                })
                current_time += transition_duration

            # Add highlight clip
            clip_duration = highlight['end'] - highlight['start']
            reel_timeline.append({
                'type': 'clip',
                'source_start': highlight['start'],
                'source_end': highlight['end'],
                'reel_start': current_time,
                'reel_end': current_time + clip_duration,
                'text': highlight.get('text', ''),
                'speaker': highlight.get('speaker', ''),
                'importance': highlight.get('importance', 1.0)
            })
            current_time += clip_duration

        return {
            'timeline': reel_timeline,
            'total_duration': current_time,
            'clip_count': len(highlights),
            'has_transitions': len(highlights) > 1
        }


# Singleton instance
video_sync_service = VideoSyncService()