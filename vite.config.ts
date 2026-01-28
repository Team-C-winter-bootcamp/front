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
      strictPort: true, 
      proxy: {
        '/api': {
          target: 'http://localhost:8000',
          changeOrigin: true,
          rewrite: (path) => {
            const newPath = path.replace(/^\/api/, ''); // /api를 제거
            console.log(`[Proxy] ${path} -> http://localhost:8000${newPath}`);
            return newPath;
          },
          configure: (proxy, _options) => {
            proxy.on('error', (err, _req, _res) => {
              console.log('[Proxy Error]', err);
            });
            proxy.on('proxyReq', (proxyReq, req, _res) => {
              console.log('[Proxy Request]', req.method, req.url, '->', proxyReq.path);
            });
            proxy.on('proxyRes', (proxyRes, req, _res) => {
              console.log('[Proxy Response]', req.url, '->', proxyRes.statusCode);
            });
          },
        },
      },
    },
    plugins: [react()],
    // esbuild 최적화 옵션
    esbuild: {
      drop: isProduction ? ['console', 'debugger'] : [], // 프로덕션에서 console 제거
      legalComments: 'none',
      minifyIdentifiers: isProduction,
      minifySyntax: isProduction,
      minifyWhitespace: isProduction,
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
      treyshake: {
        preset: 'recommended',
        moduleSideEffects: false,
      },
      // 청크 분할 전략 개선 (단순화함)
      rollupOptions: {
        output: {
          
          // 청크 파일명 최적화
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
          
          // 더 공격적인 minification 옵션
          compact: isProduction,
        },
      },
      // 청크 크기 경고 임계값 증가
      chunkSizeWarningLimit: 1000,
      // 빌드 최적화
      target: 'esnext',
      cssCodeSplit: true,
      reportCompressedSize: false,
    },
  }
})