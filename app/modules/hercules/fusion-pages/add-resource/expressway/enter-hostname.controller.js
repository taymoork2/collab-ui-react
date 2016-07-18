(function () {
  'use strict';

  angular.module('Hercules')
    .controller('EnterHostnameController', EnterHostnameController);

  /* @ngInject */
  function EnterHostnameController($stateParams) {
    var vm = this;
    vm.hostname = '';
    vm.next = next;
    vm.canGoNext = canGoNext;

    ///////////////

    function next() {
      $stateParams.wizard.next({
        expressway: {
          hostname: vm.hostname
        }
      });
    }

    function canGoNext() {
      return isValidHostname(vm.hostname);
    }

    function isValidHostname(hostname) {
      return hostname.length > 3;
    }
  }
})();
