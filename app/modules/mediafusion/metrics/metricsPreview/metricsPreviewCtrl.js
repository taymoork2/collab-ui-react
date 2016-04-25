(function() {
  'use strict';

  angular.module('Mediafusion')
    .controller('MetricsPreviewCtrl', MetricsPreviewCtrl);

  /* @ngInject */
  function MetricsPreviewCtrl($scope, $state) {
    //console.log("in Metric Preview Ctrl");
    $scope.closePreview = function () {
      // console.log("we are here");
      $state.go('metrics');
    };
  }
})();