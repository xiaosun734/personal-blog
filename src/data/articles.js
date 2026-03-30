// 文章数据
const articles = [
  {
    id: 1,
    title: 'Vue 3 实战：组合式 API 进阶',
    author: 'Sunn',
    desc: '从响应式、生命周期和组件拆分说起',
    date: '2026-03-20',
    category: '前端',
    link: '#',
    content: `<p>在 Vue 3 中，组合式 API 为我们提供了一种新的代码组织方式，使我们能够更好地逻辑复用和代码组织。本文将深入探讨组合式 API 的高级用法，从响应式系统到生命周期管理，帮助你掌握 Vue 3 的核心特性。</p>
          
          <h2>响应式系统的原理</h2>
          <p>Vue 3 的响应式系统基于 Proxy 对象，相比 Vue 2 的 Object.defineProperty，它提供了更全面的响应式能力。通过 reactive 和 ref 等 API，我们可以创建响应式数据，并在数据变化时自动触发视图更新。</p>
          
          <pre><code>import { reactive, ref } from 'vue'

// 使用 reactive 创建响应式对象
const state = reactive({
  count: 0,
  message: 'Hello Vue 3'
})

// 使用 ref 创建响应式变量
const count = ref(0)</code></pre>
          
          <h2>组合式 API 的优势</h2>
          <p>组合式 API 的主要优势在于：</p>
          <ul>
            <li>更好的逻辑复用：通过组合函数，我们可以将相关的逻辑提取到独立的函数中</li>
            <li>更清晰的代码组织：按照功能组织代码，而不是按照选项类型</li>
            <li>更好的 TypeScript 支持：类型推断更加准确</li>
            <li>更小的打包体积：Tree-shaking 更加有效</li>
          </ul>
          
          <h2>生命周期钩子</h2>
          <p>在组合式 API 中，生命周期钩子以函数的形式提供，我们可以在 setup 函数中使用它们：</p>
          
          <pre><code>import { onMounted, onUpdated, onUnmounted } from 'vue'

export default {
  setup() {
    onMounted(() => {
      console.log('组件挂载')
    })
    
    onUpdated(() => {
      console.log('组件更新')
    })
    
    onUnmounted(() => {
      console.log('组件卸载')
    })
    
    return {}
  }
}</code></pre>
          
          <h2>组件拆分策略</h2>
          <p>使用组合式 API，我们可以更灵活地拆分组件逻辑：</p>
          <ol>
            <li>按功能拆分：将相关的逻辑提取到独立的组合函数中</li>
            <li>按生命周期拆分：将不同生命周期的逻辑分开处理</li>
            <li>按状态管理拆分：将状态管理相关的逻辑提取到专门的函数中</li>
          </ol>
          
          <p>通过合理的组件拆分，我们可以构建更加可维护和可测试的应用。</p>
          
          <h2>总结</h2>
          <p>组合式 API 是 Vue 3 的重要特性，它为我们提供了一种新的代码组织方式，使我们能够更好地构建复杂的应用。通过掌握组合式 API 的高级用法，我们可以编写更加清晰、可维护的代码。</p>
          <p>希望本文对你有所帮助，如果你有任何问题或建议，欢迎在评论区留言。</p>`
  },
  {
    id: 2,
    title: 'Node.js 性能优化方案',
    author: 'Sunn',
    desc: '高并发下的事件循环与资源控制',
    date: '2026-03-18',
    category: '后端',
    link: '#',
    content: `<p>Node.js 作为一种基于事件驱动的异步 I/O 运行环境，在处理高并发请求时表现出色。然而，随着应用规模的扩大，性能优化成为了开发者必须面对的挑战。本文将介绍一些 Node.js 性能优化的实用方案，帮助你构建更高效的应用。</p>
          
          <h2>事件循环的理解</h2>
          <p>Node.js 的事件循环是其高性能的核心。理解事件循环的工作原理，对于优化 Node.js 应用至关重要。</p>
          
          <h2>内存管理</h2>
          <p>合理的内存管理可以避免内存泄漏，提高应用的稳定性和性能。</p>
          
          <h2>数据库优化</h2>
          <p>数据库操作往往是应用性能的瓶颈，通过合理的索引设计和查询优化，可以显著提高应用的响应速度。</p>
          
          <h2>总结</h2>
          <p>通过本文介绍的性能优化方案，你可以显著提高 Node.js 应用的性能和稳定性。记住，性能优化是一个持续的过程，需要根据应用的实际情况进行调整和优化。</p>`
  },
  {
    id: 3,
    title: '写给新人程序员的 10 条习惯',
    author: 'Sunn',
    desc: '代码、沟通、测试与持续学习',
    date: '2026-03-15',
    category: '成长',
    link: '#',
    content: `<p>作为一名新人程序员，养成良好的习惯对于职业发展至关重要。本文将分享 10 条有助于你成为优秀程序员的好习惯。</p>
          
          <h2>1. 编写清晰的代码</h2>
          <p>代码不仅是给计算机执行的，也是给人阅读的。编写清晰、易读的代码，有助于团队协作和后续维护。</p>
          
          <h2>2. 定期学习新技术</h2>
          <p>技术发展迅速，保持学习的习惯，不断更新自己的知识体系，才能跟上时代的步伐。</p>
          
          <h2>3. 重视测试</h2>
          <p>编写测试用例，确保代码的质量和稳定性，是一名专业程序员的基本素养。</p>
          
          <h2>4. 善于沟通</h2>
          <p>良好的沟通能力，有助于理解需求、解决问题，是团队协作的关键。</p>
          
          <h2>5. 学会使用版本控制</h2>
          <p>熟练使用 Git 等版本控制工具，是现代开发的必备技能。</p>
          
          <h2>6. 保持代码整洁</h2>
          <p>定期重构代码，保持代码库的整洁和可维护性。</p>
          
          <h2>7. 注重用户体验</h2>
          <p>始终以用户为中心，关注产品的用户体验，才能开发出真正有价值的产品。</p>
          
          <h2>8. 学会调试</h2>
          <p>掌握调试技巧，快速定位和解决问题，是提高开发效率的关键。</p>
          
          <h2>9. 阅读优秀代码</h2>
          <p>通过阅读优秀的开源代码，学习他人的编程风格和技巧，不断提升自己的编码能力。</p>
          
          <h2>10. 保持耐心和热情</h2>
          <p>编程是一项需要耐心和热情的工作，保持对技术的热爱，才能在这个领域走得更远。</p>
          
          <p>希望这 10 条习惯能对你的职业发展有所帮助，祝你成为一名优秀的程序员！</p>`
  },
  {
    id: 4,
    title: '摄影之旅：记录生活中的美好瞬间',
    author: 'Sunn',
    desc: '用镜头捕捉生活中的精彩瞬间',
    date: '2026-03-29',
    category: '摄影',
    link: '#',
    content: `<p>摄影是一种捕捉瞬间、记录生活的艺术。通过镜头，我们可以冻结时间，保存那些稍纵即逝的美好时刻。在这篇文章中，我将分享一些我最近拍摄的照片，以及我对摄影的一些感悟。</p>
          
          <h2>自然风光</h2>
          <p>大自然的美景总是让人心旷神怡。无论是雄伟的山脉、宁静的湖泊，还是绚烂的日落，都值得我们用相机记录下来。</p>
          
          <div class="photo-gallery">
            <div class="photo-item">
              <img src="https://neeko-copilot.bytedance.net/api/text2image?prompt=beautiful%20mountain%20landscape%20with%20lake%20and%20sunset&size=1024x768" alt="山景日落" />
              <p class="photo-caption">山脉日落 - 大自然的壮丽景色</p>
            </div>
            <div class="photo-item">
              <img src="https://neeko-copilot.bytedance.net/api/text2image?prompt=peaceful%20forest%20with%20sunlight%20through%20trees&size=1024x768" alt="森林阳光" />
              <p class="photo-caption">森林阳光 - 静谧的自然之美</p>
            </div>
          </div>
          
          <h2>城市街景</h2>
          <p>城市是人类文明的结晶，充满了活力和故事。街头的行人、建筑的线条、夜晚的灯光，都是城市摄影的绝佳素材。</p>
          
          <div class="photo-gallery">
            <div class="photo-item">
              <img src="https://neeko-copilot.bytedance.net/api/text2image?prompt=urban%20street%20photography%20with%20people%20walking&size=1024x768" alt="城市街景" />
              <p class="photo-caption">城市街景 - 现代生活的缩影</p>
            </div>
            <div class="photo-item">
              <img src="https://neeko-copilot.bytedance.net/api/text2image?prompt=city%20night%20lights%20skyline&size=1024x768" alt="城市夜景" />
              <p class="photo-caption">城市夜景 - 夜晚的繁华与活力</p>
            </div>
          </div>
          
          <h2>人文纪实</h2>
          <p>摄影不仅是记录美景，更是记录人性的美好。通过镜头，我们可以捕捉到人们的情感、生活的瞬间，这些都是最真实、最动人的画面。</p>
          
          <div class="photo-gallery">
            <div class="photo-item">
              <img src="https://neeko-copilot.bytedance.net/api/text2image?prompt=people%20enjoying%20time%20together%20in%20park&size=1024x768" alt="公园时光" />
              <p class="photo-caption">公园时光 - 人们的欢乐时刻</p>
            </div>
            <div class="photo-item">
              <img src="https://neeko-copilot.bytedance.net/api/text2image?prompt=street%20artist%20performing%20in%20city&size=1024x768" alt="街头艺人" />
              <p class="photo-caption">街头艺人 - 城市中的艺术气息</p>
            </div>
          </div>
          
          <h2>摄影心得</h2>
          <p>通过摄影，我学会了更加细致地观察生活，发现身边的美好。每一次按下快门，都是对生活的一次记录和思考。</p>
          <p>摄影教会我：</p>
          <ul>
            <li>耐心等待最佳时机</li>
            <li>从不同角度观察事物</li>
            <li>注重光线和构图</li>
            <li>用心感受被摄对象的故事</li>
          </ul>
          
          <p>希望这些照片能带给你一些美的感受，也希望你能拿起相机，记录属于自己的美好瞬间。</p>`
  }
];

export default articles;