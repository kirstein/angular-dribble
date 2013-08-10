module.exports = function( grunt ) {

  'use strict';

  var SRC = 'src';

  grunt.initConfig({
    uglify : {
      production : {
        src: [ SRC + '/**/*.js' ],
        dest: 'angular-dribble.min.js'
      }
    },

    copy : {
      production : {
        files : [
          { src: SRC + '/dribble.js', dest : 'angular-dribble.js' }
        ]
      }
    },

    karma : {
      spec: {
        configFile : 'karma.conf.js'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-karma');

  grunt.registerTask('default', ['build']);
  grunt.registerTask('test', [ 'karma' ]);
  grunt.registerTask('build', [ 'test', 'copy', 'uglify' ]);
};
