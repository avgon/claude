"""Prompt generation logic (placeholder for LLM integration)."""
from __future__ import annotations

from dataclasses import dataclass
from typing import Dict


@dataclass
class PromptTemplate:
    subject: str
    action: str
    location: str
    style: str

    def build(self) -> str:
        return f"{self.subject} {self.action} {self.location}, {self.style}"


def generate_prompt() -> Dict[str, str]:
    """Mocked LLM output for prompt scripting."""
    template = PromptTemplate(
        subject="A cute blue rabbit",
        action="jumping on a trampoline",
        location="in a sunny playground",
        style="3d pixar style",
    )

    return {
        "scene_description": template.build(),
        "voiceover_text": "Wow! Look how high I can jump! One, two, three!",
    }


if __name__ == "__main__":
    print(generate_prompt())
