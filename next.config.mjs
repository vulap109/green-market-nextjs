const requestedBuildCpus = Number.parseInt(process.env.NEXT_BUILD_CPUS || "", 10);
const buildCpus =
  Number.isFinite(requestedBuildCpus) && requestedBuildCpus > 0 ? requestedBuildCpus : undefined;

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.vietqr.io",
        pathname: "/image/**"
      },
      {
        protocol: "https",
        hostname: "**.public.blob.vercel-storage.com",
        pathname: "/**"
      }
    ]
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "4.5mb"
    },
    ...(buildCpus
      ? {
          cpus: buildCpus,
          staticGenerationMaxConcurrency: buildCpus
        }
      : {})
  }
};

export default nextConfig;
