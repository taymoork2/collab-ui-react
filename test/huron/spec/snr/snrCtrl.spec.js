'use strict';

describe('Controller: SingleNumberReachInfoCtrl', function () {
  var controller, $scope, $httpBackend, TelephonyInfoService, Notification, HuronConfig;
  var url;
  var currentUser = getJSONFixture('core/json/currentUser.json');
  var telephonyInfoWithSnr = getJSONFixture('huron/json/telephonyInfo/snrEnabled.json');

  var $stateParams = {
    currentUser: currentUser
  };

  beforeEach(module('Huron'));

  beforeEach(inject(function ($rootScope, $controller, _$httpBackend_, _TelephonyInfoService_, _Notification_, _HuronConfig_) {
    $scope = $rootScope.$new();
    $httpBackend = _$httpBackend_;
    TelephonyInfoService = _TelephonyInfoService_;
    Notification = _Notification_;
    HuronConfig = _HuronConfig_;

    url = HuronConfig.getCmiUrl() + '/voice/customers/' + currentUser.meta.organizationID + '/users/' + currentUser.id + '/remotedestinations';

    spyOn(TelephonyInfoService, 'getTelephonyInfo').and.callThrough();
    spyOn(TelephonyInfoService, 'getRemoteDestinationInfo');
    spyOn(Notification, 'notify');

    $httpBackend.whenPOST(url).respond(201);
    $httpBackend.whenPUT(url + '/' + telephonyInfoWithSnr.snrInfo.remoteDestinations[0].uuid).respond(200);
    $httpBackend.whenDELETE(url + '/' + telephonyInfoWithSnr.snrInfo.remoteDestinations[0].uuid).respond(204);

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
      controller.saveSingleNumberReach();
      $httpBackend.flush();
      expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'success');
    });

    it('should notify on update', function () {
      TelephonyInfoService.getTelephonyInfo.and.returnValue(telephonyInfoWithSnr);
      $scope.$broadcast('telephonyInfoUpdated');
      $scope.$apply();
      controller.saveSingleNumberReach();
      $httpBackend.flush();
      expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'success');
    });

    it('should notify on delete', function () {
      TelephonyInfoService.getTelephonyInfo.and.returnValue(telephonyInfoWithSnr);
      $scope.$broadcast('telephonyInfoUpdated');
      $scope.$apply();
      controller.telephonyInfo.snrInfo.singleNumberReachEnabled = false;
      controller.saveSingleNumberReach();
      $httpBackend.flush();
      expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'success');
    });
  });

});
