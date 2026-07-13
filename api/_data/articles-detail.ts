// 由 scripts/generate-articles.mjs 自动生成，请勿手动编辑

export interface ArticleFrontmatter {
  id: number
  title: string
  author: string
  desc: string
  date: string
  category: string
}

interface ArticleDetail extends ArticleFrontmatter {
  content: string
  link: string
}

const detail: Record<number, ArticleDetail> = {
  "1": {
    "id": 1,
    "title": "Vue 3 实战：组合式 API 进阶",
    "author": "Sunn",
    "desc": "从响应式、生命周期和组件拆分说起",
    "date": "2026-03-20T00:00:00.000Z",
    "category": "前端",
    "content": "<p>在 Vue 3 中，组合式 API 为我们提供了一种新的代码组织方式，使我们能够更好地逻辑复用和代码组织。本文将深入探讨组合式 API 的高级用法，从响应式系统到生命周期管理，帮助你掌握 Vue 3 的核心特性。</p>\n<h2>响应式系统的原理</h2>\n<p>Vue 3 的响应式系统基于 Proxy 对象，相比 Vue 2 的 Object.defineProperty，它提供了更全面的响应式能力。通过 reactive 和 ref 等 API，我们可以创建响应式数据，并在数据变化时自动触发视图更新。</p>\n<pre><code class=\"language-js\">import { reactive, ref } from &#39;vue&#39;\n\n// 使用 reactive 创建响应式对象\nconst state = reactive({\n  count: 0,\n  message: &#39;Hello Vue 3&#39;\n})\n\n// 使用 ref 创建响应式变量\nconst count = ref(0)\n</code></pre>\n<h2>组合式 API 的优势</h2>\n<p>组合式 API 的主要优势在于：</p>\n<ul>\n<li>更好的逻辑复用：通过组合函数，我们可以将相关的逻辑提取到独立的函数中</li>\n<li>更清晰的代码组织：按照功能组织代码，而不是按照选项类型</li>\n<li>更好的 TypeScript 支持：类型推断更加准确</li>\n<li>更小的打包体积：Tree-shaking 更加有效</li>\n</ul>\n<h2>生命周期钩子</h2>\n<p>在组合式 API 中，生命周期钩子以函数的形式提供，我们可以在 setup 函数中使用它们：</p>\n<pre><code class=\"language-js\">import { onMounted, onUpdated, onUnmounted } from &#39;vue&#39;\n\nexport default {\n  setup() {\n    onMounted(() =&gt; {\n      console.log(&#39;组件挂载&#39;)\n    })\n\n    onUpdated(() =&gt; {\n      console.log(&#39;组件更新&#39;)\n    })\n\n    onUnmounted(() =&gt; {\n      console.log(&#39;组件卸载&#39;)\n    })\n\n    return {}\n  }\n}\n</code></pre>\n<h2>组件拆分策略</h2>\n<p>使用组合式 API，我们可以更灵活地拆分组件逻辑：</p>\n<ol>\n<li>按功能拆分：将相关的逻辑提取到独立的组合函数中</li>\n<li>按生命周期拆分：将不同生命周期的逻辑分开处理</li>\n<li>按状态管理拆分：将状态管理相关的逻辑提取到专门的函数中</li>\n</ol>\n<p>通过合理的组件拆分，我们可以构建更加可维护和可测试的应用。</p>\n<h2>总结</h2>\n<p>组合式 API 是 Vue 3 的重要特性，它为我们提供了一种新的代码组织方式，使我们能够更好地构建复杂的应用。通过掌握组合式 API 的高级用法，我们可以编写更加清晰、可维护的代码。</p>\n<p>希望本文对你有所帮助，如果你有任何问题或建议，欢迎在评论区留言。</p>\n",
    "link": "#"
  },
  "2": {
    "id": 2,
    "title": "Node.js 性能优化方案",
    "author": "Sunn",
    "desc": "高并发下的事件循环与资源控制",
    "date": "2026-03-18T00:00:00.000Z",
    "category": "后端",
    "content": "<p>Node.js 作为一种基于事件驱动的异步 I/O 运行环境，在处理高并发请求时表现出色。然而，随着应用规模的扩大，性能优化成为了开发者必须面对的挑战。本文将介绍一些 Node.js 性能优化的实用方案，帮助你构建更高效的应用。</p>\n<h2>事件循环的理解</h2>\n<p>Node.js 的事件循环是其高性能的核心。理解事件循环的工作原理，对于优化 Node.js 应用至关重要。</p>\n<h2>内存管理</h2>\n<p>合理的内存管理可以避免内存泄漏，提高应用的稳定性和性能。</p>\n<h2>数据库优化</h2>\n<p>数据库操作往往是应用性能的瓶颈，通过合理的索引设计和查询优化，可以显著提高应用的响应速度。</p>\n<h2>总结</h2>\n<p>通过本文介绍的性能优化方案，你可以显著提高 Node.js 应用的性能和稳定性。记住，性能优化是一个持续的过程，需要根据应用的实际情况进行调整和优化。</p>\n",
    "link": "#"
  },
  "3": {
    "id": 3,
    "title": "写给新人程序员的 10 条习惯",
    "author": "Sunn",
    "desc": "代码、沟通、测试与持续学习",
    "date": "2026-03-15T00:00:00.000Z",
    "category": "成长",
    "content": "<p>作为一名新人程序员，养成良好的习惯对于职业发展至关重要。本文将分享 10 条有助于你成为优秀程序员的好习惯。</p>\n<h2>1. 编写清晰的代码</h2>\n<p>代码不仅是给计算机执行的，也是给人阅读的。编写清晰、易读的代码，有助于团队协作和后续维护。</p>\n<h2>2. 定期学习新技术</h2>\n<p>技术发展迅速，保持学习的习惯，不断更新自己的知识体系，才能跟上时代的步伐。</p>\n<h2>3. 重视测试</h2>\n<p>编写测试用例，确保代码的质量和稳定性，是一名专业程序员的基本素养。</p>\n<h2>4. 善于沟通</h2>\n<p>良好的沟通能力，有助于理解需求、解决问题，是团队协作的关键。</p>\n<h2>5. 学会使用版本控制</h2>\n<p>熟练使用 Git 等版本控制工具，是现代开发的必备技能。</p>\n<h2>6. 保持代码整洁</h2>\n<p>定期重构代码，保持代码库的整洁和可维护性。</p>\n<h2>7. 注重用户体验</h2>\n<p>始终以用户为中心，关注产品的用户体验，才能开发出真正有价值的产品。</p>\n<h2>8. 学会调试</h2>\n<p>掌握调试技巧，快速定位和解决问题，是提高开发效率的关键。</p>\n<h2>9. 阅读优秀代码</h2>\n<p>通过阅读优秀的开源代码，学习他人的编程风格和技巧，不断提升自己的编码能力。</p>\n<h2>10. 保持耐心和热情</h2>\n<p>编程是一项需要耐心和热情的工作，保持对技术的热爱，才能在这个领域走得更远。</p>\n<p>希望这 10 条习惯能对你的职业发展有所帮助，祝你成为一名优秀的程序员！</p>\n",
    "link": "#"
  },
  "4": {
    "id": 4,
    "title": "我的舍友小马",
    "author": "Sunn",
    "desc": "小马的帅照",
    "date": "2026-03-30T00:00:00.000Z",
    "category": "摄影",
    "content": "<p>小马是我的好朋友，我希望能通过照片记录他的日常生活，毕业以后看到照片还能回忆起他。</p>\n<h2>高P小马</h2>\n<p>小马的帅气人尽皆知</p>\n<div class=\"photo-gallery\">\n  <div class=\"photo-item\">\n    <img src=\"https://cdn.imgos.cn/vip/2026/04/19/69e4d1e9500c1.jpg\" alt=\"自恋\" />\n    <p class=\"photo-caption\">2025/7/10 晚，小马自恋之夜</p>\n  </div>\n  <div class=\"photo-item\">\n    <img src=\"https://cdn.imgos.cn/vip/2026/04/20/69e57409a70f3.jpg\" alt=\"伪素颜\" />\n    <p class=\"photo-caption\">2025/1/5，伪素颜小马</p>\n  </div>\n  <div class=\"photo-item\">\n    <img src=\"https://cdn.imgos.cn/vip/2026/04/20/69e5742e2dd94.jpg\" alt=\"小奶狗\" />\n    <p class=\"photo-caption\">2025/4/4，小奶狗</p>\n  </div>\n</div><h2>摆拍小马</h2>\n<p>摆拍这一块——（摄影师当然是萧笋）</p>\n<div class=\"photo-gallery\">\n  <div class=\"photo-item\">\n    <img src=\"https://cdn.imgos.cn/vip/2026/04/20/69e5747458b76.jpg\" alt=\"忠奸不分\" />\n    <p class=\"photo-caption\">2025/3/8，忠奸不分</p>\n  </div>\n  <div class=\"photo-item\">\n    <img src=\"https://cdn.imgos.cn/vip/2026/04/20/69e574a858248.jpg\" alt=\"忠诚\" />\n    <p class=\"photo-caption\">2024/12/6，忠诚！</p>\n  </div>\n</div><blockquote>\n<p>免责声明：以上照片已经过小马本人同意，未经允许禁止转载或使用</p>\n</blockquote>\n",
    "link": "#"
  }
}

export default detail
