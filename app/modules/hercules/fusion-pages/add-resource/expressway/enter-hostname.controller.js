(function () {
  'use strict';

  angular.module('Hercules')
    .controller('ExpresswayEnterHostnameController', ExpresswayEnterHostnameController);

  var KeyCodes = require('modules/core/accessibility').KeyCodes;

  /* @ngInject */
  function ExpresswayEnterHostnameController($stateParams, $translate) {
    var vm = this;
    vm.hostname = '';
    vm.next = next;
    vm.canGoNext = canGoNext;
    vm.handleKeypress = handleKeypress;
    vm._translation = {
      placeholder: $translate.instant('hercules.addResourceDialog.enterHostnamePlaceholder'),
      help: $translate.instant('hercules.addResourceDialog.registerNewExpresswayHelp'),
    };
    vm.minlength = 3;
    vm.validationMessages = {
      required: $translate.instant('common.invalidRequired'),
      minlength: $translate.instant('common.invalidMinLength', {
        min: vm.minlength,
      }),
    };

    ///////////////

    function next() {
      $stateParams.wizard.next({
        expressway: {
          hostname: vm.hostname,
        },
      });
    }

    function canGoNext() {
      return isValidHostname(vm.hostname);
    }

    function handleKeypress(event) {
      if (event.keyCode === KeyCodes.ENTER && canGoNext()) {
        next();
      }
    }

    function isValidHostname(hostname) {
      return hostname && hostname.length >= 3;
    }
  }
})();
