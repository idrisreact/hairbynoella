import { url } from "inspector";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images:{
   remotePatterns:[{hostname:"fakestoreapi.com"},{hostname:'images.pexels.com'}]

  }
};

export default nextConfig;
