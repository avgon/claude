"""Video assembly using moviepy."""
from __future__ import annotations

from pathlib import Path
from typing import Optional

from moviepy.editor import AudioFileClip, CompositeAudioClip, VideoFileClip
from moviepy.video.fx.loop import loop
from moviepy.audio.fx.volumex import volumex


def _find_background_music(music_dir: Path) -> Optional[Path]:
    if not music_dir.exists():
        return None
    for ext in ("*.mp3", "*.wav", "*.m4a"):
        matches = list(music_dir.glob(ext))
        if matches:
            return matches[0]
    return None


def assemble_video(
    video_path: Path,
    voiceover_path: Path,
    output_path: Path,
    music_dir: Path,
) -> Path:
    output_path.parent.mkdir(parents=True, exist_ok=True)

    with VideoFileClip(str(video_path)) as video_clip:
        voice_clip = AudioFileClip(str(voiceover_path))
        if voice_clip.duration > video_clip.duration:
            video_clip = loop(video_clip, duration=voice_clip.duration)
        else:
            voice_clip = voice_clip.set_duration(video_clip.duration)

        audio_layers = [voice_clip]
        bg_music_path = _find_background_music(music_dir)
        if bg_music_path:
            bg_clip = AudioFileClip(str(bg_music_path))
            if bg_clip.duration < voice_clip.duration:
                bg_clip = bg_clip.audio_loop(duration=voice_clip.duration)
            bg_clip = volumex(bg_clip, 0.1)
            audio_layers.append(bg_clip)

        final_audio = CompositeAudioClip(audio_layers)
        final_video = video_clip.set_audio(final_audio)
        final_video.write_videofile(
            str(output_path),
            codec="libx264",
            audio_codec="aac",
            threads=4,
            fps=video_clip.fps or 24,
        )

    return output_path


if __name__ == "__main__":
    assemble_video(
        video_path=Path("../output/raw_videos/sample.mp4"),
        voiceover_path=Path("../output/audio/sample.mp3"),
        output_path=Path("../output/final_renders/sample_final.mp4"),
        music_dir=Path("../assets/music"),
    )
