import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

const isTest = process.env.VITEST === 'true';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	resolve: isTest ? { conditions: ['module', 'browser', 'development', 'production'] } : undefined,
		test: {
		include: ['src/**/*.test.ts'],
		pool: 'forks',
		execArgv: ['--experimental-sqlite'],
		coverage: {
			include: ['src/**/*.ts', 'src/**/*.svelte'],
			exclude: ['src/**/*.test.ts', 'src/**/*.d.ts', 'src/app.d.ts', 'src/**/*.css']
		}
	}
});
