/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  pageExtensions: ['ts', 'tsx'],
  // 產出獨立可執行包，方便在其他位置以 node server.js 執行
  output: 'standalone',
  // 允許忽略 TypeScript 與 ESLint 錯誤以便先進行打包
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config, { isServer }) => {
    // 伺服器端可以使用 Node.js 的模組
    if (isServer) {
      return config;
    }

    // 客戶端環境不應該包含這些 Node.js 模組
    return {
      ...config,
      resolve: {
        ...config.resolve,
        fallback: {
          ...config.resolve.fallback,
          // 將這些 Node.js 模組替換為空模組或假模組
          net: false,
          tls: false,
          fs: false,
          dns: false,
          child_process: false,
          mssql: false,
          tedious: false
        },
      },
    };
  }
};

module.exports = nextConfig;
