// jest.config.js
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    roots: ['<rootDir>/src'],
    testMatch: [
        '**/__tests__/**/*.+(ts|tsx|js)',
        '**/*.(test|spec).+(ts|tsx|js)'
    ],
    transform: {
        '^.+\\.(ts|tsx)$': 'ts-jest',
    },
    setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
    moduleNameMapper: {
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
        '^@/(.*)$': '<rootDir>/src/$1'
    },
    collectCoverageFrom: [
        'src/**/*.{ts,tsx}',
        '!src/**/*.d.ts',
        '!src/index.tsx',
        '!src/prototype.tsx'
    ]
};