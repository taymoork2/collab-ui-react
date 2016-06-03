(function () {
  'use strict';

  angular.module('Core')
    .controller('HeaderCtrl', HeaderCtrl);

  /* @ngInject */
  function HeaderCtrl($scope, $translate, Config, Utils, FeatureToggleService) {
    var vm = this;
    vm.newTabDisplay = false;

    vm.showOrgName = showOrgName;
    vm.showFirstTimeSetupDropDown = showFirstTimeSetupDropDown;
    vm.showLicenseUsageDropDown = showLicenseUsageDropDown;
    vm.showUserDropDown = showUserDropDown;
    vm.showMyCompany = showMyCompany;

    init();

    function init() {
      $scope.icon = 'icon-cisco-logo';
      $translate('loginPage.title').then(function (title) {
        $scope.headerTitle = title;
      });
      $scope.navStyle = 'admin';
      initFeatureToggles();
    }

    function initFeatureToggles() {
      if (Utils.isAdminPage()) {
        FeatureToggleService.supports(FeatureToggleService.features.myCompanyPage).then(function (support) {
          vm.newTabDisplay = !!support;
        });
      }
    }

    function originalTabDisplay() {
      return !_.isUndefined(vm.newTabDisplay) && !vm.newTabDisplay;
    }

    function showOrgName() {
      return originalTabDisplay() && Utils.isAdminPage();
    }

    function showFirstTimeSetupDropDown() {
      return originalTabDisplay() && Utils.isAdminPage();
    }

    function showLicenseUsageDropDown() {
      return originalTabDisplay() && Utils.isAdminPage();
    }

    function showUserDropDown() {
      return Utils.isAdminPage();
    }

    function showMyCompany() {
      return !!vm.newTabDisplay;
    }
  }
})();
