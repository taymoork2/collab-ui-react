(function () {
  'use strict';

  angular.module('Hercules')
    .controller('EnterHostnameController', EnterHostnameController);

  /* @ngInject */
  function EnterHostnameController($stateParams, $translate) {
    var vm = this;
    vm.hostname = '';
    vm.next = next;
    vm.canGoNext = canGoNext;
    vm.handleKeypress = handleKeypress;
    vm._translation = {
      placeholder: $translate.instant('hercules.addResourceDialog.enterHostnamePlaceholder')
    };
    vm.minlength = 3;
    vm.validationMessages = {
      required: $translate.instant('common.invalidRequired'),
      minlength: $translate.instant('common.invalidMinLength', {
        min: vm.minlength
      })
    };

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

    function handleKeypress(event) {
      if (event.keyCode === 13 && canGoNext()) {
        next();
      }
    }

    function isValidHostname(hostname) {
      return hostname && hostname.length >= 3;
    }
  }
})();
