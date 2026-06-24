"""
Media processing service for clips and reels
Handles ffmpeg operations for cutting and stitching video/audio
"""

import os
import subprocess
import tempfile
import json
from typing import List, Dict, Optional, Tuple
from pathlib import Path
import logging

logger = logging.getLogger(__name__)


class MediaProcessor:
    """Service for processing media files (clips and reels)"""

    def __init__(self):
        """Initialize media processor"""
        self.ffmpeg_path = self._find_ffmpeg()
        self.ffprobe_path = self._find_ffprobe()

    def _find_ffmpeg(self) -> str:
        """Find ffmpeg executable"""
        # Try common paths
        paths = [
            "ffmpeg",  # System PATH
            "/usr/bin/ffmpeg",
            "/usr/local/bin/ffmpeg",
            "/opt/homebrew/bin/ffmpeg",  # macOS with Homebrew
        ]

        for path in paths:
            if self._check_executable(path):
                return path

        logger.warning("ffmpeg not found, using mock processor")
        return None

    def _find_ffprobe(self) -> str:
        """Find ffprobe executable"""
        paths = [
            "ffprobe",  # System PATH
            "/usr/bin/ffprobe",
            "/usr/local/bin/ffprobe",
            "/opt/homebrew/bin/ffprobe",  # macOS with Homebrew
        ]

        for path in paths:
            if self._check_executable(path):
                return path

        return None

    def _check_executable(self, path: str) -> bool:
        """Check if executable exists and is runnable"""
        try:
            subprocess.run([path, "-version"], capture_output=True, check=False)
            return True
        except (subprocess.SubprocessError, FileNotFoundError):
            return False

    def get_media_info(self, file_path: str) -> Dict:
        """Get media file information using ffprobe"""
        if not self.ffprobe_path:
            # Return mock info if ffprobe not available
            return {
                "duration": 60.0,
                "width": 1920,
                "height": 1080,
                "codec": "h264",
                "format": "mp4"
            }

        try:
            cmd = [
                self.ffprobe_path,
                "-v", "quiet",
                "-print_format", "json",
                "-show_format",
                "-show_streams",
                file_path
            ]

            result = subprocess.run(cmd, capture_output=True, text=True, check=True)
            data = json.loads(result.stdout)

            # Extract relevant info
            info = {
                "duration": float(data.get("format", {}).get("duration", 0)),
                "size": int(data.get("format", {}).get("size", 0)),
                "bit_rate": int(data.get("format", {}).get("bit_rate", 0)),
            }

            # Get video stream info
            for stream in data.get("streams", []):
                if stream["codec_type"] == "video":
                    info.update({
                        "width": stream.get("width"),
                        "height": stream.get("height"),
                        "codec": stream.get("codec_name"),
                        "fps": eval(stream.get("r_frame_rate", "0/1"))  # Convert fraction to float
                    })
                    break

            return info

        except Exception as e:
            logger.error(f"Error getting media info: {e}")
            return {}

    def extract_clip(
        self,
        input_path: str,
        output_path: str,
        start_time: float,
        end_time: float,
        include_audio: bool = True
    ) -> bool:
        """Extract a clip from media file"""
        if not self.ffmpeg_path:
            # Mock processing - just copy file or create empty file
            logger.info(f"Mock: Would extract clip from {start_time} to {end_time}")
            Path(output_path).touch()
            return True

        try:
            duration = end_time - start_time

            cmd = [
                self.ffmpeg_path,
                "-i", input_path,
                "-ss", str(start_time),
                "-t", str(duration),
                "-c:v", "libx264",  # Re-encode video with H.264
                "-preset", "fast",  # Fast encoding
                "-crf", "23",  # Quality (lower = better, 23 is default)
            ]

            if include_audio:
                cmd.extend(["-c:a", "aac"])  # AAC audio codec
            else:
                cmd.extend(["-an"])  # No audio

            cmd.extend([
                "-y",  # Overwrite output
                output_path
            ])

            result = subprocess.run(cmd, capture_output=True, text=True, check=True)
            logger.info(f"Clip extracted successfully: {output_path}")
            return True

        except subprocess.CalledProcessError as e:
            logger.error(f"Error extracting clip: {e.stderr}")
            return False
        except Exception as e:
            logger.error(f"Unexpected error extracting clip: {e}")
            return False

    def compile_reel(
        self,
        clips: List[Dict],
        output_path: str,
        transition_style: str = "fade",
        transition_duration: float = 0.5,
        resolution: str = "1080p",
        aspect_ratio: str = "16:9",
        intro_text: Optional[str] = None,
        outro_text: Optional[str] = None,
        watermark: bool = False
    ) -> bool:
        """Compile multiple clips into a reel"""
        if not self.ffmpeg_path:
            # Mock processing
            logger.info(f"Mock: Would compile {len(clips)} clips into reel")
            Path(output_path).touch()
            return True

        try:
            # Create temporary concat file
            with tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False) as concat_file:
                # Write file list for concatenation
                for clip in clips:
                    concat_file.write(f"file '{clip['path']}'\n")
                concat_file_path = concat_file.name

            # Determine resolution settings
            width, height = self._get_dimensions(resolution, aspect_ratio)

            # Build ffmpeg command
            cmd = [
                self.ffmpeg_path,
                "-f", "concat",
                "-safe", "0",
                "-i", concat_file_path,
                "-c:v", "libx264",
                "-preset", "medium",
                "-crf", "23",
                "-vf", f"scale={width}:{height}:force_original_aspect_ratio=decrease,pad={width}:{height}:(ow-iw)/2:(oh-ih)/2",
                "-c:a", "aac",
                "-b:a", "128k",
                "-movflags", "+faststart",  # Optimize for streaming
            ]

            # Add watermark if requested
            if watermark:
                # Simple text watermark in bottom right
                cmd[cmd.index("-vf") + 1] += f",drawtext=text='Qualitas Engine':x=w-tw-10:y=h-th-10:fontsize=24:fontcolor=white@0.5"

            cmd.extend(["-y", output_path])

            # Execute ffmpeg
            result = subprocess.run(cmd, capture_output=True, text=True, check=True)

            # Clean up temp file
            os.unlink(concat_file_path)

            # Add intro/outro if specified (simplified - in production would be more complex)
            if intro_text or outro_text:
                self._add_text_overlays(output_path, intro_text, outro_text)

            logger.info(f"Reel compiled successfully: {output_path}")
            return True

        except subprocess.CalledProcessError as e:
            logger.error(f"Error compiling reel: {e.stderr}")
            return False
        except Exception as e:
            logger.error(f"Unexpected error compiling reel: {e}")
            return False

    def _get_dimensions(self, resolution: str, aspect_ratio: str) -> Tuple[int, int]:
        """Get video dimensions from resolution and aspect ratio"""
        # Resolution presets
        resolutions = {
            "720p": (1280, 720),
            "1080p": (1920, 1080),
            "4k": (3840, 2160)
        }

        # Get base resolution
        base_width, base_height = resolutions.get(resolution, (1920, 1080))

        # Adjust for aspect ratio
        if aspect_ratio == "16:9":
            return base_width, base_height
        elif aspect_ratio == "9:16":  # Portrait (stories)
            return base_height, base_width
        elif aspect_ratio == "1:1":  # Square
            size = min(base_width, base_height)
            return size, size
        elif aspect_ratio == "4:3":
            return base_height * 4 // 3, base_height
        else:
            return base_width, base_height

    def _add_text_overlays(self, video_path: str, intro_text: str, outro_text: str):
        """Add intro and outro text overlays to video"""
        # Simplified implementation
        # In production, would create text slides and concatenate
        logger.info(f"Would add intro: {intro_text}, outro: {outro_text}")

    def add_subtitles(
        self,
        input_path: str,
        output_path: str,
        subtitles: List[Dict]
    ) -> bool:
        """Add subtitles to a video"""
        if not self.ffmpeg_path:
            logger.info("Mock: Would add subtitles")
            Path(output_path).touch()
            return True

        try:
            # Create SRT file
            with tempfile.NamedTemporaryFile(mode='w', suffix='.srt', delete=False) as srt_file:
                for i, sub in enumerate(subtitles, 1):
                    srt_file.write(f"{i}\n")
                    srt_file.write(f"{self._format_time(sub['start'])} --> {self._format_time(sub['end'])}\n")
                    srt_file.write(f"{sub['text']}\n\n")
                srt_path = srt_file.name

            # Add subtitles using ffmpeg
            cmd = [
                self.ffmpeg_path,
                "-i", input_path,
                "-vf", f"subtitles={srt_path}",
                "-c:a", "copy",
                "-y", output_path
            ]

            subprocess.run(cmd, capture_output=True, text=True, check=True)

            # Clean up
            os.unlink(srt_path)

            return True

        except Exception as e:
            logger.error(f"Error adding subtitles: {e}")
            return False

    def _format_time(self, seconds: float) -> str:
        """Format seconds to SRT time format (HH:MM:SS,mmm)"""
        hours = int(seconds // 3600)
        minutes = int((seconds % 3600) // 60)
        secs = seconds % 60
        return f"{hours:02d}:{minutes:02d}:{secs:06.3f}".replace(".", ",")

    def create_thumbnail(
        self,
        input_path: str,
        output_path: str,
        time_offset: float = 0
    ) -> bool:
        """Create a thumbnail from video"""
        if not self.ffmpeg_path:
            logger.info("Mock: Would create thumbnail")
            Path(output_path).touch()
            return True

        try:
            cmd = [
                self.ffmpeg_path,
                "-i", input_path,
                "-ss", str(time_offset),
                "-vframes", "1",
                "-vf", "scale=320:-1",  # Width 320px, maintain aspect ratio
                "-y", output_path
            ]

            subprocess.run(cmd, capture_output=True, text=True, check=True)
            return True

        except Exception as e:
            logger.error(f"Error creating thumbnail: {e}")
            return False

    def merge_audio_tracks(
        self,
        video_path: str,
        audio_path: str,
        output_path: str,
        audio_delay: float = 0
    ) -> bool:
        """Merge an audio track with a video"""
        if not self.ffmpeg_path:
            logger.info("Mock: Would merge audio tracks")
            Path(output_path).touch()
            return True

        try:
            cmd = [
                self.ffmpeg_path,
                "-i", video_path,
                "-i", audio_path,
                "-c:v", "copy",
                "-c:a", "aac",
                "-map", "0:v:0",
                "-map", "1:a:0",
            ]

            if audio_delay != 0:
                cmd.extend(["-itsoffset", str(audio_delay)])

            cmd.extend(["-y", output_path])

            subprocess.run(cmd, capture_output=True, text=True, check=True)
            return True

        except Exception as e:
            logger.error(f"Error merging audio: {e}")
            return False