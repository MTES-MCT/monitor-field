module.exports = {
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/*.d.ts'],
  coverageReporters: ['lcov', 'text-summary'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@app/(.*)$': '<rootDir>/src/app/$1',
    '^@assets/(.*)$': '<rootDir>/assets/$1',
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@config/(.*)$': '<rootDir>/src/config/$1',
    '^@constants/(.*)$': '<rootDir>/src/constants/$1',
    '^@contexts/(.*)$': '<rootDir>/src/contexts/$1',
    '^@database/(.*)$': '<rootDir>/src/database/$1',
    '^@domain/(.*)$': '<rootDir>/src/domain/$1',
    '^@features/(.*)$': '<rootDir>/src/features/$1',
    '^@hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^@infrastructure/(.*)$': '<rootDir>/src/infrastructure/$1',
    '^@storage$': '<rootDir>/src/storage',
    '^@types/(.*)$': '<rootDir>/src/types/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1'
  },
  preset: 'jest-expo',
  testMatch: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.test.tsx'],
  // jest-expo transforms @sentry/react-native but not the @sentry/* ESM packages it pulls in.
  transformIgnorePatterns: [
    '/node_modules/(?!(.pnpm|react-native|@react-native|@react-native-community|expo|@expo|@expo-google-fonts|react-navigation|@react-navigation|@sentry|native-base|standard-navigation))',
    '/node_modules/react-native-reanimated/plugin/',
    '/node_modules/@react-native/babel-preset/'
  ]
}
