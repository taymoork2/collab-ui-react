(function() {
  'use strict';

  angular.module('Mediafusion')
    .controller('AlarmPreviewCtrl', AlarmPreviewCtrl);

  /* @ngInject */
  function AlarmPreviewCtrl($scope, $state) {
    //console.log("in threshold Preview Ctrl");
    $scope.closePreview = function () {
      // console.log("we are here");
      $state.go('alarms');
    };
  }
})();