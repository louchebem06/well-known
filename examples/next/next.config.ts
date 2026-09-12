import { withWellKnown } from "@well-known/next";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	reactStrictMode: true,
};

export default withWellKnown()(nextConfig);
