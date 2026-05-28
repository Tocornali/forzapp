/* eslint-disable @typescript-eslint/no-require-imports */
const { execSync } = require('child_process')

try {
  console.log('Checking for database changes in git status...')
  const status = execSync('git status --porcelain').toString()

  if (!status.includes('FH6Cars.json')) {
    console.log('No modifications detected in FH6Cars.json. Git commit/push skipped.')
    process.exit(0)
  }

  console.log('Staging changes in FH6Cars.json...')
  execSync('git add FH6Cars.json', { stdio: 'inherit' })

  console.log('Committing changes...')
  execSync('git commit -m "chore: sync vehicles list from web scraper"', { stdio: 'inherit' })

  console.log('Pushing updates to GitHub main branch...')
  execSync('git push origin main', { stdio: 'inherit' })
  console.log('Successfully pushed changes to GitHub! Build pipeline should be triggered.')
} catch (error) {
  console.error('Git automation script failed:', error.message)
  process.exit(1)
}
