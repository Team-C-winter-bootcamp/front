/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Minimalism Modern 색상 팔레트
        minimal: {
          white: '#FFFFFF',
          'off-white': '#FAFAFA',
          cream: '#F5F5F0',
          'light-gray': '#F3F4F6',
          gray: '#E5E5E5',
          'medium-gray': '#9CA3AF',
          'dark-gray': '#424242',
          charcoal: '#212121',
          concrete: '#757575',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        minimal: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'minimal-md': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        'minimal-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.03)',
      },
      borderRadius: {
        minimal: '8px',
        'minimal-lg': '12px',
      },
    },
  },
  plugins: [],
}
