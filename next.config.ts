import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
	/* config options here */
	env: {
		TRIGGER_SECRET_KEY: process.env.TRIGGER_SECRET_KEY,
	},
	experimental: {
		serverActions: {
			bodySizeLimit: '1GB', // Set the body size limit to 10MB
		},
	},
}

export default nextConfig
