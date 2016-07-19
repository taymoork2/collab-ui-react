'use strict';

describe('Controller: SingleNumberReachInfoCtrl', function () {
  var controller, $scope, $httpBackend, TelephonyInfoService, Notification, HuronConfig;
  var url;
  var currentUser = getJSONFixture('core/json/currentUser.json');
  var telephonyInfoWithDest = getJSONFixture('huron/json/telephonyInfo/snrEnabledWithDest.json');
  var telephonyInfoWithoutDest = getJSONFixture('huron/json/telephonyInfo/snrEnabledWithoutDest.json');

  var $stateParams = {
    currentUser: currentUser
  };

  beforeEach(module('Huron'));
  beforeEach(module('Sunlight'));

  beforeEach(inject(function ($rootScope, $controller, _$httpBackend_, _TelephonyInfoService_, _Notification_, _HuronConfig_) {
    $scope = $rootScope.$new();
    $httpBackend = _$httpBackend_;
    TelephonyInfoService = _TelephonyInfoService_;
    Notification = _Notification_;
    HuronConfig = _HuronConfig_;

    url = HuronConfig.getCmiUrl() + '/voice/customers/' + currentUser.meta.organizationID + '/users/' + currentUser.id + '/remotedestinations';

    spyOn(TelephonyInfoService, 'getTelephonyInfo').and.returnValue(telephonyInfoWithDest);
    spyOn(TelephonyInfoService, 'getRemoteDestinationInfo');
    spyOn(Notification, 'notify');

    controller = $controller('SingleNumberReachInfoCtrl', {
      $scope: $scope,
      $stateParams: $stateParams,
      TelephonyInfoService: TelephonyInfoService,
      Notification: Notification
    });

    $scope.$apply();
  }));

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  describe('saveSingleNumberReach', function () {
    it('should notify on add', function () {
      $httpBackend.whenPOST(url).respond(201);
      TelephonyInfoService.getTelephonyInfo.and.returnValue(telephonyInfoWithoutDest);
      $scope.$broadcast('telephonyInfoUpdated');
      $scope.$apply();
      controller.saveSingleNumberReach();
      $httpBackend.flush();
      expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'success');
    });

    it('should notify on update', function () {
      $httpBackend.whenPUT(url + '/' + telephonyInfoWithDest.snrInfo.remoteDestinations[0].uuid).respond(200);
      TelephonyInfoService.getTelephonyInfo.and.returnValue(telephonyInfoWithDest);
      $scope.$broadcast('telephonyInfoUpdated');
      $scope.$apply();
      controller.saveSingleNumberReach();
      $httpBackend.flush();
      expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'success');
    });

    it('should notify on delete', function () {
      $httpBackend.whenDELETE(url + '/' + telephonyInfoWithDest.snrInfo.remoteDestinations[0].uuid).respond(204);
      TelephonyInfoService.getTelephonyInfo.and.returnValue(telephonyInfoWithDest);
      $scope.$broadcast('telephonyInfoUpdated');
      $scope.$apply();
      controller.snrInfo.singleNumberReachEnabled = false;
      controller.saveSingleNumberReach();
      $httpBackend.flush();
      expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'success');
    });
  });

});
