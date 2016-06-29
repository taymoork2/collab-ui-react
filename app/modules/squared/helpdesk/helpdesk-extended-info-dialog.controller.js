(function () {
  'use strict';

  /* @ngInject */
  function HelpdeskExtendedInfoDialogController(title, data, $timeout) {
    var vm = this;
    vm.title = title;
    vm.copied = false;
    var copiedTimer;

    var populate = function () {
      vm.data = JSON.stringify(data, null, 4);
      vm.loading = false;
    };
    vm.loading = true;
    $timeout(populate, 500);

    vm.copyingFinished = function () {
      $timeout.cancel(copiedTimer);
      vm.copied = true;
      copiedTimer = $timeout(function () {
        vm.copied = false;
      }, 2000);
    };
  }

  angular
    .module('Squared')
    .controller('HelpdeskExtendedInfoDialogController', HelpdeskExtendedInfoDialogController);
}());
