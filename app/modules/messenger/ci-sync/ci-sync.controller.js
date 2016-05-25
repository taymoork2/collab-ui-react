(function () {
  'use strict';

  angular
    .module('Messenger')
    .controller('CiSyncCtrl', CiSyncCtrl);

  /** @ngInject */
  function CiSyncCtrl($q, $translate, Authinfo, Config, Log, Notification, CiService, SyncService) {
    // Interface ---------------------------------------------------------------
    var vm = this;

    var translatePrefix = 'messengerCiSync.';
    var fullAdminRole = 'id_full_admin';
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

    vm.init();

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
        }, function (errorMsg) {
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
      // Customer Success Admin     --> Ops Admin
      // Non-Customer Success Admin --> must have webex-squared AND webex-messenger CI entitlements
      if (Authinfo.isReadOnlyAdmin()) {
        setReadAdmin();
        defer.resolve();
      } else {
        CiService.hasRole(fullAdminRole)
          .then(function (hasAdminRole) {
            if (hasAdminRole) {
              // Now check for Customer Success Admin or not
              CiService.hasRole(customerSuccessRole)
                .then(function (hasCSRole) {
                  if (hasCSRole) {
                    setOpsAdmin();
                    defer.resolve();
                  } else {
                    // Not a Customer Success Admin, must have entitlements
                    CiService.hasEntitlements(requiredEntitlements)
                      .then(function (hasEntitlements) {
                        if (hasEntitlements) {
                          setOrgAdmin();
                          defer.resolve();
                        } else {
                          defer.reject($translate.instant(translatePrefix + 'errorLacksEntitlements') + requiredEntitlements);
                        }
                      }, function (errorMsg) {
                        defer.reject($translate.instant(translatePrefix + 'errorFailedCheckingCIEntitlements') + errorMsg);
                      });
                  }
                }, function (errorMsg) {
                  defer.reject($translate.instant(translatePrefix + 'errorFailedCheckingCustSuccessRole') + errorMsg);
                });
            } else {
              defer.reject($translate.instant(translatePrefix + 'errorLacksFullAdmin'));
            }
          }, function (errorMsg) {
            defer.reject($translate.instant(translatePrefix + 'errorFailedCheckingCIRoles') + errorMsg);
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
          .then(function (successMsg) {
            Notification.success($translate.instant(translatePrefix + 'patchSuccessful'));
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
})();
