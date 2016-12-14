(function () {
  'use strict';

  angular
    .module('Squared')
    .controller('HelpdeskOrderController', HelpdeskOrderController);

  /* @ngInject */
  function HelpdeskOrderController($state, $stateParams, $translate, $timeout, Authinfo, HelpdeskService, Notification) {
    $('body').css('background', 'white');
    var vm = this;
    if ($stateParams.order) {
      vm.orderId = $stateParams.order.externalOrderId;
    } else {
      vm.orderId = $stateParams.id;
    }
    vm.showCustomerEmailSent = true;
    vm.showPartnerEmailSent = true;
    vm.customerAdminEmailEdit = vm.partnerAdminEmailEdit = false;
    vm.showCustomerAdminEmailEdit = showCustomerAdminEmailEdit;
    vm.updateCustomerAdminEmail = updateCustomerAdminEmail;
    vm.getEmailStatus = getEmailStatus;
    vm.cancelCustomerAdminEmailEdit = cancelCustomerAdminEmailEdit;
    vm.showPartnerAdminEmailEdit = showPartnerAdminEmailEdit;
    vm.updatePartnerAdminEmail = updatePartnerAdminEmail;
    vm.cancelPartnerAdminEmailEdit = cancelPartnerAdminEmailEdit;
    vm.resendAdminEmail = resendAdminEmail;
    vm.isEditAllowed = Authinfo.isOrderAdminUser();
    vm.goToCustomerPage = goToCustomerPage;
    vm.goToPartnerPage = goToPartnerPage;
    vm.isAccountActivated = isAccountActivated;
    vm.partnerOrgExists = partnerOrgExists;

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
      vm.subscriptionId = orderObj.serviceId;
      var accountId = orderObj.accountId;
      vm.orderId = orderObj.externalOrderId;

      //Getting the customer info from order payload or update clientContent
      var emailUpdates = _.get(orderObj, 'clientContent.adminEmailUpdates');
      var customerEmailUpdates = _.filter(emailUpdates, function (data) {
        return data.orderEmailType === "CUSTOMER_ADMIN";
      });
      if (customerEmailUpdates.length > 0) {
        customerEmailUpdates = _.last(customerEmailUpdates);
        vm.customerAdminEmail = _.get(customerEmailUpdates, 'adminDetails.emailId');
      } else {
        vm.customerAdminEmail = _.get(orderObj, 'orderContent.common.customerInfo.endCustomerInfo.adminDetails.emailId');
      }
      vm.oldcustomerAdminEmail = vm.customerAdminEmail;

      //Getting the partner info from order payload or update clientContent
      var partnerEmailUpdates = _.filter(emailUpdates, function (data) {
        return data.orderEmailType === "PARTNER_ADMIN";
      });
      if (partnerEmailUpdates.length > 0) {
        partnerEmailUpdates = _.last(partnerEmailUpdates);
        vm.partnerAdminEmail = _.get(partnerEmailUpdates, 'adminDetails.emailId');
      } else {
        if (orderObj.orderContent.common.resellerInfo) {
          vm.partnerAdminEmail = _.get(orderObj, 'orderContent.common.customerInfo.resellerInfo.adminDetails.emailId');
        } else {
          vm.partnerAdminEmail = _.get(orderObj, 'orderContent.common.customerInfo.partnerInfo.adminDetails.emailId');
        }
      }
      vm.oldpartnerAdminEmail = vm.partnerAdminEmail;


      // Getting the account details using the account Id from order.
      if (accountId) {
        HelpdeskService.getAccount(accountId)
          .then(function (account) {
            vm.account = account;
            vm.accountName = account.accountName;
            vm.accountOrgId = account.accountOrgId;
            // Getting partner Info only if Partner OrgId exists.
            vm.partnerOrgId = account.partnerOrgId;
            if (vm.partnerOrgId) {
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
            vm.customerEmailSent = null;
            var emailSent = getEmailSentTime(response);
            if (emailSent && emailSent.timestamp) {
              vm.customerEmailSent = HelpdeskService.unixTimestampToUTC(emailSent.timestamp);
            }
            vm.showCustomerEmailSent = true;
          }, vm._helpers.notifyError);
      } else {
        HelpdeskService.getEmailStatus(vm.partnerAdminEmail)
          .then(function (response) {
            // First element of response array is the latest.
            vm.partnerEmailSent = null;
            var emailSent = getEmailSentTime(response);
            if (emailSent && emailSent.timestamp) {
              vm.partnerEmailSent = HelpdeskService.unixTimestampToUTC(emailSent.timestamp);
            }
            vm.showPartnerEmailSent = true;
          }, vm._helpers.notifyError);
      }
    }

    function getEmailSentTime(emails) {
      var mailStat = _.filter(emails, function (data) {
        return data.event === "delivered";
      });
      if (mailStat) {
        mailStat = _.first(mailStat);
      }
      return mailStat;
    }

    // Allow Customer Admin Email address to be editted
    function showCustomerAdminEmailEdit() {
      vm.customerAdminEmailEdit = true;
    }

    // Update Customer Admin Email and send welcome email
    function updateCustomerAdminEmail() {
      HelpdeskService.editAdminEmail(vm.orderUuid, vm.customerAdminEmail, false)
        .then(function () {
          Notification.success('helpdesk.editAdminEmailSuccess');
          vm.oldcustomerAdminEmail = vm.customerAdminEmail;
          vm.customerAdminEmailEdit = false;
          vm.showCustomerEmailSent = false;
          $timeout(function () {
            getEmailStatus(false);
          }, 5000);
        }, function (response) {
          Notification.errorWithTrackingId(response, 'helpdesk.editAdminEmailFailure');
        });
    }

    // Cancel (close) the Edit option
    function cancelCustomerAdminEmailEdit() {
      vm.customerAdminEmailEdit = false;
      vm.customerAdminEmail = vm.oldcustomerAdminEmail;
    }

    // Allow Partner Admin Email address to be editted
    function showPartnerAdminEmailEdit() {
      vm.partnerAdminEmailEdit = true;
    }

    // Update Partner Admin Email and send welcome email
    function updatePartnerAdminEmail() {
      HelpdeskService.editAdminEmail(vm.orderUuid, vm.partnerAdminEmail, false)
        .then(function () {
          Notification.success('helpdesk.editAdminEmailSuccess');
          vm.oldpartnerAdminEmail = vm.partnerAdminEmail;
          vm.partnerAdminEmailEdit = false;
          vm.showPartnerEmailSent = false;
          $timeout(function () {
            getEmailStatus(false);
          }, 5000);
        }, function (response) {
          Notification.errorWithTrackingId(response, 'helpdesk.editAdminEmailFailure');
        });
    }

    // Cancel (close) the Edit option
    function cancelPartnerAdminEmailEdit() {
      vm.partnerAdminEmailEdit = false;
      vm.partnerAdminEmail = vm.oldpartnerAdminEmail;
    }

    // Resend the welcome email to specified party.  Attempt to last send date.
    function resendAdminEmail(isCustomer) {
      HelpdeskService.resendAdminEmail(vm.orderUuid, isCustomer)
        .then(function () {
          if (isCustomer) {
            vm.showCustomerEmailSent = false;
          } else {
            vm.showPartnerEmailSent = false;
          }

          $timeout(function () {
            getEmailStatus(isCustomer);
          }, 5000);
          Notification.success('helpdesk.resendMailSuccess');
        }, function (response) {
          Notification.errorWithTrackingId(response, 'helpdesk.resendMailFailure');
        });
    }

    // Transition to the customer page if account has been activated.
    function goToCustomerPage() {
      $state.go('helpdesk.org', { id: vm.accountOrgId });
    }

    function goToPartnerPage() {
      $state.go('helpdesk.org', { id: vm.partnerOrgId });
    }

    // Check if account has been activated.
    function isAccountActivated() {
      return (vm.accountActivated);
    }

    function partnerOrgExists() {
      return (vm.partnerOrgId);
    }
    function notifyError(response) {
      Notification.errorWithTrackingId(response, 'helpdesk.unexpectedError');
    }
  }
}());
