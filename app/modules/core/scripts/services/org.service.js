(function () {
  'use strict';

  angular
    .module('Core')
    .factory('Orgservice', Orgservice);

  /* @ngInject */
  function Orgservice($http, $q, Auth, Authinfo, Config, Log, UrlConfig, Utils) {
    var service = {
      getOrg: getOrg,
      getAdminOrg: getAdminOrg,
      getAdminOrgUsage: getAdminOrgUsage,
      getValidLicenses: getValidLicenses,
      getLicensesUsage: getLicensesUsage,
      getUnlicensedUsers: getUnlicensedUsers,
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

    function getOrg(callback, oid, disableCache) {
      var scomUrl = null;
      if (oid) {
        scomUrl = UrlConfig.getScomUrl() + '/' + oid;
      } else {
        scomUrl = UrlConfig.getScomUrl() + '/' + Authinfo.getOrgId();
      }

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
            return !(match.status === 'CANCELLED' || match.status === 'SUSPENDED');
          });

          var subscription = {
            "subscriptionId": usageLicense.subscriptionId ? usageLicense.subscriptionId : trial,
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


    /**
     * Get the latest orgSettings, merge with new settings, and PATCH the org
     */
    function setOrgSettings(orgId, settings) {
      var orgUrl = UrlConfig.getAdminServiceUrl() + 'organizations/' + orgId + '/settings';
      savedOrgSettingsCache.push({date: new Date(), setting: _.clone(settings)});
      var mergedCacheAndNewSettings = _.chain(savedOrgSettingsCache)
        .filter(function (cache) {
          return moment(cache.date).isAfter(moment().subtract(5, 'minutes'));
        })
        .map(function (cache) {return _.clone(cache.setting);})
        .reduce(function (result, setting) {return _.merge(result, setting);}, {})
        .value();
      return getOrg(_.noop, orgId, true)
        .then(function (response) {
          var orgSettings = _.get(response, 'data.orgSettings', {});
          _.assign(orgSettings, mergedCacheAndNewSettings);

          return $http({
            method: 'PATCH',
            url: orgUrl,
            data: orgSettings
          });
        });
    }

    function createOrg(enc, callback) {
      var orgUrl = UrlConfig.getAdminServiceUrl() + 'organizations';
      var orgRequest = {
        'encryptedQueryString': enc
      };

      Auth.setAccessToken().then(function () {
        $http.post(orgUrl, orgRequest)
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
  }
})();
