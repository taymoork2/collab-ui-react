(function () {
  'use strict';

  angular
    .module('Squared')
    .controller('HelpdeskExtendedInfoDialogController', HelpdeskExtendedInfoDialogController);

  /* @ngInject */
  function HelpdeskExtendedInfoDialogController(title, data, $timeout, $scope) {
    var vm = this;
    vm.title = title;
    vm.copied = false;
    var copiedTimer;

    $scope.$on('$destroy', function () {
      $timeout.cancel(copiedTimer);
    });

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

}());
