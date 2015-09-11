(function () {
  'use strict';

  angular
    .module('Messenger')
    .controller('CiSyncCtrl', CiSyncCtrl);

  /** @ngInject */
  function CiSyncCtrl(Config, CiService) {
    // Interface ---------------------------------------------------------------
    var vm = this;

    vm.title = 'Messenger CI Sync';

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

    vm.data = {
      messengerOrgName: 'URDB-' + CiService.orgName,
      messengerOrgId: 'URDB-' + CiService.orgId,
      linkDate: new Date('08/20/2015'),
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
        type: 'date',
        label: 'CI Link Date',
        required: false,
        disabled: true,
        placeholder: ''
      }
    }];

    vm.init = init;

    // Event handlers
    vm.setOrgAdmin = setOrgAdmin;
    vm.setOpsAdmin = setOpsAdmin;

    vm.init();

    ////////////////////////////////////////////////////////////////////////////

    // Implementation ----------------------------------------------------------

    // CI Calls Inside
    function init() {
      vm.status = vm.statusOptions.on;
      setOrgAdmin();

      vm.ciData = CiService.getCiOrgInfo();

      vm.ciAdmins = [];
      CiService.getCiAdmins(vm.ciAdmins);

      vm.ciUsers = [];
      CiService.getCiNonAdmins(vm.ciUsers);

      vm.dev = Config.isDev() && ('testAtlasMsgr' === CiService.orgName) ? true : false;
    }

    function setOrgAdmin() {
      vm.adminType = vm.adminTypes.org;
    }

    function setOpsAdmin() {
      vm.adminType = vm.adminTypes.ops;
    }
  }
})();
