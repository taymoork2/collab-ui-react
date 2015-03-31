'use strict';

describe('Controller: LineSettingsCtrl', function () {
  var controller, $scope, $stateParams, $q, $modal, Notification, DirectoryNumber, TelephonyInfoService, LineSettings, HuronAssignedLine, HuronUser;
  var currentUser, directoryNumber, getDirectoryNumber, internalNumbers, externalNumbers, telephonyInfoWithVoicemail;

  beforeEach(module('Huron'));

  beforeEach(inject(function ($rootScope, _$httpBackend_, $controller, _$q_, _$modal_, _Notification_, _DirectoryNumber_, _TelephonyInfoService_, _LineSettings_, _HuronAssignedLine_, _HuronUser_) {
    $scope = $rootScope.$new();
    $q = _$q_;
    $modal = _$modal_;
    Notification = _Notification_;
    DirectoryNumber = _DirectoryNumber_;
    TelephonyInfoService = _TelephonyInfoService_;
    LineSettings = _LineSettings_;
    HuronAssignedLine = _HuronAssignedLine_;
    HuronUser = _HuronUser_;

    currentUser = getJSONFixture('core/json/currentUser.json');
    directoryNumber = getJSONFixture('huron/json/lineSettings/directoryNumber.json');
    getDirectoryNumber = getJSONFixture('huron/json/lineSettings/getDirectoryNumber.json');
    internalNumbers = getJSONFixture('huron/json/internalNumbers/internalNumbers.json');
    externalNumbers = getJSONFixture('huron/json/externalNumbers/externalNumbers.json');
    telephonyInfoWithVoicemail = getJSONFixture('huron/json/telephonyInfo/voicemailEnabled.json');

    $stateParams = {
      currentUser: currentUser,
      directoryNumber: directoryNumber
    };

    // Wow too many services need to refactor controller
    spyOn(TelephonyInfoService, 'getInternalNumberPool').and.returnValue(internalNumbers);
    spyOn(TelephonyInfoService, 'getExternalNumberPool').and.returnValue(externalNumbers);
    spyOn(TelephonyInfoService, 'getTelephonyInfo').and.returnValue(telephonyInfoWithVoicemail);
    spyOn(TelephonyInfoService, 'getUserDnInfo').and.returnValue($q.when());

    spyOn(DirectoryNumber, 'getDirectoryNumber').and.returnValue($q.when(getDirectoryNumber));

    spyOn(LineSettings, 'updateLineSettings').and.returnValue($q.when());
    spyOn(LineSettings, 'changeInternalLine').and.returnValue($q.when());
    spyOn(LineSettings, 'addNewLine').and.returnValue($q.when());
    spyOn(LineSettings, 'disassociateInternalLine').and.returnValue($q.when());
    spyOn(LineSettings, 'addExternalLine').and.returnValue($q.when());
    spyOn(LineSettings, 'changeExternalLine').and.returnValue($q.when());
    spyOn(LineSettings, 'deleteExternalLine').and.returnValue($q.when());

    spyOn(HuronUser, 'updateDtmfAccessId').and.returnValue($q.when());

    controller = $controller('LineSettingsCtrl', {
      $scope: $scope,
      $stateParams: $stateParams,
      Notification: Notification,
      DirectoryNumber: DirectoryNumber,
      TelephonyInfoService: TelephonyInfoService,
      LineSettings: LineSettings,
      HuronAssignedLine: HuronAssignedLine,
      HuronUser: HuronUser
    });

    $scope.$apply();
  }));

  afterEach(function () {
    // Cached fixture is being manipulated by controller, so needs to be cleared
    jasmine.getJSONFixtures().clearCache();
  });

  describe('saveLineSettings', function () {
    beforeEach(function () {
      controller.saveLineSettings();
      $scope.$apply();
    });

    it('should update dtmfAccessId with the external number pattern', function () {
      expect(HuronUser.updateDtmfAccessId).toHaveBeenCalledWith(currentUser.id, telephonyInfoWithVoicemail.alternateDirectoryNumber.pattern);
    });
  });

});
