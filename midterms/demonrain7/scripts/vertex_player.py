"""Bounded remote model client. No callable functions are given to the model.
SPDX-License-Identifier: GPL-2.0-or-later
"""
from dataclasses import dataclass
import json
import os
import time

from player_contract import RESPONSE_SCHEMA


@dataclass
class ModelReply:
    text: str
    model_version: str
    input_tokens: int | None
    output_tokens: int | None
    elapsed_seconds: float
    finish_reason: str


class VertexPlayer:
    def __init__(self, config, prompt, seed):
        from google import genai
        from google.genai import types
        project = os.environ.get("GOOGLE_CLOUD_PROJECT", "").strip()
        if not project:
            raise ValueError("Set GOOGLE_CLOUD_PROJECT and configure Application Default Credentials")
        self.config, self.prompt, self.seed = config, prompt, seed
        self.types = types
        self.client = genai.Client(
            vertexai=True, project=project, location=config["location"],
            http_options=types.HttpOptions(timeout=int(config["limits"]["request_timeout_seconds"] * 1000),
                                           retry_options=types.HttpRetryOptions(attempts=1)))

    def generate(self, frames, invalid_notice=None):
        types = self.types
        if not 1 <= len(frames) <= 4:
            raise ValueError("At most four screenshots are permitted per request")
        parts = []
        for index, frame in enumerate(frames):
            text = json.dumps({"frame": index, "current": index == len(frames) - 1, **frame.metadata})
            parts.append(types.Part.from_text(text=text))
            parts.append(types.Part.from_bytes(data=frame.png, mime_type="image/png"))
        if invalid_notice:
            parts.append(types.Part.from_text(text="Invalid-response notice: " + invalid_notice))
        started = time.monotonic()
        response = self.client.models.generate_content(
            model=self.config["model"], contents=[types.Content(role="user", parts=parts)],
            config=types.GenerateContentConfig(
                system_instruction=self.prompt, response_mime_type="application/json",
                response_json_schema=RESPONSE_SCHEMA,
                temperature=self.config["temperature"], seed=self.seed,
                max_output_tokens=self.config["max_output_tokens"],
                thinking_config=types.ThinkingConfig(thinking_level=self.config["thinking_level"]),
                automatic_function_calling=types.AutomaticFunctionCallingConfig(disable=True)))
        usage = response.usage_metadata
        prompt_tokens = getattr(usage, "prompt_token_count", None)
        output = getattr(usage, "candidates_token_count", None)
        thoughts = getattr(usage, "thoughts_token_count", None)
        # Thinking is billable output even when no reasoning text is returned.
        output_tokens = output + (thoughts or 0) if output is not None else None
        finish = str(response.candidates[0].finish_reason.value) if response.candidates else "NO_CANDIDATE"
        return ModelReply(response.text or "", response.model_version or self.config["model"],
                          prompt_tokens, output_tokens, time.monotonic() - started, finish)

    def close(self):
        self.client.close()
