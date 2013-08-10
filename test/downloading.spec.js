describe ('dribble downloading test', function() {
  var $routeProvider;

  beforeEach(function() {
    var testModule = angular.module('dribble.test', [ 'ngDribble' ]);
    testModule.config(function(_$dribbleProvider_, _$routeProvider_) {
      $dribbleProvider = _$dribbleProvider_;
      $routeProvider   = _$routeProvider_;

      // Set extensive timeout
      $dribbleProvider.config({timeout: 500000});
    });

    module(testModule.name);
    inject(function() {});
  });

  it ('should download a template and place it to $templateCache', inject(function($templateCache, $httpBackend, $timeout) {
    var url = "/veryrandom.html";
    $httpBackend.expectGET(url).respond('test');
    $routeProvider.when('/test/url', {
      templateUrl: url
    });

    // Flush it after we have set the routeProvider url
    $timeout.flush();
    $httpBackend.flush();

    expect($templateCache.get(url)[1]).toBe('test');
  }));

  it ('should download a multple templates after the last has downloaded if there arent any unsuspecting requests. Should place them both to templateCache', inject(function($templateCache, $httpBackend, $timeout) {
    var url  = "/veryrandom.html";
    var url2 = "/veryrandom1.html";

    $httpBackend.expectGET(url).respond('test');
    $httpBackend.expectGET(url2).respond('test2');
    $routeProvider.when('/test/url', {
      templateUrl: url
    }).when('test/url2', {
      templateUrl: url2
    });

    // Flush it after we have set the routeProvider url
    $timeout.flush();
    $httpBackend.flush();

    expect($templateCache.get(url)[1]).toBe('test');
    expect($templateCache.get(url2)[1]).toBe('test2');
  }));

  it ('should consider priority key and download templates in given order', inject(function($templateCache, $httpBackend, $timeout) {
    var url  = "/veryrandom.html";
    var url2 = "/veryrandom1.html";

    $dribbleProvider.config({ property: 'priority' });

    $httpBackend.expectGET(url2).respond('test2');
    $httpBackend.expectGET(url).respond('test');

    $routeProvider.when('/test/url', {
      templateUrl: url,
      priority   : 123123
    }).when('test/url2', {
      templateUrl: url2,
      priority   : 1
    });

    // Flush it after we have set the routeProvider url
    $timeout.flush();
    $httpBackend.flush();

    expect($templateCache.get(url)[1]).toBe('test');
    expect($templateCache.get(url2)[1]).toBe('test2');
  }));


  it ('shoul not download a template that is already in cache', inject(function($templateCache, $httpBackend, $timeout) {
    var url  = "/veryrandom.html";
    var url2 = "/veryrandom1.html";

    // Add the url to cache
    $templateCache.put(url , 'test');

    $httpBackend.expectGET(url2).respond('test2');

    $routeProvider.when('/test/url', {
      templateUrl: url,
      priority   : 123123
    }).when('test/url2', {
      templateUrl: url2,
      priority   : 1
    });

    // Flush it after we have set the routeProvider url
    $timeout.flush();
    $httpBackend.flush();

    expect($templateCache.get(url2)[1]).toBe('test2');
  }));

});

