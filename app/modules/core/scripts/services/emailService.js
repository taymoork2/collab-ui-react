(function () {
  'use strict';

  angular.module('Core')
    .factory('EmailService', EmailService);

  /* @ngInject */
  function EmailService($http, LogMetricsService, UrlConfig) {

    var _types = {
      CUSTOMER_TRIAL: '1',
      NEW_DR_ORDER_WELCOME: '20'
    };
    var _helpers = {
      mkTrialPayload: mkTrialPayload
    };
    var emailUrl = UrlConfig.getAdminServiceUrl() + 'email';

    var factory = {
      emailNotifyTrialCustomer: emailNotifyTrialCustomer,
      _types: _types,
      _helpers: _helpers
    };

    return factory;

    function mkTrialPayload(customerEmail, trialPeriod, organizationId) {
      return {
        type: _types.CUSTOMER_TRIAL,
        addressTo: customerEmail,
        properties: {
          CustomerEmail: customerEmail,
          TrialPeriod: trialPeriod,
          OrganizationId: organizationId
        }
      };
    }

    function emailNotifyTrialCustomer(customerEmail, trialPeriod, organizationId) {
      var emailData = mkTrialPayload(customerEmail, trialPeriod, organizationId);
      return email(emailData);
    }

    function email(_emailData) {
      var emailData = _emailData;
      return $http.post(emailUrl, emailData)
        .success(function (data, status) {
          LogMetricsService.logMetrics('Email', LogMetricsService.getEventType('EmailService (success) - Type = ' + emailData.type), LogMetricsService.getEventAction('buttonClick'), status, moment(), 1, null);
        })
        .error(function (data, status) {
          LogMetricsService.logMetrics('Email', LogMetricsService.getEventType('EmailService (error) - Type = ' + emailData.type), LogMetricsService.getEventAction('buttonClick'), status, moment(), 1, null);
        });
    }
  }
})();
