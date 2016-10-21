(function () {
  'use strict';

  angular
    .module('Squared')
    .controller('HelpdeskOrderController', HelpdeskOrderController);

  /* @ngInject */
  function HelpdeskOrderController($stateParams, HelpdeskService, XhrNotificationService, Authinfo, Notification, $translate, $state, Log) {
    $('body').css('background', 'white');
    var vm = this;
    if ($stateParams.order) {
      vm.orderId = $stateParams.order.externalOrderId;
    } else {
      vm.orderId = $stateParams.id;
    }
    vm.customerAdminEmailEdit = false;
    vm.showCustomerAdminEmailEdit = showCustomerAdminEmailEdit;
    vm.updateCustomerAdminEmail = updateCustomerAdminEmail;
    vm.cancelCustomerAdminEmailEdit = cancelCustomerAdminEmailEdit;
    vm.partnerAdminEmailEdit = false;
    vm.showPartnerAdminEmailEdit = showPartnerAdminEmailEdit;
    vm.updatePartnerAdminEmail = updatePartnerAdminEmail;
    vm.cancelPartnerAdminEmailEdit = cancelPartnerAdminEmailEdit;
    vm.resendAdminEmail = resendAdminEmail;
    vm.isEditAllowed = Authinfo.isOrderAdminUser();
    vm.goToCustomerPage = goToCustomerPage;
    vm.isAccountActivated = isAccountActivated;

    // Get Order details
    HelpdeskService.searchOrder(vm.orderId).then(initOrderView, XhrNotificationService.notify);

    function initOrderView(order) {
      vm.order = order;
      var orderObj = _.first(order);
      if (_.isUndefined(orderObj)) {
        return;
      }
      vm.orderUuid = orderObj.orderUuid;
      var accountId = orderObj.accountId;
      vm.orderId = orderObj.externalOrderId;

      // Get the account details.
      if (accountId) {
        HelpdeskService.getAccount(accountId)
        .then(function (account) {
          vm.account = account;
          vm.accountName = account.accountName;
          vm.customerId = account.customerId;
          vm.accountOrgId = account.accountOrgId;
          vm.customerName = _.get(orderObj, 'orderContent.common.customerInfo.endCustomerInfo.name');
          vm.customerAdminEmail = _.get(vm, 'account.customerAdminEmail');
          vm.partnerInfo = _.get(orderObj, 'orderContent.common.customerInfo.partnerInfo');
          vm.managedBy = vm.partnerInfo.name;
          vm.partnerAdminEmail = _.get(vm, 'partnerInfo.adminDetails.emailId');
          vm.provisionTime = (new Date(orderObj.orderReceived)).toGMTString();
          vm.accountActivated = "No";
          if (vm.accountOrgId) {
            HelpdeskService.getOrg(vm.accountOrgId).then(function (org) {
              vm.accountActivated = (new Date(org.meta.created)).toGMTString();
            });
          }

          // Get the most recent date that emails were sent to customer and partner
          // First, get latest date the welcome email was sent to customer.
          getEmailStatus(true);
          // If Partner is available, get the latest date welcome mail was sent to partner.
          if (vm.partnerInfo) {
            getEmailStatus(false);
          }
        });
      }
    }

    // Make REST calls to get the email status.
    function getEmailStatus(isCustomer) {
      if (isCustomer) {
        HelpdeskService.getEmailStatus(vm.customerAdminEmail)
        .then(function (response) {
          if (response.items && response.items.length > 0) {
            var timestamp = response.items[0].timestamp;
            vm.customerEmailSent = getUTCtime(timestamp);
          }
        }, XhrNotificationService.notify);
      } else {
        HelpdeskService.getEmailStatus(vm.partnerAdminEmail)
        .then(function (response) {
          if (response.items && response.items.length > 0) {
            var timestamp = response.items[0].timestamp;
            vm.partnerEmailSent = getUTCtime(timestamp);
          }
        }, XhrNotificationService.notify);
      }
    }

    // Convert Date from milliseconds to UTC format
    function getUTCtime(timestamp) {
      var newDate = new Date();
      newDate.setTime(timestamp * 1000);
      var emailSent = newDate.toUTCString();
      return emailSent;
    }

    // Allow Customer Admin Email address to be editted
    function showCustomerAdminEmailEdit() {
      vm.customerAdminEmailEdit = true;
    }

    // Update Customer Admin Email and send welcome email
    function updateCustomerAdminEmail() {
      // TODO - Waiting for backend support
    }

    // Cancel (close) the Edit option
    function cancelCustomerAdminEmailEdit() {
      vm.customerAdminEmailEdit = false;
    }

    // Allow Partner Admin Email address to be editted
    function showPartnerAdminEmailEdit() {
      vm.partnerAdminEmailEdit = true;
    }

    // Update Partner Admin Email and send welcome email
    function updatePartnerAdminEmail() {
      // TODO - Waiting for backend support
    }

    // Cancel (close) the Edit option
    function cancelPartnerAdminEmailEdit() {
      vm.partnerAdminEmailEdit = false;
    }

    // Resend the welcome email to specified party.  Attempt to last send date.
    function resendAdminEmail(isCustomer) {
      HelpdeskService.resendAdminEmail(vm.orderUuid, isCustomer)
        .then(function (res) {
          Log.info(res);
          getEmailStatus(isCustomer);
          var successMessage = [];
          successMessage.push($translate.instant('helpdesk.resendMailSuccess'));
          Notification.notify(successMessage, 'success');
        }, function (err) {
          var message = _.get(err.data, "message");
          var errorMessage = [];
          errorMessage.push($translate.instant('helpdesk.resendMailFailure'));
          errorMessage.push(message);
          Notification.notify(errorMessage, 'error');
        });
    }

    // Transition to the customer page if account has been activated.
    function goToCustomerPage() {
      $state.go('helpdesk.org', { id: vm.accountOrgId });
    }

    // Check if account has been activated.
    function isAccountActivated() {
      return (vm.accountActivated !== "No");
    }
  }
}());
