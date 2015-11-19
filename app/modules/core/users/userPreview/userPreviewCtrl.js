'use strict';

angular.module('Core')
  .controller('UserPreviewCtrl', ['$scope', '$state', '$stateParams', '$rootScope', '$translate', 'FeatureToggleService', 'Userservice',
    function ($scope, $state, $stateParams, $rootScope, $translate, FeatureToggleService, Userservice) {
      $scope.service = 'ALL';

      if ($stateParams.service) {
        $scope.service = $stateParams.service;
      }
      $scope.closePreview = function () {
        $state.go('users.list');
      };
    }
  ]);
