/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 프리미엄 모드 라이트 색상 팔레트
        brand: {
          primary: '#6366f1', // 메인 인디고
          secondary: '#8b5cf6', // 포인트 퍼플
          background: '#ffffff', // 메인 배경
          surface: '#f8fafc', // 카드 및 섹션 배경
          text: {
            main: '#0f172a', // 주요 텍스트 (Slate 900)
            sub: '#475569', // 부가 설명 (Slate 600)
            muted: '#94a3b8', // 비활성/캡션 (Slate 400)
          },
          border: '#e2e8f0', // 경계선
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
