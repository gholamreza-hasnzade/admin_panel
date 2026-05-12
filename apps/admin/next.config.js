/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    /** Smaller client bundles for icon-only imports from `lucide-react`. */
    optimizePackageImports: ["lucide-react"],
  },
};

export default nextConfig;
