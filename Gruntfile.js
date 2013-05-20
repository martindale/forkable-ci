module.exports = function(grunt) {
  var remote = grunt.file.readJSON(grunt.option('remote'));
  var pk = grunt.file.read(remote.privateKey);
  grunt.initConfig({
    sshexec: {
      deploy: {
        command: "cd /usr/local/node/forkable-ci && grunt clone",
        options: {
          host: remote.host,
          username: remote.username,
          privateKey: grunt.file.read(remote.privateKey),
          passphrase: process.env.PASS
        }
      }
    },
    shell: {
      clone: {
        command: [
          "git clone git@github.com:coursefork/forkshop.git",
          "cd forkshop",
          "npm install"
        ].join('&&'),
        options: {
          stdout: true,
          stderr: true,
          execOptions: {
            cwd: "/usr/local/node"
          }
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-ssh');
  grunt.loadNpmTasks('grunt-shell');

  grunt.registerTask('clone', ['shell:clone']);
  grunt.registerTask('deploy', ['sshexec:deploy']);
}
