'use strict';

describe('Controller: SingleNumberReachInfoCtrl', function () {
  var controller, $scope, $httpBackend, $modal, TelephonyInfoService, Notification, HuronConfig, DialPlanService, $q;
  var url;
  var currentUser = getJSONFixture('core/json/currentUser.json');
  var telephonyInfoWithDest = getJSONFixture('huron/json/telephonyInfo/snrEnabledWithDest.json');
  var telephonyInfoWithoutDest = getJSONFixture('huron/json/telephonyInfo/snrEnabledWithoutDest.json');
  var modalDefer;
  var $stateParams = {
    currentUser: currentUser
  };

  beforeEach(angular.mock.module('Huron'));
  beforeEach(angular.mock.module('Sunlight'));

  beforeEach(inject(function ($rootScope, $controller, _$modal_, _$httpBackend_, _TelephonyInfoService_, _Notification_, _HuronConfig_, _DialPlanService_, _$q_) {
    $scope = $rootScope.$new();
    $httpBackend = _$httpBackend_;
    $modal = _$modal_;
    TelephonyInfoService = _TelephonyInfoService_;
    Notification = _Notification_;
    HuronConfig = _HuronConfig_;
    DialPlanService = _DialPlanService_;
    $q = _$q_;
    modalDefer = $q.defer();
    $scope.currentUser = currentUser.id;
    url = HuronConfig.getCmiUrl() + '/voice/customers/' + currentUser.meta.organizationID + '/users/' + currentUser.id + '/remotedestinations';

    spyOn(TelephonyInfoService, 'getTelephonyInfo').and.returnValue(telephonyInfoWithDest);
    spyOn(TelephonyInfoService, 'getRemoteDestinationInfo').and.returnValue($q.resolve(telephonyInfoWithoutDest));
    spyOn(Notification, 'notify');
    spyOn(DialPlanService, 'getCustomerVoice').and.returnValue($q.resolve({ regionCode: '' }));
    spyOn($modal, 'open').and.returnValue({
      result: modalDefer.promise
    });
    controller = $controller('SingleNumberReachInfoCtrl', {
      $scope: $scope,
      $stateParams: $stateParams,
      TelephonyInfoService: TelephonyInfoService,
      Notification: Notification
    });
    $scope = $rootScope.$new();
    $scope.$apply();
  }));

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  describe('saveSingleNumberReach', function () {
    beforeEach(function () {
      TelephonyInfoService.getRemoteDestinationInfo.and.returnValue($q.resolve(telephonyInfoWithDest));
    });

    it('should notify on add', function () {
      $httpBackend.whenPOST(url).respond(201);
      $scope.$apply();
      controller.saveSingleNumberReach();
      $httpBackend.flush();
      expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'success');
    });

    it('should notify on update', function () {
      $httpBackend.whenPUT(url + '/' + telephonyInfoWithDest.snrInfo.remoteDestinations[0].uuid).respond(200);
      $scope.$apply();
      controller.snrInfo.remoteDestinations = [{
        "uuid": "123456",
        "pattern": "555"
      }];
      controller.saveSingleNumberReach();
      $httpBackend.flush();
      expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'success');
    });

    it('should notify on disable SNR update', function () {
      $httpBackend.whenPUT(url + '/' + telephonyInfoWithDest.snrInfo.remoteDestinations[0].uuid).respond(200);
      TelephonyInfoService.getTelephonyInfo.and.returnValue(telephonyInfoWithDest);
      controller.snrInfo.remoteDestinations = [{
        "uuid": "123456",
        "pattern": "555"
      }];
      $scope.$apply();

      controller.snrInfo.singleNumberReachEnabled = false;
      controller.saveSingleNumberReach();
      $httpBackend.flush();
      expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'success');
    });

    it('should notify on delete', function () {
      $httpBackend.whenDELETE(url + '/' + telephonyInfoWithDest.snrInfo.remoteDestinations[0].uuid).respond(204);
      TelephonyInfoService.getTelephonyInfo.and.returnValue(telephonyInfoWithDest);
      $scope.$apply();
      controller.snrInfo.remoteDestinations = [{
        "uuid": "123456",
        "pattern": "555"
      }];
      controller.snrInfo.singleNumberReachEnabled = false;
      controller.remove();
      modalDefer.resolve();
      $httpBackend.flush();
      expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'success');
    });
  });

});
