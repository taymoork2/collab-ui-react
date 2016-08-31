(function () {
  'use strict';

  module.exports = angular
    .module('core.org', [
      require('modules/core/auth/auth'),
      require('modules/core/config/config'),
      require('modules/core/config/urlConfig'),
      require('modules/core/scripts/services/authinfo'),
      require('modules/core/scripts/services/log'),
      require('modules/core/scripts/services/utils'),
    ])
    .factory('Orgservice', Orgservice)
    .name;

  /* @ngInject */
  function Orgservice($http, $q, Auth, Authinfo, Config, Log, UrlConfig, Utils) {
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
      getHybridServiceAcknowledged: getHybridServiceAcknowledged,
      setHybridServiceAcknowledged: setHybridServiceAcknowledged,
      getEftSetting: getEftSetting,
      setEftSetting: setEftSetting
    };

    var savedOrgSettingsCache = [];

    return service;

    function getOrg(callback, orgId, disableCache) {
      if (!orgId) {
        orgId = Authinfo.getOrgId();
      }
      var scomUrl = UrlConfig.getScomUrl() + '/' + orgId;

      if (disableCache) {
        scomUrl = scomUrl + '?disableCache=true';
      }
      return $http.get(scomUrl)
        .success(function (data, status) {
          data = data || {};
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
          data = data || {};
          data.success = false;
          data.status = status;
          callback(data, status);
        });
    }

    function getAdminOrg(callback, oid, disableCache) {
      var adminUrl = null;
      if (oid) {
        adminUrl = UrlConfig.getAdminServiceUrl() + 'organizations/' + oid;
      } else {
        adminUrl = UrlConfig.getAdminServiceUrl() + 'organizations/' + Authinfo.getOrgId();
      }

      var cacheDisabled = !!disableCache;
      return $http.get(adminUrl, {
        params: {
          disableCache: cacheDisabled
        }
      })
        .success(function (data, status) {
          data = data || {};
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

    function getAdminOrgAsPromise(oid, disableCache) {
      return getAdminOrg(_.noop, oid, disableCache)
        .catch(function (data, status) {
          data = _.extend({}, data, {
            success: false,
            status: status
          });
          return $q.reject(data);

        })
        .then(function (data, status) {
          data = _.extend({}, data, {
            success: true,
            status: status
          });
          return data;
        });
    }

    function getAdminOrgUsage(oid) {
      var orgId = oid || Authinfo.getOrgId();
      var adminUrl = UrlConfig.getAdminServiceUrl() + 'customers/' + orgId + '/usage';
      return $http.get(adminUrl);
    }

    function getLicensesUsage() {
      return getAdminOrgUsage().then(function (response) {

        var usageLicenses = response.data || [];
        var statusLicenses = Authinfo.getLicenses();
        var trial = '';

        var result = [];
        _.forEach(usageLicenses, function (usageLicense) {
          var licenses = _.filter(usageLicense.licenses, function (license) {
            var match = _.find(statusLicenses, {
              'licenseId': license.licenseId
            });
            trial = license.isTrial ? 'Trial' : 'unknown';
            return !(_.isUndefined(match) || match.status === 'CANCELLED' || match.status === 'SUSPENDED');
          });

          var subscription = {
            "subscriptionId": usageLicense.subscriptionId ? usageLicense.subscriptionId : trial,
            "internalSubscriptionId": usageLicense.internalSubscriptionId ?
                                      usageLicense.internalSubscriptionId : trial,
            "licenses": licenses
          };
          result.push(subscription);
        });
        return result;
      }).catch(function (err) {
        Log.debug('Get existing admin org failed. Status: ' + err);
        throw err;
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
            'licenseId': license.licenseId
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
          data = data || {};
          data.success = true;
          callback(data, status);
        })
        .error(function (data, status) {
          data = data || {};
          data.success = false;
          data.status = status;
          callback(data, status);
        });
    }

    function setSetupDone() {
      var adminUrl = UrlConfig.getAdminServiceUrl() + 'organizations/' + Authinfo.getOrgId() + '/setup';

      return $http({
        method: 'PATCH',
        url: adminUrl
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
        setting: _.clone(settings)
      });
      return getOrg(_.noop, orgId, true) //get retrieves the pushed value above, no need to re assign to orgSettings
        .then(function (response) {
          var orgSettings = _.get(response, 'data.orgSettings', {});

          return $http({
            method: 'PATCH',
            url: orgUrl,
            data: orgSettings
          });
        });
    }

    function createOrg(enc) {
      var orgUrl = UrlConfig.getAdminServiceUrl() + 'organizations';
      var orgRequest = {
        'encryptedQueryString': enc
      };
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
        url: serviceUrl
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
              organizations: [result.data]
            }
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
          data = data || {};
          data.success = true;
          callback(data, status);
        })
        .error(function (data, status) {
          data = data || {};
          data.success = false;
          data.status = status;
          callback(data, status);
        });
    }

    function getHybridServiceAcknowledged() {
      var serviceUrl = UrlConfig.getHerculesUrl() + '/organizations/' + Authinfo.getOrgId() + '/services';
      return $http({
        method: 'GET',
        url: serviceUrl
      });
    }

    function setHybridServiceAcknowledged(serviceName) {
      var serviceUrl = UrlConfig.getHerculesUrl() + '/organizations/' + Authinfo.getOrgId() + '/services/';
      if (serviceName === 'calendar-service') {
        serviceUrl = serviceUrl.concat(Config.entitlements.fusion_cal);
      } else if (serviceName === 'call-aware-service') {
        serviceUrl = serviceUrl.concat(Config.entitlements.fusion_uc);
      } else if (serviceName === 'call-connect-service') {
        serviceUrl = serviceUrl.concat(Config.entitlements.fusion_ec);
      } else if (serviceName === 'squared-fusion-media') {
        serviceUrl = serviceUrl.concat(Config.entitlements.mediafusion);
      } else {
        return $q(function (resolve, reject) {
          reject('serviceName is invalid: ' + serviceName);
        });
      }
      return $http({
        method: 'PATCH',
        url: serviceUrl,
        data: {
          "acknowledged": true
        }
      }).error(function () {
        Log.error("Error in PATCH acknowledge status to " + serviceUrl);
      });
    }

    function getEftSetting(currentOrgId) {
      if (_.isUndefined(currentOrgId)) {
        return $q.reject('An organization ID is required.');
      }
      var serviceUrl = UrlConfig.getAdminServiceUrl() + 'organizations/' + currentOrgId + '/settings/eft';

      return $http({
        method: 'GET',
        url: serviceUrl
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
          eft: setting
        }
      });
    }

    function isSetupDone(orgId) {
      return $http.get(Auth.getAuthorizationUrl(orgId))
        .then(function (data) {
          return data.data.setupDone;
        });
    }
  }
})();
