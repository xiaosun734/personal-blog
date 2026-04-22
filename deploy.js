const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

async function deploy() {
  // 收集所有命令行参数作为commit message
  const message = process.argv.slice(2).join(' ') || 'update';

  try {
    console.log('🚀 开始部署...');
    console.log(`📝 Commit message: ${message}`);

    // Step 1: Git add
    console.log('\n1️⃣ 执行 git add...');
    await execAsync('git add .');
    console.log('✅ Git add 完成');

    // Step 2: Git commit
    console.log('\n2️⃣ 执行 git commit...');
    await execAsync(`git commit -m "${message}"`);
    console.log('✅ Git commit 完成');

    // Step 3: Git push
    console.log('\n3️⃣ 执行 git push...');
    await execAsync('git push');
    console.log('✅ Git push 完成');

    // Step 4: Build
    console.log('\n4️⃣ 执行 npm run build...');
    await execAsync('npm run build');
    console.log('✅ Build 完成');

    // Step 5: Deploy to gh-pages
    console.log('\n5️⃣ 执行 npx gh-pages -d dist...');
    await execAsync('npx gh-pages -d dist');
    console.log('✅ gh-pages 部署完成');

    console.log('\n🎉 部署成功！');
  } catch (error) {
    console.error('\n❌ 部署失败:', error.message);
    process.exit(1);
  }
}

deploy();