'use strict';

//TODO Change module name to "core.user.userRoles"
//DO NOT use export KTEST__MODULAR=true, this module is not self-contrained

describe('Service: UserRoleService:', function () {
  var $http, $httpBackend, Authinfo, Config, UrlConfig, UserRoleService;

  beforeEach(angular.mock.module('Core'));

  beforeEach(inject(function (_$http_, _$httpBackend_, _Authinfo_, _Config_, _UrlConfig_) {
    $http = _$http_;
    $httpBackend = _$httpBackend_;
    Authinfo = _Authinfo_;
    Config = _Config_;
    UrlConfig = _UrlConfig_;

    spyOn(UrlConfig, 'getAdminServiceUrl').and.returnValue('http://fake-atlas-backend-url/');
  }));

  beforeEach(inject(function (_UserRoleService_) {
    UserRoleService = _UserRoleService_;
  }));

  //////////////

  describe('primary functions:', function () {
    beforeEach(function () {
      spyOn(UserRoleService._helpers, 'mkRoleChangePartial').and.callThrough();
      spyOn(UserRoleService._helpers, 'mkRoleChangesList').and.callThrough();
      spyOn(UserRoleService._helpers, 'patchUserWithRoleChanges');
    });

    describe('patchUserWithRoleChangeSpecsList():', function () {
      it('should convert the role changes specs list to list of role change objects and call through to "patchUserWithRoleChanges()"', function () {
        var roleChangesSpecsList = [['fake-role-1', 'fake-role-state-1']];
        var convertedList = [{
          roleName: 'fake-role-1',
          roleState: 'fake-role-state-1',
        }];

        UserRoleService.patchUserWithRoleChangeSpecsList('fake-userName', roleChangesSpecsList);

        expect(UserRoleService._helpers.mkRoleChangesList).toHaveBeenCalledWith(roleChangesSpecsList);
        expect(UserRoleService._helpers.patchUserWithRoleChanges).toHaveBeenCalledWith('fake-userName', convertedList);
      });
    });

    describe('enableSalesAdmin():', function () {
      it('should use "Sales_Admin" and "ACTIVE" to generate an appropriate payload and call through to "patchUserWithRoleChanges()"', function () {
        UserRoleService.enableSalesAdmin('fake-userName');
        expect(UserRoleService._helpers.mkRoleChangePartial).toHaveBeenCalledWith(Config.roles.sales, Config.roleState.active);
        expect(UserRoleService._helpers.patchUserWithRoleChanges).toHaveBeenCalledWith('fake-userName', [{
          roleName: Config.roles.sales,
          roleState: Config.roleState.active,
        }]);
      });
    });

    describe('disableSalesAdmin():', function () {
      it('should use "Sales_Admin" and "INACTIVE" to generate an appropriate payload and call through to "patchUserWithRoleChanges()"', function () {
        UserRoleService.disableSalesAdmin('fake-userName');
        expect(UserRoleService._helpers.mkRoleChangePartial).toHaveBeenCalledWith(Config.roles.sales, Config.roleState.inactive);
        expect(UserRoleService._helpers.patchUserWithRoleChanges).toHaveBeenCalledWith('fake-userName', [{
          roleName: Config.roles.sales,
          roleState: Config.roleState.inactive,
        }]);
      });
    });

    describe('enableFullAdmin():', function () {
      it('should use "Full_Admin", "ACTIVE", and target customer org id to generate an appropriate payload and call through to "patchUserWithRoleChanges()"', function () {
        UserRoleService.enableFullAdmin('fake-userName', 'fake-org-id-1');
        expect(UserRoleService._helpers.mkRoleChangePartial).toHaveBeenCalledWith(Config.roles.full_admin, Config.roleState.active, 'fake-org-id-1');
        expect(UserRoleService._helpers.patchUserWithRoleChanges).toHaveBeenCalledWith('fake-userName', [{
          roleName: Config.roles.full_admin,
          roleState: Config.roleState.active,
          orgId: 'fake-org-id-1',
        }]);
      });
    });

    describe('disableFullAdmin():', function () {
      it('should use "Full_Admin", "INACTIVE", and target customer org id to generate an appropriate payload and call through to "patchUserWithRoleChanges()"', function () {
        UserRoleService.disableFullAdmin('fake-userName', 'fake-org-id-2');
        expect(UserRoleService._helpers.mkRoleChangePartial).toHaveBeenCalledWith(Config.roles.full_admin, Config.roleState.inactive, 'fake-org-id-2');
        expect(UserRoleService._helpers.patchUserWithRoleChanges).toHaveBeenCalledWith('fake-userName', [{
          roleName: Config.roles.full_admin,
          roleState: Config.roleState.inactive,
          orgId: 'fake-org-id-2',
        }]);
      });
    });

    describe('getCCARoles():', function () {
      afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
      });

      it('should return CCA roles and generate correct keys which starts with "CCA_" according role names', function () {
        $httpBackend.expectGET(/.*\/serviceRoles/).respond({
          total: 2,
          data: [
            {
              serviceId: 'cca-portal',
              roles: [
                {
                  name: 'cca-portal.configuration_write',
                  displayName: 'Configuration (Full Privilege)',
                },
                {
                  name: 'cca-portal.configuration_read',
                  displayName: 'Configuration (Read Only)',
                },
              ],
            },
          ],
        });

        var roles = [];
        UserRoleService.getCCARoles().then(function (d) {
          roles = d;
        });
        $httpBackend.flush();
        expect(roles.length).toBe(2);
        expect(roles[0].key).toBe('CCA_Configuration_Write');
        expect(roles[1].key).toBe('CCA_Configuration_Read');
      });
    });
  });

  describe('helper functions:', function () {
    describe('getUsersRolesUrl():', function () {
      it('should return an atlas backend url using the org id provided', function () {
        expect(UserRoleService._helpers.getUsersRolesUrl({ orgId: 'fake-org-id-1' }))
          .toBe('http://fake-atlas-backend-url/organization/fake-org-id-1/users/roles');
      });
    });

    describe('getOrgServiceRolesUrl():', function () {
      it('should return an atlas backend url using the org id provided', function () {
        expect(UserRoleService._helpers.getOrgServiceRolesUrl({ orgId: 'fake-org-id-1' }))
          .toBe('http://fake-atlas-backend-url/organization/fake-org-id-1/serviceRoles');
      });
    });

    describe('toCCARoleName():', function () {
      it('should convert role name correctly', function () {
        expect(UserRoleService._helpers.toCCARoleName('cca-portal.configuration_write')).toBe('CCA_Configuration_Write');
      });
    });

    describe('toCCARoleTooltip():', function () {
      it('should get CCA role tooltip according to description correctly', function () {
        var roleDescription = 'Search for possible fraudulent meetings only';
        expect(UserRoleService._helpers.toCCARoleTooltip(roleDescription)).toBe(roleDescription);

        var roleDescriptionWithSemicolon = 'View and submit telephony; View CCA reports';
        expect(UserRoleService._helpers.toCCARoleTooltip(roleDescriptionWithSemicolon)).toContain('<ul');
      });
    });

    describe('mkRoleChangePartial():', function () {
      it('should return an object with "roleName" and "roleState" properties set', function () {
        expect(UserRoleService._helpers.mkRoleChangePartial('fake-role-1', 'fake-role-state-1'))
          .toEqual({
            roleName: 'fake-role-1',
            roleState: 'fake-role-state-1',
          });
      });

      it('should also include an "orgId" property if also passed in', function () {
        expect(UserRoleService._helpers.mkRoleChangePartial('fake-role-2', 'fake-role-state-2', 'fake-org-id-2'))
          .toEqual({
            roleName: 'fake-role-2',
            roleState: 'fake-role-state-2',
            orgId: 'fake-org-id-2',
          });
      });
    });

    describe('mkRoleChangesList():', function () {
      it('should map a call to "mkRoleChangePartial()" for each element of the list and return the result', function () {
        var roleChangeSpecsList = [];
        roleChangeSpecsList.push(['fake-role-1', 'fake-role-state-1']);
        roleChangeSpecsList.push(['fake-role-2', 'fake-role-state-2']);
        roleChangeSpecsList.push(['fake-role-3', 'fake-role-state-3', 'fake-org-id-3']);

        spyOn(UserRoleService._helpers, 'mkRoleChangePartial').and.callThrough();

        expect(UserRoleService._helpers.mkRoleChangesList(roleChangeSpecsList)).toEqual([
          {
            roleName: 'fake-role-1',
            roleState: 'fake-role-state-1',
          },
          {
            roleName: 'fake-role-2',
            roleState: 'fake-role-state-2',
          },
          {
            roleName: 'fake-role-3',
            roleState: 'fake-role-state-3',
            orgId: 'fake-org-id-3',
          },
        ]);

        expect(UserRoleService._helpers.mkRoleChangePartial.calls.count()).toBe(3);
      });
    });

    describe('mkPayload():', function () {
      it('return an object appropriate for PATCHing for a given user and given role changes', function () {
        var roleChanges = [
          {
            roleName: 'fake-role-1',
            roleState: 'fake-role-state-1',
          },
          {
            roleName: 'fake-role-3',
            roleState: 'fake-role-state-3',
            orgId: 'fake-org-id-3',
          },
        ];

        expect(UserRoleService._helpers.mkPayload('fake-userName', roleChanges)).toEqual({
          users: [{
            email: 'fake-userName',
            userRoles: roleChanges,
          }],
        });
      });
    });

    describe('patchUserWithRoleChanges():', function () {
      it('should convert the list of role change objects to an appropriate payload and call through to "patch()"', function () {
        var roleChanges = [{
          roleName: 'fake-role-1',
          roleState: 'fake-role-state-1',
        }];
        var convertedPayload = {
          users: [{
            email: 'fake-userName',
            userRoles: roleChanges,
          }],
        };
        spyOn(UserRoleService._helpers, 'mkPayload').and.callThrough();
        spyOn(UserRoleService._helpers, 'patch');

        UserRoleService._helpers.patchUserWithRoleChanges('fake-userName', roleChanges);

        expect(UserRoleService._helpers.mkPayload).toHaveBeenCalledWith('fake-userName', roleChanges);
        expect(UserRoleService._helpers.patch).toHaveBeenCalledWith(convertedPayload);
      });
    });

    describe('patch():', function () {
      it('should PATCH an atlas backend url with the payload provided', function () {
        var expectedUrl = 'http://fake-atlas-backend-url/organization/fake-org-id-1/users/roles';
        var fakePayload = {
          foo: 'bar',
        };

        spyOn(Authinfo, 'getOrgId').and.returnValue('fake-org-id-1');
        spyOn(UserRoleService._helpers, 'getUsersRolesUrl').and.returnValue('http://fake-atlas-backend-url/organization/fake-org-id-1/users/roles');
        spyOn($http, 'patch');

        UserRoleService._helpers.patch({ foo: 'bar' });

        expect(Authinfo.getOrgId.calls.count()).toBe(1);
        expect(UserRoleService._helpers.getUsersRolesUrl).toHaveBeenCalledWith({ orgId: 'fake-org-id-1' });
        expect($http.patch).toHaveBeenCalledWith(expectedUrl, fakePayload);
      });
    });
  });
});
