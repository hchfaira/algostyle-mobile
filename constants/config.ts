// Change this to your backend URL
// Use your local IP for physical device testing (not localhost)
import { Platform } from 'react-native';

export const API_BASE_URL = __DEV__
  // On web (browser), "localhost" resolves correctly.
  // On a physical/emulated device, use the LAN IP so the device can reach the dev machine.
  ? (Platform.OS === 'web' ? 'http://localhost:8000' : 'http://192.168.1.71:8000')
  : 'https://api.algostyle.app';

export const API_TIMEOUT = 30000;

export const APP_CONFIG = {
  name: 'AlgoStyle',
  tagline: 'Your AI Fashion Assistant',
  version: '0.1.0',
};
