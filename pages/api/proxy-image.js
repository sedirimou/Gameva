// Image proxy to resolve CORS issues with external CDN images
export default async function handler(req, res) {
  const { url } = req.query;
  
  if (!url) {
    return res.status(400).json({ error: 'Missing URL parameter' });
  }
  
  try {
    // Validate URL is from allowed domains
    const allowedDomains = ['static.kinguin.net', 'images.kinguin.net'];
    const urlObj = new URL(url);
    
    if (!allowedDomains.some(domain => urlObj.hostname === domain)) {
      return res.status(403).json({ error: 'Domain not allowed' });
    }
    
    // Fetch the image
    const imageResponse = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'image/*'
      }
    });
    
    if (!imageResponse.ok) {
      return res.status(404).json({ error: 'Image not found' });
    }
    
    // Get image data and content type
    const imageBuffer = await imageResponse.arrayBuffer();
    const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';
    
    // Set appropriate headers
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 1 day
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    // Send the image
    res.send(Buffer.from(imageBuffer));
    
  } catch (error) {
    console.error('Image proxy error:', error);
    res.status(500).json({ error: 'Failed to fetch image' });
  }
}