import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

/** 本地 API 插件：dev 模式下直接调用后端 handler，不再代理到 Vercel */
function localApiPlugin() {
  return {
    name: 'local-api',
    configureServer(server: any) {
      server.middlewares.use('/api', async (req: any, res: any, _next: any) => {
        try {
          const { parse } = await import('node:url')
          const { pathname } = parse(req.url || '', true)

          const ROUTES: Record<string, string> = {
            '/articles': './api/articles.ts',
            '/comments': './api/comments.ts',
          }

          const handlerPath = ROUTES[pathname || '']
          if (!handlerPath) {
            res.statusCode = 404
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: `未找到 API: ${pathname}` }))
            return
          }

          const mod = await server.ssrLoadModule(handlerPath)
          await mod.default(req, res)
        } catch (e) {
          console.error('本地 API 错误：', e)
          if (!res.headersSent) {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'Internal Server Error' }))
          }
        }
      })
    }
  }
}

export default defineConfig({
  plugins: [vue(), localApiPlugin()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  base: '/',
  build: {
    outDir: 'dist'
  }
})
