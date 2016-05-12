(function () {
  'use strict';

  angular
    .module('Squared')
    .controller('ProcessorderCtrl', ProcessorderCtrl);

  /* @ngInject */
  function ProcessorderCtrl($scope, $location, WindowLocation, Orgservice, Localytics) {
    Localytics.tagEvent('Display /processorder', {
      enc: !!$location.search().enc
    });
    $scope.isProcessing = true;
    $scope.enc = $location.search().enc;
    Orgservice.createOrg($scope.enc, function (data, status) {
      $scope.isProcessing = false;
      if (data.success) {
        WindowLocation.set(data.redirectUrl);
      } else {
        $('#processOrderErrorModal').modal('show');
      }
    });
  }
})();
