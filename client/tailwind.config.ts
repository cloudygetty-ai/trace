import type { Config } from 'tailwindcss';
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg:      '#1a1208',
        wood1:   '#2e1f0e',
        wood2:   '#3d2b14',
        wood3:   '#5c3d1e',
        border:  'rgba(255,210,140,.15)',
        amber:   '#f0a830',
        cream:   '#fdf0d8',
        muted:   '#b89060',
        paw:     '#e8764a',
        glass:   'rgba(255,245,220,.06)',
        warn:    '#e05050',
        green:   '#5cb85c',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        sans:    ['"Lato"', 'sans-serif'],
        mono:    ['"DM Mono"', 'monospace'],
      },
      backgroundImage: {
        'wood-grain': "url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='400' height='400' filter='url(%23n)' opacity='.04'/%3E%3C/svg%3E")",
      },
    },
  },
  plugins: [],
} satisfies Config;
