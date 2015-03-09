'use strict';

describe('Controller: VoicemailInfoCtrl', function () {
  var controller, $scope, $httpBackend, TelephonyInfoService, Notification, HuronConfig;

  var currentUser = getJSONFixture('core/json/currentUser.json');
  var telephonyInfoWithVoicemail = getJSONFixture('huron/json/telephonyInfo/voicemailEnabled.json');
  var url;

  beforeEach(module('Huron'));

  beforeEach(inject(function ($rootScope, $controller, _$httpBackend_, _TelephonyInfoService_, _Notification_, _HuronConfig_) {
    $scope = $rootScope.$new();
    $httpBackend = _$httpBackend_;
    TelephonyInfoService = _TelephonyInfoService_;
    Notification = _Notification_;
    HuronConfig = _HuronConfig_;

    $scope.currentUser = currentUser;
    url = HuronConfig.getCmiUrl() + '/common/customers/' + currentUser.meta.organizationID + '/users/' + currentUser.id;

    spyOn(TelephonyInfoService, 'getTelephonyInfo').and.callThrough();
    spyOn(Notification, 'notify');

    controller = $controller('VoicemailInfoCtrl', {
      $scope: $scope,
      TelephonyInfoService: TelephonyInfoService,
      Notification: Notification
    });

    $scope.$apply();
  }));

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  describe('saveVoicemail', function () {
    describe('enable voicemail', function () {
      beforeEach(function () {
        controller.enableVoicemail = true;
      });

      it('should notify on success', function () {
        $httpBackend.whenPUT(url).respond(200);
        controller.saveVoicemail();
        $httpBackend.flush();
        expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'success');
      });

      it('should notify on error', function () {
        $httpBackend.whenPUT(url).respond(500);
        controller.saveVoicemail();
        $httpBackend.flush();
        expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'error');
      });

      it('should work when already enabled', function () {
        TelephonyInfoService.getTelephonyInfo.and.returnValue(telephonyInfoWithVoicemail);
        $scope.$broadcast('telephonyInfoUpdated');
        $scope.$apply();

        $httpBackend.whenPUT(url).respond(200);
        controller.saveVoicemail();
        $httpBackend.flush();
        expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'success');
      });
    });

    describe('disable voicemail', function () {
      beforeEach(function () {
        controller.enableVoicemail = false;
        TelephonyInfoService.getTelephonyInfo.and.returnValue(telephonyInfoWithVoicemail);
        $scope.$broadcast('telephonyInfoUpdated');
        $scope.$apply();
      });

      it('should notify on success', function () {
        $httpBackend.whenPUT(url).respond(200);
        controller.saveVoicemail();
        $httpBackend.flush();
        expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'success');
      });

      it('should notify on error', function () {
        $httpBackend.whenPUT(url).respond(500);
        controller.saveVoicemail();
        $httpBackend.flush();
        expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'error');
      });
    });
  });

});
