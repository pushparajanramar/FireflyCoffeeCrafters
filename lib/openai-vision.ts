import OpenAI from 'openai';
import { OPENAI_CONFIG } from './openai-config';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: OPENAI_CONFIG.apiKey,
});

export interface CupCoordinates {
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
  cupType: 'paper' | 'plastic' | 'ceramic' | 'glass' | 'unknown';
  centerX: number;
  centerY: number;
}

export interface DetailedCupPoints {
  targetCenter: { x: number; y: number };
  cupStructure: {
    rimY: number;
    bottomY: number;
    rimLeftX: number;
    rimRightX: number;
    cupCenterX: number;
  };
  confidence: number;
}

/**
 * Uses OpenAI GPT-4 Vision API to analyze an image and detect cup coordinates
 */
export async function getCupCoordinates(imageUrl: string): Promise<CupCoordinates | null> {
  try {
    console.log('[Vision] Analyzing image for cup detection:', imageUrl);
    
    const response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this image and detect ONLY the physical cup container walls - completely ignore all foam, cream, and beverage content.

CRITICAL INSTRUCTIONS:
1. IGNORE ALL FOAM/CREAM: Do not include any white foam, whipped cream, or beverage toppings in your measurements
2. DETECT CUP WALLS ONLY: Focus only on the solid cup container (paper, plastic, ceramic, glass)
3. EXCLUDE HANDLES: Measure only the cylindrical cup body width, not handles or spouts
4. LOOK BELOW THE FOAM: If there's foam on top, detect the cup walls underneath it

The logo must be placed on the PHYSICAL CUP SURFACE, not on foam or beverage content.

Provide coordinates for the CUP CONTAINER ONLY:
- x: left edge of the SOLID CUP WALL (0-1 normalized)
- y: top edge of the SOLID CUP RIM, ignore any foam above it (0-1 normalized)
- width: SOLID CUP BODY width only, no handles (0-1 normalized) 
- height: SOLID CUP height from rim to bottom, ignore foam (0-1 normalized)
- confidence: detection confidence (0-1)
- cupType: one of 'paper', 'plastic', 'ceramic', 'glass', 'unknown'
- centerX: center X of the SOLID CUP WALL surface (0-1 normalized)
- centerY: center Y of the SOLID CUP WALL surface, NOT foam level (0-1 normalized)

REMEMBER: You are detecting the cup container itself, not the beverage or foam inside it. Look for the cup walls, rim, and bottom - ignore everything else.

Example response format:
{
  "x": 0.3,
  "y": 0.2,
  "width": 0.4,
  "height": 0.6,
  "confidence": 0.95,
  "cupType": "paper",
  "centerX": 0.5,
  "centerY": 0.5
}`
            },
            {
              type: "image_url",
              image_url: {
                url: imageUrl,
                detail: "high"
              }
            }
          ]
        }
      ],
      max_tokens: 500,
      temperature: 0.1, // Low temperature for consistent detection
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      console.error('[Vision] No response content from OpenAI');
      return null;
    }

    console.log('[Vision] Raw OpenAI response:', content);

    // Extract JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('[Vision] No JSON found in response');
      return null;
    }

    const coordinates: CupCoordinates = JSON.parse(jsonMatch[0]);
    
    // Validate the coordinates
    if (
      typeof coordinates.x !== 'number' ||
      typeof coordinates.y !== 'number' ||
      typeof coordinates.width !== 'number' ||
      typeof coordinates.height !== 'number' ||
      coordinates.x < 0 || coordinates.x > 1 ||
      coordinates.y < 0 || coordinates.y > 1 ||
      coordinates.width <= 0 || coordinates.width > 1 ||
      coordinates.height <= 0 || coordinates.height > 1
    ) {
      console.error('[Vision] Invalid coordinates detected:', coordinates);
      return null;
    }

    console.log('[Vision] Cup detected successfully:', coordinates);
    return coordinates;

  } catch (error) {
    console.error('[Vision] Error in cup detection:', error);
    return null;
  }
}

/**
 * Advanced cup analysis with multiple detection strategies
 */
export async function analyzeImageForCupPlacement(imageUrl: string): Promise<{
  primary: CupCoordinates | null;
  suggestions: Array<{
    area: 'center' | 'upper' | 'lower' | 'left' | 'right';
    coordinates: CupCoordinates;
    reasoning: string;
  }>;
  imageAnalysis: {
    cupCount: number;
    dominantColors: string[];
    lighting: 'bright' | 'moderate' | 'dim';
    background: 'clean' | 'textured' | 'complex';
    hasCreamLayer?: boolean;
    beverage?: string;
  };
}> {
  try {
    console.log('[Vision] Starting advanced cup analysis:', imageUrl);
    
    const response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this image to find the SOLID CUP CONTAINER for logo placement - completely ignore all foam, cream, and beverage content.

CRITICAL FOAM EXCLUSION RULES:
1. IGNORE WHITE FOAM/CREAM: Any white, fluffy, or textured content on top is beverage foam - ignore it completely
2. FIND THE CUP WALLS: Look for the solid container walls (paper, plastic, ceramic, glass) underneath any beverage content
3. DETECT CUP STRUCTURE: Focus on the cup rim, walls, and sleeve - these are the physical surfaces for logo placement
4. NO FOAM COORDINATES: Never include foam, whipped cream, or beverage toppings in measurements

The logo must go on the PHYSICAL CUP SURFACE, not floating on foam or beverage content.

Analyze and provide:
1. PRIMARY CUP DETECTION - Main cup container coordinates (excluding beverage/toppings)
2. ALTERNATIVE PLACEMENT SUGGESTIONS - Other suitable cup surface areas for logo placement
3. IMAGE ANALYSIS - Overall image characteristics

Respond with this exact JSON structure:
{
  "primary": {
    "x": 0.0,
    "y": 0.0,
    "width": 0.0,
    "height": 0.0,
    "confidence": 0.0,
    "cupType": "paper|plastic|ceramic|glass|unknown",
    "centerX": 0.0,
    "centerY": 0.0
  },
  "suggestions": [
    {
      "area": "center|upper|lower|left|right",
      "coordinates": {
        "x": 0.0,
        "y": 0.0,
        "width": 0.0,
        "height": 0.0,
        "confidence": 0.0,
        "cupType": "paper|plastic|ceramic|glass|unknown",
        "centerX": 0.0,
        "centerY": 0.0
      },
      "reasoning": "explanation focusing on cup surface placement"
    }
  ],
  "imageAnalysis": {
    "cupCount": 0,
    "dominantColors": ["color1", "color2"],
    "lighting": "bright|moderate|dim",
    "background": "clean|textured|complex",
    "hasCreamLayer": true|false,
    "beverage": "espresso|latte|cappuccino|americano|other"
  }
}

All coordinates should be normalized (0-1) and represent the PHYSICAL CUP BODY boundaries only. Ignore beverage content, cream layers, foam, toppings, AND cup handles/spouts. Focus on the cylindrical cup body surface areas where a logo would be physically placed on the container.`
            },
            {
              type: "image_url",
              image_url: {
                url: imageUrl,
                detail: "high"
              }
            }
          ]
        }
      ],
      max_tokens: 1000,
      temperature: 0.1,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      console.error('[Vision] No response content from advanced analysis');
      return {
        primary: null,
        suggestions: [],
        imageAnalysis: {
          cupCount: 0,
          dominantColors: [],
          lighting: 'moderate',
          background: 'clean',
          hasCreamLayer: false,
          beverage: 'unknown'
        }
      };
    }

    console.log('[Vision] Advanced analysis response:', content);

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('[Vision] No JSON found in advanced analysis response');
      return {
        primary: null,
        suggestions: [],
        imageAnalysis: {
          cupCount: 0,
          dominantColors: [],
          lighting: 'moderate',
          background: 'clean',
          hasCreamLayer: false,
          beverage: 'unknown'
        }
      };
    }

    const analysis = JSON.parse(jsonMatch[0]);
    console.log('[Vision] Advanced cup analysis successful:', analysis);
    return analysis;

  } catch (error) {
    console.error('[Vision] Error in advanced cup analysis:', error);
    return {
      primary: null,
      suggestions: [],
      imageAnalysis: {
        cupCount: 0,
        dominantColors: [],
        lighting: 'moderate',
        background: 'clean',
        hasCreamLayer: false,
        beverage: 'unknown'
      }
    };
  }
}

