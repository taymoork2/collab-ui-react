(function () {
  'use strict';

  angular.module('Core')
  .controller('CustomerSubscriptionsDetailCtrl', CustomerSubscriptionsDetail);

  function CustomerSubscriptionsDetail($stateParams, $window, Authinfo, Auth) {
    var vm = this;
    vm.subscriptions = [];
    vm.currentCustomer = $stateParams.currentCustomer;
    vm.customerOrgId = vm.currentCustomer.customerOrgId;
    vm.customerName = vm.currentCustomer.customerName;
    vm.customerEmail = vm.currentCustomer.customerEmail;
    vm.getSubscriptions = getSubscriptions;
    vm.sendMail = sendMail;
    vm.partnerOrgName = Authinfo.getOrgName();
    vm.partnerEmail = Authinfo.getPrimaryEmail();
    vm.customerInfo = ['Customer Info:', vm.customerName, vm.customerEmail, '', 'Partner Admin:', vm.partnerOrgName, vm.partnerEmail, '', 'Webex Subscriptions:', ''].join('%0D%0A');
    vm.customerInfoClipboard = ['Customer Info:', vm.customerName, vm.customerEmail, '', 'Partner Admin:', vm.partnerOrgName, vm.partnerEmail, '', 'Webex Subscriptions:', ''].join('\n');
    init();

    function init() {
      getSubscriptions();
    }
    function sendMail() {
      $window.location.href = 'mailto:' + '' + '?subject=' + 'Subscription Info: ' + vm.customerName + '&body=' + vm.customerInfo;
    }
    function getSubscriptions() {
      return Auth.getCustomerAccount(vm.customerOrgId).then(function (response) {
        var resources = _.get(response, 'data.customers[0].licenses', []);
        _.forEach(resources, function (customerLicenses) {
          var subscriptionId = _.get(customerLicenses, 'billingServiceId', 'Trial');
          var siteUrl = _.get(customerLicenses, 'siteUrl', '');
          var offerName = _.get(customerLicenses, 'offerName', '');
          var customerSubscription = {};
          if (siteUrl !== '' && offerName !== '') {
            customerSubscription = {
              siteUrl: siteUrl,
              subscriptionId: subscriptionId,
              offerName: offerName
            };
            vm.subscriptions.push(customerSubscription);
            _.forEach(vm.subscriptions, function (sub) {
              vm.customerInfo += ['', sub.offerName, sub.subscriptionId, sub.siteUrl].join('%0D%0A');
              vm.customerInfoClipboard += ['', sub.offerName, sub.subscriptionId, sub.siteUrl].join('\n');
            });
          }
        });
      });
    }
  }
})();
