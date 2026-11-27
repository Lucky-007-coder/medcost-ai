/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#000000',        // Main dark background
          surface: '#080B09',   // Secondary dark background
          card: '#0F1412',      // Card background
          border: '#1F2622',    // Subtle borders
          text: '#FFFFFF',      // Primary text
          muted: '#9CA3AF',     // Secondary/muted text
          accent: '#52B788',    // Primary green accent
          accentLight: '#95D5B2'// Secondary green
        },
        canvas: {
          DEFAULT: '#FBFBFA', // Primary warm off-white editorial background
          card: '#FFFFFF',
          subtle: '#F4F5F0',  // Very soft secondary card tint
          muted: '#EAECE5',
        },
        forest: {
          DEFAULT: '#1B4332', // Primary brand deep forest
          deep: '#112D22',    // Darker hero card forest
          mid: '#2D6A4F',     // Secondary brand mid forest
          light: '#3F8A68',
          50: '#F2F8F5',
          100: '#E2EFE9',
          200: '#C5DFD3',
          300: '#9ECAAE',
          400: '#72B08B',
          500: '#52B788',     // Accent vibrant emerald sage
          600: '#2D6A4F',     // Secondary brand
          700: '#1B4332',     // Primary brand
          800: '#153628',
          900: '#0E241B',
        },
        emerald: {
          accent: '#52B788',  // Accent color
        },
        sage: {
          DEFAULT: '#E6EFEA', // Soft sage for pills & badges
          light: '#F0F6F3',
          border: '#CBE0D4',
          dark: '#3A6B52',
        },
        ink: {
          DEFAULT: '#111827', // Primary text
          secondary: '#4B5563', // Secondary text
          muted: '#6B7280',
          light: '#9CA3AF',
          dark: '#0B0F17',
        },
        border: {
          DEFAULT: '#E5E7EB', // Borders & dividers
          subtle: '#ECEEE9',
          strong: '#D1D5DB',
        },
        peach: {
          DEFAULT: '#F2D8C9',
          coral: '#D98C72',
          dark: '#8B4B32',
        },
        gold: {
          DEFAULT: '#C9A66B',
          light: '#F8F4EA',
          dark: '#8B6528',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['Newsreader', 'Georgia', 'serif'],
        numeric: ['"Space Grotesk"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'soft': '0 1px 3px 0 rgba(17, 24, 39, 0.04), 0 1px 2px 0 rgba(17, 24, 39, 0.02)',
        'card': '0 2px 8px -1px rgba(27, 67, 50, 0.06), 0 1px 4px -1px rgba(27, 67, 50, 0.03)',
        'elevated': '0 12px 30px -6px rgba(27, 67, 50, 0.10), 0 8px 12px -6px rgba(27, 67, 50, 0.04)',
      }
    },
  },
  plugins: [],
}
