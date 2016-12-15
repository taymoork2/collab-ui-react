require('./_user-preview.scss');

(function () {
  'use strict';

  angular
    .module('Core')
    .controller('ConferencePreviewCtrl', ConferencePreviewCtrl);

  /* @ngInject */
  function ConferencePreviewCtrl($scope, $state, $stateParams, $translate, Authinfo, FeatureToggleService) {
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

      /* TODO For now we are using the site url to determine if the license is an SMP license. This logic will change;
      we will be looking at licenseModel inside the licenses payload to determine if the license is SMP instead of the siteUrl. */
      $scope.isSharedMultiPartyLicense = function (siteUrl) {
        return _.isString(siteUrl) && siteUrl.indexOf('.') > -1 ? _.first(siteUrl.split('.')) === 'smp' : false;
      };

      // This logic will be changed to look for the 'licenseModel' key when the payload is ready from the backend
      $scope.determineLicenseType = function (siteUrl) {
        return $scope.isSharedMultiPartyLicense(siteUrl) ? $translate.instant('firstTimeWizard.sharedLicenses') : $translate.instant('firstTimeWizard.assignedLicenses');
      };
    }
  }
})();
