import axios from 'axios';

const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
const YOUTUBE_API_BASE_URL = 'https://www.googleapis.com/youtube/v3';

// Search for videos
export const searchYouTubeVideos = async (query, maxResults = 10) => {
  try {
    const response = await axios.get(`${YOUTUBE_API_BASE_URL}/search`, {
      params: {
        part: 'snippet',
        q: query,
        type: 'video',
        videoCategoryId: '10', // Music category
        maxResults: maxResults,
        key: YOUTUBE_API_KEY
      }
    });

    // Get video details for duration
    const videoIds = response.data.items.map(item => item.id.videoId).join(',');
    const detailsResponse = await axios.get(`${YOUTUBE_API_BASE_URL}/videos`, {
      params: {
        part: 'contentDetails,statistics',
        id: videoIds,
        key: YOUTUBE_API_KEY
      }
    });

    // Combine search results with video details
    const videos = response.data.items.map((item, index) => {
      const details = detailsResponse.data.items[index];
      return {
        videoId: item.id.videoId,
        title: item.snippet.title,
        artist: item.snippet.channelTitle,
        thumbnail: item.snippet.thumbnails.medium.url,
        duration: formatDuration(details.contentDetails.duration),
        publishedAt: item.snippet.publishedAt
      };
    });

    return videos;
  } catch (error) {
    console.error('YouTube API Error:', error);
    throw new Error('Failed to search YouTube videos');
  }
};

// Format ISO 8601 duration to readable format (PT4M33S -> 4:33)
const formatDuration = (isoDuration) => {
  const match = isoDuration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  
  const hours = (match[1] || '').replace('H', '');
  const minutes = (match[2] || '').replace('M', '');
  const seconds = (match[3] || '').replace('S', '');

  const parts = [];
  if (hours) parts.push(hours);
  parts.push(minutes || '0');
  parts.push(seconds.padStart(2, '0') || '00');

  return parts.join(':');
};

// Get video details by ID
export const getVideoDetails = async (videoId) => {
  try {
    const response = await axios.get(`${YOUTUBE_API_BASE_URL}/videos`, {
      params: {
        part: 'snippet,contentDetails',
        id: videoId,
        key: YOUTUBE_API_KEY
      }
    });

    const item = response.data.items[0];
    return {
      videoId: item.id,
      title: item.snippet.title,
      artist: item.snippet.channelTitle,
      thumbnail: item.snippet.thumbnails.medium.url,
      duration: formatDuration(item.contentDetails.duration),
      description: item.snippet.description
    };
  } catch (error) {
    console.error('YouTube API Error:', error);
    throw new Error('Failed to get video details');
  }
};
