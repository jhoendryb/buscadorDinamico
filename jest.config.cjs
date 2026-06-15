module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    roots: ['<rootDir>/src'],
    testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts', '**/tests/**/*.test.ts'],
    moduleFileExtensions: ['ts', 'tsx', 'js'],
    collectCoverageFrom: [
        'src/**/*.ts',
        '!src/**/*.d.ts',
    ],
};