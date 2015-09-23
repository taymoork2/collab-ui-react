(function () {
  'use strict';

  angular
    .module('Messenger')
    .controller('CiSyncCtrl', CiSyncCtrl);

  /** @ngInject */
  function CiSyncCtrl(Authinfo, Config, CiService, SyncService) {
    // Interface ---------------------------------------------------------------
    var vm = this;

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
    vm.title = 'Messenger CI Sync';
    vm.isDirSync = false;
    vm.status = vm.statusOptions.on;
    vm.ciAdmins = [];
    vm.ciUsers = [];
    vm.ciData = CiService.getCiOrgInfo();
    vm.dev = Config.isDev() && ('testAtlasMsgr' === Authinfo.getOrgName());

    vm.syncInfo = {
      messengerOrgName: 'Unknown',
      messengerOrgId: 'Unknown',
      linkDate: 'Unknown',
      isAuthRedirect: false,
      isSyncing: false
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
    vm.setOrgAdmin = setOrgAdmin;
    vm.setOpsAdmin = setOpsAdmin;
    vm.refreshStatus = refreshStatus;
    vm.updateSync = updateSync;

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
          // Update data from service
          vm.syncInfo.messengerOrgId = status.urdbOrgId;
          vm.syncInfo.messengerOrgName = status.urdbOrgName;
          vm.syncInfo.linkDate = status.linkDate;
          vm.syncInfo.isSyncing = SyncService.isSyncing();
          vm.syncInfo.isAuthRedirect = status.authRedirect;
        }, function (errorMsg) {
          window.console.error('Error getting CI sync status: ' + errorMsg);
        });
    }

    function refreshStatus() {
      getSyncStatus();
    }

    function setOrgAdmin() {
      vm.adminType = vm.adminTypes.org;
    }

    function setOpsAdmin() {
      vm.adminType = vm.adminTypes.ops;
    }

    function updateSync() {
      // Double-check that they are ops for security
      if (vm.adminTypes.ops === vm.adminType) {
        // SyncService must turn the syncing boolean into the full mode
        SyncService.updateSync(vm.syncInfo.isSyncing, vm.syncInfo.isAuthRedirect);
      }
    }
  }
})();
