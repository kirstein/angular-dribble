/* 
 * angular-dribble 0.0.1
 * https://github.com/kirstein/angular-dribble
 * 
 * Licensed under the MIT license
 */
(function(angular) {
  'use strict';

  // Configurations
  var DEFAULT_CONFIG = {
    property : null,
    timeout  : 5000
  };

  var module = angular.module('ngDribble', []);

  /**
   * Dribble provider
   *
   * Provider that provides configuration for the dribble service
   */
  module.provider('$dribble', function() {
    var config = DEFAULT_CONFIG;

    /**
     * Getter and setter for the dribble configuration.
     * If the conf param is an array then will set extend the default configuration with that.
     *
     *  @param {Object|Undefined} conf configuration to set
     *  @return {Object} current configuration
     */
    this.config = function(conf) {
      if (angular.isObject(conf)) {
        angular.extend(config, conf);
      }

      return config;
    };

    /**
     * Constructor for the $dribble provider
     *
     * @return {Function} function that returns the configuration object
     */
    this.$get = function() {
      return function() {
        return config;
      };
    };
  });

  /**
   * Main service for dealing with template downloading.
   * Will build the template list and check if the template is needed for downloading or not.
   *
   * Deals with the timeout handling and making sure we dont download templates when there are active user requests
   */
  module.service('ngDribbleService', [ '$templateCache', '$injector', '$timeout', '$dribble', '$filter', function($templateCache, $injector, $timeout, $dribble, $filter) {

    var downloaded = {},                 // list of to-be or already downloaded templates
        config     = $dribble(),         // dribble configuration
        order      = $filter('orderBy'), // orderBy filter for template list ordering
        templates, timer,
        $route, $http;                   // will be initiated later on using $injector

    /**
     * Will build the template list.
     *
     * On the first run will inject `$route` and get all the available routes.
     * If the routes contain `templateUrl` param then will add.
     *
     * If the `config` has defined `priority` key then it will sort the received templates
     * by using angulars very own `orderBy` filter.
     *
     *  @return {Array} list of templates to be downloaded
     */
    function buildTemplateList () {
      $route    = $route || $injector.get('$route');
      templates = [];

      // Map the routes.
      // Using angular forEach instead of #map to work with es3
      angular.forEach($route.routes, function(route) {
        if (angular.isString(route.templateUrl)) {
          templates.push({
            url      : route.templateUrl,
            priority : route[config.property]
          });
        }
      });

      // If the priority setting is set
      // then lets sort the template by it.
      if (angular.isString(config.property)) {
        // false = smaller on top
        templates = order(templates, 'priority', false);
      }

      return templates;
    }

    /**
     * Checks if all templates have been downloaded
     * If the templates have been initiated and they are empty
     * then we can safely assume that everything has been downloaded
     */
    function isEverythingDownloaded() {
      return angular.isArray(templates) && !templates.length;
    }

    /**
     * Download the next available template.
     *
     * On the first run will initiate $http and build the template list.
     * Later on will use the already initiated $http and already built template list.
     *
     * If there are templates to download then AND the template is not in $templateCache already
     * then will trigger $http request for the given template.
     *
     * If there are templates and the to-be downloaded template is in $templateCache
     * then it will try to download the next available template.
     */
    function downloadNext() {
      var template;

      $http     = $http     || $injector.get('$http');
      templates = templates || buildTemplateList();

      if (templates.length) {
        // Remove the first
        template             = templates.shift().url;
        downloaded[template] = false; // Mark the template to be downloaded

        // If the template is already loaded
        // then mark the template loading as done
        // and lets try to fetch another
        if ($templateCache.get(template)) {
          downloaded[template] = true;
          return downloadNext();
        }

        // Download the template and store it in $templateCache
        $http.get(template, { cache : $templateCache });
      }
    }

    /**
     * Notifys he dribble that the download of a certain task url has completed
     * If the path was expected to be downloaded by the dribble module
     * then it will just continue downloading its templates.
     *
     * If there are no more templates to download then it will not reset the timer
     * nor will it try to download the next template.
     *
     * If the path was not expected then that means that some kind of activity is happening
     * so we will reset the idle timer.
     *
     *  @param {String} path url that has been downloaded
     */
    this.notify = function(path) {
      if (isEverythingDownloaded()) {
        return;
      }

      // If the request is the template request
      // then lets just ignore it.
      if (!downloaded.hasOwnProperty(path)) {
        this.resetTimer();
      } else {
        downloaded[path] = true;
        downloadNext();
      }
    };

    /**
     * Resets the download timer.
     * If the download timer has not been started then starts it.
     * If the timer has been started then cancels the previous timer and stars a new one.
     *
     * If all the templates have been downloaded then will just return.
     */
    this.resetTimer = function() {
      if (isEverythingDownloaded()) {
        return;
      }

      // If the timer had been started earlier then lets stop it
      if (timer) {
        $timeout.cancel(timer);
      }

      // Start the timer without modal dirty checking
      timer = $timeout(downloadNext, config.timeout, false);
    };
  }]);

  /**
   * Register an interceptor for all responses.
   * If the response is gotten (we dont care if its a failed one or not)
   * then we will notify the ngDribbleService
   *
   *  @param {HttpProvider} httpProvider
   */
  module.config(['$httpProvider', function($httpProvider) {
    $httpProvider.responseInterceptors.push(['ngDribbleService', '$q', function(ngDribbleService, $q) {

      // Notify the dribbleService
      function notify(response) {
        ngDribbleService.notify(response.config.url);
      }

      // Interceptor magic
      return function(promise) {
        return promise.then(function(response) {
          notify(response);
          return response;
        }, function(response) {
          notify(response);
          return $q.reject(response);
        });
      };
    }]);
  }]);

  /**
   * Invokes the dribble service #resetTimer function right after the angular app is bootstraped
   *
   * @param {ngDribbleService} ngDribbleService
   */
  module.run(['ngDribbleService', function(ngDribbleService) {
    ngDribbleService.resetTimer();
  }]);

}(angular));
