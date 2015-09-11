(function () {
  'use strict';

  angular
    .module('Core')
    .controller('CustomerOverviewCtrl', CustomerOverviewCtrl);

  /* @ngInject */
  function CustomerOverviewCtrl($stateParams, $state, $window, $translate, $log, $http, identityCustomer, Config, Userservice, Authinfo, AccountOrgService) {
    /*jshint validthis: true */
    var vm = this;
    vm.currentCustomer = $stateParams.currentCustomer;

    vm.launchCustomerPortal = launchCustomerPortal;
    vm.openEditTrialModal = openEditTrialModal;
    vm.getDaysLeft = getDaysLeft;
    vm.isSquaredUC = isSquaredUC();

    initCustomer();

    function initCustomer() {
      if (angular.isUndefined(vm.currentCustomer.customerEmail)) {
        vm.currentCustomer.customerEmail = identityCustomer.email;
      }
    }

    function collectLicenseIdsForWebexSites(liclist) {
      var licIds = [];
      var i = 0;
      if (angular.isUndefined(liclist)) {
        liclist = [];
      }
      for (i = 0; i < liclist.length; i++) {
        var lic = liclist[i];
        var licId = lic.licenseId;
        var lictype = lic.licenseType;
        var isConfType = lictype === "CONFERENCING";
        var licHasSiteUrl = (angular.isUndefined(lic.siteUrl) === false);
        if (licHasSiteUrl && isConfType) {
          licIds.push(licId);
        }
      }
      return licIds;
    } //collectLicenses

    function launchCustomerPortal() {
      var liclist = vm.currentCustomer.licenseList;
      var licIds = collectLicenseIdsForWebexSites(liclist);
      var partnerEmail = Authinfo.getPrimaryEmail();
      var u = {
        'address': partnerEmail
      };
      if (licIds.length > 0) {
        Userservice.updateUsers([u], licIds, null, 'updateUserLicense', function () {});
      } else {
        AccountOrgService.getAccount(vm.currentCustomer.customerOrgId).success(function (data) {
          var d = data;
          var len = d.accounts.length;
          var i = 0;
          for (i = 0; i < len; i++) {
            var account = d.accounts[i];
            var lics = account.licenses;
            var licIds = collectLicenseIdsForWebexSites(lics);
            Userservice.updateUsers([u], licIds, null, 'updateUserLicense', function () {});
          }
        });
      }
      $window.open($state.href('login_swap', {
        customerOrgId: vm.currentCustomer.customerOrgId,
        customerOrgName: vm.currentCustomer.customerName
      }));
    }

    function openEditTrialModal() {
      $state.go('trialEdit.info', {
          showPartnerEdit: true,
          currentTrial: vm.currentCustomer
        })
        .then(function () {
          $state.modal.result.then(function () {
            $state.go('partnercustomers.list', {}, {
              reload: true
            });
          });
        });
    }

    function getDaysLeft(daysLeft) {
      if (daysLeft < 0) {
        return $translate.instant('customerPage.expired');
      } else if (daysLeft === 0) {
        return $translate.instant('customerPage.expiresToday');
      } else {
        return daysLeft;
      }
    }

    function isSquaredUC() {
      if (angular.isArray(identityCustomer.services)) {
        return _.contains(identityCustomer.services, Config.entitlements.huron);
      }
      return false;
    }
  }
})();
