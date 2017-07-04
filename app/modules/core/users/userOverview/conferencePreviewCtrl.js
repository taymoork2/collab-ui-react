(function () {
  'use strict';

  angular
    .module('Core')
    .controller('ConferencePreviewCtrl', ConferencePreviewCtrl);

  /* @ngInject */
  function ConferencePreviewCtrl($scope, $state, $stateParams, $translate, Authinfo, Config) {
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
          if (entry.license.features.indexOf('cloudmeetings') != -1) {
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

      $scope.isSharedMeetingsLicense = function (siteUrl) {
        var service = _.find(vm.sites, { license: { siteUrl: siteUrl } });
        return _.toLower(_.get(service, 'license.licenseModel', '')) === Config.licenseModel.cloudSharedMeeting;
      };

      $scope.determineLicenseType = function (siteUrl) {
        return $scope.isSharedMeetingsLicense(siteUrl) ? $translate.instant('firstTimeWizard.sharedLicenses') : $translate.instant('firstTimeWizard.namedLicenses');
      };
    }
  }
})();
