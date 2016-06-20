'use strict';

describe('Controller: VoicemailInfoCtrl', function () {
  var controller, $scope, $stateParams, $httpBackend, $modal, $q, TelephonyInfoService, Notification, HuronConfig, modalDefer, UserServiceCommon, DirectoryNumber, LineSettings;

  var currentUser = getJSONFixture('core/json/currentUser.json');
  var telephonyInfoWithVoice = getJSONFixture('huron/json/telephonyInfo/voiceEnabled.json');
  var telephonyInfoWithVoicemail = getJSONFixture('huron/json/telephonyInfo/voicemailEnabled.json');
  var directoryInfo = getJSONFixture('huron/json/telephonyInfo/getDirectoryNumber.json');
  var directoryInfoBusy = getJSONFixture('huron/json/lineSettings/getDirectoryNumberBusy.json');
  var directoryInfoCFA = getJSONFixture('huron/json/lineSettings/getDirectoryNumberCFA.json');
  var errorMessage = {
    'data': {
      'errorMessage': 'Common User create failed.'
    }
  };
  var url;

  beforeEach(module('Huron'));
  beforeEach(module('Sunlight'));

  beforeEach(inject(function ($rootScope, $controller, _$httpBackend_, _$modal_, _$q_, _TelephonyInfoService_, _Notification_, _HuronConfig_, _UserServiceCommon_, _DirectoryNumber_, _LineSettings_) {
    $scope = $rootScope.$new();
    $httpBackend = _$httpBackend_;
    TelephonyInfoService = _TelephonyInfoService_;
    DirectoryNumber = _DirectoryNumber_;
    LineSettings = _LineSettings_;
    Notification = _Notification_;
    HuronConfig = _HuronConfig_;
    $modal = _$modal_;
    $q = _$q_;
    modalDefer = $q.defer();
    UserServiceCommon = _UserServiceCommon_;

    $stateParams = {
      currentUser: currentUser
    };
    url = HuronConfig.getCmiUrl() + '/common/customers/' + currentUser.meta.organizationID + '/users/' + currentUser.id;

    spyOn(TelephonyInfoService, 'getTelephonyInfo').and.returnValue(telephonyInfoWithVoice);
    spyOn(Notification, 'notify');
    spyOn($modal, 'open').and.returnValue({
      result: modalDefer.promise
    });
    spyOn(UserServiceCommon, 'update').and.callThrough();

    controller = $controller('VoicemailInfoCtrl', {
      $scope: $scope,
      $stateParams: $stateParams,
      $modal: $modal,
      TelephonyInfoService: TelephonyInfoService,
      UserServiceCommon: UserServiceCommon,
      Notification: Notification,
      DirectoryNumber: DirectoryNumber,
      LineSettings: LineSettings
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
        spyOn(DirectoryNumber, 'getDirectoryNumber').and.returnValue($q.when(directoryInfo));

      });

      it('should notify on success', function () {
        $httpBackend.whenPUT(url).respond(200);
        controller.saveVoicemail();
        $httpBackend.flush();
        expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'success');
      });

      it('should update dtmfAccessId with external number', function () {
        $httpBackend.whenPUT(url).respond(200);
        controller.saveVoicemail();
        $httpBackend.flush();
        expect(UserServiceCommon.update.calls.mostRecent().args[1].voicemail.dtmfAccessId).toEqual(telephonyInfoWithVoice.esn);
      });

      it('should notify on error', function () {
        $httpBackend.whenPUT(url).respond(500, errorMessage);
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
        spyOn(DirectoryNumber, 'getDirectoryNumber').and.returnValue($q.when(directoryInfo));
        TelephonyInfoService.getTelephonyInfo.and.returnValue(telephonyInfoWithVoicemail);
        $scope.$broadcast('telephonyInfoUpdated');
        $scope.$apply();
      });

      it('should notify on success', function () {
        $httpBackend.whenPUT(url).respond(200);
        controller.saveVoicemail();
        modalDefer.resolve();
        $httpBackend.flush();
        expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'success');
      });

      it('should notify on error', function () {
        $httpBackend.whenPUT(url).respond(500, errorMessage);
        controller.saveVoicemail();
        modalDefer.resolve();
        $httpBackend.flush();
        expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'error');
      });

      it('should do nothing on modal cancel', function () {
        controller.saveVoicemail();
        modalDefer.reject();
        expect(Notification.notify).not.toHaveBeenCalled();
      });
    });

    describe('enable voicemail With prior CFA/CFB destination set', function () {
      beforeEach(function () {
        controller.enableVoicemail = true;
      });

      it('should notify on success', function () {
        spyOn(DirectoryNumber, 'getDirectoryNumber').and.returnValue($q.when(directoryInfoBusy));
        $httpBackend.whenPUT(url).respond(200);
        controller.saveVoicemail();
        $httpBackend.flush();
        expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'success');
      });

      it('should notify on success', function () {
        spyOn(DirectoryNumber, 'getDirectoryNumber').and.returnValue($q.when(directoryInfoCFA));
        $httpBackend.whenPUT(url).respond(200);
        controller.saveVoicemail();
        $httpBackend.flush();
        expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'success');
      });
    });
  });
});
