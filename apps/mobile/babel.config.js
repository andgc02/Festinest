module.exports = function (api) {
  api.cache(true);
  return {
    // Order matters: Expo first, then NativeWind preset to set the JSX importSource
    presets: ['babel-preset-expo', 'nativewind/babel'],
    // Note: Reanimated plugin must be listed last.
    plugins: ['react-native-reanimated/plugin'],
  };
};
