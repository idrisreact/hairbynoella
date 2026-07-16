import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images:{
   remotePatterns:[
    {hostname:"fakestoreapi.com"},
    {hostname:'images.pexels.com'},
    // UploadThing (customer hair photos)
    {hostname:"utfs.io"},
    {hostname:"*.ufs.sh"},
   ]

  }
};

export default nextConfig;
