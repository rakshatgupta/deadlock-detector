import type { Config } from 'tailwindcss';
export default { content: ['./app/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'], theme: { extend: { colors: { ink:'#17251e', paper:'#f7f8f4', moss:'#476b52', line:'#dce3d9' } } }, plugins: [] } satisfies Config;
