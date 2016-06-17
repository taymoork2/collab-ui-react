(function () {
  'use strict';

  angular.module('Squared')
    .service('BillingService', BillingService);

  /* @ngInject */
  function BillingService($http, UrlConfig, Log, $window) {
    var service = {
      getOrderStatus: getOrderStatus,
      resendCustomerEmail: resendCustomerEmail,
      resendPartnerEmail: resendPartnerEmail
    };

    return service;

    function getOrderStatus(enc, callback) {
      var orderStatusUrl = UrlConfig.getAdminServiceUrl() + 'orders?enc=' + $window.encodeURIComponent(enc);

      $http.get(orderStatusUrl)
        .success(function (data, status) {
          data = data || {};
          data.success = true;
          Log.debug('Retrieved order status for enc: ' + enc);
          callback(data, status);
        })
        .error(function (data, status) {
          callback(data, status);
        });
    }

    function resendCustomerEmail(orderId, callback) {
      var resendCustomerEmailUrl = UrlConfig.getAdminServiceUrl() + 'orders/' + orderId + '/customerAdminEmail';

      $http.post(resendCustomerEmailUrl)
        .success(function (data, status) {
          Log.debug('Resent customer welcome email for orderId: ' + orderId);
          callback(data, status);
        })
        .error(function (data, status) {
          callback(data, status);
        });
    }

    function resendPartnerEmail(orderId, callback) {
      var resendPartnerEmailUrl = UrlConfig.getAdminServiceUrl() + 'orders/' + orderId + '/partnerAdminEmail';

      $http.post(resendPartnerEmailUrl)
        .success(function (data, status) {
          Log.debug('Resent partner welcome email for orderId: ' + orderId);
          callback(data, status);
        })
        .error(function (data, status) {
          callback(data, status);
        });
    }
  }
})();
