(function () {
  'use strict';

  module.exports = angular
    .module('hercules.serviceDescriptor', [
      require('modules/core/config/urlConfig'),
      require('modules/core/scripts/services/authinfo'),
      require('modules/core/scripts/services/org.service'),
    ])
    .service('ServiceDescriptor', ServiceDescriptor)
    .name;

  /* @ngInject */
  function ServiceDescriptor($http, UrlConfig, Authinfo, Orgservice) {
    function getServiceStatus(serviceId, orgId) {
      return $http.get(UrlConfig.getHerculesUrlV2() + '/organizations/' + (orgId || Authinfo.getOrgId()) + '/services/' + serviceId + '/status')
        .then(function (response) {
          return response.data;
        });
    }

    function getServices(orgId) {
      return $http.get(UrlConfig.getHerculesUrlV2() + '/organizations/' + (orgId || Authinfo.getOrgId()) + '/services')
        .then(extractData);
    }

    function extractData(res) {
      return res.data.items;
    }

    var filterEnabledServices = function (services) {
      return _.filter(services, function (service) {
        return service.id != 'squared-fusion-mgmt' && service.enabled;
      });
    };

    var filterAllExceptManagement = function (services) {
      return _.filter(services, function (service) {
        return service.id === 'squared-fusion-cal' || service.id === 'squared-fusion-uc';
      });
    };

    var getEmailSubscribers = function (serviceId) {
      return $http
        .get(UrlConfig.getHerculesUrlV2() + '/organizations/' + Authinfo.getOrgId() + '/services')
        .then(function (response) {
          var data = response.data;
          var service = _.find(data.items, {
            id: serviceId,
          });
          if (service !== undefined) {
            return _.without(service.emailSubscribers.split(','), '');
          }
          return [];
        });
    };

    var setEmailSubscribers = function (serviceId, emailSubscribers) {
      return $http
        .patch(UrlConfig.getHerculesUrlV2() + '/organizations/' + Authinfo.getOrgId() + '/services/' + serviceId, {
          emailSubscribers: emailSubscribers,
        });
    };

    var getOrgSettings = function () {
      var params = {
        basicInfo: true,
        disableCache: true,
      };
      return Orgservice.getOrg(_.noop, Authinfo.getOrgId(), params)
        .then(function (response) {
          if (!_.isEmpty(response.data.orgSettings)) {
            return response.data.orgSettings;
          }
        });
    };

    var setDisableEmailSendingToUser = function (calSvcDisableEmailSendingToEndUser) {
      var settings = {
        calSvcDisableEmailSendingToEndUser: !!calSvcDisableEmailSendingToEndUser,
      };

      return Orgservice.setOrgSettings(Authinfo.getOrgId(), settings);
    };

    var getAllWebExSiteOrgLevel = function () {
      var conferenceServices = Authinfo.getConferenceServicesWithoutSiteUrl() || [];
      var webexSiteUrls = _.map(conferenceServices, function (conferenceService) {
        return conferenceService.license.siteUrl;
      });

      return _.uniq(webexSiteUrls);
    };

    var setDefaultWebExSiteOrgLevel = function (defaultWebExSiteOrgLevel) {
      var settings = {
        calSvcDefaultWebExSite: defaultWebExSiteOrgLevel,
      };

      return Orgservice.setOrgSettings(Authinfo.getOrgId(), settings);
    };

    var setOneButtonToPushIntervalMinutes = function (bgbIntervalMinutes) {
      var settings = {
        bgbIntervalMinutes: bgbIntervalMinutes,
      };

      return Orgservice.setOrgSettings(Authinfo.getOrgId(), settings);
    };

    var enableService = function (serviceId) {
      var url = UrlConfig.getHerculesUrlV2() + '/organizations/' + Authinfo.getOrgId() + '/services/' + serviceId;
      return $http.patch(url, {
        enabled: true,
      })
        .then(extractData);
    };

    var disableService = function (serviceId) {
      var url = UrlConfig.getHerculesUrlV2() + '/organizations/' + Authinfo.getOrgId() + '/services/' + serviceId;
      return $http.patch(url, {
        enabled: false,
      })
        .then(extractData);
    };

    var isServiceEnabled = function (serviceId) {
      return getServices()
        .then(function (items) {
          var service = _.find(items, {
            id: serviceId,
          });
          return service ? service.enabled : false;
        });
    };

    return {
      filterEnabledServices: filterEnabledServices,
      filterAllExceptManagement: filterAllExceptManagement,
      isServiceEnabled: isServiceEnabled,
      getServiceStatus: getServiceStatus,
      getServices: getServices,
      getEmailSubscribers: getEmailSubscribers,
      setEmailSubscribers: setEmailSubscribers,
      getOrgSettings: getOrgSettings,
      setDisableEmailSendingToUser: setDisableEmailSendingToUser,
      getAllWebExSiteOrgLevel: getAllWebExSiteOrgLevel,
      setDefaultWebExSiteOrgLevel: setDefaultWebExSiteOrgLevel,
      setOneButtonToPushIntervalMinutes: setOneButtonToPushIntervalMinutes,
      enableService: enableService,
      disableService: disableService,
    };
  }
}());