/**
 * Gets detailed cup measurement points for precise logo placement
 */
export async function getDetailedCupPoints(imageUrl: string, imageWidth: number = 2048, imageHeight: number = 2048): Promise<DetailedCupPoints | null> {
  try {
    console.log('[Vision] Getting detailed cup reference points for precise placement');
    
    const response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `This is a 16oz coffee cup with these physical dimensions:
- Height: 16 cm
- Top rim diameter: 9.2 cm
- The cup tapers from top to bottom (narrower at base)

TASK: Find the placement point for a logo that should be:
- Vertically: 8 cm from the bottom (50% of height) = halfway down the cup
- Horizontally: On the cup's center axis at that height

IMPORTANT:
- Measure from the BOTTOM of the cup (where it touches the surface)
- Measure to the TOP RIM (the elliptical opening, NOT the cocoa powder surface)
- The point should be INSIDE the cup's visible face, at the midpoint

Image size: ${imageWidth}x${imageHeight} pixels

Return JSON:
{
  "logoCenter": {"x": <pixels>, "y": <pixels>},
  "measurements": {
    "cupTopY": <rim Y position>,
    "cupBottomY": <base Y position>,
    "cupHeightPixels": <total height in pixels>,
    "midpointY": <50% height Y position>,
    "cupCenterX": <horizontal center>
  }
}`
            },
            {
              type: "image_url",
              image_url: {
                url: imageUrl,
                detail: "high"
              }
            }
          ]
        }
      ],
      max_tokens: 500,
      temperature: 0.1,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      console.error('[Vision] No response content from detailed cup analysis');
      return null;
    }

    console.log('[Vision] Raw detailed cup analysis response:', content);

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('[Vision] No JSON found in detailed cup response');
      return null;
    }

    const points: DetailedCupPoints = JSON.parse(jsonMatch[0]);
    
    // Validate the new response structure
    if (!points.targetCenter || typeof points.targetCenter.x !== 'number' || typeof points.targetCenter.y !== 'number') {
      console.error('[Vision] Invalid or missing targetCenter');
      return null;
    }
    
    if (!points.cupStructure) {
      console.error('[Vision] Invalid or missing cupStructure');
      return null;
    }
    
    const requiredStructureFields = ['rimY', 'bottomY', 'rimLeftX', 'rimRightX', 'cupCenterX'];
    for (const field of requiredStructureFields) {
      if (typeof points.cupStructure[field as keyof typeof points.cupStructure] !== 'number') {
        console.error(`[Vision] Invalid or missing cupStructure.${field}`);
        return null;
      }
    }
    
    if (typeof points.confidence !== 'number') {
      console.error('[Vision] Invalid or missing confidence');
      return null;
    }

    // Convert pixel coordinates to normalized (0-1) coordinates
    const normalizedPoints: DetailedCupPoints = {
      targetCenter: { 
        x: points.targetCenter.x / imageWidth, 
        y: points.targetCenter.y / imageHeight 
      },
      cupStructure: {
        rimY: points.cupStructure.rimY / imageHeight,
        bottomY: points.cupStructure.bottomY / imageHeight,
        rimLeftX: points.cupStructure.rimLeftX / imageWidth,
        rimRightX: points.cupStructure.rimRightX / imageWidth,
        cupCenterX: points.cupStructure.cupCenterX / imageWidth
      },
      confidence: points.confidence / 100 // Convert 0-100 to 0-1
    };

    console.log('[Vision] Detailed cup points detected successfully:', normalizedPoints);
    console.log('[Vision] Cup structure analysis:');
    console.log(`[Vision] - Rim: Y=${(normalizedPoints.cupStructure.rimY * 100).toFixed(1)}%, Left=${(normalizedPoints.cupStructure.rimLeftX * 100).toFixed(1)}%, Right=${(normalizedPoints.cupStructure.rimRightX * 100).toFixed(1)}%`);
    console.log(`[Vision] - Bottom: Y=${(normalizedPoints.cupStructure.bottomY * 100).toFixed(1)}%`);
    console.log(`[Vision] - Target center: X=${(normalizedPoints.targetCenter.x * 100).toFixed(1)}%, Y=${(normalizedPoints.targetCenter.y * 100).toFixed(1)}%`);
    console.log(`[Vision] - Cup width: ${((normalizedPoints.cupStructure.rimRightX - normalizedPoints.cupStructure.rimLeftX) * 100).toFixed(1)}% of image`);
    return normalizedPoints;

  } catch (error) {
    console.error('[Vision] Error in detailed cup analysis:', error);
    return null;
  }
}