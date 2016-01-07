'use strict';

angular.module('Mediafusion')
  .controller('AlarmPreviewCtrl', ['$scope', '$state',
    function ($scope, $state) {
      //console.log("in threshold Preview Ctrl");
      $scope.closePreview = function () {
        // console.log("we are here");
        $state.go('alarms');
      };
    }
  ]);
