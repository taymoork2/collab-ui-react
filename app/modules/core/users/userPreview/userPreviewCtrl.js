'use strict';

angular.module('Core')
  .controller('UserPreviewCtrl', ['$scope', '$state', '$stateParams',
    function ($scope, $state, $stateParams) {
      $scope.service = 'ALL';
      if ($stateParams.service) {
        $scope.service = $stateParams.service;
      }
      $scope.closePreview = function () {
        $state.go('users.list');
      };
    }
  ]);
