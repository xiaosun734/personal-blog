const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

async function deploy() {
  const message = process.argv.slice(2).join(' ') || 'update';

  try {
    console.log('🚀 开始部署...');
    console.log(`📝 Commit message: ${message}`);

    console.log('\n1️⃣ 执行 git add...');
    await execAsync('git add .');
    console.log('✅ Git add 完成');

    console.log('\n2️⃣ 执行 git commit...');
    await execAsync(`git commit -m "${message}"`);
    console.log('✅ Git commit 完成');

    console.log('\n3️⃣ 执行 git push...');
    await execAsync('git push');
    console.log('✅ Git push 完成');

    console.log('\n🎉 推送成功！Vercel 将自动构建并部署。');
  } catch (error) {
    console.error('\n❌ 部署失败:', error.message);
    process.exit(1);
  }
}

deploy();
