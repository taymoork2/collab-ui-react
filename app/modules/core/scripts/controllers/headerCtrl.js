(function () {
  'use strict';

  angular.module('Core')
    .controller('HeaderCtrl', HeaderCtrl);

  /* @ngInject */
  function HeaderCtrl($translate, Utils, Authinfo) {
    var vm = this;

    vm.showOrgName = showOrgName;
    vm.showUserDropDown = showUserDropDown;
    vm.showMyCompany = showMyCompany;
    init();

    function init() {
      vm.icon = 'icon-cisco-logo';
      $translate('loginPage.title').then(function (title) {
        vm.headerTitle = title;
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
