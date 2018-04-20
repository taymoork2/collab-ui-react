'use strict';

describe('controller: servicePartnerCtrl', function () {
  var $q, $scope, $controller, defer, controller, gemService, Notification, $httpBackend, UrlConfig;
  var spData = getJSONFixture('gemini/servicepartner.json');

  beforeEach(function () {
    this.preData = _.cloneDeep(getJSONFixture('gemini/common.json'));
  });

  beforeEach(angular.mock.module('Core'));
  beforeEach(angular.mock.module('Gemini'));
  beforeEach(inject(dependencies));
  beforeEach(initSpec);
  beforeEach(initController);

  function dependencies(_$q_, _$httpBackend_, _UrlConfig_, $rootScope, _$controller_, _gemService_, _Notification_) {
    $q = _$q_;
    defer = $q.defer();
    gemService = _gemService_;
    $scope = $rootScope.$new();
    $controller = _$controller_;
    Notification = _Notification_;
    $httpBackend = _$httpBackend_;
    UrlConfig = _UrlConfig_;
  }

  function initSpec() {
    spyOn(Notification, 'error').and.returnValue($q.resolve());
    spyOn(gemService, 'getSpData').and.returnValue(defer.promise);
  }

  function initController() {
    var getCountriesUrl = UrlConfig.getGeminiUrl() + 'countries';
    $httpBackend.expectGET(getCountriesUrl).respond(200, this.preData.getCountries);

    controller = $controller('servicePartnerCtrl', {
      $scope: $scope,
      gemService: gemService,
    });
  }

  it('should loading is false', function () {
    defer.resolve(spData.success);
    $scope.$apply();
    expect(controller.loading).toBe(false);
  });

  it('The body length is zero', function () {
    defer.resolve(spData.error1);
    $scope.$apply();
    expect(Notification.error).toHaveBeenCalledWith('gemini.msg.splsResponseErr');
  });
});
