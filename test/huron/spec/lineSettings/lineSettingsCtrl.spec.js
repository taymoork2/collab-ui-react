'use strict';

describe('Controller: LineSettingsCtrl', function () {
  var controller, $scope, $stateParams, $rootScope, $q, $modal, Notification, DirectoryNumber, TelephonyInfoService, LineSettings, HuronAssignedLine, HuronUser, ServiceSetup;
  var currentUser, directoryNumber, getDirectoryNumber, internalNumbers, externalNumbers, telephonyInfoWithVoicemail;
  var UserListService, SharedLineInfoService;
  var userList = [];
  var userData = [];
  var sharedLineUsers = [];
  var sharedLineDevices = [];
  var sharedLineEndpoints = [];
  var selectedUsers = [];
  var count;
  beforeEach(module('Huron'));

  beforeEach(inject(function (_$rootScope_, _$httpBackend_, $controller, _$q_, _$modal_, _Notification_, _DirectoryNumber_, _TelephonyInfoService_, _LineSettings_, _HuronAssignedLine_, _HuronUser_, _ServiceSetup_,
    _UserListService_, _SharedLineInfoService_) {
    $rootScope = _$rootScope_;
    $scope = $rootScope.$new();
    $q = _$q_;
    $modal = _$modal_;
    Notification = _Notification_;
    DirectoryNumber = _DirectoryNumber_;
    TelephonyInfoService = _TelephonyInfoService_;
    LineSettings = _LineSettings_;
    HuronAssignedLine = _HuronAssignedLine_;
    HuronUser = _HuronUser_;
    ServiceSetup = _ServiceSetup_;
    UserListService = _UserListService_;
    SharedLineInfoService = _SharedLineInfoService_;

    $scope.sort = {
      by: 'name',
      order: 'ascending',
      maxCount: 10000,
      startAt: 0
    };

    currentUser = getJSONFixture('core/json/currentUser.json');
    directoryNumber = getJSONFixture('huron/json/lineSettings/directoryNumber.json');
    getDirectoryNumber = getJSONFixture('huron/json/lineSettings/getDirectoryNumber.json');
    internalNumbers = getJSONFixture('huron/json/internalNumbers/internalNumbers.json');
    externalNumbers = getJSONFixture('huron/json/externalNumbers/externalNumbers.json');
    telephonyInfoWithVoicemail = getJSONFixture('huron/json/telephonyInfo/voicemailEnabled.json');

    //Sharedline
    userList = getJSONFixture('huron/json/user/users/usersList.json');
    sharedLineUsers = getJSONFixture('huron/json/sharedLine/sharedUsers.json');
    sharedLineEndpoints = getJSONFixture('huron/json/sharedLine/sharedDevices.json');
    selectedUsers = getJSONFixture('huron/json/sharedLine/selectedUser.json');
    //SharedLine

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

    spyOn(ServiceSetup, 'listSites').and.returnValue($q.when([]));
    //Sharedline 
    spyOn(UserListService, 'listUsers').and.returnValue($q.when(userList));
    spyOn(SharedLineInfoService, 'loadSharedLineUsers').and.returnValue($q.when(sharedLineUsers));
    spyOn(SharedLineInfoService, 'loadSharedLineUserDevices').and.returnValue($q.when(sharedLineEndpoints));
    spyOn(SharedLineInfoService, 'addSharedLineUser').and.returnValue($q.when(sharedLineUsers));
    spyOn(SharedLineInfoService, 'disassociateSharedLineUser').and.returnValue($q.when());
    spyOn(SharedLineInfoService, 'associateLineEndpoint').and.returnValue($q.when());
    spyOn(SharedLineInfoService, 'disassociateLineEndpoint').and.returnValue($q.when());
    spyOn(SharedLineInfoService, 'getSharedLineDevices').and.callThrough();

    //Sharedline 

    spyOn(Notification, 'notify');

    controller = $controller('LineSettingsCtrl', {
      $scope: $scope,
      $rootScope: $rootScope,
      $stateParams: $stateParams,
      Notification: Notification,
      DirectoryNumber: DirectoryNumber,
      TelephonyInfoService: TelephonyInfoService,
      LineSettings: LineSettings,
      HuronAssignedLine: HuronAssignedLine,
      HuronUser: HuronUser,
      UserListService: UserListService,
      SharedLineInfoService: SharedLineInfoService
    });

    $scope.$apply();
  }));

  afterEach(function () {
    // Cached fixture is being manipulated by controller, so needs to be cleared
    jasmine.getJSONFixtures().clearCache();
  });

  describe('init', function () {
    it('should call TelephonyInfoService.getTelephonyInfo()', function () {
      controller.init();
      $scope.$apply();
      expect(TelephonyInfoService.getTelephonyInfo).toHaveBeenCalled();
      expect(controller.directoryNumber).toEqual(getDirectoryNumber);
    });
  });

  describe('saveLineSettings', function () {
    beforeEach(function () {
      controller.forward = 'none';
      controller.saveLineSettings();
      $scope.$apply();
    });

    it('should update dtmfAccessId with the external number pattern', function () {
      expect(HuronUser.updateDtmfAccessId).toHaveBeenCalledWith(currentUser.id, telephonyInfoWithVoicemail.alternateDirectoryNumber.pattern);
    });

  });

  describe('SharedLineUsers', function () {
    beforeEach(function () {
      controller.forward = 'none';
      controller.selectedUsers.push(selectedUsers[0]);
      spyOn(SharedLineInfoService, 'getUserLineCount').and.returnValue($q.when(2));
      controller.saveLineSettings();
    });

    it('listSharedLineUsers: Should return shared line users and endpoints', function () {
      expect(SharedLineInfoService.loadSharedLineUsers).toHaveBeenCalledWith(directoryNumber.uuid, currentUser.id);
      expect(controller.sharedLineBtn).toBe(true);
      expect(controller.sharedLineUsers.length).toBe(2);
      expect(controller.sharedLineEndpoints).toBeDefined();
    });

    it('addSharedLineUsers: Should add shared line users and endpoints', function () {
      expect(controller.sharedLineBtn).toBe(true);
      SharedLineInfoService.getSharedLineDevices.and.returnValue(sharedLineEndpoints);
      $scope.$broadcast('SharedLineInfoUpdated');
      $scope.$apply();
      expect(SharedLineInfoService.getUserLineCount).toHaveBeenCalledWith(selectedUsers[0].uuid);
      expect(SharedLineInfoService.addSharedLineUser).toHaveBeenCalled();
      expect(SharedLineInfoService.loadSharedLineUsers).toHaveBeenCalled();
      expect(controller.sharedLineUsers.length).toBe(2);
      expect(controller.sharedLineEndpoints).toBeDefined();

      expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'success');
    });

  });

  describe('update SharedLineDevices', function () {
    beforeEach(function () {
      controller.forward = 'none';
      spyOn(SharedLineInfoService, 'getUserLineCount').and.returnValue($q.when(2));
      controller.selectedUsers = [];
      controller.devices = angular.copy(sharedLineEndpoints);
      controller.sharedLineUsers.push(sharedLineUsers[0]);
      controller.sharedLineEndpoints = angular.copy(sharedLineEndpoints);
      if (controller.sharedLineEndpoints.length >= 2) {
        controller.sharedLineEndpoints[0].isSharedLine = false;
        controller.sharedLineEndpoints[1].isSharedLine = true;
      }
      controller.saveLineSettings();
      $scope.$apply();
    });

    it('disassociateSharedLineDevice: should disassociate Shared Line endpoint', function () {
      expect(controller.sharedLineBtn).toBe(true);
      expect(controller.devices.length).toBe(3);
      expect(controller.devices[0].isSharedLine).toBeTruthy();
      expect(controller.sharedLineEndpoints[0].isSharedLine).toBeFalsy();

      expect(SharedLineInfoService.disassociateLineEndpoint).toHaveBeenCalled();
      expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'success');
    });

    it('associateSharedLineDevice: should associate Shared Line endpoint', function () {
      expect(controller.sharedLineBtn).toBe(true);
      expect(controller.sharedLineEndpoints[1].isSharedLine).toBeTruthy();
      expect(SharedLineInfoService.associateLineEndpoint).toHaveBeenCalled();

      expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'success');
    });
  });

  describe('Toggle button to remove SharedLineUsers', function () {
    beforeEach(function () {
      controller.forward = 'none';
      spyOn(SharedLineInfoService, 'getUserLineCount').and.returnValue($q.when(2));
      controller.selectedUsers = [];

      controller.saveLineSettings();
      controller.sharedLineBtn = false;
      $scope.$apply();
    });

    it('disassociateSharedLineUsers: should disassociate Shared Line Users', function () {
      expect(controller.sharedLineUsers.length).toBe(2);
      expect(SharedLineInfoService.disassociateSharedLineUser).toHaveBeenCalled();
    });

  });

  describe('Remove SharedLineUsers', function () {
    beforeEach(function () {
      controller.forward = 'none';
      spyOn(SharedLineInfoService, 'getUserLineCount').and.returnValue($q.when(2));
      controller.selectedUsers.push(selectedUsers[0]);
      controller.sharedLineUsers.push(sharedLineUsers[0]);
      controller.devices = sharedLineEndpoints;
      controller.disassociateSharedLineUser();
      $scope.$apply();
    });

    it('disassociateSharedLineUsers: should disassociate Shared Line Users', function () {
      expect(SharedLineInfoService.disassociateSharedLineUser).toHaveBeenCalled();

    });
  });

  describe('addSharedLineUsersError', function () {
    beforeEach(function () {
      controller.forward = 'none';
      spyOn(SharedLineInfoService, 'getUserLineCount').and.returnValue($q.when(controller.maxlines));
      controller.selectedUsers.push(selectedUsers[0]);
      controller.saveLineSettings();
      $scope.$apply();
    });

    it('Should not add shared line users as number of lines exceeded maxlineCount', function () {
      controller.selectedUsers.push(selectedUsers[0]);
      controller.saveLineSettings();
      expect(controller.sharedLineBtn).toBe(true);
      expect(SharedLineInfoService.getUserLineCount).toHaveBeenCalledWith(selectedUsers[0].uuid);
      expect(SharedLineInfoService.addSharedLineUser).not.toHaveBeenCalled();
      expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'error');
      expect(controller.sharedLineEndpoints).toBeDefined();
    });
  });

  describe('getUserList', function () {
    beforeEach(function () {
      controller.sharedLineUsers = [];
      controller.selectSharedLineUser(userList[0]);
    });
    it('should test getUserList', function () {
      $rootScope.searchStr = 'ray';
      expect(UserListService.listUsers).toHaveBeenCalled();
    });

    it('should not select already selected user for Sharedline', function () {
      controller.selectSharedLineUser(userList[0]);
    });

  });

});
