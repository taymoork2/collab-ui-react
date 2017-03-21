(function () {
  'use strict';

  var angularResourceModule = require('angular-resource');
  var angularTranslateModule = require('angular-translate');
  var authModule = require('modules/core/auth/auth');
  var configModule = require('modules/core/config/config');
  var urlConfigModule = require('modules/core/config/urlConfig');
  var authinfoModule = require('modules/core/scripts/services/authinfo');
  var logModule = require('modules/core/scripts/services/log');
  var utilsModule = require('modules/core/scripts/services/utils');

  module.exports = angular
    .module('core.org', [
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
  function Orgservice($http, $q, $resource, $translate, Auth, Authinfo, Log, UrlConfig, Utils) {
    var service = {
      getOrg: getOrg,
      getAdminOrg: getAdminOrg,
      getAdminOrgAsPromise: getAdminOrgAsPromise,
      getAdminOrgUsage: getAdminOrgUsage,
      getValidLicenses: getValidLicenses,
      getLicensesUsage: getLicensesUsage,
      getUnlicensedUsers: getUnlicensedUsers,
      isSetupDone: isSetupDone,
      setSetupDone: setSetupDone,
      setOrgSettings: setOrgSettings,
      createOrg: createOrg,
      deleteOrg: deleteOrg,
      listOrgs: listOrgs,
      getOrgCacheOption: getOrgCacheOption,
      getEftSetting: getEftSetting,
      setEftSetting: setEftSetting,
      setOrgAltHdsServersHds: setOrgAltHdsServersHds,
      validateSiteUrl: validateSiteUrl,
      setHybridServiceReleaseChannelEntitlement: setHybridServiceReleaseChannelEntitlement,
      updateDisplayName: updateDisplayName,
      validateDisplayName: validateDisplayName,
    };

    var savedOrgSettingsCache = [];

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
        .success(function (data, status) {
          data = _.isObject(data) ? data : {};
          data.success = true;

          if (_.isEmpty(data.orgSettings)) {
            data.orgSettings = {};
            Log.debug('No orgSettings found for org: ' + data.id);
          } else {
            data.orgSettings = JSON.parse(_.last(data.orgSettings));
          }
          _.assign(data.orgSettings, getCachedOrgSettings(orgId));

          callback(data, status);
        })
        .error(function (data, status) {
          data = _.isObject(data) ? data : {};
          data.success = false;
          data.status = status;
          callback(data, status);
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
        .success(function (data, status) {
          data = _.isObject(data) ? data : {};
          data.success = true;
          callback(data, status);
        })
        .error(function (data, status) {
          if (!data || !(data instanceof Object)) {
            data = {};
          }
          data.success = false;
          data.status = status;
          callback(data, status);
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
      return $http.get(adminUrl, { cache: true });
    }

    function getLicensesUsage() {
      return getAdminOrgUsage()
        .then(function (response) {
          var usageLicenses = response.data || [];
          var statusLicenses = Authinfo.getLicenses();
          var trial = '';

          var result = [];
          _.forEach(usageLicenses, function (usageLicense) {
            var licenses = _.filter(usageLicense.licenses, function (license) {
              var match = _.find(statusLicenses, {
                'licenseId': license.licenseId,
              });
              trial = license.isTrial ? 'Trial' : 'unknown';
              return !(_.isUndefined(match) || match.status === 'CANCELLED' || match.status === 'SUSPENDED');
            });

            var subscription = {
              "subscriptionId": usageLicense.subscriptionId ? usageLicense.subscriptionId : trial,
              "internalSubscriptionId": usageLicense.internalSubscriptionId ?
                usageLicense.internalSubscriptionId : trial,
              "licenses": licenses,
            };
            result.push(subscription);
          });
          return result;
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
            'licenseId': license.licenseId,
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
          adminUrl = UrlConfig.getAdminServiceUrl() + 'organizations/' + oid + "/unlicensedUsers?searchPrefix=" + searchStr;
        } else {
          adminUrl = UrlConfig.getAdminServiceUrl() + 'organizations/' + oid + "/unlicensedUsers";
        }
      } else {
        if (searchStr) {
          adminUrl = UrlConfig.getAdminServiceUrl() + 'organizations/' + Authinfo.getOrgId() + "/unlicensedUsers?searchPrefix=" + searchStr;
        } else {
          adminUrl = UrlConfig.getAdminServiceUrl() + 'organizations/' + Authinfo.getOrgId() + "/unlicensedUsers";
        }
      }

      $http.get(adminUrl)
        .success(function (data, status) {
          data = _.isObject(data) ? data : {};
          data.success = true;
          callback(data, status);
        })
        .error(function (data, status) {
          data = _.isObject(data) ? data : {};
          data.success = false;
          data.status = status;
          callback(data, status);
        });
    }

    function setSetupDone() {
      var adminUrl = UrlConfig.getAdminServiceUrl() + 'organizations/' + Authinfo.getOrgId() + '/setup';

      return $http({
        method: 'PATCH',
        url: adminUrl,
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

    function createOrg(enc, country) {
      var orgUrl = UrlConfig.getAdminServiceUrl() + 'organizations';
      var orgRequest = {
        encryptedQueryString: enc,
      };
      // only set 'country' property if passed in (otherwise, it is safe left as undefined)
      if (country) {
        _.set(orgRequest, 'country', _.get(country, 'id', 'US'));
      }
      return Auth.setAccessToken().then(function () {
        return $http.post(orgUrl, orgRequest).then(function (response) {
          return response.data;
        });
      });
    }

    function deleteOrg(currentOrgId) {
      if (!currentOrgId) {
        return $q.reject('currentOrgId is not set');
      }
      var serviceUrl = UrlConfig.getAdminServiceUrl() + 'organizations/' + currentOrgId;

      return $http({
        method: 'DELETE',
        url: serviceUrl,
      });
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
        .success(function (data, status) {
          data = _.isObject(data) ? data : {};
          data.success = true;
          callback(data, status);
        })
        .error(function (data, status) {
          data = _.isObject(data) ? data : {};
          data.success = false;
          data.status = status;
          callback(data, status);
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

    function setOrgAltHdsServersHds(orgId, altHdsServers) {
      var serviceUrl = UrlConfig.getAdminServiceUrl() + 'organizations/' + orgId + '/settings/altHdsServers';
      return $http.put(serviceUrl, altHdsServers);
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
          if (status === 'DUPLICATE') {
            return $q.reject($translate.instant('helpdesk.org.duplicateName'));
          } else if (status !== 'SUCCESS') {
            return $q.reject(response);
          }
        });
    }

    function validateDisplayName(orgId, displayName) {
      return patchDisplayName(orgId, displayName, true)
        .then(function (response) {
          return _.get(response, 'status') === 'ALLOWED';
        });
    }
  }
})();
