(function () {
  'use strict';

  angular
    .module('Squared')
    .controller('HelpdeskOrderController', HelpdeskOrderController);

  /* @ngInject */
  function HelpdeskOrderController($stateParams, HelpdeskService, XhrNotificationService) {
    $('body').css('background', 'white');
    var vm = this;
    if ($stateParams.order) {
      vm.orderId = $stateParams.order.externalOrderId;
    } else {
      vm.orderId = $stateParams.id;
    }

    HelpdeskService.searchOrder(vm.orderId).then(initOrderView, XhrNotificationService.notify);

    function initOrderView(order) {
      vm.order = order;
      HelpdeskService.getAccount(order[0].accountId).then(function (account) {
        vm.account = account;
        vm.partnerInfo = order[0].orderContent.common.customerInfo.partnerInfo;
        if (account.accountOrgId) {
          HelpdeskService.getOrg(account.accountOrgId).then(function (org) {
            vm.account.accountActivate = org.meta.created;
          });
        } else {
          vm.account.accountActivate = "No";
        }
        HelpdeskService.getEmailStatus(account.customerAdminEmail).then(function (response) {
          if (response.items) {
            var timestamp = response.items[0].timestamp;
            vm.customerEmailSent = getUTCtime(timestamp);
          }
        });
        if (vm.partnerInfo) {
          HelpdeskService.getEmailStatus(vm.partnerInfo.adminDetails.emailId).then(function (response) {
            if (response.items) {
              var timestamp = response.items[0].timestamp;
              vm.partnerEmailSent = getUTCtime(timestamp);
            }
          });
        }
      });
    }

    function getUTCtime(timestamp) {
      var newDate = new Date();
      newDate.setTime(timestamp * 1000);
      var emailSent = newDate.toUTCString();
      return emailSent;
    }
  }
}());
