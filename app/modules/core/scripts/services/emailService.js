(function () {
  'use strict';

  angular.module('Core')
    .factory('EmailService', EmailService);

  /* @ngInject */
  function EmailService($http, LogMetricsService, UrlConfig) {

    var _types = {
      CUSTOMER_TRIAL: '1',
      NOTIFY_PARTNER_ADMIN_CUSTOMER_TRIAL_EXT_INTEREST: '15',
      NEW_DR_ORDER_WELCOME: '20'
    };
    var _helpers = {
      mkTrialPayload: mkTrialPayload,
      mkTrialConversionReqPayload: mkTrialConversionReqPayload
    };
    var emailUrl = UrlConfig.getAdminServiceUrl() + 'email';

    var factory = {
      emailNotifyTrialCustomer: emailNotifyTrialCustomer,
      emailNotifyPartnerTrialConversionRequest: emailNotifyPartnerTrialConversionRequest,
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

    function mkTrialConversionReqPayload(customerName, customerEmail, partnerEmail, webexSiteUrl) {
      return {
        type: _types.NOTIFY_PARTNER_ADMIN_CUSTOMER_TRIAL_EXT_INTEREST,
        addressTo: partnerEmail,
        properties: {
          CUSTOMER_NAME: customerName,
          CUSTOMER_EMAIL: customerEmail,
          PARTNER_EMAIL: partnerEmail,
          WEBEX_SITE_URL: webexSiteUrl,
          SUBJECT: customerName + ' wants to order or extend their trial'
        }
      };
    }

    // TODO: mv implemention to backend, front-end should shouldn't need this many properties
    function emailNotifyPartnerTrialConversionRequest(customerName, customerEmail, partnerEmail, webexSiteUrl) {
      var emailData = mkTrialConversionReqPayload(customerName, customerEmail, partnerEmail, webexSiteUrl);
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
