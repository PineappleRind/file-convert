import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";
import {optimizeCssModules} from 'vite-plugin-optimize-css-modules';

export default defineConfig({
	plugins: [solidPlugin(),optimizeCssModules()],
	server: {
		port: 3000,
	},
	build: {
		target: "esnext",
	},
});
