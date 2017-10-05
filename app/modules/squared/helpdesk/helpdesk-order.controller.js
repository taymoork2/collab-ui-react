(function () {
  'use strict';

  angular
    .module('Squared')
    .controller('HelpdeskOrderController', HelpdeskOrderController);

  /* @ngInject */
  function HelpdeskOrderController($state, $stateParams, $translate, $timeout, $window, Authinfo, FeatureToggleService, HelpdeskService, Notification) {
    $('body').css('background', 'white');
    var vm = this;
    if ($stateParams.order) {
      vm.order = $stateParams.order;
      vm.orderId = vm.order.externalOrderId;
    } else {
      vm.orderId = $stateParams.id;
    }
    // Flag to show spinners while email update is being fetched
    vm.loadingCustomerEmailUpdate = false;
    vm.loadingPartnerEmailUpdate = false;
    vm.loadingProvisioningContactUpdate = false;

    // Flags to toggle input field and edit button
    vm.showCustomerEmailEditView = false;
    vm.showPartnerEmailEditView = false;
    vm.showProvisioningContactEditView = false;

    // Logic for showing links
    vm.isAccountActivated = isAccountActivated;
    vm.isAccountPendingActivation = isAccountPendingActivation;
    vm.isOrderPendingProvisioning = isOrderPendingProvisioning;
    vm.isOrderProvisioned = isOrderProvisioned;

    vm.showEmailEditView = showEmailEditView;
    vm.updateAdminEmail = updateAdminEmail;
    vm.getEmailStatus = getEmailStatus;
    vm.cancelAdminEmailEdit = cancelAdminEmailEdit;
    vm.resendAdminEmail = resendAdminEmail;
    vm.hasPermissionToEditInfo = Authinfo.isOrderAdminUser();
    vm.goToCustomerPage = goToCustomerPage;
    vm.goToPartnerPage = goToPartnerPage;
    vm.goToProvisionedCustomerPage = goToProvisionedCustomerPage;
    vm.launchOrderProcessingClient = launchOrderProcessingClient;

    // Feature toggle to hide setup link
    vm.supportsHelpDeskOrderSetup = false;

    vm._helpers = {
      notifyError: notifyError,
    };

    vm.emailTypes = {
      CUSTOMER: 'customer',
      PARTNER: 'partner',
      PROVISIONING: 'provisioning',
    };

    var oneTier = '1-tier';
    var PROVISIONED = 'PROVISIONED';

    var emailObjsMap = {
      customer: {
        email: 'customerAdminEmail',
        showEditEmail: 'showCustomerEmailEditView',
        showLoadingEmail: 'loadingCustomerEmailUpdate',
        lastTimeSent: 'customerEmailSent',
        oldEmail: 'oldcustomerAdminEmail',
      },
      partner: {
        email: 'partnerAdminEmail',
        showEditEmail: 'showPartnerEmailEditView',
        showLoadingEmail: 'loadingPartnerEmailUpdate',
        lastTimeSent: 'partnerEmailSent',
        oldEmail: 'oldpartnerAdminEmail',

      },
      provisioning: {
        email: 'lastProvisioningContact',
        showEditEmail: 'showProvisioningContactEditView',
        showLoadingEmail: 'loadingCustomerEmailUpdate',
        lastTimeSent: 'customerEmailSent',
        oldEmail: 'oldLastProvisioningContact',
      },
    };

    // Get Order details
    if (!vm.order) {
      HelpdeskService.searchOrders(vm.orderId).then(initOrderView, vm._helpers.notifyError);
    } else {
      initOrderView(vm.order);
    }

    function initOrderView(order) {
      FeatureToggleService.atlasHelpDeskOrderSetupGetStatus().then(function (result) {
        vm.supportsHelpDeskOrderSetup = result;
      });

      // Getting information from the order.
      var orderObj;
      if (_.isArray(order)) {
        orderObj = _.find(order, function (res) {
          return res.orderStatus === PROVISIONED;
        });
        if (_.isEmpty(orderObj)) {
          return;
        }
      } else {
        orderObj = order;
      }
      vm.orderUuid = orderObj.orderUuid;
      vm.subscriptionId = orderObj.serviceId;
      vm.accountId = orderObj.accountId;
      vm.orderId = orderObj.externalOrderId;

      //Getting the customer info from order payload or update clientContent
      var emailUpdates = _.get(orderObj, 'clientContent.adminEmailUpdates');
      var customerEmailUpdates = _.filter(emailUpdates, function (data) {
        return data.orderEmailType === 'CUSTOMER_ADMIN';
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
        return data.orderEmailType === 'PARTNER_ADMIN';
      });
      if (partnerEmailUpdates.length > 0) {
        partnerEmailUpdates = _.last(partnerEmailUpdates);
        vm.partnerAdminEmail = _.get(partnerEmailUpdates, 'adminDetails.emailId');
      } else {
        vm.rtm = _.get(orderObj, 'orderContent.common.rtm').toLowerCase();
        if (vm.rtm === oneTier) {
          vm.partnerAdminEmail = _.get(orderObj, 'orderContent.common.customerInfo.partnerInfo.adminDetails.emailId');
        } else if (orderObj.orderContent.common.customerInfo.resellerInfo && orderObj.orderContent.common.customerInfo.resellerInfo.id) {
          vm.partnerAdminEmail = _.get(orderObj, 'orderContent.common.customerInfo.resellerInfo.adminDetails.emailId');
        } else {
          vm.partnerAdminEmail = _.get(orderObj, 'orderContent.common.customerInfo.partnerInfo.adminDetails.emailId');
        }
      }
      vm.oldpartnerAdminEmail = vm.partnerAdminEmail;

      if (!vm.accountId) {
        vm.provisionTime = orderObj.orderStatus !== PROVISIONED ? null : (new Date(orderObj.lastModified)).toUTCString();
        vm.endCustomerName = _.get(orderObj, 'orderContent.common.customerInfo.endCustomerInfo.name');
        vm.customerEmailSent = orderObj.lastProvisioningEmailTimestamp ? (new Date(orderObj.lastProvisioningEmailTimestamp)).toUTCString() : undefined;
        vm.purchaseOrderId = orderObj.purchaseOrderId;
        vm.lastProvisioningContact = vm.order.lastProvisioningContact;
        vm.oldLastProvisioningContact = _.clone(vm.lastProvisioningContact);
      }
      // Getting the account details using the account Id from order.
      if (vm.accountId) {
        HelpdeskService.getAccount(vm.accountId)
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
            vm.provisionTime = (new Date(orderObj.orderReceived)).toUTCString();
            vm.accountActivated = false;
            vm.accountActivationInfo = $translate.instant('common.no');
            if (vm.accountOrgId) {
              // Getting the activation time if the account has already been activated.
              HelpdeskService.getOrg(vm.accountOrgId).then(function (org) {
                var activationDate = _.get(org, 'meta.created');
                if (activationDate) {
                  vm.accountActivated = true;
                  vm.accountActivationInfo = (new Date(activationDate)).toUTCString();
                }
              });
            }

            // Get the most recent date that emails were sent to customer and partner
            // First, get latest date the welcome email was sent to customer.
            getEmailStatus(vm.emailTypes.CUSTOMER);
            // If Partner is available, get the latest date welcome mail was sent to partner.
            if (vm.partnerOrgId) {
              getEmailStatus(vm.emailTypes.PARTNER);
            }
          }, function (response) {
            Notification.errorResponse(response, 'helpdesk.getOrgDetailsFailure');
            vm.accountName = $translate.instant('common.notAvailable');
            vm.provisionTime = $translate.instant('common.notAvailable');
            vm.accountActivated = $translate.instant('common.notAvailable');
          });
      } else if (!vm.isOrderPendingProvisioning()) {
        HelpdeskService.getSubscription(vm.order.subscriptionUuid)
          .then(function (res) {
            vm.orgId = _.get(res, 'customer.orgId');
          }, function (response) {
            Notification.errorResponse(response, 'helpdesk.getOrgDetailsFailure');
          });
      }
    }

    // Make REST calls to get the email status.
    function getEmailStatus(emailType) {
      var emailObj = emailObjsMap[emailType];
      HelpdeskService.getEmailStatus(vm[emailObj.email])
        .then(function (response) {
          var emailSent = getEmailSentTime(response);
          if (emailSent && emailSent.timestamp) {
            vm[emailObj.lastTimeSent] = HelpdeskService.unixTimestampToUTC(emailSent.timestamp);
          }
          vm[emailObj.showLoadingEmail] = false;
        }, vm._helpers.notifyError);
    }

    function getEmailSentTime(emails) {
      var mailStat = _.filter(emails, function (data) {
        return data.event === 'delivered';
      });
      if (mailStat) {
        mailStat = _.first(mailStat);
      }
      return mailStat;
    }

    // Allow Customer Admin Email address to be editted
    function showEmailEditView(emailType) {
      var editViewFlag = emailObjsMap[emailType].showEditEmail;
      vm[editViewFlag] = true;
    }

    function updateAdminEmail(emailType) {
      var isCustomer = emailType === vm.emailTypes.CUSTOMER || emailType === vm.emailTypes.PROVISIONING;
      var emailObj = emailObjsMap[emailType];
      HelpdeskService.editAdminEmail(vm.orderUuid, vm[emailObj.email], isCustomer)
        .then(function () {
          Notification.success('helpdesk.editAdminEmailSuccess');
          var emailTypeMap = emailObjsMap[emailType];
          vm[emailTypeMap.oldEmail] = vm[emailTypeMap.email];
          vm[emailTypeMap.showLoadingEmail] = true;
          vm[emailTypeMap.showEditEmail] = false;
          $timeout(function () {
            getEmailStatus(emailType);
          }, 5000);
        }, function (response) {
          Notification.errorResponse(response, 'helpdesk.editAdminEmailFailure');
        });
    }

    function isAccountActivated() {
      return vm.accountId && vm.accountActivated;
    }

    function isAccountPendingActivation() {
      return vm.accountId && !vm.accountActivated;
    }

    function isOrderPendingProvisioning() {
      return vm.purchaseOrderId && vm.order.orderStatus !== PROVISIONED;
    }

    function isOrderProvisioned() {
      return vm.purchaseOrderId && vm.order.orderStatus === PROVISIONED;
    }

    // Cancel (close) the Edit option
    function cancelAdminEmailEdit(emailType) {
      var emailObj = emailObjsMap[emailType];
      vm[emailObj.email] = vm[emailObj.oldEmail];
      vm[emailObj.showEditEmail] = false;
    }

    // Resend the welcome email to specified party.  Attempt to last send date.
    function resendAdminEmail(emailType) {
      var isCustomer = (emailType === vm.emailTypes.CUSTOMER || emailType === vm.emailTypes.PROVISIONING);
      HelpdeskService.resendAdminEmail(vm.orderUuid, isCustomer)
        .then(function () {
          var emailObj = emailObjsMap[emailType];
          vm[emailObj.showLoadingEmail] = true;
          $timeout(function () {
            getEmailStatus(emailType);
          }, 5000);
          Notification.success('helpdesk.resendMailSuccess');
        }, function (response) {
          Notification.errorResponse(response, 'helpdesk.resendMailFailure');
        });
    }

    // Transition to the customer page if account has been activated.
    function goToCustomerPage() {
      $state.go('helpdesk.org', { id: vm.accountOrgId });
    }

    function goToPartnerPage() {
      $state.go('helpdesk.org', { id: vm.partnerOrgId });
    }

    function goToProvisionedCustomerPage() {
      if (!vm.orgId) {
        return Notification.error('helpdesk.getOrgDetailsFailure');
      }
      $state.go('helpdesk.org', { id: vm.orgId });
    }

    function launchOrderProcessingClient() {
      HelpdeskService.getOrderProcessingUrl(vm.order.purchaseOrderId)
        .then(function (opcUrl) {
          $window.open(opcUrl, '_blank');
        }, function (res) {
          notifyError(res);
        });
    }

    function notifyError(response) {
      Notification.errorResponse(response, 'helpdesk.unexpectedError');
    }
  }
}());
