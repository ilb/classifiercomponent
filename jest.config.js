module.exports = {
  collectCoverageFrom: ['**/*.{js,jsx,ts,tsx,mjs}', '!**/*.d.ts', '!**/node_modules/**'],
  moduleFileExtensions: ['js', 'json', 'jsx', 'ts', 'tsx', 'node', 'mjs'],
  testPathIgnorePatterns: ['/node_modules/', '/.next/'],
  transform: {
    '^.+\\.(js|jsx|ts|tsx|mjs)$': ['babel-jest', { presets: ['next/babel'] }]
  },
  transformIgnorePatterns: ['/node_modules/', '^.+\\.module\\.(css|sass|scss)$'],
  moduleNameMapper: {
    '^.+\\.module\\.(css|sass|scss)$': 'identity-obj-proxy',
    '^.+\\.(css|sass|scss)$': '<rootDir>/__mocks__/styleMock.js',
    '^.+\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/__mocks__/fileMock.js'
  },
  testEnvironment: 'node'
};