(function () {
  'use strict';

  angular
    .module('Core')
    .controller('ConferencePreviewCtrl', ConferencePreviewCtrl);

  /* @ngInject */
  function ConferencePreviewCtrl($scope, $state, $stateParams, $rootScope, $translate, Authinfo, FeatureToggleService, Userservice) {
    var vm = this;

    vm.service = '';
    vm.sites = [];
    vm.gsxFeature = false;

    init();

    ////////////////

    function init() {
      if ($stateParams.service) {
        vm.service = $stateParams.service;
      }

      if (Authinfo.hasAccount()) {
        vm.sites = Authinfo.getConferenceServices();
      }

      Userservice.getUser('me', function (data, status) {
        FeatureToggleService.getFeaturesForUser(data.id, 'gsxdemo').then(function (value) {
          vm.gsxFeature = value;
        }).finally(function () {
          displayName();
        });
      });

      $scope.closePreview = function () {
        $state.go('users.list');
      };
    }

    function displayName() {
      if ($state.current &&
        $state.current.data &&
        $state.current.data.displayName &&
        $state.current.data.displayName === 'Conferencing' &&
        vm.gsxFeature
      ) {
        $state.current.data.displayName = $translate.instant('usersPreview.webex');
        $rootScope.$broadcast('displayNameUpdated');
      }
    }
  }
})();
