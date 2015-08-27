'use strict';

angular.module('Core')
  .controller('UserPreviewCtrl', ['$scope', '$state', '$stateParams', '$translate', 'FeatureToggleService', 'Userservice',
    function ($scope, $state, $stateParams, $translate, FeatureToggleService, Userservice) {
      $scope.service = 'ALL';

      $scope.gsxFeature = false;

      Userservice.getUser('me', function (data, status) {
        FeatureToggleService.getFeaturesForUser(data.id, function (data, status) {
          _.each(data.developer, function (element) {
            if (element.key === 'gsxdemo' && element.val === 'true') {
              $scope.gsxFeature = true;
            }
          });
          init();
        });
      });

      var init = function () {

        if ($state.current &&
          $state.current.data &&
          $state.current.data.displayName &&
          $state.current.data.displayName === 'Messaging' &&
          $scope.gsxFeature
        ) {
          $state.current.data.displayName = $translate.instant('usersPreview.spark');
          $state.reload();
        }
      };

      if ($stateParams.service) {
        $scope.service = $stateParams.service;
      }
      $scope.closePreview = function () {
        $state.go('users.list');
      };
    }
  ]);
