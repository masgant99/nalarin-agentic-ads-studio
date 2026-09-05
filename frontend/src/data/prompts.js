// Centralized Prompt Management
// All AI prompts used throughout the application

export const PROMPT_CATEGORIES = {
    AD_COPY: 'Ad Copy Generation',
    AD_REMIX: 'Ad Remix Engine',
    IMAGE_GENERATION: 'Image Generation',
    RESEARCH: 'Research & Analysis'
};

export const prompts = [
    {
        id: 'copy-generation-main',
        name: 'Ad Copy Generation',
        category: PROMPT_CATEGORIES.AD_COPY,
        description: 'Main prompt for generating ad copy variations with brand voice, product details, and campaign specifics',
        variables: ['brand_voice', 'product_name', 'product_description', 'demographics', 'pain_points', 'goals', 'offer', 'messaging', 'design_style', 'variation_count'],
        template: `You are an expert ad copywriter. Generate {variation_count} variations of ad copy for a Facebook/Instagram ad campaign.

BRAND VOICE: {brand_voice}

PRODUCT: {product_name}
{product_description}

TARGET AUDIENCE:
- Demographics: {demographics}
- Pain Points: {pain_points}
- Goals: {goals}

CAMPAIGN DETAILS:
- Offer: {offer}
- Key Messaging: {messaging}

TEMPLATE STYLE: {design_style}

BODY COPY STYLES (vary across variations):
1. BULLET POINTS WITH EMOJIS: Use 2-4 bullet points with emojis at the start
   - Sometimes use the same emoji (e.g., ✓ ✓ ✓ or ⭐ ⭐ ⭐)
   - Sometimes use mixed emojis (e.g., 🎯 💪 ✨ 🚀)
   - Keep each bullet concise and benefit-focused
   Example: "✓ Save 50% today
✓ Free shipping
✓ 30-day guarantee"

2. EMOTIONAL STORYTELLING: Longer narrative that connects emotionally
   - Tell a relatable story or paint a vivid picture
   - Use emotional triggers and sensory details
   - Build desire and urgency through narrative
   - Can be 150-200 characters for story-driven ads
   Example: "Remember that feeling when everything just clicks? When you finally found the solution you've been searching for? That's what our customers experience every day..."

INSTRUCTIONS:
Generate {variation_count} distinct variations. Mix both body copy styles across variations. Each variation should:
1. Match the brand voice consistently
2. Address the audience's pain points and goals
3. Incorporate the campaign offer and key messaging
4. Be compelling, conversion-focused, and ad-appropriate
5. Keep headlines under 40 characters
6. For bullet-point style: Keep body under 125 characters
7. For storytelling style: Can extend to 200 characters
8. Keep CTAs under 20 characters

Return ONLY valid JSON in this exact format:
{
  "variations": [
    {
      "headline": "Short, punchy headline",
      "body": "Compelling body copy (bullets with emojis OR emotional story)",
      "cta": "Action CTA"
    }
  ]
}`,
        notes: 'This prompt generates multiple ad copy variations with different styles. Adjust character limits based on platform requirements.'
    },
    {
        id: 'copy-field-regeneration',
        name: 'Field Regeneration',
        category: PROMPT_CATEGORIES.AD_COPY,
        description: 'Regenerate a specific field (headline, body, or CTA) while maintaining brand consistency',
        variables: ['field_name', 'field_instruction', 'brand_voice', 'product_name', 'demographics', 'offer', 'current_value'],
        template: `You are an expert ad copywriter. {field_instruction}.

BRAND VOICE: {brand_voice}
PRODUCT: {product_name}
TARGET AUDIENCE: {demographics}
CAMPAIGN: {offer}

Current {field_name}: {current_value}

Generate a DIFFERENT, fresh variation that:
1. Matches the brand voice
2. Is compelling and conversion-focused
3. Follows the character limits

Return ONLY the new {field_name} text, nothing else.`,
        notes: 'Field instructions: headline (under 40 chars), body (under 125 chars for bullets, or up to 200 for storytelling), cta (under 20 chars)'
    },
    {
        id: 'ad-remix-deconstruction',
        name: 'Ad Template Deconstruction',
        category: PROMPT_CATEGORIES.AD_REMIX,
        description: 'Analyze a winning ad to extract its structural blueprint for reuse',
        variables: [],
        template: `You are a master creative strategist analyzing advertising templates.

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

Do NOT include any other text. Return ONLY the JSON object.`,
        notes: 'This prompt is used with image analysis (Gemini Vision) to extract reusable ad patterns from winning ads.'
    },
    {
        id: 'ad-remix-reconstruction',
        name: 'Ad Template Reconstruction',
        category: PROMPT_CATEGORIES.AD_REMIX,
        description: 'Apply a proven ad blueprint to new brand/product data',
        variables: ['blueprint_json', 'brand_name', 'brand_voice', 'product_name', 'product_description', 'audience_demographics', 'audience_pain_points', 'audience_goals', 'campaign_offer', 'campaign_urgency', 'campaign_messaging'],
        template: `You are a Senior Creative Director creating a new ad concept.

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

Do NOT include any other text. Return ONLY the JSON object.`,
        notes: 'This prompt takes a deconstructed ad blueprint and applies it to new brand data, maintaining the winning structure while changing the content.'
    }
];

export function getPromptById(id) {
    return prompts.find(p => p.id === id);
}

export function getPromptsByCategory(category) {
    return prompts.filter(p => p.category === category);
}

export function getAllCategories() {
    return Object.values(PROMPT_CATEGORIES);
}
