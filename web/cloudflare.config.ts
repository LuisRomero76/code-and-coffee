import { bindings, defineConfig } from "cf/config";

export default defineConfig({
	worker: {
		name: "code-and-coffee",
		compatibilityDate: "2026-10-01",
		entrypoint: "worker/index.ts",
		assets: {
			notFoundHandling: "single-page-application",
			runWorkerFirst: [
				"/api/*",
				"/admin/*",
			],
		},
		env: {
			ASSETS: bindings.assets(),
		},
	},
});
