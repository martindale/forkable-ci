var prompt = require("prompt");

module.exports = function(grunt) {
  var remote = grunt.option('remote') ? grunt.file.readJSON(grunt.option('remote')) : {};
  var pk     = remote.privateKey ? grunt.file.read(remote.privateKey) : "";

  // forkable-ci home
  var home   = grunt.option('home') || '/usr/local/node/forkable-ci';

  // forkshop root
  var root   = grunt.option('root') || '/usr/local/node/forkshop';

  grunt.initConfig({
    sshexec: {
      deploy: {
        command: "cd <%= home %> && grunt pull",
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
        command: "cd <%= home %> && grunt git_branch",
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
          "git submodule update"
        ].join('&&'),
        options: {
          stdout: true,
          stderr: true,
          execOptions: {
            cwd: "<%= root %>"
          }
        }
      },
      restart: {
        command: "forever restart coursefork.js",
        options: {
          stdout: true,
          stderr: true,
          execOptions: {
            cwd: "<%= root %>"
          }
        }
      },
      git_branch: {
        command: "git branch",
        options: {
          stdout: true,
          execOptions: {
            cwd: "<%= root %>"
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
            cwd: "<%= root %>"
          }
        }
      },
      build: {
        command: [
          "make clean"
        ].join('&&'),
        options: {
          stdout: true,
          stderr: true,
          execOptions: {
            cwd: "/usr/local/node/build"
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
    },
    concat: {
      css: {
        options: {
          process: function(src, filepath) {
            // replace relative reference to ../img with /img
            return src.replace(/\.\.(\/img)/g, '$1');
          }
        }
      }
    },
    uglify: {
      js: {}
    }
  });

  grunt.loadNpmTasks('grunt-ssh');
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  // -----------
  // Shell tasks

  // assumes repo has already been cloned
  // git@github.com:coursefork/forkshop.git
  grunt.registerTask('pull', 'Pull latest updates to local repo', function() {

    // makes all the file manipulation stuff work without being fully qualified
    grunt.file.setBase(root);

    // pull latest code
    grunt.task.run('shell:pull');

    // require assets for concat and uglify
    var assets = require(root + '/assets');

    // need to prepend 'public' to each asset
    for (min_asset in assets) {
      for (var index in assets[min_asset]) {
        assets[min_asset][index] = 'public' + assets[min_asset][index];
      }
    }

    // concat css
    grunt.config.set('concat.css.files', { 'public/css/main.min.css': assets['/css/main.min.css'] });
    grunt.task.run('concat');

    // uglify js
    grunt.config.set('uglify.js.files', { 'public/js/main.min.js': assets['/js/main.min.js'] });
    grunt.task.run('uglify');

    // restart service
    grunt.task.run('shell:restart');

  });

  // local git branch check
  grunt.registerTask('git_branch', ['shell:git_branch']);

  // checkout branch
  // needs --pr command line arg set to a pull request number
  // e.g. grunt checkout_branch --pr 59
  grunt.registerTask('checkout_branch', ['shell:checkout_branch']);

  // work in progress...
  grunt.registerTask('test', ['shell:test']);

  // build
  // not complete - will be used for building and testing pull requests
  grunt.registerTask('_build', ['shell:build']);
  grunt.registerTask('build', 'Build coursefork', function() {
  });

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
