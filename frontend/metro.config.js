// metro.config.js
const { getDefaultConfig } = require('@expo/metro-config');

const config = getDefaultConfig(__dirname);

// Ensure Hermes-specific transforms aren't used on web
config.transformer.unstable_transformProfile = 'default';

module.exports = config;
