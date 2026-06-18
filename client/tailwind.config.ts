import type { Config } from 'tailwindcss';
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg:      '#fdf6ee',
        surface: '#fffaf3',
        wood1:   '#c4862a',
        wood2:   '#e8d5b0',
        wood3:   '#f5e8cc',
        border:  'rgba(180,120,40,.2)',
        amber:   '#d97706',
        text:    '#2d1a05',
        muted:   '#8a6a3a',
        paw:     '#c05c28',
        warn:    '#dc2626',
        green:   '#16a34a',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        sans:    ['"Lato"', 'sans-serif'],
        mono:    ['"DM Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
} satisfies Config;
