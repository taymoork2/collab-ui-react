'use strict';

angular.module('Squared')
  .service('BillingService', ['$http', 'Config', 'Log', 'Auth', '$log',
    function ($http, Config, Log, Auth, $log) {

      return {
        getOrderStatus: function (enc, callback) {
          var orderStatusUrl = Config.getAdminServiceUrl() + 'orders?enc=' + window.encodeURIComponent(enc);

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
        },

        resendCustomerEmail: function (orderId, callback) {
          var resendCustomerEmailUrl = Config.getAdminServiceUrl() + 'orders/' + orderId + '/customerAdminEmail';

          $http.post(resendCustomerEmailUrl)
            .success(function (data, status) {
              Log.debug('Resent customer welcome email for orderId: ' + orderId);
              callback(data, status);
            })
            .error(function (data, status) {
              callback(data, status);
            });
        },

        resendPartnerEmail: function (orderId, callback) {
          var resendPartnerEmailUrl = Config.getAdminServiceUrl() + 'orders/' + orderId + '/partnerAdminEmail';

          $http.post(resendPartnerEmailUrl)
            .success(function (data, status) {
              Log.debug('Resent partner welcome email for orderId: ' + orderId);
              callback(data, status);
            })
            .error(function (data, status) {
              callback(data, status);
            });
        }
      };
    }
  ]);
