'use strict';

angular.module('Mediafusion')
  .controller('VtsPreviewCtrl', ['$scope',
    function ($scope) {
      var $currentVts;
      $scope.changeOpState = function () {
        console.log("inside changeOpState");
        if ($currentVts.status === 'Active') {
          $currentVts.status = 'Down';
        } else {
          $currentVts.status = 'Active';
        }
      };
    }
  ]);
