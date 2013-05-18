module.exports = function(grunt) {
  grunt.initConfig({
    sshexec: {
      staging: {
        command: ""
      },
      production: {
        command: ""
      },
      uptime: {
        command: "uptime",
        options: {
          host: "tomango.asmallorange.com",
          username: "brianpm1",
          privateKey: grunt.file.read("/Users/brian/.ssh/aso_id_dsa"),
          passphrase: process.env.PASSPHRASE
        }
      }
    },
    deploy: {
    },
    shell: {
      ls: {
        command: "ls -al",
        options: {
          stdout: true
        }
      },
      deploy: {
        command: "",
        options: {
        }
      },
      clone: {
        command: [
          "git clone git@github.com:coursefork/forkshop.git",
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

  // grunt-shell
  // grunt-exec

  grunt.loadNpmTasks('grunt-ssh');
  grunt.loadNpmTasks('grunt-shell');

  grunt.registerTask('uptime', ['sshexec:uptime']);

  grunt.registerTask('ls', ['shell:ls']);

  grunt.registerTask('clone', ['shell:clone']);
}
