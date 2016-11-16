(function () {
  'use strict';

  angular
    .module('Squared')
    .controller('HelpdeskOrderController', HelpdeskOrderController);

  /* @ngInject */
  function HelpdeskOrderController($state, $stateParams, $translate, Authinfo, HelpdeskService, Notification) {
    $('body').css('background', 'white');
    var vm = this;
    if ($stateParams.order) {
      vm.orderId = $stateParams.order.externalOrderId;
    } else {
      vm.orderId = $stateParams.id;
    }
    vm.customerAdminEmailEdit = vm.partnerAdminEmailEdit = false;
    vm.showCustomerAdminEmailEdit = showCustomerAdminEmailEdit;
    vm.updateCustomerAdminEmail = updateCustomerAdminEmail;
    vm.cancelCustomerAdminEmailEdit = cancelCustomerAdminEmailEdit;
    vm.showPartnerAdminEmailEdit = showPartnerAdminEmailEdit;
    vm.updatePartnerAdminEmail = updatePartnerAdminEmail;
    vm.cancelPartnerAdminEmailEdit = cancelPartnerAdminEmailEdit;
    vm.resendAdminEmail = resendAdminEmail;
    vm.isEditAllowed = Authinfo.isOrderAdminUser();
    vm.goToCustomerPage = goToCustomerPage;
    vm.isAccountActivated = isAccountActivated;

    vm._helpers = {
      notifyError: notifyError
    };

    // Get Order details
    HelpdeskService.searchOrders(vm.orderId).then(initOrderView, vm._helpers.notifyError);

    function initOrderView(order) {
      // Getting information from the order.
      vm.order = order;
      var orderObj = _.first(order);
      if (_.isUndefined(orderObj)) {
        return;
      }
      vm.orderUuid = orderObj.orderUuid;
      var accountId = orderObj.accountId;
      vm.orderId = orderObj.externalOrderId;
      // Getting the account details using the account Id from order.
      if (accountId) {
        HelpdeskService.getAccount(accountId)
        .then(function (account) {
          vm.account = account;
          vm.accountName = account.accountName;
          vm.customerId = account.customerId;
          vm.accountOrgId = account.accountOrgId;
          vm.customerAdminEmail = _.get(vm, 'account.customerAdminEmail');
          // Getting partner Info only if Partner OrgId exists.
          vm.partnerOrgId = account.partnerOrgId;
          if (vm.partnerOrgId) {
            var licenses = _.get(account, 'licenses');
            var license = _.first(licenses);
            vm.partnerAdminEmail = license.partnerEmail;
            // Getting the display name of the partner cited in account.
            HelpdeskService.getOrg(vm.partnerOrgId).then(function (org) {
              vm.managedBy = _.get(org, 'displayName', '');
            }, vm._helpers.notifyError);
          }
          vm.provisionTime = (new Date(orderObj.orderReceived)).toGMTString();
          vm.accountActivated = false;
          vm.accountActivationInfo = $translate.instant('common.no');
          if (vm.accountOrgId) {
            // Getting the activation time if the account has already been activated.
            HelpdeskService.getOrg(vm.accountOrgId).then(function (org) {
              var activationDate = _.get(org, 'meta.created');
              if (activationDate) {
                vm.accountActivated = true;
                vm.accountActivationInfo = (new Date(activationDate)).toGMTString();
              }
            });
          }

          // Get the most recent date that emails were sent to customer and partner
          // First, get latest date the welcome email was sent to customer.
          getEmailStatus(true);
          // If Partner is available, get the latest date welcome mail was sent to partner.
          if (vm.partnerOrgId) {
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
          // First element of response array is the latest.
          var mailStat = _.first(response);
          if (mailStat && mailStat.timestamp) {
            vm.customerEmailSent = getUTCtime(mailStat.timestamp);
          }
        }, vm._helpers.notifyError);
      } else {
        HelpdeskService.getEmailStatus(vm.partnerAdminEmail)
        .then(function (response) {
          // First element of response array is the latest.
          var mailStat = _.first(response);
          if (mailStat && mailStat.timestamp) {
            vm.partnerEmailSent = getUTCtime(mailStat.timestamp);
          }
        }, vm._helpers.notifyError);
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
        .then(function () {
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
      return (vm.accountActivated);
    }

    function notifyError(response) {
      Notification.errorWithTrackingId(response, 'helpdesk.unexpectedError');
    }
  }
}());
