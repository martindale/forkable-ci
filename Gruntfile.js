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
      },
      status: {
        command: "forever list",
        options: {
          host: remote.host,
          username: remote.username,
          privateKey: pk,
          passphrase: process.env.PASS
        }
      },
      check_branch: {
        command: "cd /usr/local/node/forkable-ci && grunt git_branch",
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
      },
      git_branch: {
        command: "git branch",
        options: {
          stdout: true,
          execOptions: {
            cwd: "/usr/local/node/forkshop"
          }
        }
      },
      checkout_branch: {
        command: [
          "git fetch origin",
          "git checkout pr/" + grunt.option("pr"),
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
      },
      test: {
        command: [
          "make test"
        ].join('&&'),
        options: {
          stdout: true,
          stderr: true,
          execOptions: {
            cwd: "." // "/usr/local/node"
          }
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-ssh');
  grunt.loadNpmTasks('grunt-shell');

  // -----------
  // Shell tasks

  // assumes repo has already been cloned
  // git@github.com:coursefork/forkshop.git
  grunt.registerTask('pull', ['shell:pull']);

  // local git branch check
  grunt.registerTask('git_branch', ['shell:git_branch']);

  // checkout branch
  // needs --pr command line arg set to a pull request number
  // e.g. grunt checkout_branch --pr 59
  grunt.registerTask('checkout_branch', ['shell:checkout_branch']);

  // work in progress...
  grunt.registerTask('test', ['shell:test']);

  // ---------
  // SSH tasks

  // assumes PASS set at command-line or env
  // and --remote points to a json file with config info
  // calls shell:pull
  grunt.registerTask('deploy', ['sshexec:deploy']);

  // check the status of coursefork node app
  grunt.registerTask('status', ['sshexec:status']);

  // see which branch is active
  // calls shell:git_branch
  grunt.registerTask('check_branch', ['sshexec:check_branch']);
}
