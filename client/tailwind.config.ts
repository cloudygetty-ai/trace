import type { Config } from 'tailwindcss';
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg:     '#07090a',
        s1:     '#0c0f10',
        s2:     '#121618',
        s3:     '#181d20',
        border: '#222930',
        cyan:   '#00e0ff',
        green:  '#3ddc84',
        amber:  '#ffb400',
        warn:   '#ff4040',
      },
      fontFamily: {
        mono: ['"Space Mono"', 'monospace'],
        sans: ['"Space Grotesk"', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;
