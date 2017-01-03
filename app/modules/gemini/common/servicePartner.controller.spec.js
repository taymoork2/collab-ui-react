'use strict';

describe('controller: servicePartnerCtrl', function () {
  var $q, $scope, $controller, defer, controller, gemService, Notification;
  var spData = getJSONFixture('gemini/servicepartner.json');

  beforeEach(angular.mock.module('Core'));
  beforeEach(angular.mock.module('Gemini'));
  beforeEach(inject(dependencies));
  beforeEach(initSpec);
  beforeEach(initController);

  function dependencies(_$q_, $rootScope, _$controller_, _gemService_, _Notification_) {
    $q = _$q_;
    defer = $q.defer();
    gemService = _gemService_;
    $scope = $rootScope.$new();
    $controller = _$controller_;
    Notification = _Notification_;
  }

  function initSpec() {
    spyOn(Notification, 'error').and.returnValue($q.when());
    spyOn(gemService, 'getSpData').and.returnValue(defer.promise);
  }

  function initController() {
    controller = $controller('servicePartnerCtrl', {
      $scope: $scope,
      gemService: gemService
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

  it('The response have message', function () {
    defer.resolve(spData.error2);
    $scope.$apply();
    expect(Notification.error).toHaveBeenCalled();
  });
});
