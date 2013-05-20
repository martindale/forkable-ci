module.exports = function(grunt) {
  var remote = grunt.option('remote') ? grunt.file.readJSON(grunt.option('remote')) : {};
  var pk     = remote.privateKey ? grunt.file.read(remote.privateKey) : "";

  grunt.initConfig({
    sshexec: {
      deploy: {
        command: "cd /usr/local/node/forkable-ci && grunt pull",
        options: {
          host: remote.host,
          username: remote.username,
          privateKey: pk,
          passphrase: process.env.PASS
        }
      }
    },
    shell: {
      pull: {
        command: [
          "git pull",
          "npm install",
          "forever restart coursefork.js"
        ].join('&&'),
        options: {
          stdout: true,
          stderr: true,
          execOptions: {
            cwd: "/usr/local/node/forkshop"
          }
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-ssh');
  grunt.loadNpmTasks('grunt-shell');

  // assumes repo has already been cloned
  // git@github.com:coursefork/forkshop.git
  grunt.registerTask('pull', ['shell:pull']);

  // assumes PASS set at command-line or env
  // and --remote points to a json file with config info
  grunt.registerTask('deploy', ['sshexec:deploy']);
}
