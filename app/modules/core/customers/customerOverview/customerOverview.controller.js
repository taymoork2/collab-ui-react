(function () {
  'use strict';

  angular
    .module('Core')
    .controller('CustomerOverviewCtrl', CustomerOverviewCtrl);

  /* @ngInject */
  function CustomerOverviewCtrl($stateParams, $state, $window, $translate, $log, $http, identityCustomer, Config, Userservice, Authinfo) {
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
 
    function launchCustomerPortal() {
      var liclist = vm.currentCustomer.licenseList;
      var licIds = [];
      var i = 0;
      if (liclist === undefined) {
        liclist = [];
      }
      for (i = 0; i < liclist.length; i++) {
        var lic = liclist[i];
        var licId = lic.licenseId;
        var lictype = lic.licenseType;
        var isConfType = lictype === "CONFERENCING";
        var licHasSiteUrl = (lic.siteUrl !== undefined);
        if (licHasSiteUrl && isConfType) {
          licIds.push(licId);
        }
      }
      if (licIds.length > 0) {
        var partnerEmailObjectArray = Authinfo.getEmail();
        var partnerEmail = partnerEmailObjectArray[0].value;
        var u = {
          'address': partnerEmail
        };
        Userservice.updateUsers([u], licIds, null, 'updateUserLicense', function () {});
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
