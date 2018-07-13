(function () {
  'use strict';

  angular.module('Core')
    .controller('HeaderCtrl', HeaderCtrl);

  /* @ngInject */
  function HeaderCtrl($q, $translate, Authinfo, ProPackService, Utils, Orgservice) {
    var vm = this;
    vm.partnerInfo = null;
    vm.adminTabs = [];
    vm.showOrgName = showOrgName;
    vm.showUserDropDown = showUserDropDown;
    vm.showMyCompany = showMyCompany;
    vm.showProBadge = showProBadge;
    init();

    function init() {
      vm.icon = 'icon-cisco-logo';
      $q.all({
        proPackEnabled: ProPackService.hasProPackPurchased(),
      }).then(function (toggles) {
        if (toggles.proPackEnabled) {
          vm.headerTitle = $translate.instant('loginPage.titlePro');
          getAdminTabs();
          getPartnerInfo();
        } else {
          vm.headerTitle = $translate.instant('loginPage.titleNew');
          getAdminTabs();
          getPartnerInfo();
        }
      });
      vm.navStyle = 'admin';
    }

    function showOrgName() {
      return (Authinfo.isPartnerAdmin() || Authinfo.isPartnerSalesAdmin() || Authinfo.isPartialAdmin()) && Utils.isAdminPage();
    }

    function showUserDropDown() {
      return Utils.isAdminPage();
    }

    function showMyCompany() {
      return Utils.isAdminPage() && (Authinfo.isCustomerAdmin() || Authinfo.isReadOnlyAdmin() || Authinfo.isProvisionAdmin()) && Authinfo.isCustomerView();
    }

    function showProBadge() {
      return ProPackService.showProBadge();
    }

    function getAdminTabs() {
      if (showMyCompany()) {
        vm.adminTabs = [{
          icon: 'icon-company-active',
          title: Authinfo.getOrgName(),
          link: '/my-company',
          iconClass: 'icon-outline',
        }];
      } else if (showOrgName()) {
        vm.adminTabs = [{
          tab: 'admin-orgname-only',
          title: Authinfo.getOrgName(),
        }];
      }
    }

    function getPartnerInfo() {
      if (Authinfo.isCustomerLaunchedFromPartner()) {
        var params = {
          disableCache: true,
          basicInfo: true,
        };
        Orgservice.getOrg(function (data) {
          if (data.success) {
            var settings = data.orgSettings;
            if (!_.isEmpty(settings) && settings.supportProviderCompanyName) {
              vm.partnerInfo = $translate.instant('tabs.managedByPartner', {
                partnerOrgName: settings.supportProviderCompanyName,
              });
            }
          }
        }, Authinfo.getUserOrgId(), params);
      }
    }
  }
})();
