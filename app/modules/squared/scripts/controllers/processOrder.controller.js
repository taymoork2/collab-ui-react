(function () {
  'use strict';

  angular
    .module('Squared')
    .controller('ProcessorderCtrl', ProcessorderCtrl);

  /* @ngInject */
  function ProcessorderCtrl($scope, $location, $timeout, WindowLocation, Orgservice, Localytics) {
    // Note: only keep $timeout and Localytics until we gathered enough data usage
    Localytics.tagEvent('Display /processorder', {
      enc: !!$location.search().enc
    });
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
