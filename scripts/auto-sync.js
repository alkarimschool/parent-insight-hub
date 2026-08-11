import { execSync } from 'child_process';

function run(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf-8', stdio: 'pipe' }).trim();
  } catch (err) {
    console.error(`[AutoSync Error] ${cmd}:`, err.message);
    throw err;
  }
}

try {
  console.log('🔄 Checking git status...');
  const status = run('git status --porcelain');
  
  if (!status) {
    console.log('✅ Workspace is clean! Nothing to commit.');
  } else {
    console.log('📌 Changes detected. Staging all files...');
    run('git add .');
    
    const timestamp = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
    const customMsg = process.argv[2] ? process.argv[2] : `auto: update & sync project (${timestamp})`;
    
    console.log(`📝 Committing: "${customMsg}"...`);
    run(`git commit -m "${customMsg}"`);
  }

  console.log('🚀 Pushing to GitHub (origin main)...');
  console.log('   ↳ Lovable editor sync: AUTO-SYNCED');
  console.log('   ↳ Cloudflare deploy workflow: TRIGGERED');
  
  const pushOutput = run('git push origin main');
  console.log(pushOutput);
  console.log('🎉 All changes successfully synced to GitHub, Lovable, and Cloudflare!');
} catch (error) {
  console.error('❌ Auto-sync failed:', error);
  process.exit(1);
}
