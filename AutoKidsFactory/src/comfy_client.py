"""ComfyUI client wrapper for queuing prompts and downloading outputs."""
from __future__ import annotations

import asyncio
import json
import uuid
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Dict, Optional

import aiohttp


@dataclass
class ComfyConfig:
    host: str = "127.0.0.1"
    port: int = 8188
    prompt_node_id: str = "3"
    negative_prompt_node_id: str = "4"
    seed_node_id: str = "5"

    @property
    def base_url(self) -> str:
        return f"http://{self.host}:{self.port}"

    @property
    def ws_url(self) -> str:
        return f"ws://{self.host}:{self.port}/ws"


class ComfyWrapper:
    """Wrapper around ComfyUI API using WebSocket + HTTP."""

    def __init__(self, workflow_path: Path, output_dir: Path, config: Optional[ComfyConfig] = None) -> None:
        self.workflow_path = workflow_path
        self.output_dir = output_dir
        self.config = config or ComfyConfig()
        self.workflow = self._load_workflow()

    def _load_workflow(self) -> Dict[str, Any]:
        """
        IMPORTANT: The user must export their working workflow from ComfyUI in API
        format and replace the placeholder workflow_api.json.

        The code assumes node IDs in ComfyConfig map to:
        - prompt_node_id: CLIP Text Encode node for the positive prompt.
        - negative_prompt_node_id: CLIP Text Encode node for the negative prompt.
        - seed_node_id: KSampler node containing the seed field.
        """
        return json.loads(self.workflow_path.read_text(encoding="utf-8"))

    async def queue_prompt(self, prompt_text: str, negative_prompt: str, seed: int) -> Path:
        workflow = json.loads(json.dumps(self.workflow))
        workflow["prompt"][self.config.prompt_node_id]["inputs"]["text"] = prompt_text
        workflow["prompt"][self.config.negative_prompt_node_id]["inputs"]["text"] = negative_prompt
        workflow["prompt"][self.config.seed_node_id]["inputs"]["seed"] = seed

        client_id = str(uuid.uuid4())
        async with aiohttp.ClientSession() as session:
            prompt_id = await self._queue_workflow(session, workflow, client_id)
            await self._wait_for_completion(session, client_id, prompt_id)
            return await self._download_output(session, prompt_id)

    async def _queue_workflow(
        self,
        session: aiohttp.ClientSession,
        workflow: Dict[str, Any],
        client_id: str,
    ) -> str:
        payload = {"prompt": workflow["prompt"], "client_id": client_id}
        async with session.post(f"{self.config.base_url}/prompt", json=payload) as response:
            response.raise_for_status()
            data = await response.json()
        return data["prompt_id"]

    async def _wait_for_completion(
        self,
        session: aiohttp.ClientSession,
        client_id: str,
        prompt_id: str,
    ) -> None:
        ws_url = f"{self.config.ws_url}?clientId={client_id}"
        async with session.ws_connect(ws_url) as websocket:
            async for message in websocket:
                if message.type != aiohttp.WSMsgType.TEXT:
                    continue
                payload = json.loads(message.data)
                if payload.get("type") == "executing":
                    data = payload.get("data", {})
                    if data.get("node") is None and data.get("prompt_id") == prompt_id:
                        return

    async def _download_output(self, session: aiohttp.ClientSession, prompt_id: str) -> Path:
        async with session.get(f"{self.config.base_url}/history/{prompt_id}") as response:
            response.raise_for_status()
            history = await response.json()

        outputs = history[prompt_id]["outputs"]
        file_info = None
        for node_output in outputs.values():
            videos = node_output.get("gifs") or node_output.get("videos") or node_output.get("images")
            if videos:
                file_info = videos[0]
                break

        if not file_info:
            raise RuntimeError("No output files found in ComfyUI history response.")

        filename = file_info["filename"]
        subfolder = file_info.get("subfolder", "")
        file_type = file_info.get("type", "output")

        query = f"filename={filename}&subfolder={subfolder}&type={file_type}"
        download_url = f"{self.config.base_url}/view?{query}"

        self.output_dir.mkdir(parents=True, exist_ok=True)
        target_path = self.output_dir / filename
        async with session.get(download_url) as response:
            response.raise_for_status()
            target_path.write_bytes(await response.read())

        return target_path


if __name__ == "__main__":
    async def _demo() -> None:
        wrapper = ComfyWrapper(
            workflow_path=Path("../comfy_workflows/workflow_api.json"),
            output_dir=Path("../output/raw_videos"),
        )
        result = await wrapper.queue_prompt(
            prompt_text="A cute blue rabbit jumping on a trampoline",
            negative_prompt="blurry, low quality",
            seed=12345,
        )
        print(f"Downloaded output to: {result}")

    asyncio.run(_demo())
