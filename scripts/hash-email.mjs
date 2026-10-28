const email = process.argv[2]
if (!email) {
  // eslint-disable-next-line no-console
  console.error('Usage : npm run hash-email <email>')
  process.exit(1)
}
