import React, { useRef, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';

export default function YouTubePlayerComponent({ 
  videoId, 
  onEnd, 
  onReady,
  playing = true,
  onChangeState
}) {
  const playerRef = useRef(null);

  useEffect(() => {
    if (videoId && playerRef.current) {
      console.log('Playing video:', videoId);
    }
  }, [videoId]);

  const handleReady = () => {
    console.log('Player ready - attempting auto-play');
    if (onReady) {
      onReady();
    }
    // Force play after player is ready
    if (playerRef.current && playing) {
      setTimeout(() => {
        console.log('Forcing play');
      }, 500);
    }
  };

  const handleStateChange = (state) => {
    console.log('Player state:', state);
    if (onChangeState) {
      onChangeState(state);
    }
    
    if (state === 'ended' && onEnd) {
      onEnd();
    }
  };

  if (!videoId) {
    return null;
  }

  return (
    <View style={styles.container}>
      <YoutubePlayer
        ref={playerRef}
        height={200}
        width="100%"
        videoId={videoId}
        play={playing}
        onReady={handleReady}
        onChangeState={handleStateChange}
        webViewStyle={styles.webView}
        webViewProps={{
          allowsInlineMediaPlayback: true,
          mediaPlaybackRequiresUserAction: false,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#000',
    borderRadius: 12,
    overflow: 'hidden',
  },
  webView: {
    opacity: 0.99,
  },
});