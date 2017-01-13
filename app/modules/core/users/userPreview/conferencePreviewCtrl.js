require('./_user-preview.scss');

(function () {
  'use strict';

  angular
    .module('Core')
    .controller('ConferencePreviewCtrl', ConferencePreviewCtrl);

  /* @ngInject */
  function ConferencePreviewCtrl($scope, $state, $stateParams, $translate, Authinfo, Config, FeatureToggleService) {
    var vm = this;

    vm.service = '';
    vm.sites = [];
    vm.siteUrls = [];
    $scope.isSharedMultiPartyEnabled = false;

    init();

    ////////////////

    function init() {
      FeatureToggleService.atlasSMPGetStatus().then(function (smpStatus) {
        $scope.isSharedMultiPartyEnabled = smpStatus;
      });

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

      $scope.isSharedMultiPartyLicense = function (siteUrl) {
        var service = _.find(vm.sites, { license: { siteUrl: siteUrl } });
        return _.get(service, 'license.licenseModel') === Config.licenseModel.cloudSharedMeeting;
      };

      $scope.determineLicenseType = function (siteUrl) {
        return $scope.isSharedMultiPartyLicense(siteUrl) ? $translate.instant('firstTimeWizard.sharedLicenses') : $translate.instant('firstTimeWizard.namedLicenses');
      };
    }
  }
})();
