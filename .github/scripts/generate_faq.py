import os
import aiohttp
import asyncio
import time
from pathlib import Path
from tqdm import tqdm
import tiktoken
import difflib

# Env vars
MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY")
OUTPUT_FAQ = "FAQ.md"
OUTPUT_README = "README.md"

ENCODER = tiktoken.get_encoding("cl100k_base")


def count_tokens(text):
    return len(ENCODER.encode(text))


def log_token_count(label, text):
    tokens = count_tokens(text)
    print(f"🔢 Token count for {label}: {tokens}")


def chunk_text(text, max_tokens=2000):
    tokens = ENCODER.encode(text)
    chunks = []
    for i in range(0, len(tokens), max_tokens):
        chunk = ENCODER.decode(tokens[i:i + max_tokens])
        chunks.append(chunk)
    return chunks


def read_file(filepath):
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            return f.read()
    except FileNotFoundError:
        return ""


def read_code_files(directory, extensions=None):
    if extensions is None:
        extensions = [".py", ".js", ".ts", ".tsx", ".jsx", ".go", ".java"]

    code_contents = []
    for path in Path(directory).rglob("*"):
        if path.is_file() and path.suffix in extensions:
            try:
                with open(path, "r", encoding="utf-8") as f:
                    code_contents.append(f"File: {path.relative_to(directory)}\n{f.read()}")
            except Exception as e:
                print(f"Skipping {path} due to error: {e}")
    return "\n\n".join(code_contents)


async def mistral_api(session, prompt, retries=3, timeout=60):
    url = "https://api.mistral.ai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {MISTRAL_API_KEY}",
        "Content-Type": "application/json"
    }
    body = {
        "model": "mistral-small-latest",
        "messages": [
            {"role": "system", "content": "You are Sage, a thoughtful and insightful assistant from Cadence. Write in a warm, clear, user-friendly tone."},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.3,
        "top_p": 0.95
    }

    for attempt in range(1, retries + 1):
        try:
            async with session.post(url, headers=headers, json=body, timeout=timeout) as response:
                response.raise_for_status()
                result = await response.json()
                return result["choices"][0]["message"]["content"]
        except Exception as e:
            print(f"⚠️ Mistral API request failed (attempt {attempt}/{retries}): {e}")
            if attempt == retries:
                raise Exception("❌ Mistral API request failed after multiple attempts.")
            sleep_time = 2 ** attempt
            print(f"⏳ Retrying in {sleep_time} seconds...")
            await asyncio.sleep(sleep_time)


async def summarize_chunk(session, chunk):
    prompt = f"""
The following is part of an application's codebase. Extract useful information **for the end-user only**.
Focus on:
- Features
- Usage instructions
- Expected behaviors
- User-visible errors or messages
- Key functionalities

Code:
{chunk}

Please output the summary in plain text, no code, using a friendly and supportive tone like Sage would.
"""
    return await mistral_api(session, prompt)


async def summarize_chunks(chunks):
    async with aiohttp.ClientSession() as session:
        tasks = [summarize_chunk(session, chunk) for chunk in chunks]
        results = []
        for f in tqdm(asyncio.as_completed(tasks), total=len(tasks), desc="Summarizing chunks"):
            result = await f
            results.append(result)
        return results


async def generate_faq(session, summaries):
    summaries_text = '\n\n'.join(summaries)
    log_token_count("Summaries for FAQ", summaries_text)

    prompt = f"""
Your role is to create a warm, user-friendly FAQ for app users of Cadence.day.
- Be concise, clear, and supportive.
- Keep answers short, like a helpful conversation.
- Avoid technical jargon. No code snippets.
- Use bullet points and headings.
- Start with a friendly introduction.
- Include a Table of Contents at the top.
- Cover common user questions: what the app does, how to use it, helpful tips, what to do if something doesn’t work.
- Do not reference development processes or the repository.
- Only speak about the user experience with the app.
- If the FAQ should not be changed, reply with exactly: No change needed

Here are the summaries of the codebase:
{summaries_text}

Here is the previous FAQ for reference:
{read_file(OUTPUT_FAQ)}

Now, kindly write the full FAQ in Markdown. Your voice is Sage voice, the thoughtful and insightful assistant from Cadence.
"""
    return await mistral_api(session, prompt)


def file_has_changes(filepath, new_content):
    if not os.path.exists(filepath):
        print(f"🆕 {filepath} does not exist yet. Will be created.")
        return True

    with open(filepath, "r", encoding="utf-8") as f:
        old_content = f.read()

    if old_content.strip() == new_content.strip():
        return False

    # Show diff in logs
    diff = difflib.unified_diff(
        old_content.splitlines(),
        new_content.splitlines(),
        fromfile=f'Old {filepath}',
        tofile=f'New {filepath}',
        lineterm=''
    )
    print(f"\n🔍 Changes detected in {filepath}:\n")
    for line in diff:
        print(line)

    return True


def save_file(content, filename):
    with open(filename, "w", encoding="utf-8") as f:
        f.write(content)


async def main():
    print("🧩 Reading codebase...")
    codebase = read_code_files(".")
    print(f"Total codebase size: {count_tokens(codebase)} tokens")

    print("🪄 Chunking codebase...")
    chunks = chunk_text(codebase, max_tokens=2000)

    print(f"Total chunks created: {len(chunks)}")

    print("🧠 Summarizing chunks asynchronously...")
    summaries = await summarize_chunks(chunks)

    async with aiohttp.ClientSession() as session:
        print("📖 Generating FAQ...")
        faq = await generate_faq(session, summaries)

        changes_made = False

        if faq.strip() == "No change needed":
            print("ℹ️ LLM indicated no change needed for FAQ.md")
        elif file_has_changes(OUTPUT_FAQ, faq):
            print("✅ FAQ changes detected. Saving FAQ.md...")
            save_file(faq, OUTPUT_FAQ)
            changes_made = True
        else:
            print("ℹ️ No changes in FAQ.md")

    if not changes_made:
        print("🎉 No changes detected in either FAQ or README. Skipping commit.")
        exit(0)

    print("🎉 Changes detected. Proceeding to commit/PR step!")


if __name__ == "__main__":
    asyncio.run(main())
