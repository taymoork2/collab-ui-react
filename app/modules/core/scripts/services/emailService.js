(function () {
  'use strict';

  angular.module('Core')
    .factory('EmailService', EmailService);

  /* @ngInject */
  function EmailService($http, $rootScope, Config, Authinfo, Auth, LogMetricsService) {

    var emailUrl = Config.getAdminServiceUrl() + 'email';

    var factory = {
      emailNotifyTrialCustomer: emailNotifyTrialCustomer,
      emailNotifyOrganizationCustomer: emailNotifyOrganizationCustomer
    };

    return factory;

    function emailNotifyTrialCustomer(customerEmail, trialPeriod, organizationId) {
      var emailData = {
        'type': '1',
        'properties': {
          'CustomerEmail': customerEmail,
          'TrialPeriod': trialPeriod,
          'OrganizationId': organizationId
        }
      };
      return email(emailData);
    }

    function emailNotifyOrganizationCustomer(customerAdminEmail, duration, organizationId) {
      var emailData = {
        'type': '1',
        'properties': {
          'CustomerEmail': customerAdminEmail,
          'TrialPeriod': duration,
          'OrganizationId': organizationId
        }
      };
      return email(emailData);
    }

    function email(_emailData) {
      var emailData = _emailData;
      return $http.post(emailUrl, emailData)
        .success(function (data, status, headers, config) {
          LogMetricsService.logMetrics('Email', LogMetricsService.getEventType('EmailService (success) - Type = ' + emailData.type), LogMetricsService.getEventAction('buttonClick'), status, moment(), 1, null);
        })
        .error(function (data, status, headers, config) {
          LogMetricsService.logMetrics('Email', LogMetricsService.getEventType('EmailService (error) - Type = ' + emailData.type), LogMetricsService.getEventAction('buttonClick'), status, moment(), 1, null);
        });
    }
  }
})();
