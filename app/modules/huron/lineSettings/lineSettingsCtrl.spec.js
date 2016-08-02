'use strict';

describe('Controller: LineSettingsCtrl', function () {
  var controller, $scope, $state, $stateParams, $rootScope, $q, $modal, Notification, DirectoryNumber, TelephonyInfoService, LineSettings, HuronAssignedLine, HuronUser, ServiceSetup;
  var currentUser, directoryNumber, getDirectoryNumber, getDirectoryNumberBusy, getDirectoryNumberBusyNewLine, internalNumbers, simultaneousCall,
    externalNumbers, telephonyInfoWithVoicemail, telephonyInfoVoiceOnly, telephonyInfoVoiceOnlyShared, telephonyInfoSecondLine,
    modalDefer;
  var UserListService, SharedLineInfoService, CallerId, Notification, companyNumber, DeviceService, SimultaneousCallsServiceV2, DialPlanService;
  var userList = [];
  var userData = [];
  var sharedLineUsers = [];
  var sharedLineDevices = [];
  var sharedLineEndpoints = [];
  var selectedUsers = [];
  var userDevices = [];
  var callerIdSelection = {
    label: 'Direct Line',
    value: {
      externalCallerIdType: 'Direct Line',
      name: 'John Doe',
      pattern: '+12223334444',
      uuid: ''
    }
  };
  var simultaneousCall = {
    incomingCallMaximum: 8
  };
  var errorResponse = {
    message: 'error',
    status: 500
  };

  beforeEach(angular.mock.module('Huron'));
  beforeEach(angular.mock.module('Sunlight'));

  var Config;
  beforeEach(inject(function (_Config_) {
    Config = _Config_;
  }));

  beforeEach(inject(function (_$rootScope_, _$state_, $controller, _$q_, _$modal_, _Notification_, _DirectoryNumber_, _TelephonyInfoService_, _LineSettings_, _HuronAssignedLine_, _HuronUser_, _ServiceSetup_,
    _UserListService_, _SharedLineInfoService_, _SimultaneousCallsServiceV2_, _CallerId_, _DeviceService_, _DialPlanService_) {
    $rootScope = _$rootScope_;
    $scope = $rootScope.$new();
    $q = _$q_;
    $modal = _$modal_;
    $state = _$state_;
    Notification = _Notification_;
    SimultaneousCallsServiceV2 = _SimultaneousCallsServiceV2_;
    DirectoryNumber = _DirectoryNumber_;
    TelephonyInfoService = _TelephonyInfoService_;
    LineSettings = _LineSettings_;
    HuronAssignedLine = _HuronAssignedLine_;
    HuronUser = _HuronUser_;
    ServiceSetup = _ServiceSetup_;
    UserListService = _UserListService_;
    SharedLineInfoService = _SharedLineInfoService_;
    CallerId = _CallerId_;
    DeviceService = _DeviceService_;
    DialPlanService = _DialPlanService_;

    $scope.sort = {
      by: 'name',
      order: 'ascending',
      maxCount: 10000,
      startAt: 0
    };

    currentUser = getJSONFixture('core/json/currentUser.json');
    directoryNumber = getJSONFixture('huron/json/lineSettings/directoryNumber.json');
    getDirectoryNumber = getJSONFixture('huron/json/lineSettings/getDirectoryNumber.json');
    getDirectoryNumberBusy = getJSONFixture('huron/json/lineSettings/getDirectoryNumberBusy.json');
    getDirectoryNumberBusyNewLine = getJSONFixture('huron/json/lineSettings/getDirectoryNumberBusyNewLine.json');
    internalNumbers = getJSONFixture('huron/json/internalNumbers/internalNumbers.json');
    externalNumbers = getJSONFixture('huron/json/externalNumbers/externalNumbers.json');
    simultaneousCall = getJSONFixture('huron/json/lineSettings/simultaneousCall.json');
    telephonyInfoWithVoicemail = getJSONFixture('huron/json/telephonyInfo/voicemailEnabled.json');
    telephonyInfoVoiceOnly = getJSONFixture('huron/json/telephonyInfo/voiceEnabled.json');
    telephonyInfoVoiceOnlyShared = angular.copy(telephonyInfoVoiceOnly);
    telephonyInfoVoiceOnlyShared.currentDirectoryNumber.dnSharedUsage = "Primary Shared";
    telephonyInfoSecondLine = getJSONFixture('huron/json/telephonyInfo/voiceEnabledSecondLine.json');
    companyNumber = getJSONFixture('huron/json/lineSettings/companyNumber.json');
    userDevices = getJSONFixture('huron/json/device/devices.json');

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
    spyOn(TelephonyInfoService, 'loadInternalNumberPool').and.returnValue($q.when(internalNumbers));
    spyOn(TelephonyInfoService, 'getExternalNumberPool').and.returnValue(externalNumbers);
    spyOn(TelephonyInfoService, 'loadExternalNumberPool').and.returnValue($q.when(externalNumbers));
    spyOn(TelephonyInfoService, 'getTelephonyInfo').and.returnValue(telephonyInfoWithVoicemail);
    spyOn(TelephonyInfoService, 'getUserDnInfo').and.returnValue($q.when());

    spyOn(DirectoryNumber, 'getDirectoryNumber').and.returnValue($q.when(getDirectoryNumber));

    spyOn(LineSettings, 'updateLineSettings').and.returnValue($q.when());
    spyOn(LineSettings, 'changeInternalLine').and.returnValue($q.when());
    spyOn(LineSettings, 'addNewLine').and.returnValue($q.when());
    spyOn(LineSettings, 'getSimultaneousCalls').and.returnValue($q.when(simultaneousCall));
    spyOn(LineSettings, 'updateSimultaneousCalls').and.returnValue($q.when());
    spyOn(LineSettings, 'disassociateInternalLine').and.returnValue($q.when());
    spyOn(LineSettings, 'addExternalLine').and.returnValue($q.when());
    spyOn(LineSettings, 'changeExternalLine').and.returnValue($q.when());
    spyOn(LineSettings, 'deleteExternalLine').and.returnValue($q.when());

    spyOn(HuronUser, 'updateDtmfAccessId').and.returnValue($q.when());
    spyOn(ServiceSetup, 'listSites').and.returnValue($q.when([]));
    spyOn(CallerId, 'loadCompanyNumbers').and.returnValue($q.when(companyNumber));
    spyOn(CallerId, 'getCallerIdOption').and.returnValue(callerIdSelection);
    spyOn(DeviceService, 'listDevices').and.returnValue($q.when(userDevices));
    spyOn(DialPlanService, 'getCustomerDialPlanDetails').and.returnValue($q.when({
      extensionGenerated: "false"
    }));
    //Sharedline
    spyOn(UserListService, 'listUsers').and.returnValue($q.when(userList));
    spyOn(SharedLineInfoService, 'loadSharedLineUsers').and.returnValue($q.when(sharedLineUsers));
    spyOn(SharedLineInfoService, 'loadSharedLineUserDevices').and.returnValue($q.when(sharedLineEndpoints));
    spyOn(SharedLineInfoService, 'addSharedLineUser').and.returnValue($q.when(sharedLineUsers));
    spyOn(SharedLineInfoService, 'disassociateSharedLineUser').and.returnValue($q.when());
    spyOn(SharedLineInfoService, 'associateLineEndpoint').and.returnValue($q.when());
    spyOn(SharedLineInfoService, 'disassociateLineEndpoint').and.returnValue($q.when());
    spyOn(SharedLineInfoService, 'getSharedLineDevices').and.callThrough();
    spyOn(SharedLineInfoService, 'updateLineEndpoint').and.returnValue($q.when());

    //Sharedline

    spyOn(Notification, 'success');
    spyOn(Notification, 'error');
    spyOn(Notification, 'errorResponse');

    controller = $controller('LineSettingsCtrl', {
      $scope: $scope,
      $rootScope: $rootScope,
      $stateParams: $stateParams,
      $modal: $modal,
      $state: $state,
      Notification: Notification,
      DirectoryNumber: DirectoryNumber,
      TelephonyInfoService: TelephonyInfoService,
      LineSettings: LineSettings,
      HuronAssignedLine: HuronAssignedLine,
      HuronUser: HuronUser,
      UserListService: UserListService,
      SharedLineInfoService: SharedLineInfoService
    });

    controller.callerIdInfo.callerIdSelection = callerIdSelection;

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
      expect(controller.cfModel.forward).toBe('none');
      expect(controller.telephonyInfo.voicemail).toBe('On');
    });

    it('should call loadInternalNumberPool during init', function () {
      TelephonyInfoService.getInternalNumberPool.and.returnValue([]);
      controller.init();
      $scope.$apply();
      expect(Notification.errorResponse).not.toHaveBeenCalled();
    });

    it('should notify an error when loadInternalNumberPool fails', function () {
      TelephonyInfoService.getInternalNumberPool.and.returnValue([]);
      TelephonyInfoService.loadInternalNumberPool.and.returnValue($q.reject(errorResponse));
      controller.init();
      $scope.$apply();
      expect(Notification.errorResponse).toHaveBeenCalled();
    });

    it('should call loadExternalNumberPool during init', function () {
      TelephonyInfoService.getExternalNumberPool.and.returnValue([]);
      controller.init();
      $scope.$apply();
      expect(Notification.errorResponse).not.toHaveBeenCalled();
    });

    it('should call getMultipleCalls during init', function () {
      controller.init();
      $scope.$apply();
      expect(LineSettings.getSimultaneousCalls).toHaveBeenCalled();
      expect(Notification.errorResponse).not.toHaveBeenCalled();
    });

    it('it should notify an error when getMultipleCalls fails', function () {
      LineSettings.getSimultaneousCalls.and.returnValue($q.reject(errorResponse));
      controller.init();
      $scope.$apply();
      expect(Notification.errorResponse).toHaveBeenCalled();
    });

    it('should notify an error when loadExternalNumberPool fails', function () {
      TelephonyInfoService.getExternalNumberPool.and.returnValue([]);
      TelephonyInfoService.loadExternalNumberPool.and.returnValue($q.reject(errorResponse));
      controller.init();
      $scope.$apply();
      expect(Notification.errorResponse).toHaveBeenCalled();
    });

    it('should call loadCompanyNumbers during init', function () {
      controller.init();
      $scope.$apply();
      expect(CallerId.loadCompanyNumbers).toHaveBeenCalled();
      expect(Notification.errorResponse).not.toHaveBeenCalled();
      expect(controller.callerIdOptions.length).toEqual(6);
    });

    it('should notify an error when loadCompanyNumbers fails', function () {
      CallerId.loadCompanyNumbers.and.returnValue($q.reject());
      controller.init();
      $scope.$apply();
      expect(CallerId.loadCompanyNumbers).toHaveBeenCalled();
      expect(Notification.errorResponse).toHaveBeenCalled();
    });

    it('should call getCustomerDialPlanDetails during init', function () {
      controller.init();
      $scope.$apply();
      expect(DialPlanService.getCustomerDialPlanDetails).toHaveBeenCalled();
      expect(Notification.errorResponse).not.toHaveBeenCalled();
    });

    it('should notify an error when getCustomerDialPlanDetails fails', function () {
      DialPlanService.getCustomerDialPlanDetails.and.returnValue($q.reject());
      controller.init();
      $scope.$apply();
      expect(DialPlanService.getCustomerDialPlanDetails).toHaveBeenCalled();
      expect(Notification.errorResponse).toHaveBeenCalled();
    });

  });

  describe('saveLineSettings', function () {
    beforeEach(function () {
      controller.cfModel.forward = 'none';
      controller.saveLineSettings();
      $scope.$apply();
    });

    it('should update dtmfAccessId with the external number pattern', function () {
      expect(HuronUser.updateDtmfAccessId).toHaveBeenCalledWith(currentUser.id, telephonyInfoWithVoicemail.esn);
    });

    it('should update Simultaneous Calling', function () {
      expect(LineSettings.updateSimultaneousCalls).toHaveBeenCalled();
    });
  });

  describe('deletePrimaryLine', function () {
    beforeEach(function () {
      controller.cfModel.forward = 'none';
      modalDefer = $q.defer();
      spyOn($modal, 'open').and.returnValue({
        result: modalDefer.promise
      });
      spyOn($state, 'go');
      $scope.$apply();
    });

    it('should not remove Primary line', function () {
      controller.deleteLineSettings();
      modalDefer.resolve();
      $scope.$apply();
      expect(LineSettings.disassociateInternalLine).not.toHaveBeenCalledWith(currentUser.id, telephonyInfoWithVoicemail.currentDirectoryNumber.userDnUuid);
    });
  });

  describe('callforward behavior with voicemail enabled', function () {
    it('should be busy with voicemail', function () {
      DirectoryNumber.getDirectoryNumber.and.returnValue($q.when(getDirectoryNumberBusyNewLine));
      controller.init();
      $scope.$apply();
      expect(controller.cfModel.forward).toBe('busy');
      expect(controller.cfModel.forwardNABCalls).toBe('Voicemail');
      expect(controller.telephonyInfo.voicemail).toBe('On');
    });

    it('should be busy with a number', function () {
      DirectoryNumber.getDirectoryNumber.and.returnValue($q.when(getDirectoryNumberBusy));
      controller.init();
      $scope.$apply();
      expect(controller.cfModel.forward).toBe('busy');
      expect(controller.cfModel.forwardNABCalls).toBe(getDirectoryNumberBusy.callForwardBusy.intDestination);
      expect(controller.telephonyInfo.voicemail).toBe('On');
    });
  });

  describe('callforward behavior with voicemail disabled', function () {
    it('should default to no call forward', function () {
      TelephonyInfoService.getTelephonyInfo.and.returnValue(telephonyInfoVoiceOnly);
      DirectoryNumber.getDirectoryNumber.and.returnValue($q.when(getDirectoryNumberBusyNewLine));
      controller.init();
      $scope.$apply();
      expect(controller.cfModel.forward).toBe('none');
      expect(controller.telephonyInfo.voicemail).toBe('Off');
    });

    it('should default to busy with a number', function () {
      TelephonyInfoService.getTelephonyInfo.and.returnValue(telephonyInfoVoiceOnly);
      DirectoryNumber.getDirectoryNumber.and.returnValue($q.when(getDirectoryNumberBusy));
      controller.init();
      $scope.$apply();
      expect(controller.cfModel.forward).toBe('busy');
      expect(controller.cfModel.forwardNABCalls).toBe(getDirectoryNumberBusy.callForwardBusy.intDestination);
      expect(controller.telephonyInfo.voicemail).toBe('Off');
    });
  });

  describe('deleteSecondLine', function () {
    beforeEach(function () {
      controller.cfModel.forward = 'none';
      modalDefer = $q.defer();
      spyOn($modal, 'open').and.returnValue({
        result: modalDefer.promise
      });
      TelephonyInfoService.getTelephonyInfo.and.returnValue(telephonyInfoSecondLine);
      controller.init();
      spyOn($state, 'go');
      $scope.$apply();
    });

    it('should remove second line', function () {
      controller.deleteLineSettings();
      modalDefer.resolve();
      $scope.$apply();
      expect(LineSettings.disassociateInternalLine).toHaveBeenCalledWith(currentUser.id, telephonyInfoSecondLine.currentDirectoryNumber.userDnUuid);
      expect(SharedLineInfoService.disassociateSharedLineUser).not.toHaveBeenCalled();
      expect(Notification.success).toHaveBeenCalledWith('directoryNumberPanel.disassociationSuccess');
    });
  });

  describe('saveLineSettings', function () {
    beforeEach(function () {
      TelephonyInfoService.getTelephonyInfo.and.returnValue(telephonyInfoVoiceOnlyShared);
      controller.init();
      $scope.$apply();
      controller.cfModel.forward = 'none';
      controller.selectedUsers.push(selectedUsers[0]);
      spyOn(SharedLineInfoService, 'getUserLineCount').and.returnValue($q.when(2));
    });

    it('should show error on updateLineEndpoint call failure', function () {
      SharedLineInfoService.getSharedLineDevices.and.returnValue(sharedLineEndpoints);
      SharedLineInfoService.updateLineEndpoint.and.returnValue($q.reject());
      controller.saveLineSettings();
      $scope.$apply();
    });
  });

  describe('SharedLineUsers', function () {
    beforeEach(function () {
      TelephonyInfoService.getTelephonyInfo.and.returnValue(telephonyInfoVoiceOnlyShared);
      controller.init();
      $scope.$apply();
      controller.cfModel.forward = 'none';
      controller.selectedUsers.push(selectedUsers[0]);
      spyOn(SharedLineInfoService, 'getUserLineCount').and.returnValue($q.when(2));
      controller.saveLineSettings();
    });

    it('listSharedLineUsers: Should return shared line users and endpoints', function () {
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
      expect(Notification.success).toHaveBeenCalledWith('directoryNumberPanel.success');
    });

  });

  describe('disable SharedLineDevice', function () {
    it('should call IsSingleDevice and return true', function () {
      expect(controller.isSingleDevice(sharedLineEndpoints, sharedLineUsers[0].uuid)).toBeTruthy();
    });

    it('should call IsSingleDevice and return false', function () {
      expect(controller.isSingleDevice(sharedLineEndpoints, sharedLineUsers[1].uuid)).toBeFalsy();
    });

  });

  describe('update SharedLineDevices', function () {
    beforeEach(function () {
      TelephonyInfoService.getTelephonyInfo.and.returnValue(telephonyInfoVoiceOnlyShared);
      controller.cfModel.forward = 'none';
      controller.init();
      $scope.$apply();
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

    it('disassociateSharedLineDevice: should disassociate and associate Shared Line endpoint', function () {
      expect(controller.devices.length).toBe(3);
      expect(controller.devices[0].isSharedLine).toBeTruthy();
      expect(SharedLineInfoService.disassociateLineEndpoint).toHaveBeenCalled();
      expect(Notification.success).toHaveBeenCalledWith('directoryNumberPanel.success');
    });

    it('associateSharedLineDevice: should associate Shared Line endpoint', function () {
      expect(SharedLineInfoService.associateLineEndpoint).toHaveBeenCalled();
      expect(Notification.success).toHaveBeenCalledWith('directoryNumberPanel.success');
    });
  });

  describe('Remove SharedLine Users', function () {
    beforeEach(function () {
      controller.cfModel.forward = 'none';
      spyOn(SharedLineInfoService, 'getUserLineCount').and.returnValue($q.when(2));
      controller.selectedUsers.push(selectedUsers[0]);
      controller.devices = sharedLineEndpoints;
      var user = {
        'uuid': 'a787b84a-3cdf-436c-b1a7-e46e0a0cae99',
        'userDnUuid': '2'
      };
      controller.disassociateSharedLineUser(user, true);
      $scope.$apply();
    });

    it('disassociateSharedLineUsers: should disassociate Shared Line Users', function () {
      expect(SharedLineInfoService.disassociateSharedLineUser).toHaveBeenCalled();
    });
  });

  describe('Remove SharedLine Member', function () {
    beforeEach(function () {
      controller.cfModel.forward = 'none';
      spyOn(SharedLineInfoService, 'getUserLineCount').and.returnValue($q.when(2));
      controller.selectedUsers.push(selectedUsers[0]);
      controller.devices = sharedLineEndpoints;
      modalDefer = $q.defer();
      spyOn($modal, 'open').and.returnValue({
        result: modalDefer.promise
      });

    });

    it('disassociateSharedLineUser: should disassociate Shared Line User on Modal Ok', function () {
      var user = {
        'uuid': 'a787b84a-3cdf-436c-b1a7-e46e0a0cae99',
        'userDnUuid': '2'
      };
      controller.disassociateSharedLineUser(user, false);
      modalDefer.resolve();
      $scope.$apply();
      expect(SharedLineInfoService.disassociateSharedLineUser).toHaveBeenCalled();
    });

    it('disassociateSharedLineUser: should not disassociate Shared Line User on Modal Cancel', function () {
      var user = {
        'uuid': 'a787b84a-3cdf-436c-b1a7-e46e0a0cae99',
        'userDnUuid': '2'
      };
      controller.disassociateSharedLineUser(user, false);
      modalDefer.reject();
      $scope.$apply();
      expect(SharedLineInfoService.disassociateSharedLineUser).not.toHaveBeenCalled();
    });

    it('disassociateSharedLineUser: should not disassociate Shared Line User with primary DN', function () {
      var user = {
        'uuid': 'a787b84a-3cdf-436c-b1a7-e46e0a0cae99',
        'userDnUuid': '2',
        'dnUsage': 'Primary'
      };
      controller.disassociateSharedLineUser(user, false);
      modalDefer.resolve();
      $scope.$apply();
      expect(SharedLineInfoService.disassociateSharedLineUser).not.toHaveBeenCalled();
    });

  });

  describe('addSharedLineUsersError', function () {
    beforeEach(function () {
      controller.cfModel.forward = 'none';
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
      expect(Notification.error).toHaveBeenCalledWith('directoryNumberPanel.maxLines', jasmine.any(Object));
      expect(controller.sharedLineEndpoints).toBeDefined();
    });
  });

  describe('getUserList', function () {
    beforeEach(function () {
      controller.sharedLineUsers = [];
      controller.selectSharedLineUser(userList[0]);
    });

    it('should test getUserList', function () {
      controller.getUserList('ray');
      expect(UserListService.listUsers).toHaveBeenCalled();
    });

    it('should not select already selected user for Sharedline', function () {
      controller.selectSharedLineUser(userList[0]);
    });

  });

  describe('loadInternalNumberPool', function () {
    beforeEach(function () {
      controller.loadInternalNumberPool('5');
      $scope.$apply();
    });

    it('should invoke TelephonyInfoService.loadInternalNumberPool', function () {
      expect(TelephonyInfoService.loadInternalNumberPool).toHaveBeenCalledWith('5');
    });

    it('should have loaded internalNumberPool', function () {
      expect(controller.internalNumberPool).toEqual(internalNumbers);
    });
  });

  describe('loadExternalNumberPool', function () {
    beforeEach(function () {
      controller.loadExternalNumberPool('5');
      $scope.$apply();
    });

    it('should invoke TelephonyInfoService.loadExternalNumberPool', function () {
      expect(TelephonyInfoService.loadExternalNumberPool).toHaveBeenCalledWith('5');
    });

    it('should have loaded externalNumberPool', function () {
      expect(controller.externalNumberPool).toEqual(externalNumbers);
    });
  });

  describe('saveDisabled', function () {
    it('should return false when loadInternalNumberPool fails, but the line is not new', function () {
      TelephonyInfoService.getInternalNumberPool.and.returnValue([]);
      TelephonyInfoService.loadInternalNumberPool.and.returnValue($q.reject(errorResponse));
      controller.init();
      $scope.$apply();
      expect(controller.saveDisabled()).toBeFalsy();
    });

    it('should return true when loadInternalNumberPool fails and the line is new', function () {
      TelephonyInfoService.getInternalNumberPool.and.returnValue([]);
      DirectoryNumber.getDirectoryNumber.and.returnValue($q.when(getDirectoryNumberBusyNewLine));
      TelephonyInfoService.loadInternalNumberPool.and.returnValue($q.reject(errorResponse));
      controller.init();
      $scope.$apply();
      expect(controller.saveDisabled()).toBeTruthy();
    });

    it('should return false when loadExternalNumberPool fails, but the line is not new', function () {
      TelephonyInfoService.getExternalNumberPool.and.returnValue([]);
      TelephonyInfoService.loadExternalNumberPool.and.returnValue($q.reject(errorResponse));
      controller.init();
      $scope.$apply();
      expect(controller.saveDisabled()).toBeFalsy();
    });

    it('should return true when loadExternalNumberPool fails and the line is new', function () {
      TelephonyInfoService.getExternalNumberPool.and.returnValue([]);
      DirectoryNumber.getDirectoryNumber.and.returnValue($q.when(getDirectoryNumberBusyNewLine));
      TelephonyInfoService.loadExternalNumberPool.and.returnValue($q.reject(errorResponse));
      controller.init();
      $scope.$apply();
      expect(controller.saveDisabled()).toBeTruthy();
    });
  });

  describe('checkDnOverlapsSteeringDigit', function () {
    it('should return true when assignedInternalNumber starts with 9', function () {
      TelephonyInfoService.getTelephonyInfo.and.returnValue(telephonyInfoVoiceOnly);
      controller.init();
      $scope.$apply();
      controller.assignedInternalNumber.pattern = '9876';
      expect(controller.assignedInternalNumber.pattern).toEqual('9876');
      expect(controller.telephonyInfo.steeringDigit).toEqual('9');
      expect(controller.checkDnOverlapsSteeringDigit()).toBeTruthy();
    });
    it('should return false when assignedInternalNumber starts with something other than 9', function () {
      TelephonyInfoService.getTelephonyInfo.and.returnValue(telephonyInfoVoiceOnly);
      controller.init();
      $scope.$apply();
      controller.assignedInternalNumber.pattern = '1234';
      expect(controller.assignedInternalNumber.pattern).toEqual('1234');
      expect(controller.telephonyInfo.steeringDigit).toEqual('9');
      expect(controller.checkDnOverlapsSteeringDigit()).toBeFalsy();
    });
  });
});
