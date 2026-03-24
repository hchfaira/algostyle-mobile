import React, { useEffect } from 'react';
import { Platform, Pressable, StatusBar, StyleSheet } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';

interface IntroVideoScreenProps {
  onFinish: () => void;
}

// On web, public/ is served at the root — use a URL.
// On native, Metro bundles the asset via require().
const VIDEO_SOURCE: string | number =
  Platform.OS === 'web'
    ? '/intro.mp4'
    : require('../assets/intro.mp4');

export default function IntroVideoScreen({ onFinish }: IntroVideoScreenProps) {
  const player = useVideoPlayer(VIDEO_SOURCE, (p) => {
    p.loop = false;
    p.muted = true; // required for autoplay on web (browser autoplay policy)
  });

  useEffect(() => {
    // Trigger play after mount — more reliable than calling in the init callback
    player.play();

    const subscription = player.addListener('playToEnd', () => {
      onFinish();
    });
    // Fallback: skip intro if the video fails to load/play within 15 s
    const fallback = setTimeout(onFinish, 15_000);
    return () => {
      subscription.remove();
      clearTimeout(fallback);
    };
  }, [player, onFinish]);

  return (
    <Pressable onPress={onFinish} style={styles.container}>
      <StatusBar hidden />
      <VideoView
        player={player}
        style={styles.video}
        contentFit="cover"
        nativeControls={false}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  video: {
    width: '100%',
    height: '100%',
  },
});
