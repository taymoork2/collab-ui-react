(function () {
  'use strict';

  angular.module('Core')
  .controller('CustomerSubscriptionsDetailCtrl', CustomerSubscriptionsDetail);

  function CustomerSubscriptionsDetail($stateParams, $q, $translate, Authinfo, Auth, CustomerAdministratorService, Notification, UserListService, Userservice, Utils) {
    var vm = this;
    vm.DEFAULT_ORDER_BY = 'email';
    vm.currentCustomer = $stateParams.currentCustomer;
    vm.customerOrgId = vm.currentCustomer.customerOrgId;
    vm.customerName = vm.currentCustomer.customerName;
    vm.sendMail = sendMail;
    vm.partnerOrgName = Authinfo.getOrgName();
    vm.clipboardText = '';
    vm.orderReq = {
      subscriptions: [],
      customerFullAdmins: [],
      partnerAdmins: [],
      body: '',
    };
    vm._helpers = {
      getSubscriptions: getSubscriptions,
      getCustomerFullAdmins: getCustomerFullAdmins,
      getSimplifiedUserList: getSimplifiedUserList,
      flattenAndJoin: flattenAndJoin,
      updateOrderReqBody: updateOrderReqBody,
    };

    init();

    function init() {
      var promises = {
        customerFullAdmins: getCustomerFullAdmins(),
        partnerAdmins: getPartnerAdmins(),
        subscriptions: getSubscriptions(),
      };
      $q.all(promises).then(function (results) {
        // sort lists of admins, then set
        results.customerFullAdmins = _.sortBy(results.customerFullAdmins, vm.DEFAULT_ORDER_BY);
        results.partnerAdmins = _.sortBy(results.partnerAdmins, vm.DEFAULT_ORDER_BY);
        _.set(vm, 'orderReq.customerFullAdmins', results.customerFullAdmins);
        _.set(vm, 'orderReq.partnerAdmins', results.partnerAdmins);
        _.set(vm, 'orderReq.subscriptions', results.subscriptions);
        vm._helpers.updateOrderReqBody();
      });
    }

    function updateOrderReqBody() {
      var customerFullAdminLineEntries = _.map(vm.orderReq.customerFullAdmins, 'emailAndName');
      var partnerAdminLineEntries = _.map(vm.orderReq.partnerAdmins, 'emailAndName');
      var subscriptionLineEntries = _.map(vm.orderReq.subscriptions, function (sub) {
        return sub.subscriptionId + ' - ' + sub.siteUrl;
      });

      var result = [
        $translate.instant('customerSubscriptions.customerAdmin'),
        customerFullAdminLineEntries,
        '',
        $translate.instant('customerSubscriptions.partnerAdmin'),
        partnerAdminLineEntries,
        '',
      ];

      if (!subscriptionLineEntries.length) {
        result.push($translate.instant('customerSubscriptions.noWebexSubscriptions'));
      } else {
        result.push($translate.instant('customerSubscriptions.webexSubscriptions'));
        result.push(subscriptionLineEntries);
      }

      vm.orderReq.body = vm._helpers.flattenAndJoin(result, '\n');
      vm.clipboardText = vm.orderReq.body;
    }

    function sendMail() {
      var subject = $translate.instant('customerSubscriptions.subscriptionInfo') + ' ' + vm.customerName;
      var body = vm.orderReq.body;
      Utils.mailTo({
        subject: subject,
        body: body,
      });
    }

    function getSubscriptions() {
      var subscriptionArray = [];
      return Auth.getCustomerAccount(vm.customerOrgId).then(function (response) {
        var resources = _.get(response, 'data.customers[0].licenses', []);
        _.forEach(resources, function (customerLicenses) {
          var subscriptionId = _.get(customerLicenses, 'billingServiceId', 'Trial');
          var siteUrl = _.get(customerLicenses, 'siteUrl', '');
          var customerSubscription = {};
          if (siteUrl !== '') {
            if (!_.find(subscriptionArray, {
              siteUrl: siteUrl,
              subscriptionId: subscriptionId,
            })) {
              customerSubscription = {
                siteUrl: siteUrl,
                subscriptionId: subscriptionId,
              };
              subscriptionArray.push(customerSubscription);
            }
          }
        });
        return subscriptionArray;
      }).catch(function () {
        return [];
      });
    }

    function getSimplifiedUserList(ciResponse) {
      var users = _.get(ciResponse, 'data.Resources', []);
      return _.map(users, function (user) {
        var email = Userservice.getPrimaryEmailFromUser(user);
        var displayName = Userservice.getAnyDisplayableNameFromUser(user);
        displayName = (displayName === email) ? undefined : displayName;
        var emailAndName = email;
        if (displayName) {
          emailAndName += ' - ' + displayName;
        }
        return {
          email: email,
          displayName: displayName,
          emailAndName: emailAndName,
        };
      });
    }

    function getCustomerFullAdmins() {
      var params = { orgId: vm.customerOrgId };
      return UserListService.listFullAdminUsers(params).then(getSimplifiedUserList);
    }

    function getPartnerAdmins() {
      return CustomerAdministratorService.getCustomerAdmins(vm.customerOrgId)
        .then(getSimplifiedUserList)
        .catch(function (response) {
          Notification.errorWithTrackingId(response, 'customerAdminPanel.customerAdministratorServiceError');
          return [];
        });
    }

    function flattenAndJoin(targetArray, joiner) {
      return _.chain(targetArray)
      .flatten()
      .join(joiner)
      .value();
    }
  }

})();
