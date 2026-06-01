export default {
    testEnvironment: 'jsdom',
    transform: {
        '^.+\.js$': 'babel-jest'
    },
    moduleFileExtensions: ['js', 'json'],
    testMatch: ['**/tests/**/*.test.js']
};