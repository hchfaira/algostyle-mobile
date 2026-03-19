/** @type {import('jest').Config} */
module.exports = {
  // Use node environment for pure TypeScript unit tests (no React Native)
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': ['babel-jest', { presets: ['@babel/preset-typescript'] }],
  },
  testMatch: ['**/__tests__/unit/**/*.test.ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
};
