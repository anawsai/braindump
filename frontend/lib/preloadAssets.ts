import { Asset } from 'expo-asset';
import { Image } from 'react-native';

// List of mascot images to preload
const mascotImages = [
  require('../assets/mascot.png'),
  require('../assets/mascot_welcome.png'),
  require('../assets/mascot_reg.png'),
  require('../assets/mascot_dump.png'),
  require('../assets/loading_logo.jpg'),
];

/**
 * Preload all mascot images at app startup
 * This ensures they display instantly without flicker
 */
export async function preloadMascotImages(): Promise<void> {
  try {
    const imageAssets = mascotImages.map((image) => {
      if (typeof image === 'number') {
        // Local require() returns a number
        return Asset.fromModule(image).downloadAsync();
      }
      return Promise.resolve();
    });

    await Promise.all(imageAssets);
    console.log('Mascot images preloaded successfully');
  } catch (error) {
    console.warn('Failed to preload some images:', error);
    // Don't throw - app should still work even if preload fails
  }
}

/**
 * Prefetch remote images (for avatar URLs, etc.)
 */
export function prefetchImage(uri: string): void {
  if (uri) {
    Image.prefetch(uri).catch(() => {
      // Silently fail for remote images
    });
  }
}