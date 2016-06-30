(function () {
  'use strict';

  angular
    .module('Squared')
    .controller('ProcessorderCtrl', ProcessorderCtrl);

  /* @ngInject */
  function ProcessorderCtrl($scope, $location, $timeout, WindowLocation, Orgservice) {
    $scope.isProcessing = true;
    $scope.enc = $location.search().enc;
    Orgservice.createOrg($scope.enc, function (data, status) {
      $scope.isProcessing = false;
      if (data.success) {
        $timeout(function () {
          WindowLocation.set(data.redirectUrl);
        }, 2000);
      } else {
        $('#processOrderErrorModal').modal('show');
      }
    });
  }
})();
