import os
from groq import AsyncGroq
from tenacity import retry, stop_after_attempt, wait_exponential
from loguru import logger
from dotenv import load_dotenv
import tiktoken
import asyncio

load_dotenv()

class GroqService:
    def __init__(self):
        self.api_key = os.getenv("GROQ_API_KEY")
        self.encoder = tiktoken.get_encoding("cl100k_base")
        if not self.api_key:
            logger.error("GROQ_API_KEY not found in environment variables.")
            raise ValueError("GROQ_API_KEY is required")

        self.client = AsyncGroq(api_key=self.api_key)
        logger.info("AsyncGroqService initialized successfully.")

    def count_tokens(self, text: str) -> int:
        """Estimate tokens for Llama/Qwen models (approx 4 chars per token)."""
        if not text:
            return 0
        return len(text) // 4

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=4, max=10))
    async def get_completion(self, messages, model="llama-3.1-8b-instant", temperature=0.7, max_tokens=1024):
        """Get an async completion from Groq with retry logic."""
        try:
            response = await self.client.chat.completions.create(
                messages=messages,
                model=model,
                temperature=temperature,
                max_tokens=max_tokens
            )

            usage = response.usage
            return {
                "content": response.choices[0].message.content,
                "usage": {
                    "prompt_tokens": usage.prompt_tokens,
                    "completion_tokens": usage.completion_tokens,
                    "total_tokens": usage.total_tokens
                },
                "model": model
            }
        except Exception as e:
            logger.error(f"Async Groq Error: {str(e)}")
            raise e
