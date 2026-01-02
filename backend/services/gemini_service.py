# import os
# import httpx
# from dotenv import load_dotenv


# load_dotenv()

# API_KEY = os.getenv("GEMINI_API_KEY")
# MODEL = "gemini-2.5-flash"

# URL = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent"

# import httpx

# MODEL = "gemini-2.5-flash"

# async def _call_gemini(
#     prompt: str,
#     image_base64: str,
#     mime_type: str,
#     endpoint: str = "unknown"
# ):
#     headers = {
#         "Content-Type": "application/json",
#         "X-Goog-Api-Key": API_KEY,
#     }

#     payload = {
#         "contents": [
#             {
#                 "role": "user",
#                 "parts": [
#                     {"text": prompt},
#                     {
#                         "inline_data": {
#                             "mime_type": mime_type,
#                             "data": image_base64
#                         }
#                     }
#                 ]
#             }
#         ]
#     }

#     async with httpx.AsyncClient(timeout=60) as client:
#         res = await client.post(URL, headers=headers, json=payload)

#     if res.status_code == 403:
#         raise Exception("Gemini permission denied (API / billing / project)")

#     if not res.is_success:
#         raise Exception(f"Gemini error: {res.text}")

#     data = res.json()

#     try:
#         response_text = data["candidates"][0]["content"]["parts"][0]["text"]
#     except (KeyError, IndexError):
#         raise Exception("Invalid response from Gemini")

#     #  REAL TOKEN USAGE FROM GEMINI
#     usage_metadata = data.get("usageMetadata", {})

#     prompt_tokens = usage_metadata.get("promptTokenCount", 0)
#     candidate_tokens = usage_metadata.get("candidatesTokenCount", 0)
#     total_tokens = usage_metadata.get("totalTokenCount", 0)

#     usage_log = {
#         "endpoint": endpoint,
#         "model": MODEL,
#         "prompt_tokens": prompt_tokens,
#         "candidate_tokens": candidate_tokens,
#         "total_tokens": total_tokens
#     }

#     # log / store / DB insert
#     print(" GEMINI USAGE:", usage_log)

#     return response_text, usage_log


# def get_prompt_by_plan(plan_type: str | None, rationale: str) -> str:
#     base_intro = """
# You are a professional technical market analyst.
# Analyze the candlestick chart carefully and write a human-style technical note.
# """

#     # 🔹 Default prompt (when plan_type is None)
#     if not plan_type:
#         return f"""{base_intro}

# Focus on:
# - Price structure and trend
# - Momentum and visible indicators
# - Clear support and resistance

# TRADE DETAILS:
# {rationale}
# """

#     plan_type = plan_type.lower()

#     if plan_type == "equity":
#         focus = """
# Focus on:
# - Trend structure and swing behavior
# - Volume confirmation
# - Positional bias and breakout quality
# """
#     elif plan_type == "commodity":
#         focus = """
# Focus on:
# - Volatility and momentum expansion
# - Supply-demand zones
# - Breakouts vs mean reversion
# """
#     elif plan_type == "options":
#         focus = """
# Focus on:
# - Directional bias with risk awareness
# - Volatility context
# - Strike relevance and momentum
# - Mention time decay risk if applicable
# """
#     elif plan_type == "derivatives":
#         focus = """
# Focus on:
# - Leverage-driven momentum
# - Trend continuation vs exhaustion
# - Clear invalidation levels
# """
#     else:
#         # Unknown plan → fallback safely
#         focus = """
# Focus on:
# - Price structure
# - Momentum
# - Risk-aware trade assessment
# """

#     return f"""{base_intro}
# {focus}

# TRADE DETAILS:
# {rationale}
# """

# #  TEXT + IMAGE
# async def analyze_text_and_image(
#     rationale: str,
#     image_base64: str,
#     mime_type: str,
#     plan_type: str | None = None
# ):
#     # 1️⃣ Get plan-specific base prompt
#     base_prompt = get_prompt_by_plan(plan_type, rationale)

#     # 2️⃣ Append institutional analysis rules
#     full_prompt = f"""
# {base_prompt}

# You are a senior technical market analyst writing a professional trade note.

# CHART ANALYSIS GUIDELINES:
# - Identify the broader market structure (compression, triangle, base, breakout, trend)
# - Explain what price has been doing over recent sessions
# - If visible, analyze indicators such as:
#   EMA/SMA clusters, RSI, MACD, VWAP, volume behavior, Fibonacci levels
# - Describe what these indicators are currently signaling
# - Identify important support and resistance zones from structure and levels

