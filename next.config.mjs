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
  async redirects() {
    return [
      {
        source: "/news",
        has: [{ type: "query", key: "slug", value: "(?<slug>[^&]+)" }],
        destination: "/news/:slug",
        permanent: false
      },
      { source: "/index.html", destination: "/", permanent: false },
      { source: "/all-products.html", destination: "/all-products", permanent: false },
      { source: "/product.html", destination: "/product", permanent: false },
      { source: "/cart.html", destination: "/cart", permanent: false },
      { source: "/check-out.html", destination: "/check-out", permanent: false },
      { source: "/order-success.html", destination: "/order-success", permanent: false },
      { source: "/news.html", destination: "/news", permanent: false },
      { source: "/privacy-policy.html", destination: "/privacy-policy", permanent: false },
      { source: "/delivery-policy.html", destination: "/delivery-policy", permanent: false },
      { source: "/return-policy.html", destination: "/return-policy", permanent: false },
      { source: "/checking-policy.html", destination: "/checking-policy", permanent: false },
      { source: "/payment-policy.html", destination: "/payment-policy", permanent: false },
      { source: "/address.html", destination: "/address", permanent: false }
    ];
  }
};

export default nextConfig;
