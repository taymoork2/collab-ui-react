(function () {
  'use strict';

  angular.module('Core')
    .controller('HeaderCtrl', HeaderCtrl);

  /* @ngInject */
  function HeaderCtrl($q, $translate, Authinfo, FeatureToggleService, ProPackService, Utils, Orgservice) {
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
        nameChangeEnabled: FeatureToggleService.atlas2017NameChangeGetStatus(),
      }).then(function (toggles) {
        if (toggles.proPackEnabled && toggles.nameChangeEnabled) {
          vm.headerTitle = $translate.instant('loginPage.titlePro');
        } else if (toggles.nameChangeEnabled) {
          vm.headerTitle = $translate.instant('loginPage.titleNew');
          getAdminTabs();
          getPartnerInfo();
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

    function showProBadge() {
      return Authinfo.isEnterpriseCustomer() && Authinfo.isPremium();
    }

    function getAdminTabs() {
      if (showMyCompany()) {
        vm.adminTabs = [{
          icon: 'icon-settings-active',
          title: Authinfo.getOrgName(),
          link: '/my-company',
          iconClass: 'icon-outline',
        }];
      } else if (showOrgName) {
        vm.adminTabs = [{
          icon: 'icon-settings-active',
          title: Authinfo.getOrgName(),
          link: '/settings',
          iconClass: 'icon-outline',
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
