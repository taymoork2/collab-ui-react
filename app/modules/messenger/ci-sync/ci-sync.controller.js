(function () {
  'use strict';

  angular
    .module('Messenger')
    .controller('CiSyncCtrl', CiSyncCtrl);

  /** @ngInject */
  function CiSyncCtrl($translate, Authinfo, Config, CiService, SyncService) {
    // Interface ---------------------------------------------------------------
    var vm = this;

    var translatePrefix = 'messengerCiSync.';

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
        label: 'ORG Admin'
      },
      ops: {
        label: 'OPS Admin'
      }
    });

    // Public
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
        label: 'Messenger Organization Name',
        required: false,
        disabled: true,
        placeholder: ''
      }
    }, {
      key: 'messengerOrgId',
      type: 'input',
      templateOptions: {
        type: '',
        label: 'Messenger Organization ID',
        required: false,
        disabled: true,
        placeholder: ''
      }
    }, {
      key: 'linkDate',
      type: 'input',
      templateOptions: {
        type: 'input',
        label: 'CI Link Date',
        required: false,
        disabled: true,
        placeholder: ''
      }
    }];

    vm.init = init;

    // Event handlers
    vm.isDirSync = SyncService.isDirSync;
    vm.patchSync = patchSync;
    vm.refreshStatus = refreshStatus;
    vm.setOrgAdmin = setOrgAdmin;
    vm.setOpsAdmin = setOpsAdmin;

    vm.init();

    ////////////////////////////////////////////////////////////////////////////

    // Implementation ----------------------------------------------------------

    // CI Calls Inside
    function init() {
      setOrgAdmin();
      vm.ciData = CiService.getCiOrgInfo();
      CiService.getCiAdmins(vm.ciAdmins);
      CiService.getCiNonAdmins(vm.ciUsers);
      getSyncStatus();

      // Check for Partner Admin (Ops Admin) vs. Full Admin (Org Admin)
      checkUserType();
    }

    function checkUserType() {
      CiService.isPartnerAdmin()
        .then(function (isPartnerAdmin) {
          if (isPartnerAdmin) {
            setOpsAdmin();
          }
        }, function (errorMsg) {
          window.console.error('Error checking if user is a partner admin: ' + errorMsg);
        });
    }

    function getSyncStatus() {
      SyncService.getSyncStatus()
        .then(function (status) {
          vm.syncInfo = status;
        }, function (errorMsg) {
          window.console.error('Error getting CI sync status: ' + errorMsg);
        });
    }

    function refreshStatus() {
      SyncService.refreshSyncStatus()
        .then(function (status) {
          vm.syncInfo = status;
        }, function (errorMsg) {
          window.console.error('Error REFRESHING CI sync status: ' + errorMsg);
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
            window.console.log('Successful PATCH to CI Sync');
          }, function (errorMsg) {
            window.console.error('Error during PATCH to CI Sync: ' + errorMsg);
          });
      }
    }
  }
})();
