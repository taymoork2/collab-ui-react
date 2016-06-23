(function () {
  'use strict';

  angular
    .module('Core')
    .controller('ConferencePreviewCtrl', ConferencePreviewCtrl);

  /* @ngInject */
  function ConferencePreviewCtrl($scope, $state, $stateParams, Authinfo) {
    var vm = this;

    vm.service = '';
    vm.sites = [];

    init();

    ////////////////

    function init() {
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
  }
})();
