/* global installPromiseMatchers */

'use strict';

describe('OnboardCtrl: Ctrl', function () {
  var controller, $scope, $timeout, GroupService, Notification, Userservice, $q, TelephonyInfoService, Orgservice, FeatureToggleService, SyncService, $state, DialPlanService;
  var internalNumbers;
  var externalNumbers;
  var externalNumberPool;
  var externalNumberPoolMap;
  var getUserMe;
  var getMigrateUsers;
  var getMyFeatureToggles;
  var sites;
  beforeEach(module('Core'));
  beforeEach(module('Huron'));
  beforeEach(module('Messenger'));

  beforeEach(inject(function ($rootScope, $controller, _$timeout_, _GroupService_, _Notification_, _Userservice_, _TelephonyInfoService_, _$q_, _Orgservice_, _FeatureToggleService_, _DialPlanService_, _SyncService_, _$state_) {
    $scope = $rootScope.$new();
    $timeout = _$timeout_;
    $q = _$q_;
    $state = _$state_;
    GroupService = _GroupService_;
    Notification = _Notification_;
    DialPlanService = _DialPlanService_;
    Userservice = _Userservice_;
    Orgservice = _Orgservice_;
    TelephonyInfoService = _TelephonyInfoService_;
    FeatureToggleService = _FeatureToggleService_;
    SyncService = _SyncService_;
    var current = {
      step: {
        name: 'fakeStep'
      }
    };
    $scope.wizard = {};
    $scope.wizard.current = current;

    spyOn(GroupService, 'getGroupList').and.callFake(function (callback) {
      callback({});
    });
    spyOn($state, 'go');

    internalNumbers = getJSONFixture('huron/json/internalNumbers/internalNumbers.json');
    externalNumbers = getJSONFixture('huron/json/externalNumbers/externalNumbers.json');
    externalNumberPool = getJSONFixture('huron/json/externalNumberPoolMap/externalNumberPool.json');
    externalNumberPoolMap = getJSONFixture('huron/json/externalNumberPoolMap/externalNumberPoolMap.json');
    getUserMe = getJSONFixture('core/json/users/me.json');
    getMigrateUsers = getJSONFixture('core/json/users/migrate.json');
    getMyFeatureToggles = getJSONFixture('core/json/users/me/featureToggles.json');
    sites = getJSONFixture('huron/json/settings/sites.json');

    spyOn(Notification, 'notify');
    spyOn(Userservice, 'onboardUsers');
    spyOn(Orgservice, 'getUnlicensedUsers');
    spyOn(SyncService, 'isMessengerSync');

    spyOn(TelephonyInfoService, 'getInternalNumberPool').and.returnValue(internalNumbers);
    spyOn(TelephonyInfoService, 'loadInternalNumberPool').and.returnValue($q.when(internalNumbers));
    spyOn(TelephonyInfoService, 'getExternalNumberPool').and.returnValue(externalNumbers);
    spyOn(DialPlanService, 'getCustomerDialPlanDetails').and.returnValue($q.when({
      extensionGenerated: 'false'
    }));
    spyOn(TelephonyInfoService, 'loadExternalNumberPool').and.returnValue($q.when(externalNumbers));
    spyOn(TelephonyInfoService, 'loadExtPoolWithMapping').and.returnValue($q.when(externalNumberPoolMap));
    spyOn(Userservice, 'getUser').and.returnValue(getUserMe);
    spyOn(Userservice, 'migrateUsers').and.returnValue(getMigrateUsers);
    spyOn(FeatureToggleService, 'getFeaturesForUser').and.returnValue(getMyFeatureToggles);
    spyOn(TelephonyInfoService, 'getPrimarySiteInfo').and.returnValue($q.when(sites));

    controller = $controller('OnboardCtrl', {
      $scope: $scope,
      $state: $state
    });

    $scope.$apply();
  }));

  it('should be defined', function () {
    expect(controller).toBeDefined();
  });

  describe('Bulk Users CSV', function () {
    var twoValidUsers = "First Name,Last Name,Display Name,User ID/Email,Directory Number,Direct Line\nTest,Doe,John Doe,johndoe@example.com,5001,1-555-555-5001\nJane,Doe,Jane Doe,janedoe@example.com,5002,1-555-555-5002";
    var twoInvalidUsers = "First Name,Last Name,Display Name,User ID/Email,Directory Number,Direct Line\nTest,Doe,John Doe,johndoe@example.com,5001\nJane,Doe,Jane Doe,janedoe@example.com,5002";

    function fakeOnboardUsers(successFlag, statusCode, responseMessage) {
      return function (userArray, entitleList, licenseList, callback) {
        var data = {
          success: successFlag,
          userResponse: [{
            status: statusCode,
            message: responseMessage,
            email: 'blah@example.com'
          }, {
            status: statusCode,
            message: responseMessage,
            email: 'blah@example.com'
          }]
        };
        callback(data);
      };
    }
    beforeEach(installPromiseMatchers);

    describe('Upload CSV', function () {
      describe('without file content', function () {
        it('should have 0 upload progress', function () {
          expect($scope.model.uploadProgress).toEqual(0);
        });
        it('should not go to the next step', function () {
          var promise = $scope.csvUploadNext();
          $scope.$apply();
          expect(promise).toBeRejected();
          expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'error');
        });
      });
      describe('with file content', function () {
        beforeEach(function () {
          $scope.model.file = twoValidUsers;
          $scope.$apply();
          $timeout.flush();
        });
        it('should have 100 upload progress when the file model changes', function () {
          expect($scope.model.uploadProgress).toEqual(100);
        });
        it('should go to next step', function () {
          var promise = $scope.csvUploadNext();
          $scope.$apply();
          expect(promise).toBeResolved();
        });
        it('should not allow to go next after resetting file', function () {
          $scope.resetFile();
          $scope.$apply();
          $timeout.flush();
          var promise = $scope.csvUploadNext();
          $scope.$apply();
          expect(promise).toBeRejected();
          expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'error');
        });
      });
      it('should notify error on file size error', function () {
        $scope.onFileSizeError();
        $scope.$apply();
        expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'error');
      });
      it('should notify error on file type error', function () {
        $scope.onFileTypeError();
        $scope.$apply();
        expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'error');
      });
    });

    describe('Process CSV and Save Users', function () {
      beforeEach(function () {
        $scope.model.file = twoValidUsers;
        $scope.$apply();
        $timeout.flush();
      });
      it('should report new users', function () {
        Userservice.onboardUsers.and.callFake(fakeOnboardUsers(true, 200));

        var promise = $scope.csvProcessingNext();
        $scope.$apply();
        expect(promise).toBeResolved();
        expect($scope.model.processProgress).toEqual(100);
        expect($scope.model.numTotalUsers).toEqual(2);
        expect($scope.model.numNewUsers).toEqual(2);
        expect($scope.model.numExistingUsers).toEqual(0);
        expect($scope.model.userErrorArray.length).toEqual(0);
      });
      it('should report existing users', function () {
        Userservice.onboardUsers.and.callFake(fakeOnboardUsers(true, 200, 'User Patched'));

        var promise = $scope.csvProcessingNext();
        $scope.$apply();
        expect(promise).toBeResolved();
        expect($scope.model.processProgress).toEqual(100);
        expect($scope.model.numTotalUsers).toEqual(2);
        expect($scope.model.numNewUsers).toEqual(0);
        expect($scope.model.numExistingUsers).toEqual(2);
        expect($scope.model.userErrorArray.length).toEqual(0);
      });

      it('should report error users', function () {
        Userservice.onboardUsers.and.callFake(fakeOnboardUsers(true, 500));

        var promise = $scope.csvProcessingNext();
        $scope.$apply();
        expect(promise).toBeResolved();
        expect($scope.model.processProgress).toEqual(100);
        expect($scope.model.numTotalUsers).toEqual(2);
        expect($scope.model.numNewUsers).toEqual(0);
        expect($scope.model.numExistingUsers).toEqual(0);
        expect($scope.model.userErrorArray.length).toEqual(2);
      });

      it('should report error users when API fails', function () {
        Userservice.onboardUsers.and.callFake(fakeOnboardUsers(false));

        var promise = $scope.csvProcessingNext();
        $scope.$apply();
        expect(promise).toBeResolved();
        expect($scope.model.processProgress).toEqual(100);
        expect($scope.model.numTotalUsers).toEqual(2);
        expect($scope.model.numNewUsers).toEqual(0);
        expect($scope.model.numExistingUsers).toEqual(0);
        expect($scope.model.userErrorArray.length).toEqual(2);
      });

      it('should report error users when invalid CSV', function () {
        $scope.model.file = twoInvalidUsers;
        $scope.$apply();
        $timeout.flush();

        Userservice.onboardUsers.and.callFake(fakeOnboardUsers(true, 200));

        var promise = $scope.csvProcessingNext();
        $scope.$apply();
        expect(promise).toBeResolved();
        expect($scope.model.processProgress).toEqual(100);
        expect($scope.model.numTotalUsers).toEqual(2);
        expect($scope.model.numNewUsers).toEqual(0);
        expect($scope.model.numExistingUsers).toEqual(0);
        expect($scope.model.userErrorArray.length).toEqual(2);
      });

      it('should stop processing when cancelled', function () {
        Userservice.onboardUsers.and.stub();

        var promise = $scope.csvProcessingNext();
        $scope.$apply();
        expect(promise).not.toBeResolved();
        expect($scope.model.processProgress).toEqual(0);
        expect($scope.model.numTotalUsers).toEqual(0);
        expect($scope.model.numNewUsers).toEqual(0);
        expect($scope.model.numExistingUsers).toEqual(0);
        expect($scope.model.userErrorArray.length).toEqual(0);

        $scope.cancelProcessCsv();
        $scope.$apply();
        expect(promise).toBeResolved();
      });
    });
  });

  describe('With Assigning Users', function () {
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
    it('should initialize allLicenses correctly', function () {
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

  describe('Check if there are multiple subscriptions', function () {
    beforeEach(function () {
      $scope.subscriptionOptions = ['abcd', 'efgh', '12tyv'];
      $scope.selectedSubscription = $scope.subscriptionOptions[0];
      $scope.oneBilling = $scope.subscriptionOptions.length === 1;
    });
    it('should verify that there are multiple subscriptions', function () {
      expect($scope.showMultiSubscriptions('abcd')).toEqual(true);
      expect($scope.oneBilling).toEqual(false);
    });
    it('should verify correct subscription id', function () {
      expect($scope.subscriptionOptions[1]).toEqual('efgh');
      expect($scope.selectedSubscription).toEqual('abcd');
    });
    it('should verify that there is only one subscription id', function () {
      $scope.subscriptionOptions = ['bb8'];
      $scope.oneBilling = $scope.subscriptionOptions.length === 1;
      expect($scope.subscriptionOptions.length).toEqual(1);
      expect($scope.oneBilling).toEqual(true);
    });
  });

  describe('UserAdd DID and DN assignment', function () {
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

    it('assignDNForUserList', function () {

      var promise = $scope.assignDNForUserList();
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
  describe('403 errors during onboarding', function () {
    function testOnboardUsers(successFlag, statusCode, responseMessage) {
      return function (userArray, entitleList, licenseList, callback) {
        var data = {
          success: successFlag,
          userResponse: [{
            status: statusCode,
            message: responseMessage
          }, {
            status: statusCode,
            message: responseMessage
          }]
        };
        callback(data);
      };
    }

    it('checkClaimedDomain', function () {
      Userservice.onboardUsers.and.callFake(testOnboardUsers(true, 403, '400084'));
      expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'error');
    });

    it('checkUserExists', function () {
      Userservice.onboardUsers.and.callFake(testOnboardUsers(true, 403, '400081'));
      expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'error');
    });
  });
});
