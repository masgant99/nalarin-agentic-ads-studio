"""
Ad Remix Service - Business logic for deconstructing and reconstructing ads
"""
import json
import google.generativeai as genai
from typing import Dict, Any
from app.schemas.ad_blueprint import AdBlueprint, AdConcept, BrandData
from app.prompts.ad_remix_prompts import build_deconstruction_prompt, build_reconstruction_prompt
import os


# Configure Gemini API
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))


async def deconstruct_template(template_image_url: str) -> AdBlueprint:
    """
    Analyze a template image and extract its structural blueprint
    
    Args:
        template_image_url: URL or path to the template image
        
    Returns:
        AdBlueprint with extracted structure
    """
    try:
        # Use Gemini Vision model
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        # Build the prompt
        prompt = build_deconstruction_prompt(template_image_url)
        
        # For now, we'll use the image URL directly
        # In production, you might want to download and process the image
        response = model.generate_content([
            prompt,
            {
                'mime_type': 'image/jpeg',
                'data': template_image_url  # This should be image data or URL
            }
        ])
        
        # Parse the JSON response
        blueprint_data = json.loads(response.text)
        
        # Validate and return as AdBlueprint
        return AdBlueprint(**blueprint_data)
        
    except json.JSONDecodeError as e:
        raise ValueError(f"Failed to parse blueprint JSON: {e}")
    except Exception as e:
        raise Exception(f"Failed to deconstruct template: {e}")


async def reconstruct_ad(
    blueprint: AdBlueprint,
    brand_data: BrandData
) -> AdConcept:
    """
    Generate a new ad concept by applying brand data to a blueprint
    
    Args:
        blueprint: The structural blueprint to follow
        brand_data: The new brand/product information
        
    Returns:
        AdConcept with generated content
    """
    try:
        # Use Gemini model
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        # Convert blueprint to dict
        blueprint_dict = blueprint.model_dump()
        
        # Build the reconstruction prompt
        prompt = build_reconstruction_prompt(
            blueprint=blueprint_dict,
            brand_name=brand_data.brand_name,
            brand_voice=brand_data.brand_voice or "",
            product_name=brand_data.product_name,
            product_description=brand_data.product_description,
            audience_demographics=brand_data.audience_demographics,
            audience_pain_points=brand_data.audience_pain_points or "",
            audience_goals=brand_data.audience_goals or "",
            campaign_offer=brand_data.campaign_offer,
            campaign_urgency=brand_data.campaign_urgency or "",
            campaign_messaging=brand_data.campaign_messaging
        )
        
        # Generate the ad concept
        response = model.generate_content(prompt)
        
        # Parse the JSON response
        concept_data = json.loads(response.text)
        
        # Validate and return as AdConcept
        return AdConcept(**concept_data)
        
    except json.JSONDecodeError as e:
        raise ValueError(f"Failed to parse ad concept JSON: {e}")
    except Exception as e:
        raise Exception(f"Failed to reconstruct ad: {e}")


def extract_json_from_response(text: str) -> Dict[str, Any]:
    """
    Extract JSON from a response that might have markdown code blocks
    """
    # Try to find JSON in markdown code blocks
    if "```json" in text:
        start = text.find("```json") + 7
        end = text.find("```", start)
        text = text[start:end].strip()
    elif "```" in text:
        start = text.find("```") + 3
        end = text.find("```", start)
        text = text[start:end].strip()
    
    return json.loads(text)
