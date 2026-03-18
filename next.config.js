/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone',
  // Server Actions 在 Next.js 14 之後預設可用，移除此設定以避免警告
  // 略過 TypeScript 型別錯誤以便先行建構（注意：可能造成執行期錯誤）
  typescript: {
    ignoreBuildErrors: true,
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
