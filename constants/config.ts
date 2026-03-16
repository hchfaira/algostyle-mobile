// Change this to your backend URL
// Use your local IP for physical device testing (not localhost)
export const API_BASE_URL = __DEV__
  ? 'http://192.168.1.71:8000'   // ← Local machine IP — backend running here
  : 'https://api.algostyle.app';

export const API_TIMEOUT = 30000;

export const APP_CONFIG = {
  name: 'AlgoStyle',
  tagline: 'Your AI Fashion Assistant',
  version: '0.1.0',
};
