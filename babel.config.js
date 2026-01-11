module.exports = function(api) {
  api.cache(true);
  let plugins = [];

  // 'expo-router/babel' is deprecated in SDK 50+, already in babel-preset-expo
  plugins.push('react-native-worklets/plugin');

  return {
    
      presets: [
        ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
        'nativewind/babel',
      ],
    
    plugins,
  };
};
