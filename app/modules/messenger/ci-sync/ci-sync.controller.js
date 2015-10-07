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

    vm.adminTypes = Object.freeze({
      org: {
        label: $translate.instant(translatePrefix + 'labelOrgAdmin')
      },
      ops: {
        label: $translate.instant(translatePrefix + 'labelOpsAdmin')
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
    vm.dev = Config.isDev() && ('testAtlasMsgr' === Authinfo.getOrgName());

    // Translated text
    vm.refresh = $translate.instant(translatePrefix + 'refresh');
    vm.syncStatusTooltip = $translate.instant(translatePrefix + 'syncStatusTooltip');
    vm.authRedirectTooltip = $translate.instant(translatePrefix + 'authRedirectTooltip');
    vm.patchSyncButtonText = $translate.instant(translatePrefix + 'patchSyncButtonText');

    vm.syncInfo = {
      messengerOrgName: 'Unknown',
      messengerOrgId: 'Unknown',
      linkDate: 'Unknown',
      isAuthRedirect: false,
      isSyncEnabled: false
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
          Log.error('Failed checking user type: ' + errorMsg);
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

      // All users must meet these requirements at minimum:
      // -CI Roles: contains id_full_admin
      // -CI Entitlements: webex-squared AND webex-messenger
      CiService.hasEntitlements(requiredEntitlements)
        .then(function (has) {
          if (has) {
            // Must have full admin role
            CiService.hasRole(fullAdminRole)
              .then(function (has) {
                if (has) {
                  // Check if Customer Success admin
                  if (CiService.hasRole(customerSuccessRole)) {
                    setOpsAdmin();
                  } else {
                    setOrgAdmin();
                  }

                  defer.resolve();
                }
              }, function (errorMsg) {
                defer.reject('Failed getting user roles: ' + errorMsg);
              });
          }
        }, function (errorMsg) {
          defer.reject('Failed getting user entitlements: ' + errorMsg);
        });

      return defer.promise;
    }

    function getSyncStatus() {
      vm.dataStatus = vm.dataStates.loading;

      SyncService.getSyncStatus()
        .then(function (status) {
          vm.syncInfo = status;
          vm.dataStatus = vm.dataStates.loaded;
        }, function (errorMsg) {
          var baseError = 'Failed getting CI sync status';
          var fullError = baseError + ': ' + errorMsg;

          vm.dataStatus = vm.dataStates.error;
          vm.errorMsg = baseError;
          Log.error(fullError);
          Notification.error($translate.instant(translatePrefix + 'getFailed'));
        });
    }

    function refreshStatus() {
      vm.dataStatus = vm.dataStates.loading;

      SyncService.refreshSyncStatus()
        .then(function (status) {
          vm.syncInfo = status;
          vm.dataStatus = vm.dataStates.loaded;
        }, function (errorMsg) {
          var baseError = 'Failed refreshing CI Sync status';
          var fullError = baseError + ': ' + errorMsg;

          vm.dataStatus = vm.dataStates.error;
          vm.errorMsg = baseError;
          Log.error(fullError);
          Notification.error($translate.instant(translatePrefix + 'refreshFailed'));
        });
    }

    function setOrgAdmin() {
      vm.adminType = vm.adminTypes.org;
    }

    function setOpsAdmin() {
      vm.adminType = vm.adminTypes.ops;
    }

    function patchSync() {
      // Double-check that they are ops for security
      if (vm.adminTypes.ops === vm.adminType) {
        // SyncService must turn the syncing boolean into the full mode
        SyncService.patchSync(vm.syncInfo.isSyncEnabled, vm.syncInfo.isAuthRedirect)
          .then(function (successMsg) {
            Notification.success($translate.instant(translatePrefix + 'patchSuccessful'));
          }, function (errorMsg) {
            Notification.error($translate.instant(translatePrefix + 'patchFailed'));
          });
      }
    }
  }
})();
