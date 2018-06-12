(function () {
  'use strict';

  // TODO: Update all callback functions to be promises instead

  var angularCacheModule = require('angular-cache');
  var angularResourceModule = require('angular-resource');
  var angularTranslateModule = require('angular-translate');
  var authModule = require('modules/core/auth/auth');
  var configModule = require('modules/core/config/config').default;
  var urlConfigModule = require('modules/core/config/urlConfig');
  var authinfoModule = require('modules/core/scripts/services/authinfo');
  var logModule = require('modules/core/scripts/services/log');
  var utilsModule = require('modules/core/scripts/services/utils');

  module.exports = angular
    .module('core.org', [
      angularCacheModule,
      angularResourceModule,
      angularTranslateModule,
      authModule,
      authinfoModule,
      configModule,
      logModule,
      urlConfigModule,
      utilsModule,
    ])
    .factory('Orgservice', Orgservice)
    .name;

  /* @ngInject */
  function Orgservice($http, $q, $resource, Auth, Authinfo, CacheFactory, Log, UrlConfig, Utils, HuronCompassService) {
    var service = {
      getOrg: getOrg,
      getAdminOrg: getAdminOrg,
      getAdminOrgAsPromise: getAdminOrgAsPromise,
      getAdminOrgUsage: getAdminOrgUsage,
      clearOrgUsageCache: clearOrgUsageCache,
      updateOrgUsageCacheAge: updateOrgUsageCacheAge,
      getValidLicenses: getValidLicenses,
      getLicensesUsage: getLicensesUsage,
      getUnlicensedUsers: getUnlicensedUsers,
      isSetupDone: isSetupDone,
      setSetupDone: setSetupDone,
      isTestOrg: isTestOrg,
      setOrgSettings: setOrgSettings,
      createOrg: createOrg,
      deleteOrg: deleteOrg,
      getDeleteStatus: getDeleteStatus,
      listOrgs: listOrgs,
      getOrgCacheOption: getOrgCacheOption,
      getEftSetting: getEftSetting,
      setEftSetting: setEftSetting,
      setAllowCustomerSiteManagementSetting: setAllowCustomerSiteManagementSetting,
      getAllowCustomerSiteManagementSetting: getAllowCustomerSiteManagementSetting,
      validateSiteUrl: validateSiteUrl,
      setHybridServiceReleaseChannelEntitlement: setHybridServiceReleaseChannelEntitlement,
      updateDisplayName: updateDisplayName,
      setOrgEmailSuppress: setOrgEmailSuppress,
      getInternallyManagedSubscriptions: getInternallyManagedSubscriptions,
    };

    var savedOrgSettingsCache = [];
    var isTestOrgCache = {};
    var domainCache = {};

    var orgUsageCacheKey = 'orgServiceOrgUsageCache';
    var orgUsageCache = CacheFactory.get(orgUsageCacheKey);
    if (!orgUsageCache) {
      orgUsageCache = new CacheFactory(orgUsageCacheKey, {
        maxAge: 30 * 1000, // 30s
        deleteOnExpire: 'passive',
      });
    }

    return service;

    function getOrg(callback, orgId, params) {
      if (!orgId) {
        orgId = Authinfo.getOrgId();
      }

      if ((!_.isUndefined(params) && !_.isObject(params)) || !_.isFunction(callback)) {
        return $q.reject('Invalid parameters passed into getOrg service call');
      }

      var scomUrl = UrlConfig.getScomUrl() + '/' + orgId;
      var config = {};
      if (_.isObject(params)) {
        config.params = params;
      }

      return $http.get(scomUrl, config)
        .then(function (response) {
          var data = response.data;
          data = _.isObject(data) ? data : {};
          data.success = true;

          if (_.isEmpty(data.orgSettings)) {
            data.orgSettings = {};
            Log.debug('No orgSettings found for org: ' + data.id);
          } else {
            data.orgSettings = JSON.parse(_.last(data.orgSettings));
          }
          _.assign(data.orgSettings, getCachedOrgSettings(orgId));

          callback(data, response.status);
          return response;
        })
        .catch(function (response) {
          var data = response.data;
          data = _.isObject(data) ? data : {};
          data.success = false;
          data.status = response.status;
          callback(data, response.status);
          return $q.reject(response);
        });
    }

    function getAdminOrg(callback, oid, params) {
      var adminUrl = null;
      if (oid) {
        adminUrl = UrlConfig.getAdminServiceUrl() + 'organizations/' + oid;
      } else {
        adminUrl = UrlConfig.getAdminServiceUrl() + 'organizations/' + Authinfo.getOrgId();
      }

      var config = {};
      var defaultParams = {
        disableCache: false,
      };
      config.params = _.extend(defaultParams, params);

      if ((!_.isUndefined(params) && !_.isObject(params)) || !_.isFunction(callback)) {
        return $q.reject('Invalid parameters passed into getOrg service call');
      }

      return $http.get(adminUrl, config)
        .then(function (response) {
          var data = response.data;
          data = _.isObject(data) ? data : {};
          data.success = true;
          callback(data, response.status);
          return response;
        })
        .catch(function (response) {
          var data = response.data;
          if (!data || !(data instanceof Object)) {
            data = {};
          }
          data.success = false;
          data.status = response.status;
          callback(data, response.status);
          return $q.reject(response);
        });
    }

    function getAdminOrgAsPromise(oid, params) {
      return getAdminOrg(_.noop, oid, params)
        .catch(function (data, status) {
          data = _.extend({}, data, {
            success: false,
            status: status,
          });
          return $q.reject(data);
        })
        .then(function (data, status) {
          data = _.extend({}, data, {
            success: true,
            status: status,
          });
          return data;
        });
    }

    function getAdminOrgUsage(oid) {
      var orgId = oid || Authinfo.getOrgId();
      var adminUrl = UrlConfig.getAdminServiceUrl() + 'customers/' + orgId + '/usage';
      return $http.get(adminUrl, { cache: orgUsageCache });
    }

    function clearOrgUsageCache(oid) {
      var orgId = oid || Authinfo.getOrgId();
      var usageUrl = UrlConfig.getAdminServiceUrl() + 'customers/' + orgId + '/usage';
      orgUsageCache.remove(usageUrl);
    }

    function updateOrgUsageCacheAge(ageInSeconds) {
      orgUsageCache.setMaxAge(ageInSeconds * 1000);
    }

    function getLicensesUsage() {
      return getAdminOrgUsage()
        .then(function (response) {
          return _.map(response.data, function (subscription) {
            var licenses = _.reject(subscription.licenses, function (license) {
              return license.status === 'CANCELLED' || license.status === 'SUSPENDED';
            });
            var fallbackSubscriptionStatus = _.some(licenses, ['isTrial', true]) ? 'Trial' : 'unknown';
            return {
              subscriptionId: subscription.subscriptionId ? subscription.subscriptionId : fallbackSubscriptionStatus,
              internalSubscriptionId: subscription.internalSubscriptionId ?
                subscription.internalSubscriptionId : fallbackSubscriptionStatus,
              licenses: licenses,
            };
          });
        })
        .catch(function (err) {
          Log.debug('Get existing admin org failed. Status: ' + JSON.stringify(_.pick(err, 'status', 'statusText')));
          return $q.reject(err);
        });
    }

    function getValidLicenses() {
      var d = $q.defer();

      getAdminOrg(function (data, status) {
        var validLicenses;
        var usageLicenses = data.licenses || [];
        var statusLicenses = Authinfo.getLicenses();

        if (!data.success) {
          Log.debug('Get existing admin org failed. Status: ' + status);
          d.reject(status);
          return;
        }

        validLicenses = _.filter(usageLicenses, function (license) {
          var match = _.find(statusLicenses, {
            licenseId: license.licenseId,
          });
          // If the license is not valid do not add to list
          return !(match.status === 'CANCELLED' || match.status === 'SUSPENDED');
        });

        d.resolve(validLicenses);
      });

      return d.promise;
    }

    function getUnlicensedUsers(callback, oid, searchStr) {
      var adminUrl = null;
      if (oid) {
        if (searchStr) {
          adminUrl = UrlConfig.getAdminServiceUrl() + 'organizations/' + oid + '/unlicensedUsers?searchPrefix=' + searchStr;
        } else {
          adminUrl = UrlConfig.getAdminServiceUrl() + 'organizations/' + oid + '/unlicensedUsers';
        }
      } else {
        if (searchStr) {
          adminUrl = UrlConfig.getAdminServiceUrl() + 'organizations/' + Authinfo.getOrgId() + '/unlicensedUsers?searchPrefix=' + searchStr;
        } else {
          adminUrl = UrlConfig.getAdminServiceUrl() + 'organizations/' + Authinfo.getOrgId() + '/unlicensedUsers';
        }
      }

      $http.get(adminUrl)
        .then(function (response) {
          var data = response.data;
          data = _.isObject(data) ? data : {};
          data.success = true;
          callback(data, response.status);
        })
        .catch(function (response) {
          var data = response.data;
          data = _.isObject(data) ? data : {};
          data.success = false;
          data.status = response.status;
          callback(data, response.status);
        });
    }

    function setSetupDone() {
      var adminUrl = UrlConfig.getAdminServiceUrl() + 'organizations/' + Authinfo.getOrgId() + '/setup';

      return $http({
        method: 'PATCH',
        url: adminUrl,
      });
    }

    function isTestOrg(orgId) {
      if (_.isUndefined(orgId)) {
        orgId = Authinfo.getOrgId();
      }
      if (_.isBoolean(isTestOrgCache[orgId])) {
        HuronCompassService.setCustomerBaseDomain(domainCache[orgId]);
        return $q.resolve(isTestOrgCache[orgId]);
      }
      return getAdminOrgAsPromise(orgId, { basicInfo: true })
        .then(function (org) {
          var orgSettings = _.get(org, 'data.orgSettings[0]');
          if (orgSettings) {
            var domain = JSON.parse(orgSettings).sparkCallBaseDomain;
            HuronCompassService.setCustomerBaseDomain(domain);
            domainCache[orgId] = domain;
          }
          isTestOrgCache[orgId] = _.get(org, 'data.isTestOrg', false);
          return isTestOrgCache[orgId];
        });
    }

    function getCachedOrgSettings(orgId) {
      return _.chain(savedOrgSettingsCache)
        .filter(function (cache) {
          return cache.orgId === orgId && moment(cache.propertySaveTimeStamp).isAfter(moment().subtract(5, 'minutes'));
        })
        .map(function (cache) {
          return cache.setting;
        })
        .reduce(function (result, setting) {
          return _.merge(result, setting);
        }, {})
        .value();
    }

    /**
     * Get the latest orgSettings, merge with new settings, and PATCH the org
     */
    function setOrgSettings(orgId, settings) {
      var orgUrl = UrlConfig.getAdminServiceUrl() + 'organizations/' + orgId + '/settings';
      savedOrgSettingsCache.push({
        orgId: orgId,
        propertySaveTimeStamp: new Date(),
        setting: _.clone(settings),
      });
      var params = {
        disableCache: true,
      };
      return getOrg(_.noop, orgId, params) //get retrieves the pushed value above, no need to re assign to orgSettings
        .then(function (response) {
          var orgSettings = _.get(response, 'data.orgSettings', {});

          return $http({
            method: 'PATCH',
            url: orgUrl,
            data: orgSettings,
          });
        });
    }

    function returnAllowCustomerSiteManagementApiUrl(orgId) {
      return UrlConfig.getAdminServiceUrl() + 'organizations/' + orgId + '/settings/allowCustomerSiteManagement';
    }

    function setAllowCustomerSiteManagementSetting(orgId, settings) {
      if (_.isUndefined(orgId) || !_.isObject(settings)) {
        return $q.reject('Invalid parameters passed');
      }

      var url = returnAllowCustomerSiteManagementApiUrl(orgId);

      return $http.post(url, settings);
    }

    function getAllowCustomerSiteManagementSetting(orgId) {
      if (_.isUndefined(orgId)) {
        return $q.reject('Invalid parameters passed');
      }

      var url = returnAllowCustomerSiteManagementApiUrl(orgId);

      return $http.get(url);
    }

    function createOrg(enc, country) {
      var orgUrl = UrlConfig.getAdminServiceUrl() + 'organizations';
      var orgRequest = {
        encryptedQueryString: enc,
      };
      // only set 'country' property if passed in (otherwise, it is safe left as undefined)
      if (country) {
        orgUrl = orgUrl + '?country=' + _.get(country, 'id', 'US');
      }
      return Auth.setAccessToken().then(function () {
        return $http.post(orgUrl, orgRequest).then(function (response) {
          return response.data;
        });
      });
    }

    function deleteOrg(currentOrgId, deleteUsers) {
      if (!currentOrgId) {
        return $q.reject('currentOrgId is not set');
      }
      if (_.isUndefined(deleteUsers)) {
        deleteUsers = true;
      }
      var serviceUrl = UrlConfig.getAdminServiceUrl() + 'organizations/' + currentOrgId;
      return $http.delete(serviceUrl, { params: { deleteUsers: deleteUsers } })
        .then(function (response) { return response.data; });
    }

    function getDeleteStatus(statusUrl, clientAccessToken) {
      return $http.get(statusUrl, {
        headers: {
          Authorization: 'Bearer ' + clientAccessToken,
        },
      }).then(function (response) { return response.data; });
    }

    function listOrgs(filter) {
      if (!filter || filter.length <= 3) {
        return $q.reject('filter does not match requirements');
      }
      var orgUrl = UrlConfig.getProdAdminServiceUrl() + 'organizations?displayName=' + filter;

      if (Utils.isUUID(filter)) {
        return getAdminOrg(_.noop, filter).then(function (result) {
          // return it in the same manner as listOrgs
          return {
            data: {
              organizations: [result.data],
            },
          };
        });
      }

      return $http.get(orgUrl);
    }

    function setOrgEmailSuppress(isEmailSuppressed) {
      var adminUrl = UrlConfig.getAdminServiceUrl() + 'organizations/' + Authinfo.getOrgId() + '/emails';
      var emailSuppressRequest = {
        suppressEmail: isEmailSuppressed,
      };
      return $http.post(adminUrl, emailSuppressRequest);
    }

    function getOrgCacheOption(callback, oid, config) {
      var scomUrl = null;
      if (oid) {
        scomUrl = UrlConfig.getScomUrl() + '/' + oid;
      } else {
        scomUrl = UrlConfig.getScomUrl() + '/' + Authinfo.getOrgId();
      }

      if (!config) {
        config = {};
      }

      $http.get(scomUrl, config)
        .then(function (response) {
          var data = response.data;
          data = _.isObject(data) ? data : {};
          data.success = true;
          callback(data, response.status);
        })
        .catch(function (response) {
          var data = response.data;
          data = _.isObject(data) ? data : {};
          data.success = false;
          data.status = response.status;
          callback(data, response.status);
        });
    }

    function getEftSetting(currentOrgId) {
      if (_.isUndefined(currentOrgId)) {
        return $q.reject('An organization ID is required.');
      }
      var serviceUrl = UrlConfig.getAdminServiceUrl() + 'organizations/' + currentOrgId + '/settings/eft';

      return $http({
        method: 'GET',
        url: serviceUrl,
      });
    }

    function setEftSetting(setting, currentOrgId) {
      if (!_.isBoolean(setting) || _.isUndefined(currentOrgId)) {
        return $q.reject('A proper EFT setting and organization ID is required.');
      }

      var serviceUrl = UrlConfig.getAdminServiceUrl() + 'organizations/' + currentOrgId + '/settings/eft';

      return $http({
        method: 'PUT',
        url: serviceUrl,
        data: {
          eft: setting,
        },
      });
    }

    function isSetupDone(orgId) {
      return $http.get(Auth.getAuthorizationUrl(orgId))
        .then(function (data) {
          return data.data.setupDone;
        });
    }

    function setHybridServiceReleaseChannelEntitlement(orgId, channel, entitled) {
      return $http
        .post(UrlConfig.getAdminServiceUrl() + 'hybridservices/organizations/' + orgId + '/releaseChannels', {
          channel: channel,
          entitled: entitled,
        });
    }

    function validateSiteUrl(siteUrl) {
      var validationUrl = UrlConfig.getAdminServiceUrl() + '/orders/actions/shallowvalidation/invoke';
      var config = {
        method: 'POST',
        url: validationUrl,
        headers: {
          'Content-Type': 'text/plain',
        },
        data: {
          callbackUrl: 'https://api.cisco.com/sbp/provCallBack/',
          properties: [{
            key: 'siteUrl',
            value: siteUrl,
          }],
        },
      };

      return $http(config).then(function (response) {
        var data = _.get(response, 'data.properties[0]', {});
        var isValid = (data.isValid === 'true' && data.errorCode === '0');
        return {
          isValid: isValid,
        };
      });
    }

    function patchDisplayName(orgId, displayName, isValidate) {
      var customerDisplayNameResource = $resource(UrlConfig.getAdminServiceUrl() + '/customers/:customerId/displayName', {}, {
        patch: {
          method: 'PATCH',
        },
      });
      return customerDisplayNameResource.patch({
        customerId: orgId,
        verify: isValidate,
      }, {
        displayName: displayName,
      }).$promise;
    }

    function updateDisplayName(orgId, displayName) {
      return patchDisplayName(orgId, displayName)
        .then(function (response) {
          var status = _.get(response, 'status');
          if (status !== 'SUCCESS') {
            return $q.reject(response);
          }
        });
    }

    // filter out subscriptions where the sole license matches { offerName: 'MSGR' }
    // - as of 2017-07-24, 'Authinfo.isExternallyManagedLicense()' is sufficient for checking this
    // TODO: verify whether this should be the default behavior
    function getInternallyManagedSubscriptions() {
      return getLicensesUsage().then(function (subscriptions) {
        return _.reject(subscriptions, function (subscription) {
          var licenses = _.get(subscription, 'licenses');
          if (_.size(licenses) !== 1) {
            return false;
          }
          var license = _.head(licenses);
          return Authinfo.isExternallyManagedLicense(license);
        });
      });
    }
  }
})();
