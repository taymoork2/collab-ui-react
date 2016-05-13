(function () {
  'use strict';

  angular.module('Core')
    .controller('HeaderCtrl', HeaderCtrl);

  /* @ngInject */
  function HeaderCtrl($scope, $translate, Config, Utils, FeatureToggleService) {
    var vm = this;
    vm.newTabDisplay = false;

    $scope.icon = 'icon-cisco-logo';
    $translate('loginPage.title').then(function (title) {
      $scope.headerTitle = title;
    });

    $scope.navStyle = 'admin';

    FeatureToggleService.supports(FeatureToggleService.features.myCompanyPage).then(function (support) {
      vm.newTabDisplay = !!support;
    });

    function originalTabDisplay() {
      return !_.isUndefined(vm.newTabDisplay) && !vm.newTabDisplay;
    }

    vm.showOrgName = function () {
      return originalTabDisplay() && Utils.isAdminPage();
    };

    vm.showFirstTimeSetupDropDown = function () {
      return originalTabDisplay() && Utils.isAdminPage();
    };

    vm.showLicenseUsageDropDown = function () {
      return originalTabDisplay() && Utils.isAdminPage();
    };

    vm.showUserDropDown = function () {
      return Utils.isAdminPage();
    };

    vm.showMyCompany = function () {
      return !!vm.newTabDisplay;
    };
  }
})();
