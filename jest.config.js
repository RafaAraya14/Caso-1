// jest.config.js
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
    moduleNameMapper: {
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
        '^../logging$': '<rootDir>/src/__mocks__/logging.ts',
        '^../lib/supabase$': '<rootDir>/src/__mocks__/lib.ts',
        '^@/(.*)$': '<rootDir>/src/$1'
    },
    transform: {
        '^.+\\.(ts|tsx)?$': 'ts-jest',
        '^.+\\.(js|jsx)$': 'babel-jest',
    },
    globals: {
        'ts-jest': {
            useESM: true
        }
    },
    transformIgnorePatterns: [
        'node_modules/(?!(.*\\.mjs$))'
    ]
};