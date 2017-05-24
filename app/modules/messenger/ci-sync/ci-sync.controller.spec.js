(function () {
  'use strict';

  var $q, $controller, AccountOrgService, Authinfo, Notification, CiService, SyncService;
  var $scope;
  var ctrl;

  describe('Controller: CiSyncCtrl', function () {
    beforeEach(angular.mock.module('Core'));
    beforeEach(angular.mock.module('Huron'));
    beforeEach(angular.mock.module('Sunlight'));
    beforeEach(angular.mock.module('Messenger'));

    beforeEach(inject(function (_$controller_, _$q_, _$rootScope_, _AccountOrgService_, _Authinfo_, _CiService_, _Notification_, _SyncService_) {
      $scope = _$rootScope_.$new();
      $q = _$q_;
      AccountOrgService = _AccountOrgService_;
      Authinfo = _Authinfo_;
      Notification = _Notification_;
      CiService = _CiService_;
      SyncService = _SyncService_;
      $controller = _$controller_;
    }));

    afterEach(function () {
      ctrl = $scope = $q = $controller = AccountOrgService = Authinfo = CiService = Notification = SyncService = undefined;
    });

    function initController(overrideVmProperties) {
      ctrl = $controller('CiSyncCtrl');
      _.assign(ctrl, overrideVmProperties);
      $scope.$apply();
    }

    describe('Initialization Tests', function () {
      beforeEach(function () {
        spyOn(CiService, 'getCiAdmins');
        spyOn(CiService, 'getCiNonAdmins');
        spyOn(SyncService, 'getSyncStatus').and.returnValue($q.resolve());
      });

      it('should initialize user with adminTypes.OPS with help desk user', function () {
        spyOn(Authinfo, 'isReadOnlyAdmin').and.returnValue(false);
        spyOn(Authinfo, 'isCustomerAdmin').and.returnValue(false);
        spyOn(Authinfo, 'isHelpDeskUser').and.returnValue(true);
        spyOn(CiService, 'isOrgManager').and.returnValue($q.resolve(true));

        initController();

        expect(ctrl.adminType).toBe(ctrl.adminTypes.OPS);
      });

      it('should initialize user with adminTypes.ORG with non-org-manager Customer Admin', function () {
        spyOn(Authinfo, 'isReadOnlyAdmin').and.returnValue(false);
        spyOn(Authinfo, 'isCustomerAdmin').and.returnValue(true);
        spyOn(CiService, 'hasRole').and.returnValue($q.resolve());
        spyOn(Authinfo, 'isWebexSquared').and.returnValue(true);
        spyOn(Authinfo, 'isWebexMessenger').and.returnValue(true);
        spyOn(CiService, 'isOrgManager').and.returnValue($q.resolve(false));
        initController();
        expect(ctrl.adminType).toBe(ctrl.adminTypes.ORG);
      });

      it('should initialize user with adminTypes.OPS with Customer Admin & Org Manager', function () {
        spyOn(Authinfo, 'isReadOnlyAdmin').and.returnValue(false);
        spyOn(Authinfo, 'isCustomerAdmin').and.returnValue(true);
        spyOn(CiService, 'hasRole').and.returnValue($q.resolve());
        spyOn(Authinfo, 'isWebexSquared').and.returnValue(true);
        spyOn(Authinfo, 'isWebexMessenger').and.returnValue(true);
        spyOn(CiService, 'isOrgManager').and.returnValue($q.resolve(true));
        initController();
        expect(ctrl.adminType).toBe(ctrl.adminTypes.OPS);
      });

      it('should initialize with errorFailedCheckingCustSuccessRole error and user is adminTypes.UNKNOWN with Customer Admin',
        function () {
          spyOn(Authinfo, 'isReadOnlyAdmin').and.returnValue(false);
          spyOn(Authinfo, 'isCustomerAdmin').and.returnValue(true);
          spyOn(CiService, 'hasRole').and.returnValue($q.reject(''));
          spyOn(Notification, 'error');

          initController();

          // Variables not being translated in test environment. So, checking error message based on the variable(s) instead of
          // text of the error message.
          expect(Notification.error)
            .toHaveBeenCalledWith('messengerCiSync.errorAuthFailedmessengerCiSync.errorFailedCheckingCustSuccessRole');
          expect(ctrl.adminType).toBe(ctrl.adminTypes.UNKNOWN);
        });

      it('should initialize with errorLacksEntitlements error and user is adminTypes.UNKNOWN with Customer Admin',
        function () {
          spyOn(Authinfo, 'isReadOnlyAdmin').and.returnValue(false);
          spyOn(Authinfo, 'isCustomerAdmin').and.returnValue(true);
          spyOn(CiService, 'hasRole').and.returnValue($q.resolve());
          spyOn(Authinfo, 'isWebexSquared').and.returnValue(false);
          spyOn(Notification, 'error');

          initController();

          // Variables not being translated in test environment. So, checking error message based on the variable(s) instead of
          // text of the error message.
          expect(Notification.error)
            .toHaveBeenCalledWith('messengerCiSync.errorAuthFailedmessengerCiSync.errorLacksEntitlementswebex-squared,webex-messenger');
          expect(ctrl.adminType).toBe(ctrl.adminTypes.UNKNOWN);
        });

      it('should initialize with errorLacksRole error and user is adminTypes.UNKNOWN', function () {
        spyOn(Authinfo, 'isReadOnlyAdmin').and.returnValue(false);
        spyOn(Authinfo, 'isCustomerAdmin').and.returnValue(false);
        spyOn(Authinfo, 'isHelpDeskUser').and.returnValue(false);
        spyOn(Notification, 'error');

        initController();

        // Variables not being translated in test environment. So, checking error message based on the variable(s) instead of
        // text of the error message.
        expect(Notification.error).toHaveBeenCalledWith('messengerCiSync.errorAuthFailedmessengerCiSync.errorLacksRole');
        expect(ctrl.adminType).toBe(ctrl.adminTypes.UNKNOWN);
      });

      it('should initialize with errorNotInManagedOrg error and user is adminTypes.UNKNOWN with Help Desk', function () {
        spyOn(Authinfo, 'isReadOnlyAdmin').and.returnValue(false);
        spyOn(Authinfo, 'isCustomerAdmin').and.returnValue(false);
        spyOn(Authinfo, 'isHelpDeskUser').and.returnValue(true);
        spyOn(CiService, 'isOrgManager').and.returnValue($q.resolve(false));
        spyOn(Notification, 'error');

        initController();

        // Variables not being translated in test environment. So, checking error message based on the variable(s) instead of
        // text of the error message.
        expect(Notification.error).toHaveBeenCalledWith('messengerCiSync.errorAuthFailedmessengerCiSync.errorNotOrgManager');
        expect(ctrl.adminType).toBe(ctrl.adminTypes.UNKNOWN);
      });

      it('should initialize with errorFailedCheckingOrgInManagedOrgs error and user is adminTypes.UNKNOWN with Help Desk', function () {
        spyOn(Authinfo, 'isReadOnlyAdmin').and.returnValue(false);
        spyOn(Authinfo, 'isCustomerAdmin').and.returnValue(false);
        spyOn(Authinfo, 'isHelpDeskUser').and.returnValue(true);
        spyOn(CiService, 'isOrgManager').and.returnValue($q.reject(''));
        spyOn(Notification, 'error');

        initController();

        // Variables not being translated in test environment. So, checking error message based on the variable(s) instead of
        // text of the error message.
        expect(Notification.error).toHaveBeenCalledWith('messengerCiSync.errorAuthFailedmessengerCiSync.errorFailedCheckingOrgInManagedOrgs');
        expect(ctrl.adminType).toBe(ctrl.adminTypes.UNKNOWN);
      });
    });

    describe('helper functions:', function () {
      describe('saveJabberInterop():', function () {
        it('should add entitlement when true, to both backend and local auth data', function () {
          var initVmProps = {};
          _.set(initVmProps, 'settings.jabberInterop', true);

          var fakeResponse = {
            data: {
              entitlements: [{
                ciName: 'messenger-interop',
              }],
            },
          };

          spyOn(AccountOrgService, 'addMessengerInterop').and.returnValue($q.resolve());
          spyOn(AccountOrgService, 'getServices').and.returnValue($q.resolve(fakeResponse));
          spyOn(Authinfo, 'addEntitlement');
          initController(initVmProps);

          ctrl._helpers.saveJabberInterop();
          $scope.$apply();

          expect(ctrl.settings.jabberInterop).toBe(true);
          expect(AccountOrgService.addMessengerInterop).toHaveBeenCalled();
          expect(AccountOrgService.getServices).toHaveBeenCalled();
          expect(Authinfo.addEntitlement).toHaveBeenCalledWith({
            ciName: 'messenger-interop',
          });
        });

        it('should remove entitlement when false, to both backend and local auth data', function () {
          var initVmProps = {};
          _.set(initVmProps, 'settings.jabberInterop', false);

          spyOn(AccountOrgService, 'deleteMessengerInterop').and.returnValue($q.resolve());
          spyOn(Authinfo, 'removeEntitlement');
          initController(initVmProps);

          ctrl._helpers.saveJabberInterop();
          $scope.$apply();

          expect(ctrl.settings.jabberInterop).toBe(false);
          expect(AccountOrgService.deleteMessengerInterop).toHaveBeenCalled();
          expect(Authinfo.removeEntitlement).toHaveBeenCalledWith('messenger-interop');
        });
      });

      describe('saveSyncInfo():', function () {
        beforeEach(function () {
          installPromiseMatchers();
        });

        it('should reject if "settings.syncInfo" has changed, and user is not of appropriate type', function () {
          initController();
          spyOn(ctrl, 'isOpsAdmin').and.returnValue(false);
          var promise = ctrl._helpers.saveSyncInfo();
          $scope.$apply();
          expect(promise).toBeRejected();
        });

        it('should call through to "SyncService.patchSync()" with "settings.syncInfo" property', function () {
          var initVmProps = {};
          _.set(initVmProps, 'settings.syncInfo', 'fake-sync-info-data');
          initController(initVmProps);

          spyOn(ctrl, 'isOpsAdmin').and.returnValue(true);
          spyOn(SyncService, 'patchSync').and.returnValue($q.resolve());
          ctrl._helpers.saveSyncInfo();
          $scope.$apply();

          expect(SyncService.patchSync).toHaveBeenCalledWith('fake-sync-info-data');
        });
      });
    });

    describe('public methods:', function () {
      describe('saveSettings():', function () {
        beforeEach(function () {
          initController();
          spyOn($q, 'all').and.returnValue($q.resolve());
          spyOn(ctrl._helpers, 'saveJabberInterop').and.returnValue($q.resolve());
          spyOn(ctrl._helpers, 'saveSyncInfo').and.returnValue($q.resolve());
        });

        it('should call "saveJabberInterop()" if appropriate settings have changed', function () {
          spyOn(ctrl._helpers, 'hasJabberInteropChanged').and.returnValue(true);
          spyOn(ctrl._helpers, 'hasSyncInfoChanged').and.returnValue(false);
          ctrl.saveSettings();
          $scope.$apply();
          expect(ctrl._helpers.saveJabberInterop).toHaveBeenCalled();
          expect(ctrl._helpers.saveSyncInfo).not.toHaveBeenCalled();
        });

        it('should call "saveSyncInfo()" if appropriate settings have changed', function () {
          spyOn(ctrl._helpers, 'hasJabberInteropChanged').and.returnValue(false);
          spyOn(ctrl._helpers, 'hasSyncInfoChanged').and.returnValue(true);
          ctrl.saveSettings();
          $scope.$apply();
          expect(ctrl._helpers.saveJabberInterop).not.toHaveBeenCalled();
          expect(ctrl._helpers.saveSyncInfo).toHaveBeenCalled();
        });

        it('should call both "saveJabberInterop()" and "saveSyncInfo()" if appropriate settings have changed', function () {
          spyOn(ctrl._helpers, 'hasJabberInteropChanged').and.returnValue(true);
          spyOn(ctrl._helpers, 'hasSyncInfoChanged').and.returnValue(true);
          ctrl.saveSettings();
          $scope.$apply();
          expect(ctrl._helpers.saveJabberInterop).toHaveBeenCalled();
          expect(ctrl._helpers.saveSyncInfo).toHaveBeenCalled();
        });
      });

      describe('setExistingProperty():', function () {
        it('should set "settings.syncInfo.*" properties only if they are already predefined on the controller', function () {
          initController();
          ctrl.setExistingProperty('settings.syncInfo.messengerOrgName', 'fake-org-name');
          expect(ctrl.settings.syncInfo.messengerOrgName).toBe('fake-org-name');

          ctrl.setExistingProperty('settings.syncInfo.messengerOrgId', 'fake-org-id');
          expect(ctrl.settings.syncInfo.messengerOrgId).toBe('fake-org-id');

          ctrl.setExistingProperty('settings.syncInfo.linkDate', 'fake-link-date');
          expect(ctrl.settings.syncInfo.linkDate).toBe('fake-link-date');

          ctrl.setExistingProperty('settings.syncInfo.isAuthRedirect', true);
          expect(ctrl.settings.syncInfo.isAuthRedirect).toBe(true);

          ctrl.setExistingProperty('settings.syncInfo.isSyncEnabled', true);
          expect(ctrl.settings.syncInfo.isSyncEnabled).toBe(true);

          ctrl.setExistingProperty('settings.syncInfo.isMessengerSyncRawMode', true);
          expect(ctrl.settings.syncInfo.isMessengerSyncRawMode).toBe(true);

          ctrl.setExistingProperty('settings.syncInfo.isNewDataFormat', true);
          expect(ctrl.settings.syncInfo.isNewDataFormat).toBe(true);

          ctrl.setExistingProperty('settings.syncInfo.isPwdSync', true);
          expect(ctrl.settings.syncInfo.isPwdSync).toBe(true);

          ctrl.setExistingProperty('settings.syncInfo.isSparkEnt', true);
          expect(ctrl.settings.syncInfo.isSparkEnt).toBe(true);

          ctrl.setExistingProperty('settings.syncInfo.isUsrDis', true);
          expect(ctrl.settings.syncInfo.isUsrDis).toBe(true);

          ctrl.setExistingProperty('settings.syncInfo.isUsrDel', true);
          expect(ctrl.settings.syncInfo.isUsrDel).toBe(true);

          ctrl.setExistingProperty('settings.syncInfo.fakeNewProperty', true);
          expect(ctrl.settings.syncInfo.fakeNewProperty).toBe(undefined);
        });
      });
    });
  });
})();
