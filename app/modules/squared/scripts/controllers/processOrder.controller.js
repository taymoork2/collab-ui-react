(function () {
  'use strict';

  /**
   * @ngdoc function
   * @name wx2AdminWebClientApp.controller:ProcessorderCtrl
   * @description
   * # ProcessorderCtrl
   * Controller of the wx2AdminWebClientApp
   */
  angular.module('Squared')
    .controller('ProcessorderCtrl', ProcessorderCtrl);

  /* @ngInject */
  function ProcessorderCtrl($scope, $location, $window, Orgservice) {
    $scope.enc = $location.search().enc;
    $scope.isProcessing = true;
    //TODO: redo #processOrderErrorModal modal dialogue conforming to angularjs conventions
    Orgservice.createOrg($scope.enc, function (data, status) {
      $scope.isProcessing = false;
      if (data.success) {
        $window.location.href = data.redirectUrl;
      } else {
        $('#processOrderErrorModal').modal('show');
      }
    });
  }
})();
