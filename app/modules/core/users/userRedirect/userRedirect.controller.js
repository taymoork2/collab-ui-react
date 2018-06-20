require('./_user-redirect.scss');

(function () {
  'use strict';

  angular
    .module('Core')
    .controller('userRedirectCtrl', userRedirectCtrl);

  /*ng-Inject*/
  function userRedirectCtrl($timeout, WindowLocation) {
    var vm = this;

    vm.loadingDelay = 2000;

    $timeout(redirect, vm.loadingDelay);

    function redirect() {
      WindowLocation.set('https://marketplace.telstra.com/');
    }
  }
})();
