/**
 * Utility function to extract the first image URL from story content
 * Supports both HTML img tags and markdown image syntax
 */

/**
 * Extract the first image URL from content (HTML or Markdown)
 * @param {string} content - The story content
 * @returns {string} - The first image URL found, or empty string if none
 */
export const extractFirstImage = (content) => {
  if (!content || typeof content !== "string") {
    return "";
  }

  // HTML img tag pattern
  const htmlImgRegex = /<img[^>]+src\s*=\s*["']([^"']+)["'][^>]*>/i;

  // Markdown image pattern ![alt](url)
  const markdownImgRegex = /!\[.*?\]\(([^)]+)\)/;

  // Base64 image pattern to exclude them (they're too large)
  const base64Regex = /^data:image/;

  // Try HTML img tag first
  const htmlMatch = content.match(htmlImgRegex);
  if (htmlMatch && htmlMatch[1]) {
    const imageUrl = htmlMatch[1].trim();
    // Skip base64 images as they're too large for optimization
    if (!base64Regex.test(imageUrl)) {
      return imageUrl;
    }
  }

  // Try markdown image syntax
  const markdownMatch = content.match(markdownImgRegex);
  if (markdownMatch && markdownMatch[1]) {
    const imageUrl = markdownMatch[1].trim();
    // Skip base64 images
    if (!base64Regex.test(imageUrl)) {
      return imageUrl;
    }
  }

  return "";
};

/**
 * Extract all image URLs from content
 * @param {string} content - The story content
 * @returns {Array} - Array of image URLs found
 */
export const extractAllImages = (content) => {
  if (!content || typeof content !== "string") {
    return [];
  }

  const images = [];
  const base64Regex = /^data:image/;

  // Find all HTML img tags
  const htmlImgRegex = /<img[^>]+src\s*=\s*["']([^"']+)["'][^>]*>/gi;
  let htmlMatch;
  while ((htmlMatch = htmlImgRegex.exec(content)) !== null) {
    const imageUrl = htmlMatch[1].trim();
    if (!base64Regex.test(imageUrl)) {
      images.push(imageUrl);
    }
  }

  // Find all markdown images
  const markdownImgRegex = /!\[.*?\]\(([^)]+)\)/g;
  let markdownMatch;
  while ((markdownMatch = markdownImgRegex.exec(content)) !== null) {
    const imageUrl = markdownMatch[1].trim();
    if (!base64Regex.test(imageUrl) && !images.includes(imageUrl)) {
      images.push(imageUrl);
    }
  }

  return images;
};

/**
 * Check if content contains any images
 * @param {string} content - The story content
 * @returns {boolean} - True if content has images
 */
export const hasImages = (content) => {
  return extractFirstImage(content) !== "";
};
