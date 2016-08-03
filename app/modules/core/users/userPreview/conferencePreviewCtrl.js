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
    vm.siteUrls = [];

    init();

    ////////////////

    function init() {
      if ($stateParams.service) {
        vm.service = $stateParams.service;
      }

      if (Authinfo.hasAccount()) {
        vm.sites = Authinfo.getConferenceServices();
        vm.sites.forEach(function (entry) {
          if (entry.license.features.indexOf("cloudmeetings") != -1) {
            var site = entry.license.siteUrl;
            if (vm.siteUrls.indexOf(site) == -1) {
              vm.siteUrls.push(site);
            }
          }
        });
      }

      $scope.isValidConferenceSerivce = function (site) {
        return vm.siteUrls.indexOf(site) !== -1;
      };

      $scope.closePreview = function () {
        $state.go('users.list');
      };
    }
  }
})();
