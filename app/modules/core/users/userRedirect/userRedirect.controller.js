(function () {
  'use strict';

  angular
    .module('Core')
    .controller('userRedirectCtrl', userRedirectCtrl);

  /*ng-Inject*/
  function userRedirectCtrl($timeout, $window, Utils) {
    var vm = this;

    vm.loadingDelay = 2000;

    $timeout(redirect, vm.loadingDelay);

    function redirect() {
      $window.location.href = "https://marketplace.telstra.com/";
    }

    Utils.isIe();
    Utils.checkForIeWorkaround();

  }
})();
