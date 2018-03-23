'use strict';

var csvDownloadModule = require('modules/core/csvDownload').default;
var onboardModuleName = require('modules/core/users/shared/onboard').default;

describe('OnboardCtrl: Ctrl', function () {
  function init() {
    this.initModules(
      'Core',
      'Hercules',
      'Huron',
      'Messenger',
      'Sunlight',
      'WebExApp',
      csvDownloadModule,
      onboardModuleName
    );
    this.injectDependencies(
      '$httpBackend',
      '$modal',
      '$previousState',
      '$q',
      '$scope',
      '$state',
      '$stateParams',
      '$timeout',
      'Analytics',
      'Authinfo',
      'CsvDownloadService',
      'DialPlanService',
      'FeatureToggleService',
      'LogMetricsService',
      'MessengerInteropService',
      'Notification',
      'NumberService',
      'OnboardService',
      'Orgservice',
      'ServiceSetup',
      'SunlightConfigService',
      'SyncService',
      'TelephonyInfoService',
      'UrlConfig',
      'Userservice',
      'WebExUtilsFact'
    );
    initDependencySpies.apply(this);
  }

  function initController() {
    this.initController('OnboardCtrl', {
      $scope: this.$scope,
      $state: this.$state,
    });
  }

  function initDependencySpies() {
    this.mock = {};
    var current = {
      step: {
        name: 'fakeStep',
      },
    };
    this.$scope.wizard = {};
    this.$scope.wizard.current = current;

    function isLastStep() {
      return false;
    }

    this.$scope.wizard.isLastStep = isLastStep;

    this.$httpBackend.whenGET('https://identity.webex.com/identity/scim/null/v1/Users/me').respond(200, {});

    spyOn(this.$state, 'go');
    spyOn(this.$previousState, 'get').and.returnValue({
      state: {
        name: 'test.state',
      },
    });

    this.mock.internalNumbers = getJSONFixture('huron/json/internalNumbers/numbersInternalNumbers.json');
    this.mock.externalNumbers = getJSONFixture('huron/json/externalNumbers/externalNumbers.json');
    this.mock.externalNumberPool = getJSONFixture('huron/json/externalNumberPoolMap/externalNumberPool.json');
    this.mock.externalNumberPoolMap = getJSONFixture('huron/json/externalNumberPoolMap/externalNumberPoolMap.json');
    this.mock.getUserMe = getJSONFixture('core/json/users/me.json');
    this.mock.getUserWithoutKms = getJSONFixture('core/json/users/noKms.json');
    this.mock.getUserWithoutContext = getJSONFixture('core/json/users/noContext.json');
    this.mock.getUserWithoutInboundVoice = getJSONFixture('core/json/users/noInboundVoice.json');
    this.mock.getUserWithoutCes = getJSONFixture('core/json/users/noCES.json');
    this.mock.getMigrateUsers = getJSONFixture('core/json/users/migrate.json');
    this.mock.getMyFeatureToggles = getJSONFixture('core/json/users/me/featureToggles.json');
    this.mock.sites = getJSONFixture('huron/json/settings/sites.json');
    this.mock.fusionServices = getJSONFixture('core/json/authInfo/fusionServices.json');
    this.mock.headers = getJSONFixture('core/json/users/headers.json');
    this.mock.getMessageServices = getJSONFixture('core/json/authInfo/messagingServices.json');
    this.mock.unlicensedUsers = getJSONFixture('core/json/organizations/unlicensedUsers.json');
    this.mock.getCareServices = getJSONFixture('core/json/authInfo/careServices.json');
    this.mock.getCareVoiceServices = getJSONFixture('core/json/authInfo/careVoiceServices.json');
    this.mock.getCareServicesWithoutCareLicense = getJSONFixture('core/json/authInfo/careServicesWithoutCareLicense.json');
    this.mock.getCareServicesWithoutCareVoiceLicense = getJSONFixture('core/json/authInfo/careServicesWithoutCareVoiceLicense.json');
    this.mock.getConferenceServices = getJSONFixture('core/json/authInfo/confServices.json');
    this.mock.getConfCMRServicesDiffCases = getJSONFixture('core/json/authInfo/confCMRServicesDiffCases.json');
    this.mock.getLicensesUsage = getJSONFixture('core/json/organizations/usage.json');
    this.mock.manualUsersListMoreThan10 = 'one+21@g.com, one+27@g.com, one+23@g.com, one+24@g.com, one+25@g.com, one+29@g.com, one+22@g.com, one+28@g.com, one+26@g.com, one+30@g.com, one+31@g.com, one+32@g.com';
    this.mock.getUsrList = getJSONFixture('core/json/users/usrlist.controller.json');
    this.mock.getCommunicationServices = getJSONFixture('core/json/authInfo/commServices.json');

    spyOn(this.CsvDownloadService, 'getCsv').and.callFake(function (type) {
      if (type === 'headers') {
        return this.$q.resolve(this.mock.headers);
      } else {
        return this.$q.resolve({});
      }
    }.bind(this));

    spyOn(this.MessengerInteropService, 'hasAssignableMessageOrgEntitlement');

    spyOn(this.Notification, 'notify');

    spyOn(this.Orgservice, 'getUnlicensedUsers').and.callFake(function (callback) {
      callback(this.mock.unlicensedUsers, 200);
    }.bind(this));
    spyOn(this.Orgservice, 'getOrg').and.callFake(function (callback) {
      callback({}, 200);
    });

    spyOn(this.NumberService, 'getNumberList').and.returnValue(this.$q.resolve(this.mock.internalNumbers));

    spyOn(this.TelephonyInfoService, 'getExternalNumberPool').and.returnValue(this.mock.externalNumbers);
    spyOn(this.DialPlanService, 'getDialPlan').and.returnValue(this.$q.resolve({
      extensionGenerated: 'false',
    }));

    spyOn(this.TelephonyInfoService, 'loadExternalNumberPool').and.returnValue(this.$q.resolve(this.mock.externalNumbers));
    spyOn(this.TelephonyInfoService, 'loadExtPoolWithMapping').and.returnValue(this.$q.resolve(this.mock.externalNumberPoolMap));

    spyOn(this.FeatureToggleService, 'getFeaturesForUser').and.returnValue(this.mock.getMyFeatureToggles);
    spyOn(this.FeatureToggleService, 'supports').and.returnValue(this.$q.resolve(false));
    spyOn(this.TelephonyInfoService, 'getPrimarySiteInfo').and.returnValue(this.$q.resolve(this.mock.sites));
    spyOn(this.ServiceSetup, 'listSites').and.returnValue(this.$q.resolve(this.mock.sites));

    spyOn(this.Userservice, 'onboardUsers');
    spyOn(this.Userservice, 'onboardUsersLegacy');
    spyOn(this.Userservice, 'bulkOnboardUsers');
    spyOn(this.Userservice, 'migrateUsers').and.returnValue(this.mock.getMigrateUsers);
    spyOn(this.Userservice, 'updateUsers');
    spyOn(this.Orgservice, 'getLicensesUsage').and.returnValue(this.$q.resolve(this.mock.getLicensesUsage));
    spyOn(this.Analytics, 'trackAddUsers').and.returnValue(this.$q.resolve({}));
  }

  function onboardUsersResponse(statusCode, responseMessage, numUsers) {
    var returnResponse = {
      data: {
        userResponse: [],
      },
    };
    var dataItem = {
      status: statusCode,
      httpStatus: statusCode,
      message: responseMessage,
      email: 'blah@example.com',
    };

    for (var i = 0; i < numUsers; i++) {
      returnResponse.data.userResponse.push(dataItem);
    }
    return returnResponse;
  }

  beforeEach(init);

  describe('Current user name', function () {
    beforeEach(initController);

    it('should return correct string for currentUserDisplayName()', function () {
      this.$scope.currentUser = {
        displayName: 'Testy McTestUser',
        name: {
          givenName: 'Firsty',
          familyName: 'Lasty',
        },
        userName: 'User McUsername',
      };

      expect(this.$scope.currentUserDisplayName()).toEqual('Testy McTestUser');

      this.$scope.currentUser.displayName = '';
      expect(this.$scope.currentUserDisplayName()).toEqual('Firsty Lasty');

      this.$scope.currentUser.name.familyName = '';
      expect(this.$scope.currentUserDisplayName()).toEqual('Firsty');

      this.$scope.currentUser.name.givenName = null;
      this.$scope.currentUser.name.familyName = 'Lasty';
      expect(this.$scope.currentUserDisplayName()).toEqual('Lasty');

      this.$scope.currentUser.name = null;
      expect(this.$scope.currentUserDisplayName()).toEqual('User McUsername');

      this.$scope.currentUser.userName = null;
      expect(this.$scope.currentUserDisplayName()).toEqual('common.unknown');
    });
  });

  describe('Bulk Users DirSync', function () {
    beforeEach(initController);
    var validUserList = [{
      firstName: 'John',
      lastName: 'Doe',
      Email: 'johnDoe@example.com',
    }, {
      firstName: 'Jane',
      lastName: 'Doe',
      Email: 'janeDoe@domain.com',
    }];

    beforeEach(installPromiseMatchers);

    describe('process and save users', function () {
      beforeEach(function () {
        this.$scope.userList = validUserList;
        this.$scope.dirsyncInitForServices();
        this.$scope.$apply();
        this.$timeout.flush();
      });
      it('should load user list into userArray', function () {
        expect(this.$scope.model.numMaxUsers).toEqual(2);
      });
      it('should report existing users', function () {
        this.Userservice.onboardUsersLegacy.and.returnValue(this.$q.resolve(onboardUsersResponse(200, '', 2)));
        var promise = this.$scope.dirsyncProcessingNext();
        this.$scope.$apply();
        expect(promise).toBeResolved();
        expect(this.$scope.model.processProgress).toEqual(100);
        expect(this.$scope.model.numTotalUsers).toEqual(2);
        expect(this.$scope.model.numNewUsers).toEqual(0);
        expect(this.$scope.model.numExistingUsers).toEqual(2);
        expect(this.$scope.model.userErrorArray.length).toEqual(0);
      });
      it('should report error users', function () {
        this.Userservice.onboardUsersLegacy.and.returnValue(this.$q.resolve(onboardUsersResponse(403, '', 2)));
        var promise = this.$scope.dirsyncProcessingNext();
        this.$scope.$apply();
        expect(promise).toBeResolved();
        expect(this.$scope.model.processProgress).toEqual(100);
        expect(this.$scope.model.numTotalUsers).toEqual(2);
        expect(this.$scope.model.numNewUsers).toEqual(0);
        expect(this.$scope.model.numExistingUsers).toEqual(0);
        expect(this.$scope.model.userErrorArray.length).toEqual(2);
      });
      it('should report error users when API fails', function () {
        this.Userservice.onboardUsersLegacy.and.returnValue(this.$q.reject(onboardUsersResponse(500, '', 2)));
        var promise = this.$scope.dirsyncProcessingNext();
        this.$scope.$apply();
        expect(promise).toBeResolved();
        expect(this.$scope.model.processProgress).toEqual(100);
        expect(this.$scope.model.numTotalUsers).toEqual(2);
        expect(this.$scope.model.numNewUsers).toEqual(0);
        expect(this.$scope.model.numExistingUsers).toEqual(0);
        expect(this.$scope.model.userErrorArray.length).toEqual(2);
      });
      it('should stop processing when cancelled', function () {
        this.Userservice.onboardUsersLegacy.and.returnValue(this.$q.resolve(onboardUsersResponse(-1, '', 2)));
        var promise = this.$scope.dirsyncProcessingNext();
        this.$scope.$apply();
        expect(promise).toBeResolved();
        expect(this.$scope.model.processProgress).toEqual(100);
        expect(this.$scope.model.numTotalUsers).toEqual(2);
        expect(this.$scope.model.numNewUsers).toEqual(0);
        expect(this.$scope.model.numExistingUsers).toEqual(0);
        expect(this.$scope.model.userErrorArray.length).toEqual(2);
        this.$scope.cancelProcessCsv();
        this.$scope.$apply();
        expect(promise).toBeResolved();
      });
    });
  });

  describe('onboardUsers()', function () {
    beforeEach(initController);

    beforeEach(function () {
      this.$scope.$dismiss = _.noop;
      this.$scope.model.userList = this.mock.manualUsersListMoreThan10;
      this.$scope.usrlist = this.mock.getUsrList;
      this.$scope.$apply();
      this.$timeout.flush();
    });

    describe('with a usrlist array that has 12 new users', function () {
      it('should call Userservice.onboardUsers() and produce correct new users count', function () {
        this.Userservice.onboardUsers.and.returnValue(this.$q.resolve(onboardUsersResponse(201, '', 6)));
        this.$scope.onboardUsers(true);
        this.$scope.$apply();
        expect(this.$scope.numAddedUsers).toEqual(12);
      });
    });

    describe('with a usrlist array that has 12 existing users', function () {
      it('should call Userservice.onboardUsers() and produce correct new users count', function () {
        this.Userservice.onboardUsers.and.returnValue(this.$q.resolve(onboardUsersResponse(200, '', 6)));
        this.$scope.onboardUsers(true);
        this.$scope.$apply();
        expect(this.$scope.numUpdatedUsers).toEqual(12);
      });
    });
  });

  describe('setLicenseAvailability', function () {
    beforeEach(initController);

    it('Should have been initialized', function () {
      expect(this.Orgservice.getLicensesUsage).toHaveBeenCalled();
    });
    it('should get licenses', function () {
      expect(this.$scope.licenses).toBeDefined();
    });
    it('Should calculate the license availabilities correctly', function () {
      expect(this.$scope.messagingLicenseAvailability).toEqual(0);
      expect(this.$scope.conferencingLicenseAvailability).toEqual(1);
    });
  });

  describe('License redirect modal', function () {
    beforeEach(initController);
    beforeEach(function () {
      spyOn(this.$scope, 'licenseCheckModal');
    });
    it('should define the modal when sufficient licenses are not available', function () {
      this.$scope.checkLicenseAvailability('MESSAGING', true);
      expect(this.$scope.licenseCheckModal).toHaveBeenCalled();
    });
  });

  describe('disableCommCheckbox()', function () {
    beforeEach(initController);
    it('should return true if the communication licenseId is not the same as the selected one', function () {
      this.$scope.currentUserEnablesCall = true;
      this.$scope.selectedCommFeature = {
        license: {
          licenseId: 'CO_12345',
        },
      };
      var currentCommFeature = {
        license: {
          licenseId: 'CO_6789',
        },
      };
      var result = this.$scope.disableCommCheckbox(currentCommFeature);
      this.$scope.$apply();
      expect(result).toBeTruthy();
    });

    it('should return false if the communication licenseId is not same as the selected one', function () {
      this.$scope.currentUserEnablesCall = true;
      this.$scope.selectedCommFeature = {
        license: {
          licenseId: 'CO_12345',
        },
      };
      var currentCommFeature = {
        license: {
          licenseId: 'CO_12345',
        },
      };
      var result = this.$scope.disableCommCheckbox(currentCommFeature);
      this.$scope.$apply();
      expect(result).toBeFalsy();
    });
  });

  describe('With assigning meeting licenses', function () {
    beforeEach(initController);
    beforeEach(function () {
      this.$scope.allLicenses = [{
        billing: 'testOrg1',
        confModel: false,
        label: 'test org',
        licenseId: 'testABC',
        offerName: 'CS',
        siteUrl: 'testOrg1@webex.com',
        volume: 100,
      }, {
        billing: 'testOrg2',
        confModel: false,
        label: 'test org',
        licenseId: 'testDEF',
        offerName: 'CS',
        siteUrl: 'testOrg2@webex.com',
        volume: 100,
      }];
    });
    it('should initialize all licenses correctly', function () {
      this.$scope.populateConf();
      expect(this.$scope.allLicenses[0].confModel).toEqual(false);
      expect(this.$scope.allLicenses[0].label).toEqual('test org');
      expect(this.$scope.allLicenses[1].billing).toEqual('testOrg2');
      expect(this.$scope.allLicenses[1].offerName).toEqual('CS');
    });
    it('should verify userLicenseIds and licenseId are the same', function () {
      var userLicenseIds = 'testABC';
      this.$scope.populateConf();
      expect(this.$scope.allLicenses[0].licenseId).toEqual(userLicenseIds);
      expect(this.$scope.allLicenses[1].licenseId).not.toEqual(userLicenseIds);
    });
  });

  describe('With assigning message licenses', function () {
    describe('Check if single licenses get assigned correctly', function () {
      beforeEach(function () {
        spyOn(this.Authinfo, 'isInitialized').and.returnValue(true);
        spyOn(this.Authinfo, 'getMessageServices').and.returnValue(this.mock.getMessageServices.singleLicense);
        this.$stateParams.currentUser = {
          licenseID: ['MS_07bbaaf5-735d-4878-a6ea-d67d69feb1c0'],
        };
      });
      beforeEach(initController);

      it('should define licenses model', function () {
        expect(this.$scope.messageFeatures[1].licenses[0].model).toBeTruthy();
        expect(this.$scope.radioStates.msgRadio).toEqual(false);
      });
    });

    describe('Check if multiple licenses get assigned correctly', function () {
      beforeEach(function () {
        spyOn(this.Authinfo, 'isInitialized').and.returnValue(true);
        spyOn(this.Authinfo, 'hasAccount').and.returnValue(true);
        spyOn(this.Authinfo, 'getMessageServices').and.returnValue(this.mock.getMessageServices.multipleLicenses);
        this.$stateParams.currentUser = {
          licenseID: ['MS_07bbaaf5-735d-4878-a6ea-d67d69feb1c0'],
        };
      });
      beforeEach(initController);

      it('should call getAccountLicenses correctly', function () {
        var licenseFeatures = this.$scope.getAccountLicenses();
        expect(licenseFeatures[0].id).toBe('MS_07bbaaf5-735d-4878-a6ea-d67d69feb1c0');
        expect(licenseFeatures[0].idOperation).toBe('ADD');
        expect(this.$scope.messageFeatures[1].licenses[0].model).toBe(true);
        expect(this.$scope.radioStates.msgRadio).toBe(true);
        expect(this.$scope.radioStates.careRadio).toBe(this.$scope.careRadioValue.NONE);
      });
    });
  });

  describe('With assigning meeting and message licenses on invitations', function () {
    beforeEach(function () {
      this.$stateParams.currentUser = {
        licenseID: [
          'MS_07bbaaf5-735d-4878-a6ea-d67d69feb1c0',
          'CF_5761413b-5bad-4d6a-b40d-c157c0f99062',
        ],
        pendingStatus: true,
        invitations: {
          ms: true,
          cf: 'CF_5761413b-5bad-4d6a-b40d-c157c0f99062',
        },
      };
    });
    beforeEach(initController);
    beforeEach(function () {
      this.$scope.allLicenses = [{
        billing: 'testOrg1',
        confModel: false,
        label: 'test org',
        licenseId: 'CF_5761413b-5bad-4d6a-b40d-c157c0f99062',
        offerName: 'CF',
        siteUrl: '',
        volume: 100,
      }];
    });
    it('should set MS license to true based on invitation', function () {
      expect(this.$scope.radioStates.msgRadio).toBeTruthy();
    });
    it('should set meeting to true on invitation', function () {
      this.$scope.populateConfInvitations();
      expect(this.$scope.allLicenses[0].confModel).toEqual(true);
    });
  });

  describe('UserAdd DID and DN assignment', function () {
    beforeEach(initController);
    beforeEach(function () {
      this.$scope.usrlist = [{
        name: 'dntodid',
        address: 'dntodid@gmail.com',
      }, {
        name: 'dntodid1',
        address: 'dntodid1@gmail.com',
      }];
      this.$scope.convertSelectedList = [{
        name: {
          givenName: 'dntodid',
          familyName: '',
        },
        userName: 'dntodid@gmail.com',
      }, {
        name: {
          givenName: 'dntodid1',
          familyName: '',
        },
        userName: 'dntodid1@gmail.com',
      }];
      this.$scope.currentUserEnablesCall = true;
      this.$scope.internalNumberPool = this.mock.internalNumbers;
      this.$scope.externalNumberPool = this.mock.externalNumberPool;
      this.$scope.$apply();
    });
    beforeEach(installPromiseMatchers);
    it('mapDidToDn', function () {
      this.$scope.mapDidToDn();
      this.$scope.$apply();
      expect(this.$scope.externalNumberMapping.length).toEqual(2);
      expect(this.$scope.usrlist[0].externalNumber.pattern).toEqual('+14084744532');
      expect(this.$scope.usrlist[0].assignedDn.pattern).toEqual('4532');
      expect(this.$scope.usrlist[1].didDnMapMsg).toEqual('usersPage.noExtMappingAvail');
    });

    it('assignServicesNext', function () {
      expect(this.$scope.usrlist[0].externalNumber).not.toBeDefined();
      expect(this.$scope.usrlist[0].assignedDn).not.toBeDefined();
      expect(this.$scope.usrlist[1].externalNumber).not.toBeDefined();
      expect(this.$scope.usrlist[1].assignedDn).not.toBeDefined();
      var promise = this.$scope.assignServicesNext();
      this.$scope.$apply();
      expect(promise).toBeResolved();
      expect(this.$scope.usrlist[0].externalNumber).toBeDefined();
      expect(this.$scope.usrlist[0].assignedDn.number).toEqual('503');
      expect(this.$scope.usrlist[1].externalNumber).toBeDefined();
      expect(this.$scope.usrlist[1].assignedDn.number).toEqual('504');
    });

    it('editServicesSave', function () {
      this.$scope.currentUser = {
        userName: 'johndoe@example.com',
      };
      this.$scope.editServicesSave();
      this.$scope.$apply();
      expect(this.$scope.usrlist.length).toEqual(1);
      expect(this.$scope.usrlist[0]).toEqual(jasmine.objectContaining({
        address: 'johndoe@example.com',
        assignedDn: this.mock.internalNumbers[0],
        externalNumber: this.mock.externalNumbers[0],
      }));
      expect(this.$state.go).toHaveBeenCalledWith('editService.dn');
      expect(this.$scope.editServicesFlow).toBe(true);
      expect(this.$scope.convertUsersFlow).toBe(false);
    });

    it('assignDNForUserList', function () {
      this.$scope.assignDNForUserList();
      this.$scope.$apply();
      expect(this.$scope.usrlist[0].externalNumber.pattern).toEqual('null');
      expect(this.$scope.usrlist[0].assignedDn.number).toEqual('503');
      expect(this.$scope.usrlist[1].externalNumber.pattern).toEqual('null');
      expect(this.$scope.usrlist[1].assignedDn.number).toEqual('504');
    });

    it('convertUsersNext', function () {
      this.$scope.convertUsersNext();
      this.$scope.$apply();
      expect(this.$state.go).toHaveBeenCalledWith('users.convert.services.dn');
      expect(this.$scope.usrlist[0].assignedDn.number).toEqual('503');
      expect(this.$scope.usrlist[1].assignedDn.number).toEqual('504');
    });

    it('assignDNForConvertUsers', function () {
      spyOn(this.OnboardService, 'convertUsersInChunks').and.returnValue(this.$q.resolve({
        numAddedUsers: 2,
        numUpdatedUsers: 0,
        results: {
          resultList: [],
        },
      }));
      this.$scope.assignDNForConvertUsers();
      this.$scope.$apply();
      expect(this.OnboardService.convertUsersInChunks).toHaveBeenCalled();
    });

    it('checkDidDnDupes', function () {
      this.$scope.loadInternalNumberPool();
      this.$scope.loadExternalNumberPool();
      expect(this.$scope.usrlist.length).toEqual(2);
      this.$scope.assignDNForUserList();
      var result = this.$scope.checkDidDnDupes();
      this.$scope.$apply();
      expect(result).toBeTruthy();
    });
  });

  describe('With assigning call licenses', function () {
    describe('Check when there is no ciscouc assigned at all', function () {
      beforeEach(function () {
        this.$stateParams.currentUser = {
          licenseID: [],
          entitlements: [],
        };
      });
      beforeEach(initController);

      it('should initialized currentUserEnablesCall to false', function () {
        expect(this.$scope.currentUserEnablesCall).toBeFalsy();
      });
    });

    describe('Check when there is an existing ciscouc license', function () {
      beforeEach(function () {
        this.$stateParams.currentUser = {
          licenseID: ['CO_3cd433a5-c140-4ee5-bfb8'],
          entitlements: ['ciscouc'],
        };
      });
      beforeEach(initController);

      it('should initialized currentUserEnablesCall to true', function () {
        expect(this.$scope.currentUserEnablesCall).toBeTruthy();
      });
    });

    describe('Check if licenses get assigned correctly when adding a license', function () {
      beforeEach(function () {
        spyOn(this.Authinfo, 'isInitialized').and.returnValue(true);
        spyOn(this.Authinfo, 'hasAccount').and.returnValue(true);
        spyOn(this.Authinfo, 'getCommunicationServices').and.returnValue(this.mock.getCommunicationServices.multipleLicenses);
        this.$stateParams.currentUser = {
          licenseID: [],
          entitlements: [],
        };
      });
      beforeEach(initController);

      it('should initialized commFeatures to have 3 elements', function () {
        expect(this.$scope.communicationFeatures.length).toEqual(3);
      });

      it('should set the correct usage to the communication licenses', function () {
        var index = _.findIndex(this.$scope.communicationFeatures, function (commFeature) {
          return commFeature.license.licenseId === 'CO_3cd433a5-c140-4ee5-bfb8';
        });
        expect(this.$scope.communicationFeatures[index].license.usage).toEqual(2);
      });

      it('should call getAccountLicenses correctly to add a communication license', function () {
        this.$scope.currentUserEnablesCall = true;
        this.$scope.selectedCommFeature = this.mock.getCommunicationServices.multipleLicenses[1];
        var licenseFeatures = this.$scope.getAccountLicenses();
        this.$scope.$apply();
        expect(licenseFeatures.length).toEqual(1);
        expect(licenseFeatures[0].id).toBe('CO_cb9b68a9-ee2d-4896-bc8d-0f4dd830b47d');
        expect(licenseFeatures[0].idOperation).toBe('ADD');
      });
    });

    describe('Check if licenses get assigned correctly when deleting a license', function () {
      beforeEach(function () {
        spyOn(this.Authinfo, 'isInitialized').and.returnValue(true);
        spyOn(this.Authinfo, 'hasAccount').and.returnValue(true);
        spyOn(this.Authinfo, 'getCommunicationServices').and.returnValue(this.mock.getCommunicationServices.multipleLicenses);
        this.$stateParams.currentUser = {
          licenseID: ['CO_3cd433a5-c140-4ee5-bfb8'],
          entitlements: ['ciscouc'],
        };
      });
      beforeEach(initController);

      it('should set the data to the current communication license', function () {
        expect(this.$scope.currentUserCommFeature.license.licenseId).toEqual('CO_3cd433a5-c140-4ee5-bfb8');
        expect(this.$scope.selectedCommFeature.license.licenseId).toEqual('CO_3cd433a5-c140-4ee5-bfb8');
        expect(this.$scope.selectedCommFeature.commRadio).toBeTruthy();
      });

      it('should call getAccountLicenses correctly to remove the license', function () {
        this.$scope.currentUserEnablesCall = false;
        var licenseFeatures = this.$scope.getAccountLicenses('patch');
        this.$scope.$apply();
        expect(licenseFeatures.length).toEqual(1);
        expect(licenseFeatures[0].id).toBe('CO_3cd433a5-c140-4ee5-bfb8');
        expect(licenseFeatures[0].idOperation).toBe('REMOVE');
      });
    });

    describe('Check if licenses get assigned correctly when swapping licenses', function () {
      beforeEach(function () {
        spyOn(this.Authinfo, 'isInitialized').and.returnValue(true);
        spyOn(this.Authinfo, 'hasAccount').and.returnValue(true);
        spyOn(this.Authinfo, 'getCommunicationServices').and.returnValue(this.mock.getCommunicationServices.multipleLicenses);
        this.$stateParams.currentUser = {
          licenseID: ['CO_3cd433a5-c140-4ee5-bfb8'],
          entitlements: ['ciscouc'],
        };
      });
      beforeEach(initController);

      it('should call getAccountLicenses correctly to move/swap the licenses', function () {
        this.$scope.selectedCommFeature = this.mock.getCommunicationServices.multipleLicenses[1];
        var licenseFeatures = this.$scope.getAccountLicenses();
        this.$scope.$apply();
        expect(licenseFeatures.length).toEqual(2);
        expect(licenseFeatures[0].id).toBe('CO_3cd433a5-c140-4ee5-bfb8');
        expect(licenseFeatures[0].idOperation).toBe('REMOVE');
        expect(licenseFeatures[1].id).toBe('CO_cb9b68a9-ee2d-4896-bc8d-0f4dd830b47d');
        expect(licenseFeatures[1].idOperation).toBe('ADD');
      });
    });
  });

  describe('filterList', function () {
    beforeEach(initController);
    it('a proper query should call out to organizationService', function () {
      this.$scope.filterList('sqtest');
      this.$timeout.flush();
      expect(this.Orgservice.getUnlicensedUsers.calls.count()).toEqual(2);
      expect(this.$scope.showSearch).toEqual(true);
    });
  });

  describe('shouldAddCallService()', function () {
    describe('current user without call service', function () {
      beforeEach(initUserWithoutCall);
      beforeEach(initController);

      describe('should add call service', function () {
        afterEach(expectShouldAddCallService);

        it('if both commRadio and ciscoUC are enabled', function () {
          this.$scope.currentUserEnablesCall = true;
          this.$scope.entitlements.ciscoUC = true;
        });

        it('if commRadio is enabled', function () {
          this.$scope.currentUserEnablesCall = true;
          this.$scope.entitlements.ciscoUC = false;
        });

        it('if ciscoUC is enabled', function () {
          this.$scope.currentUserEnablesCall = false;
          this.$scope.entitlements.ciscoUC = true;
        });
      });

      describe('should not add call service', function () {
        afterEach(expectShouldNotAddCallService);

        it('if neither commRadio or ciscoUC is enabled', function () {
          this.$scope.currentUserEnablesCall = false;
          this.$scope.entitlements.ciscoUC = false;
        });
      });
    });

    describe('current user with call should not add call service', function () {
      beforeEach(initUserWithCall);
      beforeEach(initController);
      afterEach(expectShouldNotAddCallService);

      it('if both commRadio and ciscoUC are enabled', function () {
        this.$scope.currentUserEnablesCall = true;
        this.$scope.entitlements.ciscoUC = true;
      });

      it('if commRadio is enabled', function () {
        this.$scope.currentUserEnablesCall = true;
        this.$scope.entitlements.ciscoUC = false;
      });

      it('if ciscoUC is enabled', function () {
        this.$scope.currentUserEnablesCall = false;
        this.$scope.entitlements.ciscoUC = true;
      });

      it('if neither commRadio or ciscoUC is enabled', function () {
        this.$scope.currentUserEnablesCall = false;
        this.$scope.entitlements.ciscoUC = false;
      });
    });

    function expectShouldAddCallService() {
      expect(this.$scope.shouldAddCallService()).toBe(true);
    }

    function expectShouldNotAddCallService() {
      expect(this.$scope.shouldAddCallService()).toBe(false);
    }

    function initUserWithoutCall() {
      this.$stateParams.currentUser = {
        entitlements: [],
      };
    }

    function initUserWithCall() {
      this.$stateParams.currentUser = {
        entitlements: ['ciscouc'],
      };
    }
  });

  describe('hybridCallServiceAware', function () {
    describe('on user without squared-fusion-uc entitlement', function () {
      beforeEach(initUserWithoutHybridCall);
      beforeEach(initController);

      it('should be false', function () {
        expect(this.$scope.hybridCallServiceAware).toBe(false);
      });
    });

    describe('on user with squared-fusion-uc entitlement', function () {
      beforeEach(initUserWithHybridCall);
      beforeEach(initController);

      it('should be true', function () {
        expect(this.$scope.hybridCallServiceAware).toBe(true);
      });
    });

    function initUserWithoutHybridCall() {
      this.$stateParams.currentUser = {
        entitlements: [],
      };
    }

    function initUserWithHybridCall() {
      this.$stateParams.currentUser = {
        entitlements: ['squared-fusion-uc'],
      };
    }
  });

  describe('editServicesSave()', function () {
    describe('if adding call service', function () {
      beforeEach(initControllerAndEnableCall);
      beforeEach(editServicesSave);

      it('should activateDID and goto editService.dn state', function () {
        expect(this.$state.go).toHaveBeenCalledWith('editService.dn');
      });
    });

    describe('if not adding call service', function () {
      beforeEach(initController);
      beforeEach(initSpy);
      beforeEach(editServicesSave);

      it('should update user license', function () {
        expect(this.$scope.updateUserLicense).toHaveBeenCalled();
      });
    });

    function editServicesSave() {
      this.$scope.editServicesSave();
      this.$scope.$apply();
    }

    function initSpy() {
      spyOn(this.$scope, 'updateUserLicense');
    }
  });

  describe('updateUserLicense()', function () {
    beforeEach(initCurrentUserAndController);

    beforeEach(function () {
      this.$scope.$dismiss = _.noop;
      this.Userservice.onboardUsersLegacy.and.returnValue(this.$q.resolve(onboardUsersResponse(200, '', 2)));
    });

    describe('with a current user', function () {
      beforeEach(updateUserLicense);

      it('should call Userservice.onboardUsers() with the current user', function () {
        expect(this.Userservice.onboardUsersLegacy).toHaveBeenCalled();
        var onboardedUser = this.Userservice.onboardUsersLegacy.calls.mostRecent().args[0][0];
        expect(onboardedUser.address).toEqual(this.$stateParams.currentUser.userName);
      });
    });

    describe('with an existing usrlist array', function () {
      beforeEach(initCustomUsrList);
      beforeEach(updateUserLicense);

      it('should call Userservice.onboardUsers() with the custom user list', function () {
        expect(this.Userservice.onboardUsersLegacy).toHaveBeenCalled();
        var onboardedUser = this.Userservice.onboardUsersLegacy.calls.mostRecent().args[0][0];
        expect(onboardedUser.address).toEqual(this.usrlist[0].address);
      });
    });

    describe('with spark call line assignment', function () {
      beforeEach(initCustomUsrList);

      it('should use assignedDn and externalNumber for onboarded user', function () {
        _.assign(this.$scope.usrlist[0], {
          assignedDn: {
            uuid: '111',
            number: '123',
          },
          externalNumber: {
            uuid: '444',
            pattern: '+456',
          },
        });
        updateUserLicense.apply(this);
        expect(this.Userservice.onboardUsersLegacy).toHaveBeenCalled();
        var onboardedUser = this.Userservice.onboardUsersLegacy.calls.mostRecent().args[0][0];
        expect(onboardedUser.internalExtension).toBe('123');
        expect(onboardedUser.directLine).toBe('+456');
      });

      it('should ignore "none" externalNumber for onboarded user', function () {
        _.assign(this.$scope.usrlist[0], {
          assignedDn: {
            uuid: '111',
            number: '123',
          },
          externalNumber: {
            uuid: 'none',
            pattern: 'TranslatedNone',
          },
        });
        updateUserLicense.apply(this);
        expect(this.Userservice.onboardUsersLegacy).toHaveBeenCalled();
        var onboardedUser = this.Userservice.onboardUsersLegacy.calls.mostRecent().args[0][0];
        expect(onboardedUser.internalExtension).toBe('123');
        expect(onboardedUser.directLine).toBeUndefined();
      });
    });

    function initCustomUsrList() {
      this.usrlist = [{
        address: 'customTestUser',
      }];
      this.$scope.usrlist = this.usrlist;
    }

    function updateUserLicense() {
      this.$scope.updateUserLicense();
      this.$scope.$apply();
    }
  });

  describe('With assigning care licenses', function () {
    describe('Check if dependent services are selected correctly', function () {
      beforeEach(function () {
        spyOn(this.Authinfo, 'isInitialized').and.returnValue(true);
        spyOn(this.Authinfo, 'getCareServices').and.returnValue(this.mock.getCareServices.careLicense);
        this.$stateParams.currentUser = {
          licenseID: ['CDC_da652e7d-cd34-4545-8f23-936b74359afd'],
        };
      });
      beforeEach(initController);
      it('should select None radio button when message is unchecked', function () {
        this.$scope.radioStates.msgRadio = true;
        this.$scope.radioStates.careRadio = this.$scope.careRadioValue.K1;
        this.$scope.controlMsg();
        this.$scope.radioStates.msgRadio = false;
        this.$scope.controlMsg();
        expect(this.$scope.radioStates.careRadio).toBe(this.$scope.careRadioValue.NONE);
      });
    });

    describe('Check if single licenses get assigned correctly for CDC', function () {
      beforeEach(function () {
        spyOn(this.Authinfo, 'isInitialized').and.returnValue(true);
        spyOn(this.Authinfo, 'getCareServices').and.returnValue(this.mock.getCareServices.careLicense);
        this.$stateParams.currentUser = {
          licenseID: ['CDC_da652e7d-cd34-4545-8f23-936b74359afd'],
        };
      });
      beforeEach(initController);

      it('should have care license', function () {
        expect(this.$scope.careFeatures[1].license.licenseType).toBe('CARE');
        expect(this.$scope.careFeatures[1].license.features).toContain('cloud-contact-center');
        expect(this.$scope.careFeatures[1].license.features).not.toContain('cloud-contact-center-inbound-voice');
        expect(this.$scope.radioStates.careRadio).toBe(this.$scope.careRadioValue.NONE);
      });
    });

    describe('Check if single licenses get assigned correctly for CVC', function () {
      beforeEach(function () {
        spyOn(this.Authinfo, 'isInitialized').and.returnValue(true);
        spyOn(this.Authinfo, 'getCareServices').and.returnValue(this.mock.getCareVoiceServices.careVoiceLicense);
        this.$stateParams.currentUser = {
          licenseID: ['CVC_va652e7d-cd34-4545-8f23-936b74359afd'],
        };
      });
      beforeEach(initController);

      it('should have care license', function () {
        expect(this.$scope.careFeatures[1].license.licenseType).toBe('CARE');
        expect(this.$scope.careFeatures[1].license.features).toContain('cloud-contact-center');
        expect(this.$scope.careFeatures[1].license.features).toContain('cloud-contact-center-inbound-voice');
        expect(this.$scope.radioStates.careRadio).toBe(this.$scope.careRadioValue.NONE);
      });
    });

    describe('care radio button selection:', function () {
      beforeEach(function () {
        this.userId = 'dbca1001-ab12-cd34-de56-abcdef123454';
        spyOn(this.Authinfo, 'isInitialized').and.returnValue(true);
        spyOn(this.Authinfo, 'hasAccount').and.returnValue(true);
        spyOn(this.Authinfo, 'getMessageServices').and.returnValue(this.mock.getMessageServices.singleLicense);
        spyOn(this.LogMetricsService, 'logMetrics');
      });

      afterEach(function () {
        this.userId = undefined;
      });

      describe('user does not have the care license:', function () {
        beforeEach(function () {
          spyOn(this.Authinfo, 'getCareServices').and.returnValue(this.mock.getCareServicesWithoutCareLicense.careLicense);
          this.$stateParams.currentUser = {
            licenseID: ['MS_cd66217d-a419-4cfb-92b4-a196b7fe3c74'],
            entitlements: ['cloud-contact-center-digital', 'contact-center-context', 'cloud-contact-center'],
            roles: ['spark.synckms'],
            id: this.userId,
          };
        });

        beforeEach(initController);

        it('should set care radio value to none if initial radio state is also none', function () {
          this.$scope.radioStates.initialCareRadioState = this.$scope.careRadioValue.NONE;
          this.$scope.getAccountLicensesForCare();
          expect(this.$scope.radioStates.careRadio).toBe(this.$scope.careRadioValue.NONE);
          this.$httpBackend.verifyNoOutstandingRequest();
        });
      });

      describe('user does not have the care voice license:', function () {
        beforeEach(function () {
          spyOn(this.Authinfo, 'getCareServices').and.returnValue(this.mock.getCareServicesWithoutCareVoiceLicense.careVoiceLicense);
          this.$stateParams.currentUser = {
            licenseID: ['MS_cd66217d-a419-4cfb-92b4-a196b7fe3c74'],
            entitlements: ['contact-center-context', 'cloud-contact-center-inbound-voice', 'cloud-contact-center'],
            roles: ['spark.synckms'],
            id: this.userId,
          };
        });

        beforeEach(initController);

        it('should set care radio value to none if initial radio state is also none', function () {
          this.$scope.radioStates.initialCareRadioState = this.$scope.careRadioValue.NONE;
          this.$scope.getAccountLicensesForCare();
          expect(this.$scope.radioStates.careRadio).toBe(this.$scope.careRadioValue.NONE);
          this.$httpBackend.verifyNoOutstandingRequest();
        });
      });

      describe('user does not have the context entitlement:', function () {
        beforeEach(function () {
          spyOn(this.Authinfo, 'getCareServices').and.returnValue(this.mock.getCareServices.careLicense);
          this.$stateParams.currentUser = {
            licenseID: ['CDC_da652e7d-cd34-4545-8f23-936b74359afd'],
            entitlements: ['cloud-contact-center'],
            roles: ['spark.synckms'],
            id: this.userId,
          };
        });

        beforeEach(initController);

        it('should not modify care radio value', function () {
          this.$scope.radioStates.msgRadio = true;
          this.$scope.radioStates.careRadio = this.$scope.careRadioValue.K1;
          this.$scope.getAccountLicensesForCare();
          expect(this.$scope.radioStates.careRadio).toBe(this.$scope.careRadioValue.K1);
          this.$httpBackend.verifyNoOutstandingRequest();
        });
      });

      describe('user does not have the kms scopes:', function () {
        beforeEach(function () {
          spyOn(this.Authinfo, 'getCareServices').and.returnValue(this.mock.getCareServices.careLicense);
          this.$stateParams.currentUser = {
            licenseID: ['CDC_da652e7d-cd34-4545-8f23-936b74359afd'],
            entitlements: ['contact-center-context', 'cloud-contact-center-digital', 'cloud-contact-center'],
            roles: [],
            id: this.userId,
          };
        });

        beforeEach(initController);

        it('should not modify care radio value', function () {
          this.$scope.radioStates.msgRadio = true;
          this.$scope.radioStates.careRadio = this.$scope.careRadioValue.K1;
          this.$scope.getAccountLicensesForCare();
          expect(this.$scope.radioStates.careRadio).toBe(this.$scope.careRadioValue.K1);
          this.$httpBackend.verifyNoOutstandingRequest();
        });
      });

      describe('user does not have the entitlement', function () {
        beforeEach(function () {
          spyOn(this.Authinfo, 'getCareServices').and.returnValue(this.mock.getCareVoiceServices.careVoiceLicense);
          this.$stateParams.currentUser = {
            licenseID: ['CVC_va652e7d-cd34-4545-8f23-936b74359afd'],
            entitlements: [],
            roles: ['spark.synckms'],
            id: this.userId,
          };
        });

        beforeEach(initController);

        it('should set care radio value to none', function () {
          this.$scope.radioStates.msgRadio = true;
          this.$scope.radioStates.careRadio = this.$scope.careRadioValue.K2;
          this.$scope.getAccountLicensesForCare();
          this.$scope.setCareService();
          expect(this.$scope.radioStates.careRadio).toBe(this.$scope.careRadioValue.NONE);
          this.$httpBackend.verifyNoOutstandingRequest();
        });
      });

      describe('user does not have the roles', function () {
        beforeEach(function () {
          spyOn(this.Authinfo, 'getCareServices').and.returnValue(this.mock.getCareVoiceServices.careVoiceLicense);
          this.$stateParams.currentUser = {
            licenseID: ['CVC_va652e7d-cd34-4545-8f23-936b74359afd'],
            entitlements: ['cloud-contact-center-inbound-voice', 'contact-center-context', 'cloud-contact-center'],
            roles: [],
            id: this.userId,
          };
        });

        beforeEach(initController);

        it('should set care radio value to none', function () {
          this.$scope.radioStates.msgRadio = true;
          this.$scope.radioStates.careRadio = this.$scope.careRadioValue.K2;
          this.$scope.getAccountLicensesForCare();
          this.$scope.setCareService();
          expect(this.$scope.radioStates.careRadio).toBe(this.$scope.careRadioValue.NONE);
          this.$httpBackend.verifyNoOutstandingRequest();
        });
      });

      describe('user does not have the cloud-contact-center-inbound-voice entitlement', function () {
        beforeEach(function () {
          spyOn(this.Authinfo, 'getCareServices').and.returnValue(this.mock.getCareVoiceServices.careVoiceLicense);
          this.$stateParams.currentUser = {
            licenseID: ['CVC_va652e7d-cd34-4545-8f23-936b74359afd'],
            entitlements: ['cloud-contact-center'],
            roles: ['spark.synckms'],
            id: this.userId,
          };
        });

        beforeEach(initController);

        it('should not modify the care radio value', function () {
          this.$scope.radioStates.msgRadio = true;
          this.$scope.radioStates.careRadio = this.$scope.careRadioValue.K2;
          this.$scope.getAccountLicensesForCare();
          this.$scope.setCareService();
          expect(this.$scope.radioStates.careRadio).toBe(this.$scope.careRadioValue.NONE);
          this.$httpBackend.verifyNoOutstandingRequest();
        });
      });
    });

    describe('Check if multiple licenses (MS, CDC) get assigned correctly', function () {
      beforeEach(function () {
        this.userId = 'dbca1001-ab12-cd34-de56-abcdef123454';
        spyOn(this.Authinfo, 'isInitialized').and.returnValue(true);
        spyOn(this.Authinfo, 'hasAccount').and.returnValue(true);
        spyOn(this.Authinfo, 'getMessageServices').and.returnValue(this.mock.getMessageServices.singleLicense);
        spyOn(this.Authinfo, 'getCareServices').and.returnValue(this.mock.getCareServices.careLicense);
        spyOn(this.LogMetricsService, 'logMetrics');
        this.$stateParams.currentUser = {
          licenseID: ['MS_07bbaaf5-735d-4878-a6ea-d67d69feb1c0', 'CDC_da652e7d-cd34-4545-8f23-936b74359afd'],
          entitlements: ['cloud-contact-center', 'contact-center-context', 'cloud-contact-center-digital'],
          roles: ['spark.synckms'],
          id: this.userId,
        };
      });

      afterEach(function () {
        this.userId = undefined;
      });
      beforeEach(initController);

      it('should call getAccountLicenses and getAccountLicensesForCare correctly', function () {
        this.$scope.radioStates.msgRadio = true;
        this.$scope.controlMsg();
        this.$scope.radioStates.initialCareRadioState = this.$scope.careRadioValue.NONE;
        this.$scope.radioStates.careRadio = this.$scope.careRadioValue.K1;
        this.$scope.recvUpdateIsContextServiceAdminAuthorized(true);

        var licenseFeatures = this.$scope.getAccountLicenses();
        this.$scope.setCareService();
        expect(licenseFeatures[0].id).toBe('MS_07bbaaf5-735d-4878-a6ea-d67d69feb1c0');
        expect(licenseFeatures[0].idOperation).toBe('ADD');
        expect(licenseFeatures[1].id).toBe('CDC_da652e7d-cd34-4545-8f23-936b74359afd');
        expect(licenseFeatures[1].idOperation).toBe('ADD');
        expect(this.$scope.careFeatures[1].license.licenseType).toBe('CARE');
        expect(this.$scope.radioStates.careRadio).toBe(this.$scope.careRadioValue.K1);
        expect(this.LogMetricsService.logMetrics.calls.argsFor(0)[1]).toBe('CAREENABLED');
      });

      it('should call LogMetrics service when care None radio button is selected', function () {
        this.$scope.radioStates.msgRadio = true;
        this.$scope.radioStates.initialCareRadioState = this.$scope.careRadioValue.K1;
        this.$scope.radioStates.careRadio = this.$scope.careRadioValue.NONE;
        this.$scope.recvUpdateIsContextServiceAdminAuthorized(true);
        this.$scope.getAccountLicenses();
        expect(this.LogMetricsService.logMetrics.calls.argsFor(0)[1]).toBe('CAREDISABLED');
      });
    });

    describe('Check if multiple licenses (MS, CVC) get assigned correctly', function () {
      beforeEach(function () {
        this.userId = 'dbca1001-ab12-cd34-de56-abcdef123454';
        spyOn(this.Authinfo, 'isInitialized').and.returnValue(true);
        spyOn(this.Authinfo, 'hasAccount').and.returnValue(true);
        spyOn(this.Authinfo, 'getMessageServices').and.returnValue(this.mock.getMessageServices.singleLicense);
        spyOn(this.Authinfo, 'getCareServices').and.returnValue(this.mock.getCareVoiceServices.careVoiceLicense);
        spyOn(this.LogMetricsService, 'logMetrics');
        this.$stateParams.currentUser = {
          licenseID: ['MS_07bbaaf5-735d-4878-a6ea-d67d69feb1c0', 'CVC_va652e7d-cd34-4545-8f23-936b74359afd'],
          entitlements: ['cloud-contact-center', 'contact-center-context', 'cloud-contact-center-inbound-voice'],
          roles: ['spark.synckms'],
          id: this.userId,
        };
      });
      afterEach(function () {
        this.userId = undefined;
      });
      beforeEach(initController);

      it('should call getAccountLicenses and getAccountLicensesForCare correctly', function () {
        this.$scope.radioStates.msgRadio = true;
        this.$scope.controlMsg();
        this.$scope.radioStates.initialCareRadioState = this.$scope.careRadioValue.NONE;
        this.$scope.radioStates.careRadio = this.$scope.careRadioValue.K2;
        this.$scope.recvUpdateIsContextServiceAdminAuthorized(true);

        var licenseFeatures = this.$scope.getAccountLicenses();
        this.$scope.setCareService();
        expect(licenseFeatures[0].id).toBe('MS_07bbaaf5-735d-4878-a6ea-d67d69feb1c0');
        expect(licenseFeatures[0].idOperation).toBe('ADD');
        expect(licenseFeatures[1].id).toBe('CVC_va652e7d-cd34-4545-8f23-936b74359afd');
        expect(licenseFeatures[1].idOperation).toBe('ADD');
        expect(this.$scope.careFeatures[1].license.licenseType).toBe('CARE');
        expect(this.$scope.radioStates.careRadio).toBe(this.$scope.careRadioValue.K2);
        expect(this.LogMetricsService.logMetrics.calls.argsFor(0)[1]).toBe('CAREVOICEENABLED');
      });

      it('should call LogMetrics service when care None radio button is selected', function () {
        this.$scope.radioStates.msgRadio = true;
        this.$scope.radioStates.initialCareRadioState = this.$scope.careRadioValue.K2;
        this.$scope.radioStates.careRadio = this.$scope.careRadioValue.NONE;
        this.$scope.recvUpdateIsContextServiceAdminAuthorized(true);
        this.$scope.getAccountLicenses();
        expect(this.LogMetricsService.logMetrics.calls.argsFor(0)[1]).toBe('CAREVOICEDISABLED');
      });
    });

    describe('checkDnOverlapsSteeringDigit function', function () {
      var userObj;
      beforeEach(initController);
      beforeEach(function () {
        userObj = {
          assignedDn: {
            pattern: '912',
          },
        };
      });

      it('should be true if pattern starts with telephonyInfo.steeringDigit', function () {
        this.$scope.telephonyInfo = {
          steeringDigit: '9',
        };
        expect(this.$scope.checkDnOverlapsSteeringDigit(userObj)).toBe(true);
      });

      it('should be false if pattern does not start with telephonyInfo.steeringDigit', function () {
        this.$scope.telephonyInfo = {
          steeringDigit: '5',
        };
        expect(this.$scope.checkDnOverlapsSteeringDigit(userObj)).toBe(false);
      });

      it('should be false if telephonyInfo has not been initialized', function () {
        this.$scope.telephonyInfo = undefined;
        expect(this.$scope.checkDnOverlapsSteeringDigit(userObj)).toBe(false);
      });
    });
  });

  describe('Tests Named User License: ', function () {
    beforeEach(function () {
      spyOn(this.Authinfo, 'isInitialized').and.returnValue(true);
      spyOn(this.Authinfo, 'hasAccount').and.returnValue(true);
      spyOn(this.Authinfo, 'getConferenceServices').and.returnValue(this.mock.getConferenceServices);
    });
    beforeEach(initController);
    var dataWithNamedUserLicense = { confLic: [{ licenseModel: 'hosts' }] };

    it('The isSharedMeetingsLicense() function should return false for a service that does not have shared Licenses ', function () {
      expect(this.$scope.isSharedMeetingsLicense(dataWithNamedUserLicense)).toEqual(false);
    });

    it('The determineLicenseType() function should return licenseType Named User License string', function () {
      var result = this.$scope.determineLicenseType(dataWithNamedUserLicense);
      expect(result).toEqual('firstTimeWizard.namedLicense');
    });

    it('The generateLicenseTooltip() function should return Named User License tooltip string', function () {
      var result = this.$scope.generateLicenseTooltip(dataWithNamedUserLicense);
      expect(result).toContain('firstTimeWizard.namedLicenseTooltip');
    });

    it('The generateLicenseTranslation() function should return Named User License tooltip string', function () {
      var result = this.$scope.generateLicenseTranslation(dataWithNamedUserLicense);
      expect(result).toEqual('firstTimeWizard.namedLicenseTooltip');
    });
  });

  describe('Tests Shared Meeting License: ', function () {
    beforeEach(function () {
      spyOn(this.Authinfo, 'isInitialized').and.returnValue(true);
      spyOn(this.Authinfo, 'hasAccount').and.returnValue(true);
      spyOn(this.Authinfo, 'getConferenceServices').and.returnValue(this.mock.getConferenceServices);
    });
    beforeEach(initController);
    var dataWithSharedMeetingsLicense = { confLic: [{ licenseModel: 'Cloud Shared Meeting' }] };

    it('The isSharedMeetingsLicense() function should return true for a service that has shared licenses', function () {
      expect(this.$scope.isSharedMeetingsLicense(dataWithSharedMeetingsLicense)).toEqual(true);
    });

    it('The determineLicenseType() function should return licenseType Shared Meeting License string', function () {
      var result = this.$scope.determineLicenseType(dataWithSharedMeetingsLicense);
      expect(result).toEqual('firstTimeWizard.sharedLicense');
    });

    it('The generateLicenseTooltip() function should return Shared Meeting License tooltip string', function () {
      var result = this.$scope.generateLicenseTooltip(dataWithSharedMeetingsLicense);
      expect(result).toContain('firstTimeWizard.sharedLicenseTooltip');
    });

    it('The generateLicenseTranslation() function should return Shared Meeting License tooltip string', function () {
      var result = this.$scope.generateLicenseTranslation(dataWithSharedMeetingsLicense);
      expect(result).toEqual('firstTimeWizard.sharedLicenseTooltip');
    });
  });

  describe('fetch different siteUrl cases ', function () {
    beforeEach(function () {
      spyOn(this.Authinfo, 'isInitialized').and.returnValue(true);
      spyOn(this.Authinfo, 'hasAccount').and.returnValue(true);
      spyOn(this.Authinfo, 'getConferenceServices').and.returnValue(this.mock.getConfCMRServicesDiffCases.conf);
      spyOn(this.Authinfo, 'getCmrServices').and.returnValue(this.mock.getConfCMRServicesDiffCases.cmr);
    });
    beforeEach(initController);

    it('advanced licenses should have 1 record', function () {
      expect(this.$scope.advancedLicenses.length).toEqual(1);
    });

    it('advanced licenses confLic should have 1 record', function () {
      expect(this.$scope.advancedLicenses[0].confLic.length).toEqual(1);
    });

    it('advanced licenses cmrLic should have 1 record', function () {
      expect(this.$scope.advancedLicenses[0].cmrLic.length).toEqual(1);
    });
  });

  describe('opening convert users in the manage users model', function () {
    it('should go to users.manage when gotToManageUsers() is called', function () {
      this.$stateParams.manageUsers = true;
      initController.apply(this);
      this.$scope.$apply();

      expect(this.$scope.manageUsers).toBeTruthy();
      this.$scope.goToManageUsers();
      expect(this.$state.go).toHaveBeenCalledWith('users.manage.picker');
    });
  });

  describe('onBack', function () {
    beforeEach(function () {
      this.$previousState.get.and.returnValue({
        state: {
          name: 'users.manage.emailSuppress',
        },
      });
      installPromiseMatchers();
      initController.apply(this);
    });

    it('should go to users.manage.picker when previous state is users.manage.emailSuppress', function () {
      this.$scope.onBack();
      this.$scope.$apply();
      expect(this.$state.go).toHaveBeenCalledWith('users.manage.picker');
    });
  });

  function initUserShouldAddCall() {
    this.$scope.currentUserEnablesCall = true;
    this.$scope.$apply();
  }

  function initCurrentUser() {
    this.$stateParams.currentUser = {
      userName: 'testUser',
    };
  }

  function initCurrentUserAndController() {
    initCurrentUser.apply(this);
    initController.apply(this);
  }

  function initControllerAndEnableCall() {
    initCurrentUserAndController.apply(this);
    initUserShouldAddCall.apply(this);
  }
});
