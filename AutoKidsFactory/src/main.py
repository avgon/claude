"""Main orchestration loop for the Endless Kids Animation Factory."""
from __future__ import annotations

import asyncio
import os
from datetime import datetime
from pathlib import Path

from dotenv import load_dotenv

from audio_gen import generate_audio
from comfy_client import ComfyConfig, ComfyWrapper
from script_gen import generate_prompt
from video_editor import assemble_video


BASE_DIR = Path(__file__).resolve().parents[1]
OUTPUT_DIR = BASE_DIR / "output"


def _timestamp() -> str:
    return datetime.utcnow().strftime("%Y%m%d_%H%M%S")


def _build_paths(index: int) -> dict[str, Path]:
    stamp = _timestamp()
    return {
        "voiceover": OUTPUT_DIR / "audio" / f"voiceover_{stamp}_{index}.mp3",
        "raw_video": OUTPUT_DIR / "raw_videos" / f"clip_{stamp}_{index}.mp4",
        "final": OUTPUT_DIR / "final_renders" / f"final_{stamp}_{index}.mp4",
    }


async def _run_loop() -> None:
    load_dotenv()
    api_key = os.getenv("API_KEY", "")
    if not api_key:
        print("Warning: API_KEY is not set. Using placeholder prompt generation.")

    comfy = ComfyWrapper(
        workflow_path=BASE_DIR / "comfy_workflows" / "workflow_api.json",
        output_dir=OUTPUT_DIR / "raw_videos",
        config=ComfyConfig(),
    )

    index = 1
    while True:
        idea = generate_prompt()
        scene_description = idea["scene_description"]
        voiceover_text = idea["voiceover_text"]

        paths = _build_paths(index)

        generate_audio(text=voiceover_text, output_path=paths["voiceover"])
        video_path = await comfy.queue_prompt(
            prompt_text=scene_description,
            negative_prompt="blurry, low quality, watermark",
            seed=42 + index,
        )

        final_output = assemble_video(
            video_path=video_path,
            voiceover_path=paths["voiceover"],
            output_path=paths["final"],
            music_dir=BASE_DIR / "assets" / "music",
        )

        print(f"Video {index} Completed: {final_output}")
        index += 1


def main() -> None:
    asyncio.run(_run_loop())


if __name__ == "__main__":
    main()
