"""Audio generation using edge-tts (placeholder for ElevenLabs)."""
from __future__ import annotations

import asyncio
from pathlib import Path

import edge_tts


DEFAULT_VOICE = "en-US-JennyNeural"


async def _generate_audio_async(text: str, output_path: Path, voice: str = DEFAULT_VOICE) -> None:
    communicator = edge_tts.Communicate(text=text, voice=voice)
    await communicator.save(str(output_path))


def generate_audio(text: str, output_path: Path, voice: str = DEFAULT_VOICE) -> Path:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    asyncio.run(_generate_audio_async(text=text, output_path=output_path, voice=voice))
    return output_path


if __name__ == "__main__":
    sample_output = Path("../output/audio/sample.mp3")
    generate_audio("Testing voiceover generation.", sample_output)
    print(f"Saved to {sample_output}")
