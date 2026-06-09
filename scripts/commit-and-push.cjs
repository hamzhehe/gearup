const { execFileSync } = require('node:child_process');
const path = require('node:path');

const repoDir = path.resolve(__dirname, '..');
const git = path.join(repoDir, 'node_modules', 'dugite', 'git', 'cmd', 'git.exe');

function run(args) {
  execFileSync(git, args, { cwd: repoDir, stdio: 'inherit' });
}

run(['add', '-A']);
run(['commit', '-m', 'fix: comprehensive manufacturer dashboard, wallet, chat, cart, and analytics fixes']);

if (!process.env.GH_USER || !process.env.GH_TOKEN) {
  console.error('Missing GH_USER/GH_TOKEN');
  process.exit(1);
}

const remoteUrl = `https://${encodeURIComponent(process.env.GH_USER)}:${encodeURIComponent(process.env.GH_TOKEN)}@github.com/hamzhehe/gearup.git`;
run(['push', remoteUrl, 'main']);
