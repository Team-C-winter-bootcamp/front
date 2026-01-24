import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '')
  const isProduction = mode === 'production'
  
  // 프로덕션 모드 강제 설정
  if (isProduction) {
    process.env.NODE_ENV = 'production'
  }
  
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
      proxy: {
        '/api': {
          target: 'http://localhost:8000',
          changeOrigin: true,
        },
      },
    },
    plugins: [react()],
      // esbuild 최적화 옵션
    esbuild: {
      drop: isProduction ? ['console', 'debugger'] : [], // 프로덕션에서 console 제거
      legalComments: 'none', // 법적 주석 제거
      minifyIdentifiers: isProduction,
      minifySyntax: isProduction,
      minifyWhitespace: isProduction,
      // React 개발 모드 제거
      define: {
        'process.env.NODE_ENV': JSON.stringify(isProduction ? 'production' : 'development'),
      },
    },
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.NODE_ENV': JSON.stringify(isProduction ? 'production' : 'development'),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('.', import.meta.url)),
      }
    },
    build: {
      // 프로덕션 빌드 최적화
      minify: isProduction ? 'esbuild' : false,
      cssMinify: isProduction,
      sourcemap: !isProduction,
      // Tree-shaking 최적화
      treeshake: {
        preset: 'recommended',
        moduleSideEffects: false,
      },
      // 청크 분할 전략 개선
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            // node_modules를 더 세밀하게 분리
            if (id.includes('node_modules')) {
              // React 관련
              if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
                return 'react-vendor';
              }
              // UI 라이브러리 - 각각 분리하여 tree-shaking 최적화
              if (id.includes('framer-motion')) {
                return 'framer-motion';
              }
              if (id.includes('lucide-react')) {
                return 'lucide-react';
              }
              // 차트 라이브러리
              if (id.includes('recharts')) {
                return 'chart-vendor';
              }
              // PDF 관련
              if (id.includes('jspdf') || id.includes('html2canvas')) {
                return 'pdf-vendor';
              }
              // 기타 큰 라이브러리
              if (id.includes('axios')) {
                return 'http-vendor';
              }
              // 나머지 vendor 코드
              return 'vendor';
            }
            // 페이지별 코드 스플리팅
            if (id.includes('/pages/Solution')) {
              return 'solution-page';
            }
            if (id.includes('/pages/JudmentDetail')) {
              return 'judgment-page';
            }
            if (id.includes('/pages/AgreeDocument') || id.includes('/pages/GosoDocument') || id.includes('/pages/ProofDocument')) {
              return 'document-pages';
            }
            if (id.includes('/pages/CaseCreation')) {
              return 'case-creation';
            }
          },
          // 청크 파일명 최적화
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
          // 더 공격적인 minification 옵션
          compact: isProduction,
        },
      },
      // 청크 크기 경고 임계값 증가 (큰 라이브러리 때문에)
      chunkSizeWarningLimit: 1000,
      // 빌드 최적화
      target: 'esnext',
      cssCodeSplit: true,
      reportCompressedSize: false, // 빌드 속도 향상
    },
  }
})
