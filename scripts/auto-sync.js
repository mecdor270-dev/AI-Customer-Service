const { execSync } = require('child_process');

console.log('🔄 Автоматическая синхронизация с GitHub...');

try {
  // 1. Add all changes
  execSync('git add .', { stdio: 'inherit' });

  // 2. Check if there are changes to commit
  const status = execSync('git status --porcelain').toString();

  if (status.trim().length > 0) {
    const timestamp = new Date().toLocaleString('ru-RU');
    const commitMsg = `Auto-update: ${timestamp}`;
    execSync(`git commit -m "${commitMsg}"`, { stdio: 'inherit' });
    console.log(`✅ Коммит создан: ${commitMsg}`);
  } else {
    console.log('ℹ️ Нет новых изменений для коммита.');
  }

  // 3. Push to GitHub
  execSync('git push origin main', { stdio: 'inherit' });
  console.log('🚀 Изменения успешно отправлены на GitHub (mecdor270-dev/AI-Customer-Service)!');
} catch (error) {
  console.error('❌ Ошибка синхронизации с GitHub:', error.message);
}
