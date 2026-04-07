<template>
  <div class="personal-homepage">
    <BackButton />
    <HeaderComponent />
    
    <main class="content">
      <section class="profile-section">
        <div class="profile-card">
          <div class="profile-avatar">
            <img src="https://picui.ogmua.cn/s1/2026/04/01/69cd0873633dd.webp" alt="个人头像" />
          </div>
          <h1 class="profile-name">Sunn</h1>
          <p class="profile-desc">前端开发者 | 技术爱好者 | 生活记录者</p>
        </div>
      </section>
      
      <section class="contact-section">
        <h2 class="section-title">联系方式</h2>
        <div class="contact-cards">
          <div class="contact-card">
            <div class="contact-icon">📧</div>
            <h3>邮箱</h3>
            <p>990853641@qq.com</p>
          </div>
          <div class="contact-card">
            <div class="contact-icon">🐱</div>
            <h3>GitHub</h3>
            <p><a href="https://github.com/xiaosun734" target="_blank">github.com/xiaosun734</a></p>
          </div>
          <div 
            class="contact-card" 
            @mouseenter="showQRCode('qq')"
            @mousemove="moveQRCode"
            @mouseleave="hideQRCode"
          >
            <div class="contact-icon">🐧</div>
            <h3>QQ</h3>
            <p>990853641</p>
          </div>
          <div class="contact-card">
            <div class="contact-icon">📱</div>
            <h3>电话(微信同号)</h3>
            <p>17380552618</p>
          </div>
        </div>
        
        <!-- 二维码显示元素 -->
        <div 
          v-if="showQR" 
          class="qr-code-container"
          :style="{ left: qrPosition.x + 'px', top: qrPosition.y + 'px' }"
        >
          <div class="qr-code">
            <img :src="qrCodeSrc" alt="二维码" />
            <p>{{ qrCodeTitle }}</p>
          </div>
        </div>
      </section>
      
      <section class="links-section">
        <h2 class="section-title">友链</h2>
        <div class="links-grid">
          <div class="link-item" v-for="link in friendLinks" :key="link.name">
            <a :href="link.url" target="_blank" :title="link.description">
              <h3>{{ link.name }}</h3>
              <p>{{ link.description }}</p>
            </a>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script>
import HeaderComponent from '../components/header-component.vue';
import BackButton from '../components/back-button.vue'

export default {
  name: 'PersonalHomepage',
  components: {
    HeaderComponent,
    BackButton
  },
  data() {
    return {
      showQR: false,
      qrPosition: { x: 0, y: 0 },
      qrCodeSrc: '',
      qrCodeTitle: '',
      friendLinks: [
        {
          name: 'Vue.js',
          url: 'https://vuejs.org/',
          description: '渐进式JavaScript框架'
        },
        {
          name: 'React',
          url: 'https://react.dev/',
          description: '用于构建用户界面的JavaScript库'
        },
        {
          name: 'Node.js',
          url: 'https://nodejs.org/',
          description: '基于Chrome V8引擎的JavaScript运行环境'
        },
        {
          name: 'GitHub',
          url: 'https://github.com/',
          description: '面向开源及私有软件项目的托管平台'
        },
        {
          name: 'MDN Web Docs',
          url: 'https://developer.mozilla.org/',
          description: 'Web开发技术文档'
        },
        {
          name: 'Stack Overflow',
          url: 'https://stackoverflow.com/',
          description: '程序员问答社区'
        }
      ]
    };
  },
  methods: {
    showQRCode(type) {
      this.showQR = true;
      // 这里使用示例二维码图片，实际项目中应该使用真实的二维码
      switch(type) {
        case 'qq':
          this.qrCodeSrc = 'https://picui.ogmua.cn/s1/2026/04/01/69cd0096d6933.webp';
          this.qrCodeTitle = 'QQ二维码';
          break;
      }
    },
    hideQRCode() {
      this.showQR = false;
    },
    moveQRCode(event) {
      // 调整二维码位置，使其在鼠标右下方
      this.qrPosition.x = event.clientX + 10;
      this.qrPosition.y = event.clientY + 10;
    }
  }
};
</script>

<style scoped>
.personal-homepage {
  min-height: 100vh;
  background: linear-gradient(180deg, #e8f0ff 0%, #fdfdff 60%, #ffffff 100%);
  color: #2f3a4b;
}

.content {
  max-width: 1200px;
  margin: 0 auto;
  padding: calc(120px + 30px) 20px 40px;
}

.profile-section {
  display: flex;
  justify-content: center;
  margin-bottom: 60px;
}

.profile-card {
  text-align: center;
  background: #ffffff;
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  border: 1px solid #e1e8ed;
  max-width: 400px;
  width: 100%;
}

.profile-avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  margin: 0 auto 20px;
  border: 4px solid #f0f4f8;
}

.profile-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-name {
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 10px;
  color: #2c3e50;
}

.profile-desc {
  font-size: 16px;
  color: #7f8c8d;
  margin: 0;
}

.section-title {
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 30px;
  color: #2c3e50;
  text-align: center;
  border-bottom: 2px solid #d9e5f3;
  padding-bottom: 10px;
}

.contact-section {
  margin-bottom: 60px;
}

.contact-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.contact-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid #e1e8ed;
  text-align: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.contact-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.contact-icon {
  font-size: 32px;
  margin-bottom: 16px;
}

.contact-card h3 {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 8px;
  color: #2c3e50;
}

.contact-card p {
  font-size: 14px;
  color: #7f8c8d;
  margin: 0;
}

.contact-card a {
  color: #3498db;
  text-decoration: none;
  transition: color 0.3s ease;
}

.contact-card a:hover {
  color: #2980b9;
  text-decoration: underline;
}

.qr-code-container {
  position: fixed;
  z-index: 1000;
  pointer-events: none;
}

.qr-code {
  background: #ffffff;
  border-radius: 8px;
  padding: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border: 1px solid #e1e8ed;
  text-align: center;
}

.qr-code img {
  width: 150px;
  height: 150px;
  display: block;
  margin-bottom: 8px;
}

.qr-code p {
  font-size: 14px;
  color: #2c3e50;
  margin: 0;
  font-weight: 500;
}

.links-section {
  margin-bottom: 40px;
}

.links-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.link-item {
  background: #ffffff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid #e1e8ed;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.link-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.link-item a {
  text-decoration: none;
  color: inherit;
  display: block;
}

.link-item h3 {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 8px;
  color: #2c3e50;
  transition: color 0.3s ease;
}

.link-item p {
  font-size: 14px;
  color: #7f8c8d;
  margin: 0;
}

.link-item:hover h3 {
  color: #3498db;
}

@media (max-width: 768px) {
  .content {
    padding: calc(120px + 16px) 16px 24px;
  }
  
  .profile-card {
    padding: 30px 20px;
  }
  
  .contact-cards {
    grid-template-columns: 1fr;
  }
  
  .links-grid {
    grid-template-columns: 1fr;
  }
}
</style>