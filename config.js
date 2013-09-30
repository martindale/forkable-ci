module.exports = {
  host: 'https://forkable-ci.herokuapp.com',
  github: {
    repo: process.env.GITHUB_REPO || 'coursefork/forkshop'
  },
  grove: {
    keys: {
      ops: process.env.GROVE_NOTICE_KEY || 'set your notice key here'
    }
  }
}