(function () {
  'use strict';

  module.exports = {
    TrialWebexService: TrialWebexService,
    WebexOrderStatusResource: WebexOrderStatusResource,
  };

  var webexProvisioningData = {};

  /* @ngInject */
  function WebexOrderStatusResource($resource, Authinfo, UrlConfig) {
    return $resource(UrlConfig.getAdminServiceUrl() + 'organization/:orgId/trials/:trialId/provOrderStatus', {
      orgId: Authinfo.getOrgId(),
      trialId: '@trialId',
    }, {});
  }

  /* @ngInject */
  function TrialWebexService($http, $q, Config, UrlConfig, WebexOrderStatusResource, Notification, SetupWizardService) {
    var _trialData;
    var _siteValidationResponseMessage = {
      VALID_SITE: 'validSite',
      DOMAIN_INVALID: 'domainInvalid',
      DUPLICATE_SITE: 'duplicateSite',
    };
    var service = {
      getData: getData,
      reset: reset,
      validateSiteUrl: validateSiteUrl,
      getTrialStatus: getTrialStatus,
      provisionWebexSites: provisionWebexSites,
      provisionSubscriptionWithoutWebexSites: provisionSubscriptionWithoutWebexSites,
      provisionSubscription: provisionSubscription,
      setProvisioningWebexSendCustomerEmailFlag: setProvisioningWebexSendCustomerEmailFlag,
      setProvisioningWebexSitesData: setProvisioningWebexSitesData,
      getProvisioningWebexSitesData: getProvisioningWebexSitesData,
      _siteValidationResponseMessage: _siteValidationResponseMessage,
    };

    return service;

    ////////////////

    function getData() {
      return _trialData || _makeTrial();
    }

    function reset() {
      _makeTrial();
    }

    function _makeTrial() {
      var defaults = {
        type: Config.offerTypes.webex,
        enabled: false,
        details: {
          siteUrl: '',
          timeZone: undefined,
        },
      };

      _trialData = _.cloneDeep(defaults);
      return _trialData;
    }

    function validateSiteUrl(siteUrl, source) {
      var validationUrl = UrlConfig.getAdminServiceUrl() + '/orders/actions/shallowvalidation/invoke';
      var config = {
        method: 'POST',
        url: validationUrl,
        headers: {
          'Content-Type': 'text/plain',
        },
        data: {
          isTrial: true,
          properties: [{
            key: 'siteUrl',
            value: siteUrl,
          }],
        },
      };

      if (_.isString(source)) {
        _.set(config, 'data.source', source);
      }

      return $http(config).then(function (response) {
        var data = _.get(response, 'data.properties[0]', {});
        var errorCodes = {
          0: _siteValidationResponseMessage.VALID_SITE,
          434057: _siteValidationResponseMessage.DOMAIN_INVALID,
          439012: _siteValidationResponseMessage.DUPLICATE_SITE,
          439015: _siteValidationResponseMessage.DUPLICATE_SITE,
          431205: _siteValidationResponseMessage.DUPLICATE_SITE,
          431397: _siteValidationResponseMessage.DUPLICATE_SITE,
        };
        var isValid = (data.isValid === 'true');
        var doesNotExist = (data.isExist !== 'true');
        return {
          isValid: isValid && data.errorCode === '0' && doesNotExist,
          errorCode: errorCodes[data.errorCode] || 'invalidSite',
        };
      }).catch(function (response) {
        Notification.errorResponse(response, 'trialModal.meeting.validationHttpError');
      });
    }

    function setProvisioningWebexSitesData(webexLicenses, subscriptionId) {
      _.set(webexProvisioningData, 'webexLicencesPayload', webexLicenses);
      _.set(webexProvisioningData, 'subscriptionId', subscriptionId);
    }

    function getProvisioningWebexSitesData() {
      return webexProvisioningData;
    }

    function setProvisioningWebexSendCustomerEmailFlag(flag) {
      if (!_.isBoolean(flag)) {
        return $q.reject('paramater passed is not a boolean');
      }
      _.set(webexProvisioningData, 'sendCustomerEmail', flag);
    }

    function provisionWebexSites() {
      var payload = _.get(webexProvisioningData, 'webexLicencesPayload');
      var subscriptionId = _.get(webexProvisioningData, 'subscriptionId');

      return provisionSubscription(payload, subscriptionId)
        .finally(function () {
          SetupWizardService.clearDeterminantParametersFromSession();
        });
    }

    function provisionSubscriptionWithoutWebexSites() {
      var payload = {
        provisionOrder: true,
        serviceOrderUUID: SetupWizardService.getActingSubscriptionServiceOrderUUID(),
      };
      var subscriptionId = SetupWizardService.getInternalSubscriptionId();

      return provisionSubscription(payload, subscriptionId);
    }

    function provisionSubscription(payload, subscriptionId) {
      if (!payload || !_.isString(subscriptionId)) {
        $q.reject('invlaid paramenters passed to provision subscription.');
      }
      var webexProvisioningUrl = UrlConfig.getAdminServiceUrl() + 'subscriptions/' + subscriptionId + '/provision';

      if (_.has(webexProvisioningData, 'sendCustomerEmail')) {
        _.set(payload, 'sendCustomerEmail', webexProvisioningData.sendCustomerEmail);
      } else {
        _.set(payload, 'sendCustomerEmail', false);
      }

      return $http.post(webexProvisioningUrl, payload);
    }

    function getTrialStatus(trialId) {
      return WebexOrderStatusResource.get({
        trialId: trialId,
      }).$promise.then(function (data) {
        var orderStatus = data.provOrderStatus !== 'PROVISIONED';
        var timeZoneId = data.timeZoneId && data.timeZoneId.toString();

        return {
          siteUrl: data.siteUrl,
          timeZoneId: timeZoneId,
          trialExists: _.isUndefined(data.errorCode),
          pending: orderStatus,
        };
      });
    }
  }
})();
