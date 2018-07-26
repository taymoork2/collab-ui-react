'use strict';

var testModule = require('./authinfo');

describe('Authinfo:', function () {
  var injector, Service;
  var defaultConfig;
  var defaultUser;

  beforeEach(function () {
    angular.mock.module(testModule);
    inject(function ($injector) {
      injector = $injector;
    });
    Service = function () {
      return injector.get('Authinfo');
    };

    defaultConfig = {
      restrictedStates: {
        customer: [],
        partner: [],
      },
      publicStates: [],
      ciscoOnly: [],
      ciscoOrgId: '',
      ciscoMockOrgId: '',
      roleStates: {},
      serviceStates: {},
    };

    defaultUser = {
      name: 'Test',
      orgId: 'abc',
      orgName: 'DEADBEEF',
      addUserEnabled: false,
      entitleUserEnabled: false,
      services: [],
      roles: [],
      managedOrgs: [],
      setupDone: true,
    };
  });

  afterEach(function () {
    injector = Service = defaultConfig = defaultUser = undefined;
  });

  describe('initialization', function () {
    beforeEach(function () {
      this.Authinfo = setupUser({
        managedOrgs: undefined,
        roles: undefined,
        services: undefined,
      });
    });

    it('should set empty arrays if initial collections are undefined', function () {
      expect(this.Authinfo.getManagedOrgs()).toEqual([]);
      expect(this.Authinfo.getRoles()).toEqual([]);
      expect(this.Authinfo.getServices()).toEqual([]);
    });
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
          CO: 'onboardModal.communication',
        },
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

  describe('managing entitlements (aka. "services"):', function () {
    var Authinfo, fakeEntitlement;

    beforeEach(function () {
      Authinfo = setupUser();
      fakeEntitlement = {
        ciName: 'fake-entitlement-1',
      };
    });

    afterEach(function () {
      Authinfo = fakeEntitlement = undefined;
    });

    describe('addEntitlement():', function () {
      it('should add an entitlement', function () {
        expect(Authinfo.getServices().length).toBe(0);
        Authinfo.addEntitlement(fakeEntitlement);
        expect(Authinfo.getServices().length).toBe(1);

        // adding an entitlement that already exists does nothing
        Authinfo.addEntitlement(fakeEntitlement);
        expect(Authinfo.getServices().length).toBe(1);
      });
    });

    describe('removeEntitlement():', function () {
      it('should remove an entitlement', function () {
        Authinfo.addEntitlement(fakeEntitlement);
        expect(Authinfo.getServices().length).toBe(1);
        Authinfo.removeEntitlement('fake-entitlement-1');
        expect(Authinfo.getServices().length).toBe(0);

        // removing an entitlement that isn't present IS allowed, just does nothing
        var result = Authinfo.removeEntitlement('fake-entitlement-1');
        expect(result).toBe(undefined);
        expect(Authinfo.getServices().length).toBe(0);
      });
    });
  });

  describe('getMessageServices():', function () {
    var Authinfo, accountData, result, fakeLicenseNonMessaging, fakeLicenseMs, fakeLicenseMsgr;

    beforeEach(function () {
      Authinfo = setupUser();
      accountData = {};
      _.set(accountData, 'customers[0].licenses', []);
      result = undefined;
      fakeLicenseNonMessaging = {
        licenseType: 'not-MESSAGING',
        offerName: 'fake-offer-name',
      };
      fakeLicenseMs = {
        licenseType: 'MESSAGING',
        offerName: 'MS',
      };
      fakeLicenseMsgr = {
        licenseType: 'MESSAGING',
        offerName: 'MSGR',
      };
    });

    afterEach(function () {
      Authinfo = accountData = result = fakeLicenseNonMessaging = fakeLicenseMs = fakeLicenseMsgr = undefined;
    });

    it('should return the list of services with licenses that are of "MESSAGING"-type', function () {
      accountData.customers[0].licenses.push(fakeLicenseNonMessaging);
      Authinfo.updateAccountInfo(accountData);
      result = Authinfo.getMessageServices();
      expect(result).toBe(null);

      accountData.customers[0].licenses.push(fakeLicenseMsgr);
      Authinfo.updateAccountInfo(accountData);
      result = Authinfo.getMessageServices();
      expect(result.length).toBe(1);

      accountData.customers[0].licenses.push(fakeLicenseMs);
      Authinfo.updateAccountInfo(accountData);
      result = Authinfo.getMessageServices();
      expect(result.length).toBe(2);
    });

    it('should return the list of services with licenses that are of "MESSAGING"-type and not "MSGR" offer code', function () {
      accountData.customers[0].licenses.push(fakeLicenseNonMessaging);
      Authinfo.updateAccountInfo(accountData);
      result = Authinfo.getMessageServices({ assignableOnly: true });
      expect(result).toBe(null);

      accountData.customers[0].licenses.push(fakeLicenseMs);
      Authinfo.updateAccountInfo(accountData);
      result = Authinfo.getMessageServices({ assignableOnly: true });
      expect(result.length).toBe(1);

      accountData.customers[0].licenses.push(fakeLicenseMsgr);
      Authinfo.updateAccountInfo(accountData);
      result = Authinfo.getMessageServices({ assignableOnly: true });
      expect(result.length).toBe(1);
    });
  });

  describe('isExternallyManagedLicense():', function () {
    it('should return true if the "offerName" property is "MSGR"', function () {
      var Authinfo = setupUser();
      var result = Authinfo.isExternallyManagedLicense({ offerName: 'MSGR' });
      expect(result).toBe(true);
      result = Authinfo.isExternallyManagedLicense({ offerName: 'something-else' });
      expect(result).toBe(false);
    });
  });

  describe('.isReadOnlyState', function () {
    it('should return true if the state is allowed with a user role', function () {
      setupConfig({
        readOnlyViewStates: {
          User_Admin: [
            'settings',
          ],
        },
      });

      var Authinfo = setupUser({
        roles: ['User_Admin'], // OR PARTNER_USER
      });

      expect(Authinfo.isReadOnlyState('settings')).toBe(true);
    });

    it('should return false if the state is not in the allowed states under role list', function () {
      setupConfig({
        readOnlyViewStates: {
          User_Admin: [
            'settings',
          ],
        },
      });

      var Authinfo = setupUser({
        roles: ['User_Admin'], // OR PARTNER_USER
      });

      expect(Authinfo.isReadOnlyState('helpdesk')).toBe(false);
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
        publicStates: ['blah'],
      });

      var Authinfo = setupUser();

      expect(Authinfo.isAllowedState('blah')).toBe(true);
    });

    it('should return false if the state is part of the restricted states for partners and the user has a partner role', function () {
      setupConfig({
        restrictedStates: {
          customer: [],
          partner: ['blah'],
        },
        publicStates: ['blob', 'blah'],
      });

      var Authinfo = setupUser({
        roles: ['PARTNER_ADMIN'], // OR PARTNER_USER
      });

      expect(Authinfo.isAllowedState('blob')).toBe(true);
      expect(Authinfo.isAllowedState('blah')).toBe(false);
    });

    it('should return true even if it is a partner user role, if it is a user/device admin and the state is allowed by that partial role', function () {
      var Authinfo = setupUser({
        roles: ['PARTNER_USER', 'Device_Admin', 'User_Admin'],
      });

      expect(Authinfo.isAllowedState('users')).toBe(true);
      expect(Authinfo.isAllowedState('devices')).toBe(true);
      expect(Authinfo.isAllowedState('places')).toBe(true);
      expect(Authinfo.isAllowedState('support')).toBe(false);
    });

    it('should return false if it is a partner user role, if it also has a Support Admin role and is restricted from the partner view', function () {
      var Authinfo = setupUser({
        roles: ['PARTNER_USER', 'Support'],
      });

      expect(Authinfo.isAllowedState('overview')).toBe(false);
      expect(Authinfo.isAllowedState('support')).toBe(true);
    });

    it('should return true for support if a user is a partial admin with helpdesk access', function () {
      var Authinfo = setupUser({
        roles: ['User_Admin', 'Device_Admin', 'Help_Desk'],
      });

      expect(Authinfo.isAllowedState('reports')).toBe(false);
      expect(Authinfo.isAllowedState('support')).toBe(true);
    });

    it('if it is a Provision_Admin, it should return true for some states and false for devices related states', function () {
      var Authinfo = setupUser({
        roles: ['Provision_Admin'],
      });

      expect(Authinfo.isAllowedState('firsttimewizard')).toBe(true);
      expect(Authinfo.isAllowedState('overview')).toBe(true);
      expect(Authinfo.isAllowedState('users')).toBe(true);
      expect(Authinfo.isAllowedState('services-overview')).toBe(true);
      expect(Authinfo.isAllowedState('settings')).toBe(true);
      expect(Authinfo.isAllowedState('places')).toBe(false);
      expect(Authinfo.isAllowedState('devices')).toBe(false);
    });

    it('should return false if the state is part of the restricted states for customers and the user has not a partner role', function () {
      setupConfig({
        restrictedStates: {
          customer: ['blah'],
          partner: [],
        },
        publicStates: ['blob', 'blah'],
      });

      var Authinfo = setupUser({
        roles: ['pokemon'], // definitely not a partner role
      });

      expect(Authinfo.isAllowedState('blob')).toBe(true);
      expect(Authinfo.isAllowedState('blah')).toBe(false);
    });

    it('should return true if the state is Cisco-only and the user is part of Cisco', function () {
      setupConfig({
        ciscoOnly: ['blah'],
        ciscoOrgId: '123',
        ciscoMockOrgId: '456',
      });

      var Authinfo = setupUser({
        orgId: '123',
      });

      expect(Authinfo.isAllowedState('blah')).toBe(true);

      //////// Mock Org

      Authinfo = setupUser({
        orgId: '456',
      });

      expect(Authinfo.isAllowedState('blah')).toBe(true);
    });

    it('should return true if the state is part of one role of the user', function () {
      setupConfig({
        roleStates: {
          A_Role: [
            'blah',
          ],
        },
      });

      var Authinfo = setupUser({
        roles: ['A_Role'],
      });

      expect(Authinfo.isAllowedState('blah')).toBe(true);
    });

    it('should return true if the state is part of one service of the user', function () {
      setupConfig({
        serviceStates: {
          'le-service': [
            'blah',
          ],
        },
      });

      var Authinfo = setupUser({
        services: [{
          // we don't care about the other service properties
          ciName: 'le-service',
        }],
      });

      expect(Authinfo.isAllowedState('blah')).toBe(true);
    });

    it('should only care about the parent state', function () {
      setupConfig({
        publicStates: ['blah'],
      });

      var Authinfo = setupUser();

      expect(Authinfo.isAllowedState('blah.subblah')).toBe(true);
    });

    it('should return true if user is in delegated administration org', function () {
      setupConfig();
      var Authinfo = setupUser({
        isInDelegatedAdministrationOrg: true,
      });
      expect(Authinfo.isInDelegatedAdministrationOrg()).toBe(true);
    });

    it('should return true if user is part of Cisco Mock Org', function () {
      setupConfig({
        ciscoOnly: ['blah'],
        ciscoMockOrgId: '4567',
      });

      var Authinfo = setupUser({
        orgId: '4567',
      });

      expect(Authinfo.isCiscoMock()).toBe(true);
    });

    it('should return true if the parentState is support and the user is help desk and compliance user only', function () {
      setupConfig();

      var Authinfo = setupUser({
        roles: ['Help_Desk', 'Compliance_User'],
      });

      expect(Authinfo.isAllowedState('support')).toBe(true);
    });
  });

  describe('should return for partial admin roles only when those roles are present', function () {
    it('should not return true for isUserAdminUser or isDeviceAdminUser when user is Full_Admin', function () {
      setupConfig();
      var Authinfo = setupUser({
        roles: ['Full_Admin'],
      });
      expect(Authinfo.isUserAdminUser()).toBe(false);
      expect(Authinfo.isDeviceAdminUser()).toBe(false);
    });

    it('should return true for isUserAdminUser when user is User_Admin', function () {
      setupConfig();
      var Authinfo = setupUser({
        roles: ['User_Admin'],
      });
      expect(Authinfo.isUserAdminUser()).toBe(true);
      expect(Authinfo.isDeviceAdminUser()).toBe(false);
    });

    it('should return true for isDeviceAdminUser when user is Device_Admin', function () {
      setupConfig();
      var Authinfo = setupUser({
        roles: ['Device_Admin'],
      });
      expect(Authinfo.isDeviceAdminUser()).toBe(true);
      expect(Authinfo.isUserAdminUser()).toBe(false);
    });
  });


  describe('isPartialAdmin', function () {
    it('should return false when the user is a full admin', function () {
      setupConfig();
      var Authinfo = setupUser({
        roles: ['Full_Admin'],
      });
      expect(Authinfo.isPartialAdmin()).toEqual(false);
    });

    it('should return true when the user is a device admin', function () {
      setupConfig();
      var Authinfo = setupUser({
        roles: ['Device_Admin'],
      });
      expect(Authinfo.isPartialAdmin()).toEqual(true);
    });

    it('should return true when the user is a support admin', function () {
      setupConfig();
      var Authinfo = setupUser({
        roles: ['Support'],
      });
      expect(Authinfo.isPartialAdmin()).toEqual(true);
    });

    it('should return true when the user is a user admin', function () {
      setupConfig();
      var Authinfo = setupUser({
        roles: ['User_Admin'],
      });
      expect(Authinfo.isPartialAdmin()).toEqual(true);
    });
  });

  describe('customer with CONFERENCING license', function () {
    var accountData = {
      customers: [{
        customerId: '1',
        customerName: 'Atlas_Test_1',
        licenses: [{
          licenseType: 'CONFERENCING',
          siteUrl: 'whatever',
        }],
      }],
    };

    it('is patched with Site_Admin role if customer has full admin role.', function () {
      var Authinfo = setupUser({
        roles: ['Full_Admin'],
      });
      Authinfo.updateAccountInfo(accountData);
      expect(Authinfo.getRoles()).toEqual(['Full_Admin', 'Site_Admin']);
    });

    it('is patched with Site_Admin role if customer has read only admin role.', function () {
      var Authinfo = setupUser({
        roles: ['Readonly_Admin'],
      });
      Authinfo.updateAccountInfo(accountData);
      expect(Authinfo.getRoles()).toEqual(['Readonly_Admin', 'Site_Admin']);
    });
  });

  describe('customer with CONFERENCING and linkedSiteUrl', function () {
    var accountData = {
      customers: [{
        customerId: '1',
        customerName: 'Atlas_Test_2',
        licenses: [{
          licenseType: 'CONFERENCING',
          linkedSiteUrl: 'www.abc.com',
        }],
      }],
    };

    it('have linked site conference service', function () {
      var Authinfo = setupUser({
        roles: ['Full_Admin'],
      });
      Authinfo.updateAccountInfo(accountData);
      expect(Authinfo.getConferenceServicesWithLinkedSiteUrl()).toBeTruthy();
      expect(Authinfo.getConferenceServicesWithLinkedSiteUrl().length).toBe(1);
    });

    it('is patched with Site_Admin role if customer has full admin role.', function () {
      var Authinfo = setupUser({
        roles: ['Full_Admin'],
      });
      Authinfo.updateAccountInfo(accountData);
      expect(Authinfo.getRoles()).toEqual(['Full_Admin', 'Site_Admin']);
    });

    it('is patched with Site_Admin role if customer has read only admin role.', function () {
      var Authinfo = setupUser({
        roles: ['Readonly_Admin'],
      });
      Authinfo.updateAccountInfo(accountData);
      expect(Authinfo.getRoles()).toEqual(['Readonly_Admin', 'Site_Admin']);
    });
  });

  describe('customer with communication license', function () {
    var accountData = getJSONFixture('core/json/authInfo/customer_comm_License.json');

    it('gets the correct partner Id and customer admin Email.', function () {
      var Authinfo = setupUser();
      Authinfo.updateAccountInfo(accountData);
      expect(Authinfo.getCommPartnerOrgId()).toEqual(accountData.customers[0].licenses[0].partnerOrgId);
      expect(Authinfo.getCustomerAdminEmail()).toEqual(accountData.customers[0].customerAdminEmail);
    });

    it('gets the correct org id based on customer.', function () {
      var Authinfo = setupUser({
        roles: ['FULL_ADMIN'],
      });
      Authinfo.updateAccountInfo(accountData);
      expect(Authinfo.getCallPartnerOrgId()).toEqual(accountData.customers[0].licenses[0].partnerOrgId);
    });

    it('gets the correct org id based partner through the customer portal.', function () {
      var Authinfo = setupUser({
        roles: ['FULL_ADMIN'],
      });
      //Partners do not have licenses set
      accountData.customers[0].licenses = [];
      Authinfo.updateAccountInfo(accountData);
      expect(Authinfo.getCallPartnerOrgId()).toEqual(defaultUser.orgId);
    });
  });

  describe('Online customer', function () {
    var Authinfo;

    beforeEach(function () {
      Authinfo = setupUser();
      var accountData = {
        customers: [{
          customerId: '1',
          customerType: 'Online',
        }, {
          customerId: '2',
          customerType: 'Online',
        }],
      };
      Authinfo.updateAccountInfo(accountData);
    });

    it('isOnlineCustomer should return true if any customer is Online', function () {
      expect(Authinfo.isOnlineCustomer()).toBe(true);
    });

    it('isOnlineOnlyCustomer should return true if all customers are Online', function () {
      expect(Authinfo.isOnlineOnlyCustomer()).toBe(true);
    });
  });

  describe('Online and Enterprise customer', function () {
    var Authinfo;

    beforeEach(function () {
      Authinfo = setupUser();
      var accountData = {
        customers: [{
          customerId: '1',
          customerType: 'Online',
        }, {
          customerId: '2',
          customerType: 'Enterprise',
        }],
      };
      Authinfo.updateAccountInfo(accountData);
    });

    it('isOnlineCustomer should return true if any customer is Online', function () {
      expect(Authinfo.isOnlineCustomer()).toBe(true);
    });

    it('isOnlineOnlyCustomer should return false if some customerss are not Online', function () {
      expect(Authinfo.isOnlineOnlyCustomer()).toBe(false);
    });
  });

  describe('Online trial customer', function () {
    var Authinfo;

    beforeEach(function () {
      Authinfo = setupUser();
      var accountData = {
        customers: [{
          customerId: '1',
          customerType: 'Online',
          subscriptions: [{
            orderingTool: 'CISCO_ONLINE_OPC',
            licenses: [{
              licenseType: 'CONFERENCING',
              linkedSiteUrl: 'www.abc.com',
            }],
          }],
        }],
      };
      Authinfo.updateAccountInfo(accountData);
    });

    it('isOnlinePaid should return false if Online customer has a trial subscription', function () {
      expect(Authinfo.isOnlinePaid()).toBe(false);
    });
  });

  describe('Online paid customer', function () {
    var Authinfo;

    beforeEach(function () {
      Authinfo = setupUser();
      var accountData = {
        customers: [{
          customerId: '1',
          customerType: 'Online',
          subscriptions: [{
            orderingTool: 'DIGITAL_RIVER',
            licenses: [{
              licenseType: 'CONFERENCING',
              linkedSiteUrl: 'www.abc.com',
            }],
          }],
        }],
      };
      Authinfo.updateAccountInfo(accountData);
    });

    it('isOnlinePaid should return true if Online customer has a paid subscription', function () {
      expect(Authinfo.isOnlinePaid()).toBe(true);
    });
  });

  describe('Online customer converted to partner sales admin', function () {
    var Authinfo;

    beforeEach(function () {
      Authinfo = setupUser({
        roles: ['PARTNER_SALES_ADMIN'],
      });
      var accountData = {
        customers: [{
          customerId: '1',
          customerType: 'Online',
        }],
      };
      Authinfo.updateAccountInfo(accountData);
    });

    it('isOnline should return false if customer is a partner', function () {
      expect(Authinfo.isOnline()).toBe(false);
    });
  });

  it('isPremium should return false when there are no premium licenses', function () {
    var Authinfo = setupUser();
    var accountData = {};
    _.set(accountData, 'customers[0].licenses', []);
    expect(Authinfo.isPremium()).toBeFalsy();
  });

  it('isPremium should return true when there is a premium license', function () {
    var Authinfo = setupUser();
    var accountData = {};
    _.set(accountData, 'customers[0].licenses', [{
      offerName: 'MGMTPRO',
    }]);
    Authinfo.updateAccountInfo(accountData);
    expect(Authinfo.isPremium()).toBeTruthy();
  });

  function setupConfig(override) {
    override = override || {};
    var Config = injector.get('Config');
    _.assign(Config, defaultConfig, override);
  }

  function setupUser(override) {
    override = override || {};
    var Authinfo = Service();
    var userData = _.assign({}, defaultUser, override);
    Authinfo.initialize(userData);
    return Authinfo;
  }
});