# ALIGNMENT RULES:
# - If trade data indicates BUY, maintain bullish bias unless chart clearly invalidates it
# - If SELL, maintain bearish bias unless structure contradicts
# - Highlight confirmation or mild caution — never flip direction randomly

# WRITING STYLE REQUIREMENTS:
# - Write like a human technical analyst
# - Use complete sentences and market terminology
# - Blend chart structure, indicators, and trade logic smoothly
# - Avoid robotic or generic language

# OUTPUT FORMAT (STRICT):

# RECOMMENDATION: BUY or SELL

# TECHNICAL STRUCTURE:
# Write 3–4 lines explaining the price structure, breakout or trend context.

# INDICATORS & MOMENTUM:
# - Mention key indicators observed and what they imply

# SUPPORT / RESISTANCE:
# - Key zones or levels derived from the chart

# OUTLOOK & EXPECTATION:
# Write 2–3 lines on what traders should expect going forward
# (volatility, continuation, pullbacks, targets, risk).

# ONE LINE TRADE THESIS:
# A sharp, professional one-liner summarizing the trade.
# """

#     response_text, usage = await _call_gemini(
#         prompt=full_prompt,
#         image_base64=image_base64,
#         mime_type=mime_type,
#         endpoint=f"analyze_with_rationale_{plan_type or 'generic'}"
#     )

#     return {
#         "analysis": response_text,
#         "usage": usage
#     }


# #  IMAGE ONLY
# async def analyze_image_only(image_base64: str, mime_type: str,):
#    prompt = """
# You are a senior technical analyst preparing a professional market outlook.

# Analyze the candlestick chart in detail and write a clean, human-style technical summary.

# CHART ANALYSIS GUIDELINES:
# - Describe the prevailing market structure and trend
# - Identify any breakout, consolidation, or base formation
# - Analyze visible indicators such as EMA/SMA, RSI, MACD, VWAP, volume, or Fibonacci levels
# - Explain what momentum and structure suggest going forward

# WRITING STYLE:
# - Institutional, confident, and analytical
# - Avoid generic AI phrasing
# - Focus on structure, momentum, and expectations

# OUTPUT FORMAT (STRICT):

# RECOMMENDATION: BUY or SELL

# TECHNICAL STRUCTURE:
# Explain the current price structure and trend in 3–4 lines.

# INDICATORS & MOMENTUM:
# - Key indicators observed and what they are signaling

# SUPPORT / RESISTANCE:
# - Important price zones

# OUTLOOK & EXPECTATION:
# Forward-looking view on continuation, pullbacks, or volatility.

# ONE LINE TRADE THESIS:
# Concise professional summary.
# """
#    return await _call_gemini(prompt, image_base64, mime_type)

import os
import re
import httpx
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY")
MODEL = "gemini-2.5-flash"
URL = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent"


# ===============================
# Gemini Core Caller
# ===============================
async def _call_gemini(
    prompt: str,
    image_base64: str,
    mime_type: str,
    endpoint: str = "unknown"
):
    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": API_KEY,
    }

    payload = {
        "contents": [
            {
                "role": "user",
                "parts": [
                    {"text": prompt},
                    {
                        "inline_data": {
                            "mime_type": mime_type,
                            "data": image_base64
                        }
                    }
                ]
            }
        ]
    }

    async with httpx.AsyncClient(timeout=60) as client:
        res = await client.post(URL, headers=headers, json=payload)

    if res.status_code == 403:
        raise Exception("Gemini permission denied (API / billing / project)")

    if not res.is_success:
        raise Exception(f"Gemini error: {res.text}")

    data = res.json()

    try:
        response_text = data["candidates"][0]["content"]["parts"][0]["text"]
    except (KeyError, IndexError):
        raise Exception("Invalid response from Gemini")

    usage_metadata = data.get("usageMetadata", {})

    usage_log = {
        "endpoint": endpoint,
        "model": MODEL,
        "prompt_tokens": usage_metadata.get("promptTokenCount", 0),
        "candidate_tokens": usage_metadata.get("candidatesTokenCount", 0),
        "total_tokens": usage_metadata.get("totalTokenCount", 0),
    }

    print("GEMINI USAGE:", usage_log)

    return response_text, usage_log


