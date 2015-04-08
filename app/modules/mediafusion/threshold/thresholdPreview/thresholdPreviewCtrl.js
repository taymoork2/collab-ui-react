'use strict';

/* global $ */

angular.module('Mediafusion')
  .controller('ThresholdPreviewCtrl', ['$scope', '$state',
    function ($scope, $state) {
      console.log("in threshold Preview Ctrl");
      $scope.closePreview = function () {
        console.log("we are here");
        $state.go('threshold');
      };
    }
  ]);
