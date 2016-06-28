'use strict';

describe('OnboardCtrl: Ctrl', function () {
  var controller, $scope, $timeout, $q, $state, $stateParams, Notification, Userservice, TelephonyInfoService, Orgservice, FeatureToggleService, DialPlanService, Authinfo, CsvDownloadService;
  var internalNumbers;
  var externalNumbers;
  var externalNumberPool;
  var externalNumberPoolMap;
  var getUserMe;
  var getMigrateUsers;
  var getMyFeatureToggles;
  var sites;
  var fusionServices;
  var headers;
  var getMessageServices;
  var getLicensesUsage;
  var getLicensesUsageSpy;
  var unlicensedUsers;
  var allLicensesData;
  var $controller;
  var getCareServices;
  beforeEach(module('Core'));
  beforeEach(module('Hercules'));
  beforeEach(module('Huron'));
  beforeEach(module('Sunlight'));
  beforeEach(module('Messenger'));

  beforeEach(inject(function (_$controller_, $rootScope, _$timeout_, _$q_, _$state_, _$stateParams_, _Notification_, _Userservice_, _TelephonyInfoService_, _Orgservice_, _FeatureToggleService_, _DialPlanService_, _Authinfo_, _CsvDownloadService_) {
    $scope = $rootScope.$new();
    $controller = _$controller_;
    $timeout = _$timeout_;
    $q = _$q_;
    $state = _$state_;
    $stateParams = _$stateParams_;
    Notification = _Notification_;
    DialPlanService = _DialPlanService_;
    Userservice = _Userservice_;
    Orgservice = _Orgservice_;
    TelephonyInfoService = _TelephonyInfoService_;
    FeatureToggleService = _FeatureToggleService_;
    Authinfo = _Authinfo_;
    CsvDownloadService = _CsvDownloadService_;
    var current = {
      step: {
        name: 'fakeStep'
      }
    };
    $scope.wizard = {};
    $scope.wizard.current = current;

    function isLastStep() {
      return false;
    }
    $scope.wizard.isLastStep = isLastStep;

    spyOn($state, 'go');

    internalNumbers = getJSONFixture('huron/json/internalNumbers/internalNumbers.json');
    externalNumbers = getJSONFixture('huron/json/externalNumbers/externalNumbers.json');
    externalNumberPool = getJSONFixture('huron/json/externalNumberPoolMap/externalNumberPool.json');
    externalNumberPoolMap = getJSONFixture('huron/json/externalNumberPoolMap/externalNumberPoolMap.json');
    getUserMe = getJSONFixture('core/json/users/me.json');
    getMigrateUsers = getJSONFixture('core/json/users/migrate.json');
    getMyFeatureToggles = getJSONFixture('core/json/users/me/featureToggles.json');
    sites = getJSONFixture('huron/json/settings/sites.json');
    fusionServices = getJSONFixture('core/json/authInfo/fusionServices.json');
    headers = getJSONFixture('core/json/users/headers.json');
    getMessageServices = getJSONFixture('core/json/authInfo/messagingServices.json');
    unlicensedUsers = getJSONFixture('core/json/organizations/unlicensedUsers.json');
    allLicensesData = getJSONFixture('core/json/organizations/allLicenses.json');
    getCareServices = getJSONFixture('core/json/authInfo/careServices.json');

    spyOn(Orgservice, 'getHybridServiceAcknowledged').and.returnValue($q.when(fusionServices));
    spyOn(CsvDownloadService, 'getCsv').and.callFake(function (type) {
      if (type === 'headers') {
        return $q.when(headers);
      } else {
        return $q.when({});
      }
    });

    spyOn(Notification, 'notify');
    spyOn(Orgservice, 'getUnlicensedUsers').and.callFake(function (callback) {
      callback(unlicensedUsers, 200);
    });

    spyOn(TelephonyInfoService, 'getInternalNumberPool').and.returnValue(internalNumbers);
    spyOn(TelephonyInfoService, 'loadInternalNumberPool').and.returnValue($q.when(internalNumbers));
    spyOn(TelephonyInfoService, 'getExternalNumberPool').and.returnValue(externalNumbers);
    spyOn(DialPlanService, 'getCustomerDialPlanDetails').and.returnValue($q.when({
      extensionGenerated: 'false'
    }));
    spyOn(TelephonyInfoService, 'loadExternalNumberPool').and.returnValue($q.when(externalNumbers));
    spyOn(TelephonyInfoService, 'loadExtPoolWithMapping').and.returnValue($q.when(externalNumberPoolMap));

    spyOn(FeatureToggleService, 'getFeaturesForUser').and.returnValue(getMyFeatureToggles);
    spyOn(FeatureToggleService, 'supportsDirSync').and.returnValue($q.when(false));
    spyOn(FeatureToggleService, 'atlasCareTrialsGetStatus').and.returnValue($q.when(true));
    spyOn(TelephonyInfoService, 'getPrimarySiteInfo').and.returnValue($q.when(sites));

    spyOn(Userservice, 'onboardUsers');
    spyOn(Userservice, 'bulkOnboardUsers');
    spyOn(Userservice, 'getUser').and.returnValue(getUserMe);
    spyOn(Userservice, 'migrateUsers').and.returnValue(getMigrateUsers);
    spyOn(Userservice, 'updateUsers');
  }));

  function initController() {
    controller = $controller('OnboardCtrl', {
      $scope: $scope,
      $state: $state
    });

    $scope.$apply();
  }

  function onboardUsersResponse(statusCode, responseMessage) {
    return {
      data: {
        userResponse: [{
          status: statusCode,
          httpStatus: statusCode,
          message: responseMessage,
          email: 'blah@example.com'
        }, {
          status: statusCode,
          httpStatus: statusCode,
          message: responseMessage,
          email: 'blah@example.com'
        }]
      }
    };
  }

  describe('Bulk Users DirSync', function () {
    beforeEach(function () {
      initController();
    });
    var validUserList = [{
      firstName: 'John',
      lastName: 'Doe',
      Email: 'johnDoe@example.com'
    }, {
      firstName: 'Jane',
      lastName: 'Doe',
      Email: 'janeDoe@domain.com'
    }];

    beforeEach(installPromiseMatchers);

    describe('process and save users', function () {
      beforeEach(function () {
        $scope.userList = validUserList;
        var promise = $scope.syncStatusNext();
        $scope.$apply();
        $timeout.flush();
      });
      it('should load user list into userArray', function () {
        expect($scope.model.numMaxUsers).toEqual(2);
      });
      it('should report existing users', function () {
        Userservice.onboardUsers.and.returnValue($q.resolve(onboardUsersResponse(200)));
        var promise = $scope.dirsyncProcessingNext();
        $scope.$apply();
        expect(promise).toBeResolved();
        expect($scope.model.processProgress).toEqual(100);
        expect($scope.model.numTotalUsers).toEqual(2);
        expect($scope.model.numNewUsers).toEqual(0);
        expect($scope.model.numExistingUsers).toEqual(2);
        expect($scope.model.userErrorArray.length).toEqual(0);
      });
      it('should report error users', function () {
        Userservice.onboardUsers.and.returnValue($q.resolve(onboardUsersResponse(403)));
        var promise = $scope.dirsyncProcessingNext();
        $scope.$apply();
        expect(promise).toBeResolved();
        expect($scope.model.processProgress).toEqual(100);
        expect($scope.model.numTotalUsers).toEqual(2);
        expect($scope.model.numNewUsers).toEqual(0);
        expect($scope.model.numExistingUsers).toEqual(0);
        expect($scope.model.userErrorArray.length).toEqual(2);
      });
      it('should report error users when API fails', function () {
        Userservice.onboardUsers.and.returnValue($q.reject(onboardUsersResponse(500)));
        var promise = $scope.dirsyncProcessingNext();
        $scope.$apply();
        expect(promise).toBeResolved();
        expect($scope.model.processProgress).toEqual(100);
        expect($scope.model.numTotalUsers).toEqual(2);
        expect($scope.model.numNewUsers).toEqual(0);
        expect($scope.model.numExistingUsers).toEqual(0);
        expect($scope.model.userErrorArray.length).toEqual(2);
      });
      it('should stop processing when cancelled', function () {
        Userservice.onboardUsers.and.returnValue($q.resolve(onboardUsersResponse(-1)));
        var promise = $scope.dirsyncProcessingNext();
        $scope.$apply();
        expect(promise).toBeResolved();
        expect($scope.model.processProgress).toEqual(100);
        expect($scope.model.numTotalUsers).toEqual(2);
        expect($scope.model.numNewUsers).toEqual(0);
        expect($scope.model.numExistingUsers).toEqual(0);
        expect($scope.model.userErrorArray.length).toEqual(2);
        $scope.cancelProcessCsv();
        $scope.$apply();
        expect(promise).toBeResolved();
      });
    });
  });

  describe('with determining message checkbox visibility', function () {
    beforeEach(initController);
    it('should return false if more than one license', function () {
      var displayMessageCheckbox = $scope.checkMessageVisibility([{
        license: 1
      }, {
        license: 2
      }]);
      expect(displayMessageCheckbox).toBeFalsy();
    });

    it('should return true if only one license and no billingServiceId', function () {
      var displayMessageCheckbox = $scope.checkMessageVisibility([{
        license: 1
      }], 2);
      expect(displayMessageCheckbox).toBeTruthy();
    });

    it('should return true if only one license and no selectedSubscription', function () {
      var displayMessageCheckbox = $scope.checkMessageVisibility([{
        billingServiceId: 1
      }]);
      expect(displayMessageCheckbox).toBeTruthy();
    });

    it('should return false if only one license and billingServiceId does not match selectedSubscription', function () {
      var displayMessageCheckbox = $scope.checkMessageVisibility([{
        billingServiceId: 1
      }], 2);
      expect(displayMessageCheckbox).toBeFalsy();
    });

    it('should return true if only one license and billingServiceId match selectedSubscription', function () {
      var displayMessageCheckbox = $scope.checkMessageVisibility([{
        billingServiceId: 1
      }], 1);
      expect(displayMessageCheckbox).toBeTruthy();
    });
  });

  describe('With assigning meeting licenses', function () {
    beforeEach(initController);
    beforeEach(function () {
      $scope.allLicenses = [{
        billing: 'testOrg1',
        confModel: false,
        label: 'test org',
        licenseId: 'testABC',
        offerName: 'CS',
        siteUrl: 'testOrg1@webex.com',
        volume: 100
      }, {
        billing: 'testOrg2',
        confModel: false,
        label: 'test org',
        licenseId: 'testDEF',
        offerName: 'CS',
        siteUrl: 'testOrg2@webex.com',
        volume: 100
      }];
    });
    it('should initialize all licenses correctly', function () {
      $scope.populateConf();
      expect($scope.allLicenses[0].confModel).toEqual(false);
      expect($scope.allLicenses[0].label).toEqual('test org');
      expect($scope.allLicenses[1].billing).toEqual('testOrg2');
      expect($scope.allLicenses[1].offerName).toEqual('CS');
    });
    it('should verify userLicenseIds and licenseId are the same', function () {
      var userLicenseIds = 'testABC';
      $scope.populateConf();
      expect($scope.allLicenses[0].licenseId).toEqual(userLicenseIds);
      expect($scope.allLicenses[1].licenseId).not.toEqual(userLicenseIds);
    });
  });

  describe('With assigning message licenses', function () {
    describe('Check if single licenses get assigned correctly', function () {
      beforeEach(function () {
        spyOn(Authinfo, 'isInitialized').and.returnValue(true);
        spyOn(Authinfo, 'getMessageServices').and.returnValue(getMessageServices.singleLicense);
        $stateParams.currentUser = {
          licenseID: ['MS_07bbaaf5-735d-4878-a6ea-d67d69feb1c0']
        };
        initController();
      });

      it('should define licenses model', function () {
        expect($scope.messageFeatures[1].licenses[0].model).toBeTruthy();
        expect($scope.radioStates.msgRadio).toEqual(false);
      });
    });

    describe('Check if multiple licenses get assigned correctly', function () {
      beforeEach(function () {
        spyOn(Authinfo, 'isInitialized').and.returnValue(true);
        spyOn(Authinfo, 'hasAccount').and.returnValue(true);
        spyOn(Authinfo, 'getMessageServices').and.returnValue(getMessageServices.multipleLicenses);
        $stateParams.currentUser = {
          licenseID: ['MS_07bbaaf5-735d-4878-a6ea-d67d69feb1c0']
        };
        initController();
      });

      it('should call getAccountLicenses correctly', function () {
        var licenseFeatures = $scope.getAccountLicenses();
        expect(licenseFeatures[0].id).toEqual('MS_07bbaaf5-735d-4878-a6ea-d67d69feb1c0');
        expect(licenseFeatures[0].idOperation).toEqual('ADD');
        expect($scope.messageFeatures[1].licenses[0].model).toEqual(true);
        expect($scope.radioStates.msgRadio).toEqual(true);
      });
    });
  });

  describe('With assigning meeting and message licenses on invitations', function () {
    beforeEach(function () {
      $stateParams.currentUser = {
        licenseID: [
          'MS_07bbaaf5-735d-4878-a6ea-d67d69feb1c0',
          'CF_5761413b-5bad-4d6a-b40d-c157c0f99062'
        ],
        pendingStatus: true,
        invitations: {
          ms: true,
          cf: 'CF_5761413b-5bad-4d6a-b40d-c157c0f99062'
        }
      };
      initController();
    });
    beforeEach(function () {
      $scope.allLicenses = [{
        billing: 'testOrg1',
        confModel: false,
        label: 'test org',
        licenseId: 'CF_5761413b-5bad-4d6a-b40d-c157c0f99062',
        offerName: 'CF',
        siteUrl: '',
        volume: 100
      }];
    });
    it('should set MS license to true based on invitation', function () {
      expect($scope.radioStates.msgRadio).toBeTruthy();
    });
    it('should set meeting to true on invitation', function () {
      $scope.populateConfInvitations();
      expect($scope.allLicenses[0].confModel).toEqual(true);
    });
  });

  describe('UserAdd DID and DN assignment', function () {
    beforeEach(initController);
    beforeEach(function () {
      $scope.usrlist = [{
        "name": "dntodid",
        "address": "dntodid@gmail.com"
      }, {
        "name": "dntodid1",
        "address": "dntodid1@gmail.com"
      }];
      $scope.convertSelectedList = [{
        "name": {
          "givenName": "dntodid",
          "familyName": ""
        },
        "userName": "dntodid@gmail.com"
      }, {
        "name": {
          "givenName": "dntodid1",
          "familyName": ""
        },
        "userName": "dntodid1@gmail.com"
      }];
      $scope.radioStates.commRadio = 'true';
      $scope.internalNumberPool = internalNumbers;
      $scope.externalNumberPool = externalNumberPool;
      $scope.$apply();

    });
    beforeEach(installPromiseMatchers);
    it('mapDidToDn', function () {
      $scope.mapDidToDn();
      $scope.$apply();
      expect($scope.externalNumberMapping.length).toEqual(2);
      expect($scope.usrlist[0].externalNumber.pattern).toEqual('+14084744532');
      expect($scope.usrlist[0].assignedDn).toEqual('4532');
      expect($scope.usrlist[1].didDnMapMsg).toEqual('usersPage.noExtMappingAvail');

    });
    it('assignServicesNext', function () {

      expect($scope.usrlist[0].externalNumber).not.toBeDefined();
      expect($scope.usrlist[0].assignedDn).not.toBeDefined();
      expect($scope.usrlist[1].externalNumber).not.toBeDefined();
      expect($scope.usrlist[1].assignedDn).not.toBeDefined();
      var promise = $scope.assignServicesNext();
      $scope.$apply();
      expect(promise).toBeResolved();
      expect($scope.usrlist[0].externalNumber).toBeDefined();
      expect($scope.usrlist[0].assignedDn.pattern).toEqual('4000');
      expect($scope.usrlist[1].externalNumber).toBeDefined();
      expect($scope.usrlist[1].assignedDn.pattern).toEqual('4001');
    });

    it('editServicesSave', function () {
      $scope.currentUser = {
        userName: 'johndoe@example.com'
      };
      $scope.editServicesSave();
      $scope.$apply();
      expect($scope.usrlist.length).toEqual(1);
      expect($scope.usrlist[0]).toEqual(jasmine.objectContaining({
        address: 'johndoe@example.com',
        assignedDn: internalNumbers[0],
        externalNumber: externalNumbers[0]
      }));
      expect($state.go).toHaveBeenCalledWith('editService.dn');
      expect($scope.editServicesFlow).toBe(true);
      expect($scope.convertUsersFlow).toBe(false);
    });

    it('assignDNForUserList', function () {

      $scope.assignDNForUserList();
      $scope.$apply();
      expect($scope.usrlist[0].externalNumber.pattern).toEqual('null');
      expect($scope.usrlist[0].assignedDn.pattern).toEqual('4000');
      expect($scope.usrlist[1].externalNumber.pattern).toEqual('null');
      expect($scope.usrlist[1].assignedDn.pattern).toEqual('4001');

    });

    it('convertUsersNext', function () {

      $scope.convertUsersNext();
      $scope.$apply();
      expect($state.go).toHaveBeenCalledWith("users.convert.services.dn");
      expect($scope.usrlist[0].assignedDn.pattern).toEqual('4000');
      expect($scope.usrlist[1].assignedDn.pattern).toEqual('4001');
    });

    it('assignDNForConvertUsers', function () {

      $scope.assignDNForConvertUsers();
      $scope.$apply();
      expect(Userservice.migrateUsers).toHaveBeenCalled();
    });

    it('checkDidDnDupes', function () {

      $scope.loadInternalNumberPool();
      $scope.loadExternalNumberPool();
      expect($scope.usrlist.length).toEqual(2);
      $scope.assignDNForUserList();
      var result = $scope.checkDidDnDupes();
      $scope.$apply();
      expect(result).toBeTruthy();
    });

  });

  describe('status errors during onboarding', function () {
    beforeEach(initController);

    it('checkClaimedDomain', function () {
      Userservice.onboardUsers.and.returnValue($q.resolve(onboardUsersResponse(403, '400084')));
      $scope.onboardUsers();
      expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'error');
    });

    it('checkOutsideClaimedDomain', function () {
      Userservice.onboardUsers.and.returnValue($q.resolve(onboardUsersResponse(403, '400091')));
      $scope.onboardUsers();
      expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'error');
    });

    it('checkUserExists', function () {
      Userservice.onboardUsers.and.returnValue($q.resolve(onboardUsersResponse(403, '400081')));
      $scope.onboardUsers();
      expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'error');
    });

    it('checkUserExistsInDiffOrg', function () {
      Userservice.onboardUsers.and.returnValue($q.resolve(onboardUsersResponse(403, '400090')));
      $scope.onboardUsers();
      expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'error');
    });

    it('checkUnauthorizedToAdd - 400096', function () {
      Userservice.onboardUsers.and.returnValue($q.resolve(onboardUsersResponse(403, '400096')));
      $scope.onboardUsers();
      expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'error');
    });

    it('checkUserExistsOrDomainClaimed', function () {
      Userservice.onboardUsers.and.returnValue($q.resolve(onboardUsersResponse(403, '400108')));
      $scope.onboardUsers();
      expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'error');
    });

    it('checkUnableToMigrate', function () {
      Userservice.onboardUsers.and.returnValue($q.resolve(onboardUsersResponse(403, '400109')));
      $scope.onboardUsers();
      expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'error');
    });

    it('checkUnauthorizedToAdd - 400110', function () {
      Userservice.onboardUsers.and.returnValue($q.resolve(onboardUsersResponse(403, '400110')));
      $scope.onboardUsers();
      expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'error');
    });

    it('checkInsufficientEntitlements', function () {
      Userservice.onboardUsers.and.returnValue($q.resolve(onboardUsersResponse(403, '400111')));
      $scope.onboardUsers();
      expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'error');
    });

    it('check hybrid services without paid licenses', function () {
      Userservice.onboardUsers.and.returnValue($q.resolve(onboardUsersResponse(400, '400087')));
      $scope.onboardUsers();
      expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'error');
    });
  });

  describe('filterList', function () {
    beforeEach(initController);
    it('a proper query should call out to organizationService', function () {
      $scope.filterList('sqtest');
      $timeout.flush();
      expect(Orgservice.getUnlicensedUsers.calls.count()).toEqual(2);
      expect($scope.showSearch).toEqual(true);
    });
  });

  describe('shouldAddCallService()', function () {
    describe('current user without call service', function () {
      beforeEach(initUserWithoutCall);
      beforeEach(initController);

      describe('should add call service', function () {
        afterEach(expectShouldAddCallService);

        it('if both commRadio and ciscoUC are enabled', function () {
          $scope.radioStates.commRadio = true;
          $scope.entitlements.ciscoUC = true;
        });

        it('if commRadio is enabled', function () {
          $scope.radioStates.commRadio = true;
          $scope.entitlements.ciscoUC = false;
        });

        it('if ciscoUC is enabled', function () {
          $scope.radioStates.commRadio = false;
          $scope.entitlements.ciscoUC = true;
        });
      });

      describe('should not add call service', function () {
        afterEach(expectShouldNotAddCallService);

        it('if neither commRadio or ciscoUC is enabled', function () {
          $scope.radioStates.commRadio = false;
          $scope.entitlements.ciscoUC = false;
        });
      });
    });

    describe('current user with call should not add call service', function () {
      beforeEach(initUserWithCall);
      beforeEach(initController);
      afterEach(expectShouldNotAddCallService);

      it('if both commRadio and ciscoUC are enabled', function () {
        $scope.radioStates.commRadio = true;
        $scope.entitlements.ciscoUC = true;
      });

      it('if commRadio is enabled', function () {
        $scope.radioStates.commRadio = true;
        $scope.entitlements.ciscoUC = false;
      });

      it('if ciscoUC is enabled', function () {
        $scope.radioStates.commRadio = false;
        $scope.entitlements.ciscoUC = true;
      });

      it('if neither commRadio or ciscoUC is enabled', function () {
        $scope.radioStates.commRadio = false;
        $scope.entitlements.ciscoUC = false;
      });
    });

    function expectShouldAddCallService() {
      expect($scope.shouldAddCallService()).toBe(true);
    }

    function expectShouldNotAddCallService() {
      expect($scope.shouldAddCallService()).toBe(false);
    }

    function initUserWithoutCall() {
      $stateParams.currentUser = {
        entitlements: []
      };
    }

    function initUserWithCall() {
      $stateParams.currentUser = {
        entitlements: ['ciscouc']
      };
    }
  });

  describe('editServicesSave()', function () {
    describe('if adding call service', function () {
      beforeEach(initControllerAndEnableCall);
      beforeEach(editServicesSave);

      it('should activateDID and goto editService.dn state', function () {
        expect($state.go).toHaveBeenCalledWith('editService.dn');
      });
    });

    describe('if not adding call service', function () {
      beforeEach(initController);
      beforeEach(initSpy);
      beforeEach(editServicesSave);

      it('should update user license', function () {
        expect($scope.updateUserLicense).toHaveBeenCalled();
      });
    });

    function editServicesSave() {
      $scope.editServicesSave();
      $scope.$apply();
    }

    function initSpy() {
      spyOn($scope, 'updateUserLicense');
    }
  });

  describe('updateUserLicense()', function () {
    beforeEach(initCurrentUserAndController);

    beforeEach(function () {
      $scope.$dismiss = angular.noop;
      Userservice.onboardUsers.and.returnValue($q.resolve(onboardUsersResponse(200, '')));
    });

    describe('with a current user', function () {
      beforeEach(updateUserLicense);

      it('should call Userservice.onboardUsers() with the current user', function () {
        expect(Userservice.onboardUsers).toHaveBeenCalled();
        var onboardedUser = Userservice.onboardUsers.calls.mostRecent().args[0][0];
        expect(onboardedUser.address).toEqual($stateParams.currentUser.userName);
      });
    });

    describe('with an existing usrlist array', function () {
      beforeEach(initCustomUsrList);
      beforeEach(updateUserLicense);

      it('should call Userservice.onboardUsers() with the custom user list', function () {
        expect(Userservice.onboardUsers).toHaveBeenCalled();
        var onboardedUser = Userservice.onboardUsers.calls.mostRecent().args[0][0];
        expect(onboardedUser.address).toEqual(this.usrlist[0].address);
      });
    });

    function initCustomUsrList() {
      this.usrlist = [{
        address: 'customTestUser'
      }];
      $scope.usrlist = this.usrlist;
    }

    function updateUserLicense() {
      $scope.updateUserLicense();
      $scope.$apply();
    }
  });

  describe('MC/CMR Checkbox logic', function () {
    beforeEach(initCurrentUserAndController);

    it('should check if CMR gets checked when CF gets checked', function () {
      allLicensesData.allLicenses.forEach(function (lic) {
        lic.confLic.forEach(function (cfLic) {
          cfLic.confModel = true; // check CF license
          $scope.checkCMR(cfLic.confModel, lic.cmrLic);
          lic.cmrLic.forEach(function (cmrLic) {
            expect(cmrLic).toBeTruthy(); // expect CMR license to be checked
          });
        });
      });
    });

    it('should check if CF gets checked when CMR gets checked', function () {
      allLicensesData.allLicenses.forEach(function (lic) {
        lic.confLic.forEach(function (cfLic) {
          lic.cmrLic.forEach(function (cmrLic) {
            cmrLic = true; // check CMR license
          });
          $scope.checkCMR(cfLic.confModel, lic.cmrLic);
          expect(cfLic.confModel).toBeTruthy(); // expect CF license to be checked
        });
      });
    });

    it('should check if CF remains checked when CMR is unchecked', function () {
      allLicensesData.allLicenses.forEach(function (lic) {
        lic.confLic.forEach(function (cfLic) {
          cfLic.confModel = true; // check CF license
          $scope.checkCMR(cfLic.confModel, lic.cmrLic);
          lic.cmrLic.forEach(function (cmrLic) {
            cmrLic = false; // uncheck CMR license
          });
          expect(cfLic.confModel).toBeTruthy(); // expect CF license to remain checked
        });
      });
    });
  });

  describe('With assigning care licenses', function () {
    describe('Check if single licenses get assigned correctly', function () {
      beforeEach(function () {
        spyOn(Authinfo, 'isInitialized').and.returnValue(true);
        spyOn(Authinfo, 'getCareServices').and.returnValue(getCareServices.careLicense);
        $stateParams.currentUser = {
          licenseID: ['CDC_da652e7d-cd34-4545-8f23-936b74359afd']
        };
        initController();
      });

      it('should have care license', function () {
        expect($scope.careFeatures[1].license.licenseType).toEqual('CARE');
        expect($scope.radioStates.careRadio).toEqual(false);
      });
    });

    describe('Check if multiple licenses get assigned correctly', function () {
      beforeEach(function () {
        spyOn(Authinfo, 'isInitialized').and.returnValue(true);
        spyOn(Authinfo, 'hasAccount').and.returnValue(true);
        spyOn(Authinfo, 'getCareServices').and.returnValue(getCareServices.careLicense);
        $stateParams.currentUser = {
          licenseID: ['CDC_da652e7d-cd34-4545-8f23-936b74359afd'],
          entitlements: ['cloud-contact-center']
        };
        initController();
      });

      it('should call getAccountLicenses correctly', function () {
        var licenseFeatures = $scope.getAccountLicenses();
        expect(licenseFeatures[0].id).toEqual('CDC_da652e7d-cd34-4545-8f23-936b74359afd');
        expect(licenseFeatures[0].idOperation).toEqual('ADD');
        expect($scope.careFeatures[1].license.licenseType).toEqual('CARE');
        expect($scope.radioStates.careRadio).toEqual(true);
      });
    });
  });

  function initUserShouldAddCall() {
    $scope.radioStates.commRadio = true;
    $scope.$apply();
  }

  function initCurrentUser() {
    $stateParams.currentUser = {
      userName: 'testUser'
    };
  }

  function initCurrentUserAndController() {
    initCurrentUser();
    initController();
  }

  function initControllerAndEnableCall() {
    initCurrentUserAndController();
    initUserShouldAddCall();
  }
});
