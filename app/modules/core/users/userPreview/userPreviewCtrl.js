'use strict';

angular.module('Core')
  .controller('UserPreviewCtrl', ['$scope', '$state', '$stateParams', '$rootScope', '$translate', 'FeatureToggleService', 'Userservice',
    function ($scope, $state, $stateParams, $rootScope, $translate, FeatureToggleService, Userservice) {
      $scope.service = 'ALL';

      $scope.gsxFeature = false;

      Userservice.getUser('me', function (data, status) {
        FeatureToggleService.getFeaturesForUser(data.id, 'gsxdemo').then(function (value) {
          $scope.gsxFeature = value;
        }).finally(function () {
          init();
        });
      });

      function init() {

        if ($state.current &&
          $state.current.data &&
          $state.current.data.displayName &&
          $state.current.data.displayName === 'Messaging' &&
          $scope.gsxFeature
        ) {
          $state.current.data.displayName = $translate.instant('usersPreview.spark');
          $rootScope.$broadcast('displayNameUpdated');
        }
      }

      if ($stateParams.service) {
        $scope.service = $stateParams.service;
      }
      $scope.closePreview = function () {
        $state.go('users.list');
      };
    }
  ]);
