(function () {
  'use strict';

  angular
    .module('Messenger')
    .controller('CiSyncCtrl', CiSyncCtrl)
    .directive('msgrTextStatusOn', msgrTextStatusOn)
    .directive('msgrTextStatusOff', msgrTextStatusOff);

  /* @ngInject */
  function CiSyncCtrl($q, $translate, Authinfo, Log, Notification, CiService, SyncService) {
    // Interface ---------------------------------------------------------------
    var vm = this;

    var translatePrefix = 'messengerCiSync.';
    var customerSuccessRole = 'webex-messenger.customer_success';
    var requiredEntitlements = ['webex-squared', 'webex-messenger'];

    vm.dataStates = Object.freeze({
      loading: 1,
      loaded: 2,
      error: 3
    });

    vm.statusOptions = Object.freeze({
      on: {
        badgeClass: 'badge-primary',
        label: 'On'
      },
      off: {
        badgeClass: 'badge-default',
        label: 'Off'
      }
    });

    // the label is only a stake holder right now
    vm.adminTypes = Object.freeze({
      org: {
        label: $translate.instant(translatePrefix + 'labelOrgAdmin')
      },
      ops: {
        label: $translate.instant(translatePrefix + 'labelOpsAdmin')
      },
      read: {
        label: $translate.instant(translatePrefix + 'labelReadAdmin')
      },
      unknown: {
        label: $translate.instant(translatePrefix + 'labelUnauthorizedUser')
      }
    });

    // Public
    vm.adminType = vm.adminTypes.unknown;
    vm.dataStatus = vm.dataStates.loading;
    vm.errorMsg = '';
    vm.isDirSync = false;
    vm.status = vm.statusOptions.on;
    vm.ciAdmins = [];
    vm.ciUsers = [];
    vm.ciData = CiService.getCiOrgInfo();
    vm.orgAdminUrl = 'https://wapi.webexconnect.com/wbxconnect/acs/widgetserver/mashkit/apps/standalone.html?app=WBX.base.orgadmin';

    // Translated text
    vm.refresh = $translate.instant(translatePrefix + 'refresh');
    vm.syncStatusTooltip = $translate.instant(translatePrefix + 'syncStatusTooltip');
    vm.dirsyncStatusTooltip = $translate.instant(translatePrefix + 'dirsyncStatusTooltip');
    vm.authRedirectTooltip = $translate.instant(translatePrefix + 'authRedirectTooltip');
    vm.patchSyncButtonText = $translate.instant(translatePrefix + 'patchSyncButtonText');
    vm.orgAdminLinkTooltip = $translate.instant(translatePrefix + 'orgAdminLinkTooltip');

    vm.syncInfo = {
      messengerOrgName: 'Unknown',
      messengerOrgId: 'Unknown',
      linkDate: 'Unknown',
      isAuthRedirect: false,
      isSyncEnabled: false,
      isMessengerSyncRawMode: false
    };

    vm.fields = [{
      key: 'messengerOrgName',
      type: 'input',
      templateOptions: {
        type: '',
        label: $translate.instant(translatePrefix + 'labelOrgName'),
        required: false,
        disabled: true,
        placeholder: ''
      }
    }, {
      key: 'messengerOrgId',
      type: 'input',
      templateOptions: {
        type: '',
        label: $translate.instant(translatePrefix + 'labelOrgId'),
        required: false,
        disabled: true,
        placeholder: ''
      }
    }, {
      key: 'linkDate',
      type: 'input',
      templateOptions: {
        type: 'input',
        label: $translate.instant(translatePrefix + 'labelCILinkDate'),
        required: false,
        disabled: true,
        placeholder: ''
      }
    }];

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

    ////////////////////////////////////////////////////////////////////////////

    // Implementation ----------------------------------------------------------

    // CI Calls Inside
    function init() {
      // Check for Partner Admin (Ops Admin) vs. Full Admin (Org Admin)
      checkUserType()
        .then(function () {
          if (authorized()) {
            vm.ciData = CiService.getCiOrgInfo();
            CiService.getCiAdmins(vm.ciAdmins);
            CiService.getCiNonAdmins(vm.ciUsers);
            getSyncStatus();
          }
        }).catch(function (errorMsg) {
          var error = $translate.instant(translatePrefix + 'errorAuthFailed') + errorMsg;
          Notification.error(error);
          Log.error(error);
        });
    }

    function authorized() {
      return (isOrgAdmin() || isOpsAdmin());
    }

    function isOrgAdmin() {
      return (vm.adminTypes.org === vm.adminType);
    }

    function isOpsAdmin() {
      return (vm.adminTypes.ops === vm.adminType);
    }

    function checkUserType() {
      var defer = $q.defer();

      // All users must have CI Full Admin role except new ReadAdmin
      //
      // Also allow help desk user with customer org in its managed org list with id_full_admin role.
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
                setOrgAdmin();
                defer.resolve();
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
      vm.dataStatus = vm.dataStates.loading;

      SyncService.getSyncStatus()
        .then(function (syncStatusObj) {
          vm.syncInfo = syncStatusObj;
          vm.dataStatus = vm.dataStates.loaded;
        }, function (errorObj) {
          vm.dataStatus = vm.dataStates.error;
          var error = $translate.instant(translatePrefix + 'errorFailedGettingCISyncStatus') + errorObj.message;

          vm.errorMsg = error;
          Log.error(error);
          Notification.error(error);
        });
    }

    function refreshStatus() {
      vm.dataStatus = vm.dataStates.loading;

      SyncService.refreshSyncStatus()
        .then(function (status) {
          vm.syncInfo = status;
          vm.dataStatus = vm.dataStates.loaded;
        }, function (errorObj) {
          vm.dataStatus = vm.dataStates.error;
          var error = $translate.instant(translatePrefix + 'errorFailedRefreshingCISyncStatus') + errorObj.message;

          vm.errorMsg = error;
          Log.error(error);
          Notification.error(error);
        });
    }

    function setOrgAdmin() {
      vm.adminType = vm.adminTypes.org;
    }

    function setOpsAdmin() {
      vm.adminType = vm.adminTypes.ops;
    }

    function setReadAdmin() {
      vm.adminType = vm.adminTypes.read;
    }

    function patchSync() {
      // Double-check that they are ops for security
      if (vm.adminTypes.ops === vm.adminType) {
        // SyncService must turn the syncing boolean into the full mode
        SyncService.patchSync(vm.syncInfo.isSyncEnabled, vm.syncInfo.isAuthRedirect)
          .then(function () {
            Notification.success(translatePrefix + 'patchSuccessful');
          }, function (errorObj) {
            var error = $translate.instant(translatePrefix + 'errorFailedUpdatingCISync') + errorObj.message;

            Log.error(error);
            Notification.error(error);

            // Reset to previous state
            getSyncStatus();
          });
      }
    }
  }

  function msgrTextStatusOn() {
    return {
      templateUrl: 'modules/messenger/ci-sync/ciSyncTextStatusOn.html'
    };
  }

  function msgrTextStatusOff() {
    return {
      templateUrl: 'modules/messenger/ci-sync/ciSyncTextStatusOff.html'
    };
  }
})();
