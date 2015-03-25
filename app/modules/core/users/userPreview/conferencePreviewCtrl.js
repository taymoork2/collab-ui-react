'use strict';

angular.module('Core')
  .controller('ConferencePreviewCtrl', ['$scope', '$state', '$stateParams', 'Authinfo',
    function ($scope, $state, $stateParams, Authinfo) {
      var vm = this;
      if ($stateParams.service) {
        vm.service = $stateParams.service;
      }

      if (Authinfo.hasAccount()) {
        vm.sites = Authinfo.getConferenceServices();
      }

      $scope.closePreview = function () {
        $state.go('users.list');
      };
    }
  ]);
