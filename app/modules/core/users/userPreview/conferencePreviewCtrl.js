'use strict';

angular.module('Core')
  .controller('ConferencePreviewCtrl', ['$scope', '$state', '$stateParams', '$translate', 'Authinfo', 'FeatureToggleService', 'Userservice',
    function ($scope, $state, $stateParams, $translate, Authinfo, FeatureToggleService, Userservice) {
      var vm = this;
      vm.gsxFeature = false;

      Userservice.getUser('me', function (data, status) {
        FeatureToggleService.getFeaturesForUser(data.id, function (data, status) {
          _.each(data.developer, function (element) {
            if (element.key === 'gsxdemo' && element.val === 'true') {
              vm.gsxFeature = true;
            }
          });
          init();
        });
      });

      var init = function () {
        if ($state.current &&
          $state.current.data &&
          $state.current.data.displayName &&
          $state.current.data.displayName === 'Conferencing' &&
          vm.gsxFeature
        ) {
          $state.current.data.displayName = $translate.instant('usersPreview.webex');
          $state.reload();
        }

        if ($stateParams.service) {
          vm.service = $stateParams.service;
        }

        if (Authinfo.hasAccount()) {
          vm.sites = Authinfo.getConferenceServices();
        }
      };

      $scope.closePreview = function () {
        $state.go('users.list');
      };
    }
  ]);
