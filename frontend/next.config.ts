import type { NextConfig } from "next";

// `next typegen` loads this config in the same phase as `next build`,
// so the command name is the only way to require BACKEND_URL for builds only.
const isBuild = process.argv[2] === "build";

function backendUrl(): string {
  const url = process.env.BACKEND_URL;
  if (url) {
    return url.replace(/\/+$/, "");
  }
  if (isBuild) {
    throw new Error("BACKEND_URL must be set for production builds, e.g. https://api.example.com");
  }
  return "http://localhost:8000";
}

const nextConfig: NextConfig = {
  reactCompiler: true,
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${backendUrl()}/api/:path*/` }];
  },
};

export default nextConfig;
