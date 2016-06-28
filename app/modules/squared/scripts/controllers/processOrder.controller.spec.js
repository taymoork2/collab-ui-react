'use strict';

describe('Controller: ProcessorderCtrl', function () {
 var $controller, $httpBackend, $location, $q, $scope, controller, Auth, Orgservice;

  beforeEach(module('Squared'));
  beforeEach(inject(dependencies));
  beforeEach(initSpies);

  function dependencies($rootScope, _$controller_, _$httpBackend_, _$q_, _Auth_, _Orgservice_) {
    $controller = _$controller_;
    $httpBackend = _$httpBackend_;
    $location = {
      search: function () {}
    };
    $q = _$q_;
    $scope = $rootScope.$new();
    Auth = _Auth_;
    Orgservice = _Orgservice_;
  }

  function initSpies() {
    spyOn($location, 'search').and.returnValue({
      enc: 'fake-encrypted-payload'
    });
    spyOn(Orgservice, 'createOrg');
    spyOn(Auth, 'logoutAndRedirectTo');
  }

  function initController() {
    initControllerNoApply();
    $scope.$apply();
  }

  // leave out '$scope.$apply()' to allow tests on controller properties _before_ async calls
  function initControllerNoApply() {
    controller = $controller('ProcessorderCtrl', {
      $scope: $scope,
      $location: $location,
      Orgservice: Orgservice
    });
  }

  describe('primary behaviors:', function () {
    describe('init (before async calls):', function () {
      beforeEach(function () {
        Orgservice.createOrg.and.returnValue($q.when({}));
      });
      beforeEach(initControllerNoApply);

      it('should initialize "isProcessing" property to true', function () {
        expect(controller.isProcessing).toBe(true);
      });

      it('should call "Orgservice.createOrg()" with "enc" parameter from the browser\'s location', function () {
        expect(Orgservice.createOrg).toHaveBeenCalledWith('fake-encrypted-payload');
      });
    });

    describe('init (after all async calls flushed):', function () {
      describe('when "Orgservice.createOrg()" resolves:', function () {
        beforeEach(function () {
          Orgservice.createOrg.and.returnValue($q.when({
            redirectUrl: 'fake-redirect-url'
          }));
        });
        beforeEach(initController);

        it('should set "isProcessing" to false', function () {
          expect(controller.isProcessing).toBe(false);
        });

        it('should logout and redirect to "redirectUrl" property value in the response payload', function () {
          expect(Auth.logoutAndRedirectTo).toHaveBeenCalledWith('fake-redirect-url');
        });
      });

      describe('when "Orgservice.createOrg()" rejects:', function () {
        var $bak;

        beforeEach(function () {
          $bak = $;
          $ = jasmine.createSpy().and.returnValue({
            modal: jasmine.createSpy()
          });
          Orgservice.createOrg.and.returnValue($q.reject());
        });
        beforeEach(initController);

        afterEach(function () {
          $ = $bak;
        });

        it('should show the "#processOrderErrorModal"', function () {
          expect($).toHaveBeenCalledWith('#processOrderErrorModal');
          expect($('#processOrderErrorModal').modal).toHaveBeenCalledWith('show');
        });
      });
    });
  });
});
