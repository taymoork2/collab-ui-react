(function () {
  'use strict';

  angular
    .module('Messenger')
    .controller('CiSyncCtrl', CiSyncCtrl);

  /** @ngInject */
  function CiSyncCtrl($window, CiService) {
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

    vm.data = {
      messengerOrgName: CiService.orgName,
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
    vm.windowReady = windowReady;

    // Event handlers
    vm.setOrgAdmin = setOrgAdmin;
    vm.setOpsAdmin = setOpsAdmin;

    var domReady = false;

    vm.init();

    ////////////////////////////////////////////////////////////////////////////

    // Implementation ----------------------------------------------------------

    // CI Calls Inside
    function init() {
      vm.status = vm.statusOptions.on;
    }

    function windowReady() {
      domReady = true;
      setOrgAdmin();
    }

    function setOrgAdmin() {
      $window.console.log('Setting to Org Admin');
      vm.adminType = vm.adminTypes.org;
    }

    function setOpsAdmin() {
      $window.console.log('Setting to Ops Admin');
      vm.adminType = vm.adminTypes.ops;
    }
  }
})();
