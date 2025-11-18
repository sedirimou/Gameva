/**
 * VideoEmbed Component - YouTube and Vimeo video embeds
 */
const VideoEmbed = ({ data }) => {
  const {
    videoUrl = '',
    aspectRatio = '16:9',
    alignment = 'center',
    customClasses = '',
    marginTop = '0',
    marginBottom = '1rem'
  } = data;

  const alignmentClasses = {
    left: 'text-left',
    center: 'text-center mx-auto',
    right: 'text-right ml-auto'
  };

  const aspectRatioClasses = {
    '16:9': 'aspect-video',
    '4:3': 'aspect-[4/3]',
    '1:1': 'aspect-square'
  };

  const containerStyle = {
    marginTop,
    marginBottom
  };

  // Extract video ID and determine platform
  const getVideoEmbedUrl = (url) => {
    if (!url) return null;

    // YouTube patterns
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const youtubeMatch = url.match(youtubeRegex);
    
    if (youtubeMatch) {
      return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
    }

    // Vimeo patterns
    const vimeoRegex = /(?:vimeo\.com\/)([0-9]+)/;
    const vimeoMatch = url.match(vimeoRegex);
    
    if (vimeoMatch) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }

    return null;
  };

  const embedUrl = getVideoEmbedUrl(videoUrl);

  if (!embedUrl) {
    return (
      <div 
        className={`${alignmentClasses[alignment]} ${customClasses}`}
        style={containerStyle}
      >
        <div className="bg-gray-200 rounded-lg p-8 text-center">
          <div className="text-gray-500 text-sm">
            {videoUrl ? 'Invalid video URL' : 'No video URL provided'}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            Supports YouTube and Vimeo URLs
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`${alignmentClasses[alignment]} ${customClasses}`}
      style={containerStyle}
    >
      <div className={`${aspectRatioClasses[aspectRatio]} rounded-lg overflow-hidden shadow-sm`}>
        <iframe
          src={embedUrl}
          title="Video"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        />
      </div>
    </div>
  );
};

export default VideoEmbed;