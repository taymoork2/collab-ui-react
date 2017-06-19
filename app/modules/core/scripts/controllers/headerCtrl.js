(function () {
  'use strict';

  angular.module('Core')
    .controller('HeaderCtrl', HeaderCtrl);

  /* @ngInject */
  function HeaderCtrl($q, $translate, Authinfo, FeatureToggleService, ITProPackService, Utils) {
    var vm = this;

    vm.showOrgName = showOrgName;
    vm.showUserDropDown = showUserDropDown;
    vm.showMyCompany = showMyCompany;
    init();

    function init() {
      vm.icon = 'icon-cisco-logo';
      $q.all({
        proPackEnabled: ITProPackService.hasITProPackPurchased(),
        nameChangeEnabled: FeatureToggleService.atlas2017NameChangeGetStatus(),
      }).then(function (toggles) {
        if (toggles.proPackEnabled && toggles.nameChangeEnabled) {
          vm.headerTitle = $translate.instant('loginPage.titlePro');
        } else if (toggles.nameChangeEnabled) {
          vm.headerTitle = $translate.instant('loginPage.titleNew');
        } else {
          vm.headerTitle = $translate.instant('loginPage.title');
        }
      });
      vm.navStyle = 'admin';
    }

    function showOrgName() {
      return (Authinfo.isPartnerAdmin() || Authinfo.isPartnerSalesAdmin()) && Utils.isAdminPage();
    }

    function showUserDropDown() {
      return Utils.isAdminPage();
    }

    function showMyCompany() {
      return Utils.isAdminPage() && !(Authinfo.isPartnerAdmin() || Authinfo.isPartnerSalesAdmin());
    }
  }
})();
