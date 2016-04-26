(function () {
  'use strict';

  angular.module('Mediafusion')
    .controller('EventPreviewCtrl', EventPreviewCtrl);

  /* @ngInject */
  function EventPreviewCtrl($scope, $state) {
    //console.log("in threshold Preview Ctrl");
    $scope.closePreview = function () {
      // console.log("we are here");
      $state.go('events');
    };
  }
})();
