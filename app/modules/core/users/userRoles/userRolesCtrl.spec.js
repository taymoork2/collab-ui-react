'use strict';

//TODO Change module name to "core.user.userRoles"
//DO NOT use export KTEST__MODULAR=true, this module is not self-contrained

describe('Controller: UserRolesCtrl', function () {
  var $q, $rootScope, $scope, $state, $stateParams, $translate, Analytics, Auth, Authinfo, Config, $controller, controller, EdiscoveryService, FeatureToggleService, Log, Notification, Orgservice, ProPackService, SessionStorage, UserRoleService, Userservice;
  var fakeUserJSONFixture = getJSONFixture('core/json/sipTestFakeUser.json');
  var careUserJSONFixture = getJSONFixture('core/json/users/careTestFakeUser.json');
  var currentUser = fakeUserJSONFixture.fakeUser1;

  beforeEach(angular.mock.module('Core'));

  beforeEach(inject(function (_$controller_, _$q_, _$rootScope_, _$state_, _$stateParams_, _$translate_, _Analytics_, _Auth_, _Authinfo_, _Config_, _FeatureToggleService_, _Log_, _Notification_, _ProPackService_, _SessionStorage_, _UserRoleService_) {
    $rootScope = _$rootScope_;
    $scope = $rootScope.$new();
    $q = _$q_;
    $state = _$state_;
    $stateParams = _$stateParams_;

    $stateParams.currentUser = currentUser;
    $translate = _$translate_;
    Config = _Config_;
    $controller = _$controller_;
    Analytics = _Analytics_;
    Auth = _Auth_;
    Authinfo = _Authinfo_;
    FeatureToggleService = _FeatureToggleService_;
    Log = _Log_;
    Notification = _Notification_;
    ProPackService = _ProPackService_;
    SessionStorage = _SessionStorage_;
    UserRoleService = _UserRoleService_;

    Userservice = {
      patchUserRoles: _.noop,
      updateUserProfile: _.noop,
    };

    spyOn(Userservice, 'patchUserRoles').and.callFake(function () {
      return $q.resolve({ data: { userResponse: [currentUser] } });
    });

    spyOn(Userservice, 'updateUserProfile').and.callFake(function () {
      return $q.resolve({ data: currentUser });
    });
    spyOn(Analytics, 'trackPremiumEvent').and.returnValue($q.resolve({}));
    spyOn(Authinfo, 'getOrgId').and.returnValue('we23f24-4f3f4f-cc7af705-6583-32r3r23r');
    spyOn(Authinfo, 'getUserId').and.returnValue('cc7af705-6583-4f58-b0b6-ea75df64da7e');

    spyOn(UserRoleService, 'getCCARoles').and.returnValue($q.resolve([
      {
        key: 'CCA_Configuration_Write',
        name: 'cca-portal.configuration_write',
        displayName: 'Configuration (Full Privilege)',
      },
    ]));

    Orgservice = {
      getOrgCacheOption: _.noop,
    };
    spyOn(Orgservice, 'getOrgCacheOption').and.callFake(function (callback) {
      callback({});
    });
    spyOn(FeatureToggleService, 'supports').and.returnValue({
      then: function () {
        return true;
      },
    });
    spyOn(ProPackService, 'hasProPackEnabled').and.returnValue($q.resolve(true));
    spyOn(ProPackService, 'hasProPackPurchased').and.returnValue($q.resolve(true));
    spyOn(Auth, 'revokeUserAuthTokens').and.callFake(function () {
      return $q.resolve();
    });

    EdiscoveryService = {
      setEntitledForCompliance: _.noop,
    };
  }));

  function initController() {
    controller = $controller('UserRolesCtrl', {
      $q: $q,
      $rootScope: $rootScope,
      $scope: $scope,
      $state: $state,
      $stateParams: $stateParams,
      $translate: $translate,
      Auth: Auth,
      Authinfo: Authinfo,
      Config: Config,
      EdiscoveryService: EdiscoveryService,
      FeatureToggleService: FeatureToggleService,
      Log: Log,
      Notification: Notification,
      Orgservice: Orgservice,
      SessionStorage: SessionStorage,
      Userservice: Userservice,
      UserRoleService: UserRoleService,
    });

    $scope.$apply();
    $scope.rolesEdit = {
      form: {
        $setPristine: _.noop,
        $setUntouched: _.noop,
        displayName: {
          $setValidity: _.noop,
        },
        adminRoles: {
          $setValidity: _.noop,
        },
      },
    };
    spyOn($scope.rolesEdit.form, '$setPristine').and.callFake(_.noop);
    spyOn($scope.rolesEdit.form, '$setUntouched').and.callFake(_.noop);
    spyOn($scope.rolesEdit.form.displayName, '$setValidity').and.callFake(_.noop);
    spyOn($scope.rolesEdit.form.adminRoles, '$setValidity').and.callFake(_.noop);
  }

  describe('UserRolesCtrl Initialization: ', function () {
    it('should successfully initialize the UserRolesCtrl controller even without a currentUser', function () {
      $stateParams.currentUser = null;
      initController();
      expect(controller).toBeDefined();
      expect($scope.currentUser).toEqual($stateParams.currentUser);
    });

    it('should initialize the UserRolesCtrl controller', function () {
      initController();
      expect(controller).toBeDefined();
      expect($scope.currentUser).toEqual($stateParams.currentUser);
    });

    it('should verify the radio button value is populated when controller loads with a currentUser', function () {
      initController();
      expect($scope.rolesObj.adminRadioValue).toBeDefined();
      expect($scope.rolesObj.adminRadioValue).toEqual(1);
      expect($scope.rolesObj.complianceValue).toBeDefined();
      expect($scope.rolesObj.complianceValue).toBe(false);
    });

    it('should match Device Admin to User Admin settings when partialCheckboxesUserAdmin is called', function () {
      initController();
      spyOn($scope, 'partialCheckboxes').and.callThrough();

      $scope.rolesObj.userAdminValue = true;
      $scope.partialCheckboxesUserAdmin();
      expect($scope.rolesObj.deviceAdminValue).toEqual(true);
      expect($scope.partialCheckboxes).toHaveBeenCalledTimes(1);
      expect($scope.isDeviceCheckboxDisabled()).toEqual(true);

      $scope.rolesObj.userAdminValue = false;
      $scope.partialCheckboxesUserAdmin();
      expect($scope.rolesObj.deviceAdminValue).toEqual(false);
      expect($scope.partialCheckboxes).toHaveBeenCalledTimes(2);
      expect($scope.isDeviceCheckboxDisabled()).toEqual(false);
    });
  });

  describe('Initialize isPartner from current org response', function () {
    beforeEach(function () {
      expect($scope.isPartner).toBe(undefined);
    });
    afterEach(function () {
      initController();
      expect($scope.isPartner).toBe(true);
    });
    it('should initialize from isPartner', function () {
      Orgservice.getOrgCacheOption.and.callFake(function (callback) {
        callback({
          success: true,
          isPartner: true,
        });
      });
    });
    it('should initialize from delegatedAdministration', function () {
      Orgservice.getOrgCacheOption.and.callFake(function (callback) {
        callback({
          success: true,
          delegatedAdministration: true,
        });
      });
    });
  });

  describe('SIP User', function () {
    describe('Verify Admin Roles Radio input setting: ', function () {
      beforeEach(function () {
        $stateParams.currentUser = fakeUserJSONFixture.fakeUser2;
        initController();
      });

      it('should verify the radio button value is set to 2 when controller loads with a fakeUser2 as currentUser', function () {
        expect($scope.rolesObj.adminRadioValue).toBeDefined();
        expect($scope.rolesObj.adminRadioValue).toEqual(2);
      });
    });

    describe('Setting of user SIP Address: ', function () {
      beforeEach(initController);

      it('should set type cloud-calling and primary SIP Address to $scope.sipAddr', function () {
        expect($scope.sipAddr).toEqual(fakeUserJSONFixture.fakeUser1.sipAddresses[0].value);
      });
    });

    describe('Setting of user SIP Address for another user: ', function () {
      beforeEach(function () {
        $stateParams.currentUser = fakeUserJSONFixture.fakeUser2;
        initController();
      });

      it('should set type cloud-calling SIP Address to $scope.sipAddr', function () {
        expect($scope.sipAddr).toEqual(fakeUserJSONFixture.fakeUser2.sipAddresses[0].value);
      });
    });

    describe('Setting of user SIP Address for another user without an approprate SIP address stored: ', function () {
      beforeEach(function () {
        $stateParams.currentUser = fakeUserJSONFixture.fakeUser3;
        initController();
      });

      it('should set type cloud-calling SIP Address to $scope.sipAddr', function () {
        expect($scope.sipAddr).toEqual('');
      });
    });

    describe('Verify Admin names: ', function () {
      beforeEach(function () {
        $stateParams.currentUser = fakeUserJSONFixture.fakeUser2;
        initController();
      });

      it('should invalidate display name if first name, last name and display name are all blank', function () {
        $scope.formUserData.name.givenName = '';
        $scope.formUserData.name.familyName = '';
        $scope.formUserData.displayName = '';
        $scope.checkAdminDisplayName();
        expect($scope.rolesEdit.form.displayName.$setValidity).toHaveBeenCalledWith('notblank', false);
        expect($scope.rolesEdit.form.adminRoles.$setValidity).toHaveBeenCalledWith('noSelection', false);
      });

      it('should invalidate display name if not first name, last name and display name are all blank', function () {
        $scope.formUserData.displayName = 'DN';
        $scope.checkAdminDisplayName();
        expect($scope.rolesEdit.form.displayName.$setValidity).toHaveBeenCalledWith('notblank', true);
        expect($scope.rolesEdit.form.adminRoles.$setValidity).toHaveBeenCalledWith('noSelection', false);
      });
    });

    describe('Verify non-Admin names: ', function () {
      beforeEach(function () {
        $stateParams.currentUser = fakeUserJSONFixture.fakeNonAdminUser;
        initController();
      });

      it('should validate display name if first name, last name and display name are all blank', function () {
        $scope.formUserData.name.givenName = '';
        $scope.formUserData.name.familyName = '';
        $scope.formUserData.displayName = '';
        $scope.checkAdminDisplayName();
        expect($scope.rolesEdit.form.displayName.$setValidity).toHaveBeenCalledWith('notblank', true);
        expect($scope.rolesEdit.form.adminRoles.$setValidity).toHaveBeenCalledWith('noSelection', true);
      });
    });

    describe('Update Roles and User Data', function () {
      var expectedUserData;

      beforeEach(function () {
        $stateParams.currentUser = fakeUserJSONFixture.fakeUser1;
        currentUser = fakeUserJSONFixture.fakeUser1;
        initController();

        expectedUserData = {
          schemas: Config.scimSchemas,
          name: _.cloneDeep($scope.formUserData.name),
          meta: {
            attributes: [],
          },
          displayName: _.cloneDeep($scope.formUserData.displayName),
        };

        spyOn($rootScope, '$broadcast');
        spyOn(Notification, 'success');
        spyOn(Notification, 'errorResponse');
      });

      afterEach(function () {
        expect($scope.updatingUser).toBe(false);
      });

      ///////////
      describe('Failures', function () {
        afterEach(function () {
          expect($rootScope.$broadcast).not.toHaveBeenCalled();
          expect(Notification.success).not.toHaveBeenCalled();
          expect(Notification.errorResponse).toHaveBeenCalledWith(jasmine.any(Object), 'profilePage.rolesError');
        });

        it('should notify an error when patchUserRoles fails', function () {
          Userservice.patchUserRoles.and.callFake(function () {
            return $q.reject({});
          });

          $scope.rolesObj.adminRadioValue = 2;
          $scope.updateRoles();
          $scope.$digest();

          expect(Userservice.patchUserRoles).toHaveBeenCalled();
          expect(Userservice.updateUserProfile).not.toHaveBeenCalled();
        });

        it('should notify an error when updateUserProfile fails', function () {
          Userservice.updateUserProfile.and.callFake(function () {
            return $q.reject({});
          });

          $scope.rolesObj.adminRadioValue = 2;
          $scope.formUserData.name.givenName = 'Tester';
          $scope.updateRoles();
          $scope.$digest();

          expect(Userservice.patchUserRoles).toHaveBeenCalled();
          expect(Userservice.updateUserProfile).toHaveBeenCalled();
        });
      });

      ///////////
      describe('Successes', function () {
        afterEach(function () {
          expect($rootScope.$broadcast).toHaveBeenCalledWith('USER_LIST_UPDATED');
          expect(Notification.success).toHaveBeenCalledWith('profilePage.success');
          expect(Notification.errorResponse).not.toHaveBeenCalled();
        });

        it('should not patch anything if no changes made', function () {
          // don't make any changes, just try to do an update
          $scope.updateRoles();
          $scope.$digest();

          expect(Userservice.patchUserRoles).not.toHaveBeenCalled();
          expect(Userservice.updateUserProfile).not.toHaveBeenCalled();
        });

        it('should only patch Roles if no User Data changed', function () {
          expect($scope.rolesObj.adminRadioValue).not.toEqual(2);
          $scope.rolesObj.adminRadioValue = 2;

          $scope.updateRoles();
          $scope.$digest();

          expect(Userservice.patchUserRoles).toHaveBeenCalled();
          expect(Userservice.updateUserProfile).not.toHaveBeenCalled();
        });

        it('should only patch User Data if Roles have not changed', function () {
          expect($scope.formUserData.name.givenName).not.toEqual('Tester');
          $scope.formUserData.name.givenName = 'Tester';
          expectedUserData.name.givenName = 'Tester';

          $scope.updateRoles();
          $scope.$digest();

          expect(Userservice.patchUserRoles).not.toHaveBeenCalled();
          expect(Userservice.updateUserProfile).toHaveBeenCalledWith(currentUser.id, expectedUserData);
        });

        it('should patch Roles and User Data if they both have been changed', function () {
          expect($scope.rolesObj.adminRadioValue).not.toEqual(2);
          $scope.rolesObj.adminRadioValue = 2;

          expect($scope.formUserData.name.givenName).not.toEqual('Tester');
          $scope.formUserData.name.givenName = 'Tester';
          expectedUserData.name.givenName = 'Tester';

          $scope.updateRoles();
          $scope.$digest();

          expect(Userservice.patchUserRoles).toHaveBeenCalled();
          expect(Userservice.updateUserProfile).toHaveBeenCalledWith(currentUser.id, expectedUserData);
        });

        it('should update $scope.currentUser and $stateParams.currentUser if patchUserProfile is called', function () {
          expect($scope.formUserData.name.givenName).not.toEqual('Tester');
          $scope.formUserData.name.givenName = 'Tester';
          expectedUserData.name.givenName = 'Tester';
          Userservice.updateUserProfile.and.callFake(function () {
            return $q.resolve({ data: expectedUserData });
          });

          $scope.updateRoles();
          $scope.$digest();

          expect(Userservice.patchUserRoles).not.toHaveBeenCalled();
          expect(Userservice.updateUserProfile).toHaveBeenCalledWith(currentUser.id, expectedUserData);
          expect($scope.currentUser.name.givenName).toEqual('Tester');
          expect($stateParams.currentUser.name.givenName).toEqual('Tester');
        });

        it('should call updateUserProfile with correct meta attributes', function () {
          // test clearing givenName
          $scope.formUserData.name.givenName = '';
          $scope.updateRoles();
          $scope.$digest();

          var ed1 = _.cloneDeep(expectedUserData);
          ed1.meta.attributes.push('name.givenName');
          delete ed1.name.givenName;
          expect(Userservice.updateUserProfile).toHaveBeenCalledWith(currentUser.id, ed1);

          // test clearing familyName
          $scope.formUserData.name.familyName = '';
          $scope.updateRoles();
          $scope.$digest();

          var ed2 = _.cloneDeep(expectedUserData);
          ed2.meta.attributes.push('name.familyName');
          delete ed2.name.familyName;
          expect(Userservice.updateUserProfile).toHaveBeenCalledWith(currentUser.id, ed2);

          // test clearing displayName
          $scope.formUserData.displayName = '';
          $scope.updateRoles();
          $scope.$digest();

          var ed3 = _.cloneDeep(expectedUserData);
          ed3.meta.attributes.push('displayName');
          delete ed3.displayName;
          expect(Userservice.updateUserProfile).toHaveBeenCalledWith(currentUser.id, ed3);
        });
      });
    });
  });

  describe('Compliance User - ', function () {
    beforeEach(function () {
      initController();
      $scope.showComplianceRole = true;
      spyOn(Notification, 'errorResponse');
    });

    it('should update Compliance Officer setting', function () {
      spyOn(EdiscoveryService, 'setEntitledForCompliance').and.returnValue($q.resolve(true));

      expect($scope.rolesObj.complianceValue).toBe(false);
      $scope.rolesObj.complianceValue = true;
      $scope.updateRoles();
      $scope.$digest();

      expect($scope.currentUser.entitlements).toContain('compliance');
      expect($scope.rolesObj.complianceValue).toBe(true);
      $scope.rolesObj.complianceValue = false;
      $scope.updateRoles();
      $scope.$digest();

      expect($scope.currentUser.entitlements).not.toContain('compliance');
      expect($scope.rolesObj.complianceValue).toBe(false);
      expect(Notification.errorResponse).not.toHaveBeenCalled();
    });

    it('should not update on error', function () {
      spyOn(EdiscoveryService, 'setEntitledForCompliance').and.returnValue($q.reject({}));

      expect($scope.rolesObj.complianceValue).toBe(false);
      $scope.rolesObj.complianceValue = true;
      $scope.updateRoles();
      $scope.$digest();

      expect($scope.currentUser.entitlements).not.toContain('compliance');
      expect($scope.rolesObj.complianceValue).toBe(true);
      expect(Notification.errorResponse).toHaveBeenCalledWith(jasmine.any(Object), 'profilePage.complianceError');
    });
  });

  describe('Care User', function () {
    describe('Updating roles for Care user 1', function () {
      beforeEach(function () {
        $stateParams.currentUser = careUserJSONFixture.fakeUser1;
        initController();
      });

      it('should have spark.synckms role when already present', function () {
        var expectedRoles = [
          {
            roleName: 'Full_Admin',
            roleState: 'ACTIVE',
          },
          {
            roleName: 'Readonly_Admin',
            roleState: 'INACTIVE',
          },
          {
            roleName: 'Sales_Admin',
            roleState: 'INACTIVE',
          },
          {
            roleName: 'Billing',
            roleState: 'INACTIVE',
          },
          {
            roleName: 'Support',
            roleState: 'INACTIVE',
          },
          {
            roleName: 'Reports',
            roleState: 'INACTIVE',
          },
          {
            roleName: 'User_Admin',
            roleState: 'INACTIVE',
          },
          {
            roleName: 'Device_Admin',
            roleState: 'INACTIVE',
          },
          {
            roleName: 'Help_Desk',
            roleState: 'INACTIVE',
          },
          {
            roleName: 'Partner_Management',
            roleState: 'INACTIVE',
          },
          {
            roleName: 'Spark_SyncKms',
            roleState: 'ACTIVE',
          },
        ];

        // set user to full admin.
        expect($scope.rolesObj.adminRadioValue).not.toEqual(1);
        $scope.rolesObj.adminRadioValue = 1;

        $scope.updateRoles();
        $scope.$digest();

        expect(Userservice.patchUserRoles).toHaveBeenCalled();
        expect(Userservice.patchUserRoles.calls.argsFor(0)[2]).toEqual(expectedRoles);
      });
    });

    describe('Updating roles for Care user 2', function () {
      beforeEach(function () {
        $stateParams.currentUser = careUserJSONFixture.fakeUser2;
        initController();
      });

      it('should not have spark.synckms role when not already present', function () {
        var expectedRoles = [
          {
            roleName: 'Full_Admin',
            roleState: 'ACTIVE',
          },
          {
            roleName: 'Readonly_Admin',
            roleState: 'INACTIVE',
          },
          {
            roleName: 'Sales_Admin',
            roleState: 'INACTIVE',
          },
          {
            roleName: 'Billing',
            roleState: 'INACTIVE',
          },
          {
            roleName: 'Support',
            roleState: 'INACTIVE',
          },
          {
            roleName: 'Reports',
            roleState: 'INACTIVE',
          },
          {
            roleName: 'User_Admin',
            roleState: 'INACTIVE',
          },
          {
            roleName: 'Device_Admin',
            roleState: 'INACTIVE',
          },
          {
            roleName: 'Help_Desk',
            roleState: 'INACTIVE',
          },
          {
            roleName: 'Partner_Management',
            roleState: 'INACTIVE',
          },
          {
            roleName: 'Spark_SyncKms',
            roleState: 'INACTIVE',
          },
        ];

        // set user to full admin.
        expect($scope.rolesObj.adminRadioValue).not.toEqual(1);
        $scope.rolesObj.adminRadioValue = 1;

        $scope.updateRoles();
        $scope.$digest();

        expect(Userservice.patchUserRoles).toHaveBeenCalled();
        expect(Userservice.patchUserRoles.calls.argsFor(0)[2]).toEqual(expectedRoles);
      });
    });

    describe('Updating roles for Care user 3', function () {
      beforeEach(function () {
        $stateParams.currentUser = careUserJSONFixture.fakeUser3;
        initController();
      });

      it('should have orderadmin, helpdesk, and partner_management role when already present', function () {
        var expectedRoles = [
          {
            roleName: 'Full_Admin',
            roleState: 'ACTIVE',
          },
          {
            roleName: 'Readonly_Admin',
            roleState: 'INACTIVE',
          },
          {
            roleName: 'Sales_Admin',
            roleState: 'INACTIVE',
          },
          {
            roleName: 'Billing',
            roleState: 'INACTIVE',
          },
          {
            roleName: 'Support',
            roleState: 'INACTIVE',
          },
          {
            roleName: 'Reports',
            roleState: 'INACTIVE',
          },
          {
            roleName: 'User_Admin',
            roleState: 'INACTIVE',
          },
          {
            roleName: 'Device_Admin',
            roleState: 'INACTIVE',
          },
          {
            roleName: 'Help_Desk',
            roleState: 'ACTIVE',
          },
          {
            roleName: 'Order_Admin',
            roleState: 'ACTIVE',
          },
          {
            roleName: 'Partner_Management',
            roleState: 'ACTIVE',
          },
          {
            roleName: 'Spark_SyncKms',
            roleState: 'INACTIVE',
          },
        ];

        expect($scope.rolesObj.adminRadioValue).not.toEqual(1);
        $scope.rolesObj.adminRadioValue = 1;

        $scope.showOrderAdminRole = true;
        $scope.updateRoles();
        $scope.$digest();

        expect(Userservice.patchUserRoles).toHaveBeenCalled();
        expect(Userservice.patchUserRoles.calls.argsFor(0)[2]).toEqual(expectedRoles);
      });
    });
    describe('Reset Access', function () {
      beforeEach(function () {
        $stateParams.currentUser = careUserJSONFixture.fakeUser3;
        initController();
      });

      it('revoke token', function () {
        expect(controller).toBeDefined();
        $scope.resetAccess();
        expect(Auth.revokeUserAuthTokens).toHaveBeenCalled();
      });
    });

    describe('Editing Roles should be', function () {
      it('disallowed when it is editing self', function () {
        Authinfo.getUserId.and.returnValue(currentUser.id);
        initController();

        expect($scope.isNotEditable).toBe(true);
      });

      it('disallowed when the logged in user is a User Admin', function () {
        spyOn(Authinfo, 'isUserAdminUser').and.returnValue(true);
        currentUser.roles = [];
        initController();

        expect($scope.isNotEditable).toBe(true);
      });

      it('allowed when the logged in user is not a User Admin and is not editing self', function () {
        currentUser.roles = [];
        initController();

        expect($scope.isNotEditable).toBe(false);
      });
    });
  });

  describe('CCA Roles Block', function () {
    it('should NOT show CCA roles by default', function () {
      initController();

      expect($scope.showCCARoles).toBe(false);
      expect($scope.showCCAAdminRole).toBe(false);
    });

    describe('should show CCA admin roles if user is Cisco org', function () {
      it('and customer admin', function () {
        spyOn(Authinfo, 'isCisco').and.returnValue(true);
        spyOn(Authinfo, 'isCustomerAdmin').and.returnValue(true);
        initController();

        expect($scope.showCCAAdminRole).toBe(true);
      });

      it('and readonly admin', function () {
        spyOn(Authinfo, 'isCisco').and.returnValue(true);
        spyOn(Authinfo, 'isReadOnlyAdmin').and.returnValue(true);
        initController();

        expect($scope.showCCAAdminRole).toBe(true);
      });
    });

    describe('should show CCA if user is Partner', function () {
      beforeEach(function () {
        SessionStorage.put('partnerOrgId', 'fakePartner');
      });

      afterEach(function () {
        SessionStorage.pop('partnerOrgId');
      });

      it('and admin', function () {
        spyOn(Authinfo, 'isAdmin').and.returnValue(true);
        initController();

        expect($scope.showCCARoles).toBe(true);
      });

      it('and readonly admin', function () {
        spyOn(Authinfo, 'isReadOnlyAdmin').and.returnValue(true);
        initController();

        expect($scope.showCCARoles).toBe(true);
      });
    });
  });
});
