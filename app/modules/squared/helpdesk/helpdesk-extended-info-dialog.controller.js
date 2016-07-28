(function () {
  'use strict';

  angular
    .module('Squared')
    .controller('HelpdeskExtendedInfoDialogController', HelpdeskExtendedInfoDialogController);

  /* @ngInject */
  function HelpdeskExtendedInfoDialogController(title, data, $timeout, $scope, $log, Notification) {
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

    vm.clipboardSuccess = function (e) {
      $timeout.cancel(copiedTimer);
      vm.copied = true;
      copiedTimer = $timeout(function () {
        vm.copied = false;
      }, 2000);
    };

    vm.clipboardError = function (e) {
      $log.error("Unable to copy data to clipboard. Details:", e);
      Notification.error("helpdesk.extended-data-dialog.unableToCopy", e);
      e.clearSelection();
    };
  }

}());
