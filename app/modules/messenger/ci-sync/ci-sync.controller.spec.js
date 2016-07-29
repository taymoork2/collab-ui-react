(function () {
  'use strict';
  var $q, $controller, Authinfo, Notification, CiService, SyncService;
  var $scope;
  var ctrl;

  describe('Controller: CiSyncCtrl', function () {
    beforeEach(module('Core'));
    beforeEach(module('Huron'));
    beforeEach(module('Sunlight'));
    beforeEach(module('Messenger'));

    beforeEach(inject(function (_$controller_, _$q_, _$rootScope_, _Authinfo_, _Notification_, _CiService_, _SyncService_) {
      $scope = _$rootScope_.$new();
      $q = _$q_;
      Authinfo = _Authinfo_;
      Notification = _Notification_;
      CiService = _CiService_;
      SyncService = _SyncService_;
      $controller = _$controller_;
    }));

    function initController() {
      ctrl = $controller('CiSyncCtrl');
      $scope.$apply();
    }

    describe('Initialization Tests', function () {

      beforeEach(function () {
        spyOn(CiService, 'getCiAdmins');
        spyOn(CiService, 'getCiNonAdmins');
        spyOn(SyncService, 'getSyncStatus').and.returnValue($q.when());
      });

      it('should initialize user with adminTypes.read', function () {
        spyOn(Authinfo, 'isReadOnlyAdmin').and.returnValue(true);

        initController();

        expect(ctrl.adminType).toBe(ctrl.adminTypes.read);
      });

      it('should initialize user with adminTypes.ops with help desk user', function () {
        spyOn(Authinfo, 'isReadOnlyAdmin').and.returnValue(false);
        spyOn(Authinfo, 'isCustomerAdmin').and.returnValue(false);
        spyOn(Authinfo, 'isHelpDeskUser').and.returnValue(true);
        spyOn(CiService, 'isOrgManager').and.returnValue($q.when(true));

        initController();

        expect(ctrl.adminType).toBe(ctrl.adminTypes.ops);
      });

      it('should initialize user with adminTypes.ops with Customer Admin', function () {
        spyOn(Authinfo, 'isReadOnlyAdmin').and.returnValue(false);
        spyOn(Authinfo, 'isCustomerAdmin').and.returnValue(true);
        spyOn(CiService, 'hasRole').and.returnValue($q.when());
        spyOn(Authinfo, 'isWebexSquared').and.returnValue(true);
        spyOn(Authinfo, 'isWebexMessenger').and.returnValue(true);
        initController();
        expect(ctrl.adminType).toBe(ctrl.adminTypes.org);
      });

      it('should initialize with errorFailedCheckingCustSuccessRole error and user is adminTypes.unknown with Customer Admin',
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
          expect(ctrl.adminType).toBe(ctrl.adminTypes.unknown);
        });

      it('should initialize with errorLacksEntitlements error and user is adminTypes.unknown with Customer Admin',
        function () {
          spyOn(Authinfo, 'isReadOnlyAdmin').and.returnValue(false);
          spyOn(Authinfo, 'isCustomerAdmin').and.returnValue(true);
          spyOn(CiService, 'hasRole').and.returnValue($q.when());
          spyOn(Authinfo, 'isWebexSquared').and.returnValue(false);
          spyOn(Notification, 'error');

          initController();

          // Variables not being translated in test environment. So, checking error message based on the variable(s) instead of
          // text of the error message.
          expect(Notification.error)
            .toHaveBeenCalledWith('messengerCiSync.errorAuthFailedmessengerCiSync.errorLacksEntitlementswebex-squared,webex-messenger');
          expect(ctrl.adminType).toBe(ctrl.adminTypes.unknown);
        });

      it('should initialize with errorLacksRole error and user is adminTypes.unknown', function () {
        spyOn(Authinfo, 'isReadOnlyAdmin').and.returnValue(false);
        spyOn(Authinfo, 'isCustomerAdmin').and.returnValue(false);
        spyOn(Authinfo, 'isHelpDeskUser').and.returnValue(false);
        spyOn(Notification, 'error');

        initController();

        // Variables not being translated in test environment. So, checking error message based on the variable(s) instead of
        // text of the error message.
        expect(Notification.error).toHaveBeenCalledWith('messengerCiSync.errorAuthFailedmessengerCiSync.errorLacksRole');
        expect(ctrl.adminType).toBe(ctrl.adminTypes.unknown);
      });

      it('should initialize with errorNotInManagedOrg error and user is adminTypes.unknown with Help Desk', function () {
        spyOn(Authinfo, 'isReadOnlyAdmin').and.returnValue(false);
        spyOn(Authinfo, 'isCustomerAdmin').and.returnValue(false);
        spyOn(Authinfo, 'isHelpDeskUser').and.returnValue(true);
        spyOn(CiService, 'isOrgManager').and.returnValue($q.when(false));
        spyOn(Notification, 'error');

        initController();

        // Variables not being translated in test environment. So, checking error message based on the variable(s) instead of
        // text of the error message.
        expect(Notification.error).toHaveBeenCalledWith('messengerCiSync.errorAuthFailedmessengerCiSync.errorNotOrgManager');
        expect(ctrl.adminType).toBe(ctrl.adminTypes.unknown);
      });

      it('should initialize with errorFailedCheckingOrgInManagedOrgs error and user is adminTypes.unknown with Help Desk', function () {
        spyOn(Authinfo, 'isReadOnlyAdmin').and.returnValue(false);
        spyOn(Authinfo, 'isCustomerAdmin').and.returnValue(false);
        spyOn(Authinfo, 'isHelpDeskUser').and.returnValue(true);
        spyOn(CiService, 'isOrgManager').and.returnValue($q.reject(''));
        spyOn(Notification, 'error');

        initController();

        // Variables not being translated in test environment. So, checking error message based on the variable(s) instead of
        // text of the error message.
        expect(Notification.error).toHaveBeenCalledWith('messengerCiSync.errorAuthFailedmessengerCiSync.errorFailedCheckingOrgInManagedOrgs');
        expect(ctrl.adminType).toBe(ctrl.adminTypes.unknown);
      });

    });
  });
})();
