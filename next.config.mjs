/** @type {import('next').NextConfig} */
const nextConfig = {
  // StrictMode's dev double-mount corrupts the pinned master timeline;
  // production semantics are single-mount, so we match them in dev.
  reactStrictMode: false,
  devIndicators: false,
};

export default nextConfig;
