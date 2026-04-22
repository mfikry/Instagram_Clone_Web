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
    ],
  },
};

export default nextConfig;