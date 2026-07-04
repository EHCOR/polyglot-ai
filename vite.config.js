import {defineConfig, loadEnv} from "vite"

export default defineConfig(({mode}) => {
	const env = loadEnv(mode, process.cwd(), "")
	const backendPort = env.PORT || "3000"

	return {
		plugins: [],
		server: {
			proxy: {
				"/api": `http://localhost:${backendPort}`,
			},
		},
	}
})
