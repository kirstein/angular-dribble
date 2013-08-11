module.exports = function( grunt ) {

  'use strict';

  var SRC = 'src';

  grunt.initConfig({
    pkg    : grunt.file.readJSON('package.json'),
    banner : '/* \n * <%= pkg.name %> <%= pkg.version %>\n * <%= pkg.homepage %>\n * \n * Licensed under the <%= pkg.license %> license\n */',
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
   },

   usebanner : {
     options : {
       position: 'top',
       banner  : '<%= banner %>'
     },
     files : {
       src : [ 'angular-dribble.js', 'angular-dribble.min.js'  ]
     }
   }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-banner');

  grunt.registerTask('default', ['build']);
  grunt.registerTask('test', [ 'karma' ]);
  grunt.registerTask('build', [ 'test', 'copy', 'uglify', 'usebanner' ]);
};
