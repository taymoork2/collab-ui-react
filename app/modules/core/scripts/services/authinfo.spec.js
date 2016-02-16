'use strict';

describe('Authinfo', function () {
  var provide, injector, Service;

  describe('.isAllowedState', function () {
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
      module('Core', function ($provide) {
        provide = $provide;
      });
      inject(function ($injector) {
        injector = $injector;
      });
      Service = function () {
        return injector.get('Authinfo');
      };
    });

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

    function setupConfig(override) {
      override = override || {};
      var configMock = angular.extend({}, defaultConfig, override);
      provide.value('Config', configMock);
    }

    function setupUser(override) {
      override = override || {};
      var Authinfo = Service();
      var userData = angular.extend({}, defaultUser, override);
      Authinfo.initialize(userData);
      return Authinfo;
    }
  });
});
