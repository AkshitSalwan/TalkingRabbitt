// next.config.js
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'react-native-fetch-blob': false,   // ← stubs out the bad AlaSQL dep
    }
    if (isServer) {
      config.resolve.alias['alasql'] = false  // ← prevents server-side import
    }
    return config
  },
}
module.exports = nextConfig