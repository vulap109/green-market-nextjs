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
      }
    ]
  },
  ...(buildCpus
    ? {
        experimental: {
          cpus: buildCpus,
          staticGenerationMaxConcurrency: buildCpus
        }
      }
    : {})
};

export default nextConfig;
