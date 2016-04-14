(function () {
  'use strict';

  angular
    .module('Core')
    .controller('userRedirectCtrl', userRedirectCtrl);

  /*ng-Inject*/
  function userRedirectCtrl($timeout, $window) {
    var vm = this;

    vm.loadingDelay = 2000;

    function telstraRedirect() {
      var loadingDelayPromise = $timeout(function () {}, vm.loadingDelay);

      return loadingDelayPromise.then(
        $window.location.href = "https://marketplace.telstra.com/"
      );
    }

    // Remove when Microsoft fixes flexbox problem when min-height is defined (in messagebox-small).
    function isIe() {
      return false || ($window.navigator.userAgent.indexOf('MSIE') > 0 || $window.navigator.userAgent.indexOf('Trident') > 0);
    }

    function checkForIeWorkaround() {
      if (isIe()) {
        return "vertical-ie-workaround";
      } else {
        return "";
      }
    }
  }
})();
