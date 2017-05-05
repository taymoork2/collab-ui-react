(function () {
  'use strict';

  angular
    .module('Messenger')
    .controller('CiSyncCtrl', CiSyncCtrl);

  /* @ngInject */
  function CiSyncCtrl($q, $translate, Authinfo, Notification, CiService, SyncService) {
    var vm = this;

    var translatePrefix = 'messengerCiSync.';
    var customerSuccessRole = 'webex-messenger.customer_success';
    var requiredEntitlements = ['webex-squared', 'webex-messenger'];

    vm.dataStates = {
      LOADING: 1,
      LOADED: 2,
      ERROR: 3,
    };

    vm.adminTypes = {
      ORG: 'ORG',
      OPS: 'OPS',
      READ: 'READ',
      UNKNOWN: 'UNKNOWN',
    };

    // Public
    vm.adminType = vm.adminTypes.UNKNOWN;
    vm.dataStatus = vm.dataStates.LOADING;
    vm.errorMsg = '';
    vm.isDirSync = false;
    vm.orgAdminUrl = 'https://wapi.webexconnect.com/wbxconnect/acs/widgetserver/mashkit/apps/standalone.html?app=WBX.base.orgadmin';
    vm.backState = 'services-overview';

    // Translated text
    vm.refresh = $translate.instant(translatePrefix + 'refresh');
    vm.syncStatusTooltip = $translate.instant(translatePrefix + 'syncStatusTooltip');
    vm.dirsyncStatusTooltip = $translate.instant(translatePrefix + 'dirsyncStatusTooltip');
    vm.authRedirectTooltip = $translate.instant(translatePrefix + 'authRedirectTooltip');
    vm.patchSyncButtonText = $translate.instant(translatePrefix + 'patchSyncButtonText');
    vm.orgAdminLinkTooltip = $translate.instant(translatePrefix + 'orgAdminLinkTooltip');
    vm.pwdSyncTooltip = $translate.instant(translatePrefix + 'pwdSyncTooltip');
    vm.sparkEntTooltip = $translate.instant(translatePrefix + 'sparkEntTooltip');
    vm.usrDisTooltip = $translate.instant(translatePrefix + 'usrDisTooltip');
    vm.usrDelTooltip = $translate.instant(translatePrefix + 'usrDelTooltip');

    vm.syncInfo = {
      messengerOrgName: 'Unknown',
      messengerOrgId: 'Unknown',
      linkDate: 'Unknown',
      isAuthRedirect: false,
      isSyncEnabled: false,
      isMessengerSyncRawMode: false,
      isNewDataFormat: false,
      isPwdSync: true,
      isSparkEnt: true,
      isUsrDis: true,
      isUsrDel: true,
    };

    vm.init = init;

    // Event handlers
    vm.authorized = authorized;
    vm.isDirSync = SyncService.isDirSync;
    vm.isOrgAdmin = isOrgAdmin;
    vm.isOpsAdmin = isOpsAdmin;
    vm.patchSync = patchSync;
    vm.refreshStatus = refreshStatus;
    vm.setOrgAdmin = setOrgAdmin;
    vm.setOpsAdmin = setOpsAdmin;

    init();

    ////////////////

    // CI Calls Inside
    function init() {
      // Check for Partner Admin (Ops Admin) vs. Full Admin (Org Admin)
      checkUserType()
        .then(function () {
          if (authorized()) {
            getSyncStatus();
          }
        }).catch(function (errorMsg) {
          var error = $translate.instant(translatePrefix + 'errorAuthFailed') + errorMsg;
          Notification.error(error);
        });
    }

    function authorized() {
      return (isOrgAdmin() || isOpsAdmin());
    }

    function isOrgAdmin() {
      return (vm.adminTypes.ORG === vm.adminType);
    }

    function isOpsAdmin() {
      return (vm.adminTypes.OPS === vm.adminType);
    }

    function checkUserType() {
      var defer = $q.defer();

      // All users must have CI Full Admin role except new ReadAdmin
      //
      // Also allow help desk user with customer org in its managed org list with id_full_admin role.
      // add Full Admin Org Manager to allow list.
      //
      // Customer Success Admin     --> Ops Admin
      // Non-Customer Success Admin --> must have webex-squared AND webex-messenger CI entitlements
      if (Authinfo.isReadOnlyAdmin()) {
        setReadAdmin();
        defer.resolve();
      } else if (Authinfo.isCustomerAdmin()) {
        CiService.hasRole(customerSuccessRole)
          .then(function (hasCSRole) {
            if (hasCSRole) {
              setOpsAdmin();
              defer.resolve();
            } else {
              if (!(Authinfo.isWebexSquared() && Authinfo.isWebexMessenger())) {
                defer.reject($translate.instant(translatePrefix + 'errorLacksEntitlements') + requiredEntitlements);
              } else {
                CiService.isOrgManager()
                  .then(function (isOrgManager) {
                    if (isOrgManager) {
                      setOpsAdmin();
                    } else {
                      setOrgAdmin();
                    }
                    defer.resolve();
                  }).catch(function (errorMsg) {
                    defer.reject($translate.instant(translatePrefix + 'errorFailedCheckingOrgInManagedOrgs') + errorMsg);
                  });
              }
            }
          }).catch(function (errorMsg) {
            defer.reject($translate.instant(translatePrefix + 'errorFailedCheckingCustSuccessRole') + errorMsg);
          });
      } else if (!Authinfo.isHelpDeskUser()) {
        defer.reject($translate.instant(translatePrefix + 'errorLacksRole'));
      } else {
        CiService.isOrgManager()
          .then(function (isOrgManager) {
            if (isOrgManager) {
              setOpsAdmin();
              defer.resolve();
            } else {
              defer.reject($translate.instant(translatePrefix + 'errorNotOrgManager'));
            }
          }).catch(function (errorMsg) {
            defer.reject($translate.instant(translatePrefix + 'errorFailedCheckingOrgInManagedOrgs') + errorMsg);
          });
      }
      return defer.promise;
    }

    function getSyncStatus() {
      vm.dataStatus = vm.dataStates.LOADING;

      SyncService.getSyncStatus()
        .then(function (syncStatusObj) {
          vm.syncInfo = syncStatusObj;
          vm.dataStatus = vm.dataStates.LOADED;
        }, function (errorObj) {
          vm.dataStatus = vm.dataStates.ERROR;
          var error = $translate.instant(translatePrefix + 'errorFailedGettingCISyncStatus') + errorObj.message;

          vm.errorMsg = error;
          Notification.error(error);
        });
    }

    function refreshStatus() {
      vm.dataStatus = vm.dataStates.LOADING;

      SyncService.refreshSyncStatus()
        .then(function (status) {
          vm.syncInfo = status;
          vm.dataStatus = vm.dataStates.LOADED;
        }, function (errorObj) {
          vm.dataStatus = vm.dataStates.ERROR;
          var error = $translate.instant(translatePrefix + 'errorFailedRefreshingCISyncStatus') + errorObj.message;

          vm.errorMsg = error;
          Notification.error(error);
        });
    }

    function setOrgAdmin() {
      vm.adminType = vm.adminTypes.ORG;
    }

    function setOpsAdmin() {
      vm.adminType = vm.adminTypes.OPS;
    }

    function setReadAdmin() {
      vm.adminType = vm.adminTypes.READ;
    }

    function patchSync() {
      // Double-check that they are ops for security
      if (vm.adminTypes.OPS === vm.adminType) {
        // SyncService must turn the syncing boolean into the full mode
        SyncService.patchSync(vm.syncInfo)
          .then(function () {
            Notification.success(translatePrefix + 'patchSuccessful');
          }, function (errorObj) {
            var error = $translate.instant(translatePrefix + 'errorFailedUpdatingCISync') + errorObj.message;

            Notification.error(error);

            // Reset to previous state
            getSyncStatus();
          });
      }
    }
  }
})();
