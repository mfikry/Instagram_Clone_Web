/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'kugxaypvchfcywozmgaf.supabase.co', // Ini URL Supabase lu
        port: '',
        pathname: '/storage/v1/object/public/media/**', // Izinkan semua foto di bucket media
      },
      {
        protocol: 'https',
        hostname: 'ui-avatars.com', // ✨ TAMBAHIN INI
        port: '',
        pathname: '/api/**', // ✨ TAMBAHIN INI
      },
    ],
  },
};

export default nextConfig;