"""
Waveform Visualization Service for Qual Engine
Generates waveform data for audio/video files optimized for SEA mobile networks
"""

import json
import logging
from pathlib import Path
from typing import Dict, List, Optional, Tuple
import numpy as np
from datetime import datetime
import hashlib

from app.config import settings

logger = logging.getLogger(__name__)


class WaveformService:
    """
    Service for generating waveform visualizations from audio/video files.
    Optimized for mobile display with low data transfer requirements.
    """

    def __init__(self):
        self.storage_path = Path(settings.STORAGE_PATH) / "waveforms"
        self.storage_path.mkdir(parents=True, exist_ok=True)

        # Import audio libraries conditionally
        try:
            import librosa
            self.librosa = librosa
        except ImportError:
            logger.warning("librosa not installed, using mock waveform generation")
            self.librosa = None

    def generate_waveform_data(
        self,
        media_path: str,
        resolution: int = 1000,
        normalize: bool = True
    ) -> Dict:
        """
        Generate waveform peaks for frontend visualization.
        Optimized for mobile: Low data transfer (JSON peaks)

        Args:
            media_path: Path to audio/video file
            resolution: Number of peaks to generate (default 1000 for mobile)
            normalize: Whether to normalize peaks to [-1, 1]

        Returns:
            Dictionary containing waveform data and metadata
        """
        try:
            if self.librosa:
                return self._generate_real_waveform(media_path, resolution, normalize)
            else:
                return self._generate_mock_waveform(media_path, resolution)
        except Exception as e:
            logger.error(f"Error generating waveform: {str(e)}")
            return self._generate_fallback_waveform(resolution)

    def _generate_real_waveform(
        self,
        media_path: str,
        resolution: int,
        normalize: bool
    ) -> Dict:
        """Generate actual waveform using librosa"""
        # Load audio with librosa
        y, sr = self.librosa.load(media_path, sr=None, mono=True)
        duration = self.librosa.get_duration(y=y, sr=sr)

        # Calculate samples per pixel
        samples_per_pixel = max(1, len(y) // resolution)

        # Generate peaks for visualization
        peaks = []
        for i in range(0, len(y), samples_per_pixel):
            chunk = y[i:i+samples_per_pixel]
            if len(chunk) > 0:
                peak_min = float(np.min(chunk))
                peak_max = float(np.max(chunk))

                # Normalize if requested
                if normalize:
                    max_val = max(abs(peak_min), abs(peak_max))
                    if max_val > 0:
                        peak_min = peak_min / max_val
                        peak_max = peak_max / max_val

                peaks.append({
                    'min': round(peak_min, 4),
                    'max': round(peak_max, 4)
                })

        # Generate cache key for this waveform
        cache_key = self._generate_cache_key(media_path, resolution)

        # Save to JSON file for caching
        waveform_file = self.storage_path / f"{cache_key}.json"
        waveform_data = {
            'peaks': peaks,
            'duration': duration,
            'sample_rate': sr,
            'resolution': resolution,
            'normalized': normalize,
            'generated_at': datetime.utcnow().isoformat(),
            'version': '1.0.0'
        }

        with open(waveform_file, 'w') as f:
            json.dump(waveform_data, f, separators=(',', ':'))

        # Add file path for S3 upload
        waveform_data['cache_file'] = str(waveform_file)

        return waveform_data

    def _generate_mock_waveform(self, media_path: str, resolution: int) -> Dict:
        """Generate mock waveform for development/testing"""
        # Create realistic-looking waveform data
        np.random.seed(hash(media_path) % 2**32)

        peaks = []
        amplitude = 1.0

        for i in range(resolution):
            # Create varying amplitude pattern
            if i % 100 == 0:
                amplitude = np.random.uniform(0.3, 1.0)

            # Add some silence periods
            if np.random.random() < 0.05:
                amplitude = 0.1

            # Generate peak values with some noise
            base_val = np.random.uniform(-amplitude, amplitude)
            noise = np.random.normal(0, 0.1)

            peak_max = min(1.0, base_val + abs(noise))
            peak_min = max(-1.0, base_val - abs(noise))

            peaks.append({
                'min': round(peak_min, 4),
                'max': round(peak_max, 4)
            })

        return {
            'peaks': peaks,
            'duration': 180.0,  # Mock 3-minute duration
            'sample_rate': 44100,
            'resolution': resolution,
            'normalized': True,
            'generated_at': datetime.utcnow().isoformat(),
            'version': '1.0.0-mock'
        }

    def _generate_fallback_waveform(self, resolution: int) -> Dict:
        """Generate simple fallback waveform when processing fails"""
        # Create flat waveform
        peaks = [{'min': -0.5, 'max': 0.5} for _ in range(resolution)]

        return {
            'peaks': peaks,
            'duration': 0,
            'sample_rate': 44100,
            'resolution': resolution,
            'normalized': True,
            'generated_at': datetime.utcnow().isoformat(),
            'version': '1.0.0-fallback',
            'error': 'Failed to process audio file'
        }

    def _generate_cache_key(self, media_path: str, resolution: int) -> str:
        """Generate unique cache key for waveform data"""
        key_string = f"{media_path}:{resolution}"
        return hashlib.md5(key_string.encode()).hexdigest()

    def get_cached_waveform(self, media_path: str, resolution: int) -> Optional[Dict]:
        """
        Retrieve cached waveform if available

        Args:
            media_path: Path to media file
            resolution: Resolution of waveform

        Returns:
            Cached waveform data or None
        """
        cache_key = self._generate_cache_key(media_path, resolution)
        waveform_file = self.storage_path / f"{cache_key}.json"

        if waveform_file.exists():
            try:
                with open(waveform_file, 'r') as f:
                    return json.load(f)
            except Exception as e:
                logger.error(f"Error loading cached waveform: {str(e)}")

        return None

    def generate_waveform_image(
        self,
        waveform_data: Dict,
        width: int = 1000,
        height: int = 200,
        color: str = "#1976D2",
        background: str = "#FFFFFF"
    ) -> Optional[bytes]:
        """
        Generate PNG image of waveform for static display

        Args:
            waveform_data: Waveform data dictionary
            width: Image width in pixels
            height: Image height in pixels
            color: Waveform color (hex)
            background: Background color (hex)

        Returns:
            PNG image bytes or None
        """
        try:
            import PIL.Image as Image
            import PIL.ImageDraw as ImageDraw

            # Create image
            img = Image.new('RGBA', (width, height), background)
            draw = ImageDraw.Draw(img)

            peaks = waveform_data.get('peaks', [])
            if not peaks:
                return None

            # Calculate pixel width per peak
            peak_width = width / len(peaks)
            center_y = height // 2

            # Draw waveform
            for i, peak in enumerate(peaks):
                x = i * peak_width

                # Scale peaks to image height
                max_height = (height // 2) * 0.9  # Leave 10% margin

                y_min = center_y - (peak['max'] * max_height)
                y_max = center_y - (peak['min'] * max_height)

                # Draw vertical line for this peak
                draw.line(
                    [(x, y_min), (x, y_max)],
                    fill=color,
                    width=max(1, int(peak_width))
                )

            # Convert to bytes
            import io
            buffer = io.BytesIO()
            img.save(buffer, format='PNG', optimize=True)
            return buffer.getvalue()

        except ImportError:
            logger.warning("PIL not installed, cannot generate waveform image")
            return None
        except Exception as e:
            logger.error(f"Error generating waveform image: {str(e)}")
            return None

    def generate_timeline_segments(
        self,
        waveform_data: Dict,
        segment_duration: float = 10.0
    ) -> List[Dict]:
        """
        Generate timeline segments for chapter navigation

        Args:
            waveform_data: Waveform data dictionary
            segment_duration: Duration of each segment in seconds

        Returns:
            List of timeline segments with activity levels
        """
        duration = waveform_data.get('duration', 0)
        peaks = waveform_data.get('peaks', [])

        if not duration or not peaks:
            return []

        segments = []
        num_segments = int(duration / segment_duration) + 1
        peaks_per_segment = len(peaks) // num_segments

        for i in range(num_segments):
            start_time = i * segment_duration
            end_time = min((i + 1) * segment_duration, duration)

            # Calculate average amplitude for this segment
            start_peak = i * peaks_per_segment
            end_peak = min((i + 1) * peaks_per_segment, len(peaks))

            segment_peaks = peaks[start_peak:end_peak]
            if segment_peaks:
                avg_amplitude = np.mean([
                    max(abs(p['min']), abs(p['max']))
                    for p in segment_peaks
                ])
            else:
                avg_amplitude = 0

            # Classify activity level
            if avg_amplitude < 0.2:
                activity_level = 'silent'
            elif avg_amplitude < 0.5:
                activity_level = 'low'
            elif avg_amplitude < 0.8:
                activity_level = 'medium'
            else:
                activity_level = 'high'

            segments.append({
                'start': round(start_time, 2),
                'end': round(end_time, 2),
                'activity_level': activity_level,
                'amplitude': round(avg_amplitude, 3)
            })

        return segments

    async def process_batch(
        self,
        media_paths: List[str],
        resolution: int = 1000
    ) -> List[Dict]:
        """
        Process multiple media files in batch

        Args:
            media_paths: List of media file paths
            resolution: Resolution for all waveforms

        Returns:
            List of waveform data dictionaries
        """
        results = []

        for path in media_paths:
            # Check cache first
            cached = self.get_cached_waveform(path, resolution)
            if cached:
                results.append(cached)
            else:
                # Generate new waveform
                waveform = self.generate_waveform_data(path, resolution)
                results.append(waveform)

        return results


# Singleton instance
waveform_service = WaveformService()