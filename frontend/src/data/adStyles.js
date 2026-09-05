// Master Catalog of Ad Styles (Archetypes)
// Standardized blueprints for the Remix Engine

export const AD_CATEGORIES = {
    TRUST_AUTHORITY: 'Trust & Authority',
    PROBLEM_SOLUTION: 'Problem / Solution',
    SOCIAL_PROOF: 'Social Proof & Native',
    DEMONSTRATION: 'Demonstration & Logic',
    DISRUPTION: 'Disruption'
};

export const adStyles = [
    // ========================================
    // Category 1: Trust & Authority
    // ========================================
    {
        id: 'local-hero-split',
        name: 'The "Local Hero" Split',
        category: AD_CATEGORIES.TRUST_AUTHORITY,
        description: 'Horizontal 50/50 split showing location and practitioner',
        bestFor: ['Medical', 'Legal', 'Financial', 'High-Ticket Services'],
        visualLayout: 'Horizontal 50/50 Split',
        topHalf: 'Exterior shot of building/office',
        bottomHalf: 'Action shot of practitioner/service provider',
        keyAssets: ['Circular Map Pin overlay showing location'],
        psychology: 'This is real, they are near me, and they are open',
        mood: 'Professional and trustworthy',
        lighting: 'Natural lighting with soft shadows',
        composition: 'Split-screen balanced composition',
        design_style: 'Clean corporate aesthetic',
        prompt: 'Professional split-screen composition, top half: modern office building exterior with clear signage, bottom half: confident professional in action helping client, circular map pin overlay with location marker, clean corporate aesthetic, natural lighting, photorealistic, 4k quality, professional photography'
    },
    {
        id: 'pr-feature',
        name: 'The PR Feature (The "As Seen In")',
        category: AD_CATEGORIES.TRUST_AUTHORITY,
        description: 'Single professional hero image with media credibility bar',
        bestFor: ['SaaS', 'Supplements', 'Professional Services', 'Tech'],
        visualLayout: 'Single hero image with Media Bar overlay',
        visualAnchors: ['Logos of credible publications (Forbes, Men\'s Health, Local News)'],
        psychology: 'Transferred authority - if they wrote about it, it must be legit',
        mood: 'Credible and authoritative',
        lighting: 'Editorial studio lighting',
        composition: 'Centered hero with media bar overlay',
        design_style: 'Sophisticated and premium',
        prompt: 'Professional hero shot of product or service in use, clean background, bottom third overlay with prestigious media logos (Forbes, TechCrunch, Wall Street Journal style), sophisticated lighting, editorial photography style, high-end commercial aesthetic, sharp focus, 4k quality'
    },
    {
        id: 'founders-promise',
        name: 'The "Founder\'s Promise"',
        category: AD_CATEGORIES.TRUST_AUTHORITY,
        description: 'Portrait with direct eye contact and personal touch',
        bestFor: ['Startups', 'Personal Brands', 'Coaching', 'Consulting'],
        visualLayout: 'Portrait with direct eye contact',
        textOverlay: 'Handwritten signature and mission quote',
        psychology: 'Accountability - a face behind the brand reduces fear of being scammed',
        mood: 'Authentic and trustworthy',
        lighting: 'Warm natural lighting',
        composition: 'Portrait centered with space for signature',
        design_style: 'Approachable and professional',
        prompt: 'Professional portrait of founder looking directly at camera with confident, trustworthy expression, clean neutral background, space for handwritten signature overlay, warm natural lighting, authentic and approachable mood, professional headshot style, sharp focus on eyes, 4k quality'
    },

    // ========================================
    // Category 2: Problem / Solution
    // ========================================
    {
        id: 'comic-strip-agitator',
        name: 'The Comic Strip Agitator',
        category: AD_CATEGORIES.PROBLEM_SOLUTION,
        description: 'Sequential narrative showing transformation journey',
        bestFor: ['Supplements', 'Fitness', 'Productivity Tools', 'Self-Help'],
        visualLayout: '4-Panel Grid (2x2) or 3-Panel Horizontal',
        sequence: 'Panel 1 (Pain/Struggle) → Panel 2 (Discovery) → Panel 3 (Result/Joy)',
        visualAnchors: ['Speech bubbles', 'Pow/Zap graphics', 'Exaggerated expressions'],
        psychology: 'Narrative transport - user sees themselves in the "Before" panel',
        mood: 'Energetic and transformative',
        lighting: 'Bright and vibrant',
        composition: 'Sequential panel layout',
        design_style: 'Bold and graphic',
        prompt: 'Comic book style sequential panels showing transformation story, panel 1: person struggling with problem (frustrated expression), panel 2: discovering solution (moment of realization), panel 3: happy result (triumphant pose), bold outlines, vibrant colors, speech bubbles, dynamic composition, graphic novel aesthetic'
    },
    {
        id: 'us-vs-them-chart',
        name: 'The "Us vs. Them" Chart',
        category: AD_CATEGORIES.PROBLEM_SOLUTION,
        description: 'Comparison table framing the rational choice',
        bestFor: ['SaaS', 'Supplements', 'Services', 'Subscriptions'],
        visualLayout: 'Split screen or table comparison',
        leftSide: 'Dull colors, X marks, list of negatives',
        rightSide: 'Bright colors, green checkmarks, list of benefits',
        psychology: 'Logic bias - frames purchase as the only rational choice',
        mood: 'Logical and comparative',
        lighting: 'Even flat lighting',
        composition: 'Split comparison layout',
        design_style: 'Clean infographic style',
        prompt: 'Clean comparison chart design, left side: competitor with red X marks and dull gray tones listing problems, right side: our product with green checkmarks and vibrant colors listing benefits, professional infographic style, clear typography, modern minimal design, high contrast, 4k quality'
    },
    {
        id: 'old-way-new-way',
        name: 'The "Old Way vs. New Way"',
        category: AD_CATEGORIES.PROBLEM_SOLUTION,
        description: 'Diagonal split showing evolution and progress',
        bestFor: ['Tech', 'Innovation', 'Disruptive Products', 'Modern Services'],
        visualLayout: 'Diagonal split',
        visualAnchors: ['Black & white (Old Way)', 'Vibrant color (New Way)'],
        psychology: 'Evolution - implies not switching makes you outdated',
        mood: 'Progressive and innovative',
        lighting: 'Contrasting lighting (dim vs bright)',
        composition: 'Diagonal split composition',
        design_style: 'Modern vs vintage contrast',
        prompt: 'Diagonal split composition, left side: outdated method in black and white with vintage aesthetic looking inefficient, right side: modern solution in vibrant colors looking sleek and efficient, clear contrast between past and future, professional advertising photography, dynamic composition, 4k quality'
    },

    // ========================================
    // Category 3: Social Proof & Native
    // ========================================
    {
        id: 'iphone-note',
        name: 'The "iPhone Note" Screenshot',
        category: AD_CATEGORIES.SOCIAL_PROOF,
        description: 'Native-looking personal note that blends into feeds',
        bestFor: ['E-commerce', 'Apps', 'Beauty', 'Lifestyle Products'],
        visualLayout: 'Exact replica of Apple Notes app',
        content: 'Checklist of reasons to switch or personal to-do list',
        psychology: 'Native camouflage - feels personal and unpolished, bypasses ad blindness',
        mood: 'Casual and personal',
        lighting: 'Screen glow lighting',
        composition: 'Mobile interface centered',
        design_style: 'iOS native interface',
        prompt: 'Exact replica of iPhone Notes app interface, yellow background, Marker Felt font, handwritten-style checklist of product benefits, realistic iOS interface elements, authentic screenshot aesthetic, casual and personal feel, mobile-first composition'
    },
    {
        id: 'testimonial-sandwich',
        name: 'The Testimonial Sandwich',
        category: AD_CATEGORIES.SOCIAL_PROOF,
        description: 'Product centered with social proof above and below',
        bestFor: ['E-commerce', 'Supplements', 'Beauty', 'Consumer Goods'],
        visualLayout: 'Product image centered with overlays',
        overlays: ['Top: 5-star rating graphic', 'Bottom: Specific customer quote'],
        psychology: 'De-risking - users trust other users more than the brand',
        mood: 'Trustworthy and validated',
        lighting: 'Bright even lighting',
        composition: 'Centered product with overlay elements',
        design_style: 'Clean and organized',
        prompt: 'Product centered on clean background, top overlay: gold 5-star rating with review count, bottom overlay: authentic customer testimonial quote with quotation marks, professional product photography, clean composition with space for text, bright even lighting, 4k quality'
    },
    {
        id: 'ugc-still',
        name: 'The "UGC" Still (User Generated Content)',
        category: AD_CATEGORIES.SOCIAL_PROOF,
        description: 'Authentic selfie-style content showing real usage',
        bestFor: ['Beauty', 'Fitness', 'Fashion', 'Lifestyle'],
        visualLayout: 'Selfie-style photo (mirror or front-facing camera)',
        keyDetail: 'Person holding product casually, imperfect background',
        psychology: 'Authenticity - high-polish feels like a lie, low-polish feels like truth',
        mood: 'Authentic and relatable',
        lighting: 'Natural smartphone lighting',
        composition: 'Casual selfie composition',
        design_style: 'Unpolished and genuine',
        prompt: 'Authentic user-generated content style, casual selfie with person holding product naturally, slightly imperfect background (bedroom, bathroom, gym), natural lighting, smartphone camera aesthetic, relatable and genuine mood, unpolished but clear, real person using real product'
    },

    // ========================================
    // Category 4: Demonstration & Logic
    // ========================================
    {
        id: 'exploded-view',
        name: 'The "Exploded View" (Ingredients)',
        category: AD_CATEGORIES.DEMONSTRATION,
        description: 'Product breakdown showing ingredients inside',
        bestFor: ['Supplements', 'Food & Beverage', 'Natural Products', 'Skincare'],
        visualLayout: 'Product centered with ingredient callouts',
        visualAnchors: ['Lines drawing to floating raw ingredients'],
        psychology: 'Transparency - shows exactly what\'s inside, implies purity and potency',
        mood: 'Educational and transparent',
        lighting: 'Bright clean lighting',
        composition: 'Centered with radial ingredient layout',
        design_style: 'Scientific and clean',
        prompt: 'Product bottle centered, clean white background, illustrated lines connecting to floating raw ingredients around it (fresh lemon, mushroom, ginger root, etc.), professional product photography, scientific diagram aesthetic, clean and educational, bright even lighting, ingredients look fresh and natural, 4k quality'
    },
    {
        id: 'texture-shot',
        name: 'The Texture Shot (Sensory)',
        category: AD_CATEGORIES.DEMONSTRATION,
        description: 'Extreme macro triggering sensory desire',
        bestFor: ['Food & Beverage', 'Skincare', 'Luxury Goods', 'Sensory Products'],
        visualLayout: 'Extreme macro close-up',
        subject: 'Fizz of tablet, creaminess of lotion, condensation on can',
        psychology: 'Sensory triggering - creates visceral desire to touch or taste',
        mood: 'Luxurious and appetizing',
        lighting: 'Dramatic macro lighting',
        composition: 'Extreme close-up with shallow depth',
        design_style: 'High-end product photography',
        prompt: 'Extreme macro photography, ultra close-up of product texture, fizzing bubbles or creamy texture or condensation droplets, shallow depth of field, beautiful bokeh, sensory details in sharp focus, professional food/product photography, appetizing or luxurious feel, dramatic lighting, 4k quality, highly detailed'
    },

    // ========================================
    // Category 5: Disruption (Pattern Interrupts)
    // ========================================
    {
        id: 'ugly-ad-doodle',
        name: 'The "Ugly Ad" (Doodle)',
        category: AD_CATEGORIES.DISRUPTION,
        description: 'Intentionally crude graphics that stand out',
        bestFor: ['Saturated Markets', 'Contrarian Brands', 'Disruptive Products'],
        visualLayout: 'Stick figures or MS Paint style graphics',
        psychology: 'Novelty - looks so bad it stands out in a feed of perfect photos',
        mood: 'Playful and disruptive',
        lighting: 'Flat illustration lighting',
        composition: 'Simple sketch layout',
        design_style: 'Intentionally crude and simple',
        prompt: 'Intentionally crude hand-drawn style, stick figure illustrations explaining concept, MS Paint aesthetic, simple doodles and arrows, childlike drawings, bright primary colors, deliberately unpolished look, whiteboard sketch style, stands out through simplicity and imperfection'
    },
    {
        id: 'warning-label',
        name: 'The "Warning Label"',
        category: AD_CATEGORIES.DISRUPTION,
        description: 'Caution-style design triggering attention',
        bestFor: ['Contrarian Messaging', 'Educational Products', 'High-Stakes Decisions'],
        visualLayout: 'Bright yellow/red background with caution tape',
        headline: 'Don\'t buy this until you read this',
        psychology: 'Curiosity gap - brain is wired to pay attention to warnings',
        mood: 'Urgent and attention-grabbing',
        lighting: 'High contrast lighting',
        composition: 'Centered warning layout',
        design_style: 'Industrial safety signage',
        prompt: 'Industrial warning label aesthetic, bright yellow or red background, black and yellow caution stripe borders, bold warning text style, attention-grabbing design, safety sign inspired, high contrast, urgent visual language, clean typography, professional signage style'
    },
    {
        id: 'notification-fakeout',
        name: 'The "Notification" Fakeout',
        category: AD_CATEGORIES.DISRUPTION,
        description: 'Realistic notification that grabs attention',
        bestFor: ['Apps', 'Services', 'Time-Sensitive Offers', 'Engagement'],
        visualLayout: 'Blurred background with notification bubble',
        psychology: 'Reflex - conditioned to check notifications immediately',
        mood: 'Urgent and attention-grabbing',
        lighting: 'Soft mobile screen glow',
        composition: 'Notification bubble in foreground',
        design_style: 'Mobile UI realistic',
        prompt: 'Blurred background scene, realistic smartphone notification bubble in foreground, iOS or Android notification style, "New Message" or "Calendar Reminder" text, authentic mobile UI design, subtle drop shadow, clean interface, triggers immediate attention, photorealistic mobile notification aesthetic'
    }
];

// Helper function to get styles by category
export const getStylesByCategory = (category) => {
    return adStyles.filter(style => style.category === category);
};

// Helper function to get all categories
export const getAllCategories = () => {
    return Object.values(AD_CATEGORIES);
};

// Helper function to search styles
export const searchStyles = (query) => {
    const lowerQuery = query.toLowerCase();
    return adStyles.filter(style =>
        style.name.toLowerCase().includes(lowerQuery) ||
        style.description.toLowerCase().includes(lowerQuery) ||
        style.bestFor.some(industry => industry.toLowerCase().includes(lowerQuery))
    );
};
