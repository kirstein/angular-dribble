
describe('ngDribble', function() {
  beforeEach(module('ngDribble'));

  describe('provider test', function() {
    var $dribbleProvider;

    beforeEach(function() {
      var testModule = angular.module('dribble.test', [ 'ngDribble' ]);
      testModule.config(function(_$dribbleProvider_) {
        $dribbleProvider = _$dribbleProvider_;
      });

      module(testModule.name);
      inject(function() {});
    });

    describe('provider API', function () {

      describe('#config', function() {
        it ('should have config method', function() {
          expect($dribbleProvider.config).toEqual(jasmine.any(Function));
        });

        it ('should return default values without overwriting them', function() {
         var values = angular.copy($dribbleProvider.config());
         expect($dribbleProvider.config()).toEqual(values);
         expect($dribbleProvider.config()).toEqual(values);
        });

        it ('should overwrite properties', function() {
         expect($dribbleProvider.config({ property: null, timeout: '123' })).toEqual({ property: null, timeout: '123' });
        });

        it ('should not owerwrite properties if empty object is given', function() {
          var def = $dribbleProvider.config();
          expect($dribbleProvider.config({})).toEqual(def);
        });
      });
    });

    describe('provider', function () {

      it ('should be a function', inject(function($dribble) {
        expect($dribble).toEqual(jasmine.any(Function));
      }));

      it ('should give the defined config', inject(function($dribble) {
        $dribbleProvider.config({ property: "potato", timeout: 2555 });
        expect($dribble()).toEqual({ property: "potato", timeout: 2555 });
      }));

    });
  });

  describe('interceptors', function() {
    var $httpBackend, $http, dribbleService;

    function makeRequest(request, response) {
      $httpBackend.expectGET(request).respond(response);
      $http.get(request);
      $httpBackend.flush();
    }

    beforeEach(inject(function(_$httpBackend_, _$http_, ngDribbleService) {
      $httpBackend   = _$httpBackend_;
      $http          = _$http_;
      dribbleService = ngDribbleService;
    }));

    afterEach(function() {
      $httpBackend.verifyNoOutstandingRequest();
    });

    it ('should trigger notify function of the ngDribbleService on success', function() {
      dribbleService.notify = jasmine.createSpy();
      makeRequest('/rest/test', 200);

      expect(dribbleService.notify).toHaveBeenCalledWith('/rest/test');
    });

    it ('should trigger notify function of the ngDribbleService on error', function() {
      dribbleService.notify = jasmine.createSpy();
      makeRequest('/rest/test', 400);

      expect(dribbleService.notify).toHaveBeenCalledWith('/rest/test');
    });
  });

  describe('ngDribbleService', function() {
    var dribbleService;

    beforeEach(inject(function(ngDribbleService) {
      dribbleService = ngDribbleService;
    }));

    describe('#resetTimer', function() {

      it ('should have resetTimer method', function() {
        expect(dribbleService.resetTimer).toEqual(jasmine.any(Function));
      });

    });

    describe('#notify', function() {

      it ('should have notify method', function() {
        expect(dribbleService.notify).toEqual(jasmine.any(Function));
      });

      it ('should trigger resetTimer if it was not expecting that request', function() {
        dribbleService.resetTimer = jasmine.createSpy();
        dribbleService.notify();
        expect(dribbleService.resetTimer).toHaveBeenCalled();
      });

    });
  });
});

