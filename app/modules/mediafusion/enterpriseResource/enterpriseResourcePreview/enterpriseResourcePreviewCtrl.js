'use strict';

/* global $ */

angular.module('Mediafusion')
  .controller('VtsPreviewCtrl', ['$scope', '$state',
    function ($scope, $state) {

      /*& $scope.closePreview = function () {
         $state.go('vts.list');
       };*/

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
