// firefly-config.js
// Central config for all Adobe Firefly API endpoints and related URLs

// firefly-config.js
// Central config for all Adobe Firefly API endpoints and related URLs

module.exports = {
  IMS_TOKEN_URL: "https://ims-na1.adobelogin.com/ims/token/v3",
  GENERATE_IMAGE_URL: "https://firefly-api.adobe.io/v3/images/generate",
  GENERATE_IMAGE_ASYNC_URL: "https://firefly-api.adobe.io/v3/images/generate-async", // For custom models
  GENERATE_OBJECT_COMPOSITE_URL: "https://firefly-api.adobe.io/v3/images/generate-object-composite-async",
  LOGO_PLACEMENT_URL: "https://firefly-api.adobe.io/v3/images/generate-object-composite", // Non-async version for logo placement
  GENERATE_IMAGE_UPLOAD_URL: "https://firefly-api.adobe.io/v3/images/upload",
  JOB_STATUS_URL: (jobId) => `https://firefly-api.adobe.io/v3/status/${jobId}`,
  
  // Custom model configuration for coffee cup generation
  CUSTOM_MODEL: {
    MODEL_VERSION: "image3_custom",
    COFFEE_CUP_MODEL_ID: process.env.FIREFLY_CUSTOM_MODEL_ID || "urn:aaid:sc:VA6C2:2b3a8a94-767c-488d-afd4-f766e4e41256" // Replace with your actual custom model ID
  }
};