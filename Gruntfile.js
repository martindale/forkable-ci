var prompt = require("prompt");

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
          passphrase: '<%= passphrase %>'
        }
      },
      status: {
        command: "forever list",
        options: {
          host: remote.host,
          username: remote.username,
          privateKey: pk,
          passphrase: '<%= passphrase %>'
        }
      },
      check_branch: {
        command: "cd /usr/local/node/forkable-ci && grunt git_branch",
        options: {
          host: remote.host,
          username: remote.username,
          privateKey: pk,
          passphrase: '<%= passphrase %>'
        }
      }
    },
    shell: {
      pull: {
        command: [
          "git pull",
          "npm install",
          "git submodule init",
          "git submodule update",
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
          "git submodule init",
          "git submodule update",
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

  // assumes --remote (set at command-line) points to a json file with config info
  // calls shell:pull
  grunt.registerTask('exec_deploy', ['sshexec:deploy']);
  grunt.registerTask('deploy', 'Deploy latest updates to master', function() {
    var done = this.async();
    getPassphrase(grunt, 'exec_deploy', done);
  });

  // check the status of coursefork node app
  grunt.registerTask('exec_status', ['sshexec:status']);
  grunt.registerTask('status', 'Checkout status of coursefork node app', function() {
    var done = this.async();
    getPassphrase(grunt, 'exec_status', done);
  });

  // see which branch is active
  // calls shell:git_branch
  grunt.registerTask('exec_check_branch', ['sshexec:check_branch']);
  grunt.registerTask('check_branch', 'Check which branch is active', function() {
    var done = this.async();
    getPassphrase(grunt, 'exec_check_branch', done);
  });
}

function getPassphrase(grunt, task, done) {
  var schema = {
    properties: {
      passphrase: {
        hidden: true
      }
    }
  };

  prompt.start();

  prompt.get(schema, function(err, result) {
      grunt.config.set('passphrase', result.passphrase);
      grunt.task.run(task);
      done();
  });
}
