'use strict';

describe('Authinfo:', function () {
  var provide, injector, Service;

  var defaultConfig = {
    restrictedStates: {
      customer: [],
      partner: []
    },
    publicStates: [],
    ciscoOnly: [],
    ciscoOrgId: '',
    ciscoMockOrgId: '',
    roleStates: {},
    serviceStates: {}
  };
  var defaultUser = {
    name: 'Test',
    orgId: 'abc',
    orgName: 'DEADBEEF',
    addUserEnabled: false,
    entitleUserEnabled: false,
    services: [],
    roles: [],
    managedOrgs: [],
    setupDone: true
  };

  beforeEach(function () {
    angular.mock.module('Core', function ($provide) {
      provide = $provide;
    });
    inject(function ($injector) {
      injector = $injector;
    });
    Service = function () {
      return injector.get('Authinfo');
    };
  });

  describe('getLicenseIsTrial():', function () {
    var Authinfo, accountData;
    beforeEach(function () {
      setupConfig({
        confMap: {
          MS: 'onboardModal.paidMsg',
          CF: 'onboardModal.paidConf',
          EE: 'onboardModal.enterpriseEdition',
          MC: 'onboardModal.meetingCenter',
          SC: 'onboardModal.supportCenter',
          TC: 'onboardModal.trainingCenter',
          EC: 'onboardModal.eventCenter',
          CO: 'onboardModal.communication'
        }
      });
      Authinfo = setupUser();

      accountData = getJSONFixture('core/json/authInfo/msg_mtg_comm_Licenses.json');
    });

    it('should return true if license isTrial is true', function () {
      Authinfo.updateAccountInfo(accountData);
      var response = Authinfo.getLicenseIsTrial('COMMUNICATION', 'ciscouc');
      expect(response).toBe(true);
    });

    it('should return false if license isTrial is false', function () {
      Authinfo.updateAccountInfo(accountData);
      var response = Authinfo.getLicenseIsTrial('CONFERENCING');
      expect(response).toBe(false);
    });

    it('should return undefined if licenseType is not found', function () {
      Authinfo.updateAccountInfo(accountData);
      var response = Authinfo.getLicenseIsTrial('BOGUS');
      expect(response).not.toBeDefined();
    });

    it('should return undefined if entitlement is not found', function () {
      Authinfo.updateAccountInfo(accountData);
      var response = Authinfo.getLicenseIsTrial('COMMUNICATION', 'bogus');
      expect(response).not.toBeDefined();
    });

    it('should return undefined if no licenseType is provided', function () {
      Authinfo.updateAccountInfo(accountData);
      var response = Authinfo.getLicenseIsTrial();
      expect(response).not.toBeDefined();
    });
  });

  describe('.isAllowedState', function () {
    it('should return false is the state is not defined and simple user', function () {
      setupConfig();

      var Authinfo = setupUser();

      expect(Authinfo.isAllowedState(undefined)).toBe(false);
    });

    it('should return true if the state is an in publicStates', function () {
      setupConfig({
        publicStates: ['blah']
      });

      var Authinfo = setupUser();

      expect(Authinfo.isAllowedState('blah')).toBe(true);
    });

    it('should return false if the state is part of the restricted states for partners and the user has a partner role', function () {
      setupConfig({
        restrictedStates: {
          customer: [],
          partner: ['blah']
        },
        publicStates: ['blob', 'blah']
      });

      var Authinfo = setupUser({
        roles: ['PARTNER_ADMIN'] // OR PARTNER_USER
      });

      expect(Authinfo.isAllowedState('blob')).toBe(true);
      expect(Authinfo.isAllowedState('blah')).toBe(false);
    });

    it('should return false if the state is part of the restricted states for customers and the user has not a partner role', function () {
      setupConfig({
        restrictedStates: {
          customer: ['blah'],
          partner: []
        },
        publicStates: ['blob', 'blah']
      });

      var Authinfo = setupUser({
        roles: ['pokemon'] // definitely not a partner role
      });

      expect(Authinfo.isAllowedState('blob')).toBe(true);
      expect(Authinfo.isAllowedState('blah')).toBe(false);
    });

    it('should return true if the state is Cisco-only and the user is part of Cisco', function () {
      setupConfig({
        ciscoOnly: ['blah'],
        ciscoOrgId: '123',
        ciscoMockOrgId: '456'
      });

      var Authinfo = setupUser({
        orgId: '123'
      });

      expect(Authinfo.isAllowedState('blah')).toBe(true);

      //////// Mock Org

      Authinfo = setupUser({
        orgId: '456'
      });

      expect(Authinfo.isAllowedState('blah')).toBe(true);
    });

    it('should return true if the state is part of one role of the user', function () {
      setupConfig({
        roleStates: {
          A_Role: [
            'blah'
          ]
        }
      });

      var Authinfo = setupUser({
        roles: ['A_Role']
      });

      expect(Authinfo.isAllowedState('blah')).toBe(true);
    });

    it('should return true if the state is part of one service of the user', function () {
      setupConfig({
        serviceStates: {
          'le-service': [
            'blah'
          ]
        }
      });

      var Authinfo = setupUser({
        services: [{
          // we don't care about the other service properties
          ciName: 'le-service'
        }]
      });

      expect(Authinfo.isAllowedState('blah')).toBe(true);
    });

    it('should only care about the parent state', function () {
      setupConfig({
        publicStates: ['blah']
      });

      var Authinfo = setupUser();

      expect(Authinfo.isAllowedState('blah.subblah')).toBe(true);
    });

    it('should return true if user is in delegated administration org', function () {
      setupConfig();
      var Authinfo = setupUser({
        isInDelegatedAdministrationOrg: true
      });
      expect(Authinfo.isInDelegatedAdministrationOrg()).toBe(true);
    });

    it('should return true if user is part of Cisco Mock Org', function () {
      setupConfig({
        ciscoOnly: ['blah'],
        ciscoMockOrgId: '4567'
      });

      var Authinfo = setupUser({
        orgId: '4567'
      });

      expect(Authinfo.isCiscoMock()).toBe(true);
    });
  });

  describe('customer with CONFERENCING license', function () {
    var accountData = {
      "customers": [{
        "customerId": "1",
        "customerName": "Atlas_Test_1",
        "licenses": [{
          "licenseType": "CONFERENCING",
          "siteUrl": "whatever"
        }]
      }]
    };

    it('is patched with Site_Admin role if customer has full admin role.', function () {
      var Authinfo = setupUser({
        roles: ['Full_Admin']
      });
      var a = Authinfo.updateAccountInfo(accountData);
      expect(Authinfo.getRoles()).toEqual(["Full_Admin", "Site_Admin"]);
    });

    it('is patched with Site_Admin role if customer has read only admin role.', function () {
      var Authinfo = setupUser({
        roles: ['Readonly_Admin']
      });
      var a = Authinfo.updateAccountInfo(accountData);
      expect(Authinfo.getRoles()).toEqual(["Readonly_Admin", "Site_Admin"]);
    });
  });

  function setupConfig(override) {
    override = override || {};
    var Config = injector.get('Config');
    angular.extend(Config, defaultConfig, override);
  }

  function setupUser(override) {
    override = override || {};
    var Authinfo = Service();
    var userData = angular.extend({}, defaultUser, override);
    Authinfo.initialize(userData);
    return Authinfo;
  }
});
