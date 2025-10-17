module.exports = function (api) {
  api.cache(true);
  return {
    // Expo preset first.
    presets: ['babel-preset-expo'],
    // Keep Reanimated plugin last. NativeWind disabled (using StyleSheet).
    plugins: ['react-native-reanimated/plugin'],
  };
};
