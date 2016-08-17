(function () {
  'use strict';

  angular.module('Core')
    .controller('CustomerSubscriptionsDetailCtrl', CustomerSubscriptionsDetail);

  function CustomerSubscriptionsDetail(CustomerSubscriptionsService, $stateParams, $window, Authinfo) {

    var vm = this;
    vm.subscriptions = [];
    vm.currentCustomer = $stateParams.currentCustomer;
    vm.customerOrgId = vm.currentCustomer.customerOrgId;
    vm.customerName = vm.currentCustomer.customerName;
    vm.customerEmail = vm.currentCustomer.customerEmail;
    vm.sendMail = sendMail;
    vm.partnerOrgName = Authinfo.getOrgName();
    vm.partnerEmail = Authinfo.getPrimaryEmail();
    vm.customerHeaderInfo = '';
    vm.customerInfo = '';
    vm.test = 'thisisatest';
    vm.customerHeaderInfo = ['Customer Info:', vm.customerName, vm.customerEmail, '', 'Partner Admin:', vm.partnerOrgName, vm.partnerEmail, '', 'Webex Subscriptions:', ''].join('%0D%0A');
    vm.customerHeaderInfoClipboard = ['Customer Info:', vm.customerName, vm.customerEmail, '', 'Partner Admin:', vm.partnerOrgName, vm.partnerEmail, '', 'Webex Subscriptions:', ''].join('\n');
    // vm.customerInfoClipBoard = '';

    init();

    function init() {
      getSubscriptions();
    }

    function sendMail() {
      $window.location.href = 'mailto:' + '' + '?subject=' + 'Subscription Info: ' + vm.customerName + '&body=' + vm.customerHeaderInfo + vm.customerInfo;
    }

    function getSubscriptions() {
      CustomerSubscriptionsService.getSubscriptions(vm.customerOrgId).then(function (response) {
        var resources = _.get(response, 'data.customers[0].licenses', []);
        _.forEach(resources, function (custTest) {
          var subscriptionId = 'Trial';
          var trainSite = '';
          var offerName = '';
          var customerSubscription = {};
          if (custTest.billingServiceId) {
            subscriptionId = _.get(custTest, 'billingServiceId');
          }
          if (custTest.siteUrl) {
            trainSite = _.get(custTest, 'siteUrl');
          }
          if (custTest.offerName) {
            offerName = _.get(custTest, 'offerName');
          }
          if (trainSite !== '') {
            customerSubscription = {
              trainSite: trainSite,
              subscriptionId: subscriptionId,
              offerName: offerName
            };
            vm.subscriptions.push(customerSubscription);
            var subString = '';
            // var subStringClipboard = '';

            _.forEach(vm.subscriptions, function (sub) {

              subString = ['', sub.offerName, sub.subscriptionId, sub.trainSite].join('%0D%0A');
              // subStringClipboard = ['', sub.offerName, sub.subscriptionId, sub.trainSite].join('\n');


            });
            vm.customerInfo += subString;
            // vm.customerInfoClipBoard +=subStringClipboard;
            // vm.customerHeaderInfoClipboard+=customerInfoClipBoard;

          }

        });

      });
    }
  }

})();
