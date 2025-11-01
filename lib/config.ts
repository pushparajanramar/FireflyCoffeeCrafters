export const APP_CONFIG = {
  PASSCODE: "4263",
  // Adobe Firefly Custom Model Configuration
  USE_CUSTOM_MODEL: process.env.USE_FIREFLY_CUSTOM_MODEL !== 'false' && false, // Default to false until model is verified
  CUSTOM_MODEL_ID: process.env.FIREFLY_CUSTOM_MODEL_ID || "urn:aaid:sc:VA6C2:2b3a8a94-767c-488d-afd4-f766e4e41256",
} as const
