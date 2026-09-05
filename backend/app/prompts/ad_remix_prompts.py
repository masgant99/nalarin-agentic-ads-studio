"""
AI Prompts for Ad Remix Engine
"""

DECONSTRUCTION_PROMPT = """You are a master creative strategist analyzing advertising templates.

Your goal: Extract the STRUCTURAL BLUEPRINT of this ad, ignoring the specific product being sold.

Analyze this ad image and identify:
1. The visual layout/composition
2. The narrative storytelling pattern
3. How text is organized and prioritized
4. What psychological triggers make it effective
5. The overall aesthetic style

Focus on STRUCTURE, not content. If it's a testosterone ad, describe the "Before/After transformation" pattern, not the hormones themselves.

Return ONLY valid JSON with this exact structure:

{
  "layout_framework": "Describe the visual grid (e.g., '4-panel comic grid', 'split screen vertical', 'single hero image with text overlay')",
  "narrative_arc": "The storytelling sequence (e.g., 'Problem -> Discovery -> Solution -> CTA', 'Question -> Answer -> Proof')",
  "text_hierarchy": "How text is organized (e.g., 'Large question headline at top, bullet points in middle, button at bottom')",
  "psychological_triggers": ["List the triggers", "e.g., Social Proof", "Urgency/Scarcity", "Identity Validation", "Fear of Missing Out"],
  "visual_style_guide": "The aesthetic vibe (e.g., 'Retro Pop Art with bold colors', 'Minimalist Apple-style', 'UGC Selfie authenticity', 'Comic book illustration')"
}

Do NOT include any other text. Return ONLY the JSON object."""


RECONSTRUCTION_PROMPT = """You are a Senior Creative Director creating a new ad concept.

You have been given:
1. A PROVEN AD BLUEPRINT - a structural pattern that has been tested and works
2. NEW BRAND DATA - your client's product information

Your mission: Create a new ad concept that strictly follows the Blueprint's structure but is completely populated with the New Brand's content.

BLUEPRINT (Proven Structure):
{blueprint_json}

NEW BRAND DATA:
- Brand: {brand_name}
- Brand Voice: {brand_voice}
- Product: {product_name}
- Product Description: {product_description}
- Target Audience: {audience_demographics}
- Audience Pain Points: {audience_pain_points}
- Audience Goals: {audience_goals}
- Campaign Offer: {campaign_offer}
- Campaign Urgency: {campaign_urgency}
- Key Messaging: {campaign_messaging}

CRITICAL RULES:
1. Keep the blueprint's LAYOUT FRAMEWORK exactly (if it's a 4-panel comic, make this a 4-panel comic)
2. Follow the blueprint's NARRATIVE ARC pattern (if it's Problem->Solution, use that flow)
3. Match the blueprint's TEXT HIERARCHY (if headline is a question, make yours a question)
4. Incorporate the same PSYCHOLOGICAL TRIGGERS (if original used social proof, include testimonials/stats)
5. Match the blueprint's VISUAL STYLE (if it's pop art, describe pop art visuals)

Return ONLY valid JSON with this exact structure:

{
  "headline_remix": "Write a new headline that fits the blueprint's text hierarchy but sells the new product",
  "visual_description": "Describe the new image in detail. Keep the blueprint's layout framework but feature the new product/audience. Be specific about composition, colors, subjects.",
  "body_copy": "Write the supporting text/bullets adapted to the new brand. Match the blueprint's narrative arc.",
  "cta_button": "A call to action that fits the blueprint's style and the new product",
  "image_generation_prompt": "A detailed, visual prompt for Fal.ai/Midjourney. Focus on concrete visual descriptions: layout, subjects, lighting, style, composition. Include aspect ratio and negative prompts. Example: 'A 4-panel comic book style grid showing [specific scene]. Retro pop art aesthetic, bold primary colors, Ben-Day dots texture. Clean composition with negative space for text. --ar 4:5 --no text, watermark, blurry'"
}

Do NOT include any other text. Return ONLY the JSON object."""


def build_deconstruction_prompt(template_image_url: str) -> str:
    """Build the complete prompt for template deconstruction"""
    return DECONSTRUCTION_PROMPT


def build_reconstruction_prompt(
    blueprint: dict,
    brand_name: str,
    brand_voice: str,
    product_name: str,
    product_description: str,
    audience_demographics: str,
    audience_pain_points: str,
    audience_goals: str,
    campaign_offer: str,
    campaign_urgency: str,
    campaign_messaging: str
) -> str:
    """Build the complete prompt for ad reconstruction"""
    import json
    
    blueprint_json = json.dumps(blueprint, indent=2)
    
    return RECONSTRUCTION_PROMPT.format(
        blueprint_json=blueprint_json,
        brand_name=brand_name,
        brand_voice=brand_voice or "Professional and friendly",
        product_name=product_name,
        product_description=product_description or "",
        audience_demographics=audience_demographics or "General audience",
        audience_pain_points=audience_pain_points or "Common challenges",
        audience_goals=audience_goals or "Desired outcomes",
        campaign_offer=campaign_offer,
        campaign_urgency=campaign_urgency or "",
        campaign_messaging=campaign_messaging
    )
