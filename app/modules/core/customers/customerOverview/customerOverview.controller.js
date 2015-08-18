(function () {
  'use strict';

  angular
    .module('Core')
    .controller('CustomerOverviewCtrl', CustomerOverviewCtrl);

  /* @ngInject */
  function CustomerOverviewCtrl($stateParams, $state, $window, $translate, identityCustomer, Config) {
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
