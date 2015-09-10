(function () {
  'use strict';

  angular
    .module('Messenger')
    .controller('OrgInfoCtrl', OrgInfoCtrl);

  /** @ngInject */
  function OrgInfoCtrl($window, Config, CiService) {
    // Interface ---------------------------------------------------------------

    var vm = this;

    vm.init = init;

    // Event handlers
    // <none yet>

    vm.init();

    ////////////////////////////////////////////////////////////////////////////

    // Implementation ----------------------------------------------------------

    function init() {
      vm.ciData = CiService.getCiOrgInfo();

      vm.ciAdmins = [];
      CiService.getCiAdmins(vm.ciAdmins);

      vm.ciUsers = [];
      CiService.getCiNonAdmins(vm.ciUsers);

      vm.dev = Config.isDev() && ('testAtlasMsgr' === CiService.orgName) ? true : false;
    }
  }
})();