# ===============================
# Prompt Selector
# ===============================
def get_prompt_by_plan(plan_type: str | None, rationale: str) -> str:
    base = """
You are a professional technical market analyst.
Study the candlestick chart carefully and form a clear market view.
"""

    if not plan_type:
        focus = """
Focus on price structure, trend direction, momentum,
and important support or resistance zones.
"""
    else:
        plan_type = plan_type.lower()

        if plan_type == "equity":
            focus = """
Focus on trend strength, swing structure, volume behavior,
and positional continuation or reversal zones.
"""
        elif plan_type == "commodity":
            focus = """
Focus on volatility behavior, momentum expansion,
and supply–demand zones.
"""
        elif plan_type == "options":
            focus = """
Focus on directional bias, volatility conditions,
risk awareness, and potential time decay impact.
"""
        elif plan_type == "derivatives":
            focus = """
Focus on momentum strength, leverage impact,
and clear invalidation levels.
"""
        else:
            focus = """
Focus on price structure and risk-aware trade assessment.
"""

    return f"""{base}
{focus}

Trade Details:
{rationale}

IMPORTANT OUTPUT RULES:
- Write analysis as short, clear points
- Do NOT use markdown, symbols, or headings
- Keep it concise and human-like
"""


# ===============================
# Gemini Output Formatter
# ===============================
def format_analysis_points(raw_text: str, max_points: int = 6) -> list[str]:
    """
    Enforces:
    - Point-wise output
    - No markdown
    - Max 6 points
    """

    # Remove markdown and symbols
    cleaned = re.sub(r"[*#>`_]", "", raw_text)

    lines = cleaned.split("\n")
    points = []

    for line in lines:
        line = line.strip()

        if not line:
            continue

        # Remove numbering / bullets
        line = re.sub(r"^[-•\d.\)]\s*", "", line)

        # Skip pure headings
        if line.isupper() and len(line) < 30:
            continue

        points.append(line)

        if len(points) >= max_points:
            break

    return points


# ===============================
# TEXT + IMAGE
# ===============================
async def analyze_text_and_image(
    rationale: str,
    image_base64: str,
    mime_type: str,
    plan_type: str | None = None
):
    base_prompt = get_prompt_by_plan(plan_type, rationale)

    final_prompt = f"""
{base_prompt}

You are a professional technical analyst writing a real market note for traders.

Carefully study the candlestick chart and the provided trade details.
Treat the chart as the primary source of truth and the trade details as the intended setup.

HOW TO ANALYZE:
- First understand the overall market structure (trend, range, compression, breakout, reversal)
- Observe recent price behavior and momentum
- If any indicators are visible on the chart (EMA, SMA, RSI, MACD, VWAP, volume, Fibonacci, etc.),
  explain what they are indicating at the current stage
- Identify important support and resistance zones from price action

TRADE DETAILS (FROM SHEET DATA):
{rationale}

DECISION LOGIC:
- If the trade details suggest BUY, check whether the chart genuinely supports a bullish view
- If the trade details suggest SELL, check whether the chart supports a bearish view
- If chart and trade details align, highlight confirmation
- If there is partial mismatch, clearly mention caution without flipping the trade direction
- Do not force a trade; think like a human analyst

OUTPUT REQUIREMENTS (VERY IMPORTANT):
- Write the analysis as clear, point-wise insights
- Each point should be a complete analytical thought, written in sentence form
- Points should flow logically, like a professional market note broken into insights
- Do NOT use bullets, numbering, headings, or markdown symbols
- Maximum 8-9 points only
- Keep language natural, confident, and trader-focused
"""




    response_text, usage = await _call_gemini(
        prompt=final_prompt,
        image_base64=image_base64,
        mime_type=mime_type,
        endpoint=f"analyze_with_rationale_{plan_type or 'generic'}"
    )

    analysis_points = format_analysis_points(response_text, max_points=6)

    return {
        "analysis": analysis_points,
        "usage": usage
    }


# ===============================
# IMAGE ONLY
# ===============================
async def analyze_image_only(image_base64: str, mime_type: str):
    prompt = """
You are a professional technical analyst.

Analyze the candlestick chart and provide a clear market view.
Write only short, human-style points.
Avoid formatting or symbols.
"""

    response_text, usage = await _call_gemini(
        prompt=prompt,
        image_base64=image_base64,
        mime_type=mime_type,
        endpoint="analyze_image_only"
    )

    analysis_points = format_analysis_points(response_text, max_points=6)

    return {
        "analysis": analysis_points,
        "usage": usage
    }
