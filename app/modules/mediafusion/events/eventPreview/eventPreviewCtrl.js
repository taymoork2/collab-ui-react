'use strict';

angular.module('Mediafusion')
  .controller('EventPreviewCtrl', ['$scope', '$state',
    function ($scope, $state) {
      //console.log("in threshold Preview Ctrl");
      $scope.closePreview = function () {
        // console.log("we are here");
        $state.go('events');
      };
    }
  ]);
