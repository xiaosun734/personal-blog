import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import { readdirSync } from 'node:fs'

/**
 * 扫描 api/ 目录生成路由表，模仿 Vercel 的"文件即路由"约定：
 *   api/auth.ts → { '/auth': './api/auth.ts' }
 * 不支持的写法（会被跳过）：下划线开头的辅助模块、.test. 测试文件、
 * [id].ts 这类动态路由（Vercel 支持，本地静态表做不到）。
 */
function scanApiRoutes(): Record<string, string> {
  const apiDir = fileURLToPath(new URL('./api', import.meta.url))
  const routes: Record<string, string> = {}

  let files: string[] = []
  try {
    files = readdirSync(apiDir)
  } catch {
    return routes // api/ 目录不存在时返回空表
  }

  for (const file of files) {
    if (!file.endsWith('.ts') || file.endsWith('.d.ts')) continue // 只认 .ts
    if (file.includes('.test.')) continue // 测试文件不是接口
    if (file.startsWith('_')) continue // Vercel 约定：_ 开头不作为接口
    if (file.includes('[')) continue // [id].ts 动态路由，本地不支持

    routes['/' + file.replace(/\.ts$/, '')] = './api/' + file
  }

  return routes
}

/** 本地 API 插件：dev 模式下直接调用后端 handler，不再代理到 Vercel */
function localApiPlugin() {
  return {
    name: 'local-api',
    configureServer(server: any) {
      server.middlewares.use('/api', async (req: any, res: any, _next: any) => {
        try {
          const { parse } = await import('node:url')
          const { pathname } = parse(req.url || '', true)

          // 每次请求重新扫描：新增 api/*.ts 后无需重启 dev server
          const ROUTES = scanApiRoutes()

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
