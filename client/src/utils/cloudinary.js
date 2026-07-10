const DEFAULT_TRANSFORMS = 'q_auto,f_auto,w_800';

const needsTransforms = (url) => {
  if (!url || typeof url !== 'string') return false;
  if (!url.includes('res.cloudinary.com')) return false;
  if (!url.includes('/upload/')) return false;
  if (url.includes('q_auto') || url.includes('f_auto') || url.includes('w_')) return false;
  return true;
};

export const optimizeCloudinary = (url, transforms = DEFAULT_TRANSFORMS) => {
  if (!url || typeof url !== 'string' || url.trim() === '') return null;
  if (!needsTransforms(url)) return url;
  return url.replace('/upload/', `/upload/${transforms}/`);
};
