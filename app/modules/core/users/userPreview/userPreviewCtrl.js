'use strict';

angular.module('Core')
  .controller('UserPreviewCtrl', ['$scope', '$state',
    function ($scope, $state) {
      $scope.closePreview = function () {
        $state.go('users.list');
      };
    }
  ]);
