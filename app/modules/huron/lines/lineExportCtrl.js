(function () {
  'use strict';

  angular
    .module('Huron')
    .controller('LineExportCtrl', LineExportCtrl);

  /* @ngInject */
  function LineExportCtrl($scope, $timeout, LineListService, Notification) {
    var vm = this;
    vm.exportBusy = false;

    vm.exportCSV = function () {
      vm.exportBusy = true;
      var promise = LineListService.exportCSV($scope);
      promise
        .catch(function (response) {
          Notification.errorResponse(response, 'linesPage.lineListError');
        })
        .finally(function () {
          $timeout(function () {
            vm.exportBusy = false;
          }, 300); // delay to give export icon time to transition between states reliably
        });
      return promise;
    };
  }
})();
