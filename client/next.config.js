module.exports = {
  async redirects() {
    return [
      {
        source: "/admin",
        destination: "/admin/digitalrupiah",
        permanent: true,
      },
    ];
  },
  webpack: (config, { buildId, dev }) => {
    // This allows the app to refer to files through our symlink
    config.resolve.symlinks = false;
    return config;
  },
};
