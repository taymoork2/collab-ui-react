(function () {
  'use strict';

  /* global lodash */

  angular
    .module('Core')
    .factory('Orgservice', Orgservice);

  /* @ngInject */
  function Orgservice($http, $location, $q, $rootScope, Auth, Authinfo, Config, Log, Storage) {
    var service = {
      'getOrg': getOrg,
      'getAdminOrg': getAdminOrg,
      'getAdminOrgUsage': getAdminOrgUsage,
      'getValidLicenses': getValidLicenses,
      'getLicensesUsage': getLicensesUsage,
      'getUnlicensedUsers': getUnlicensedUsers,
      'setSetupDone': setSetupDone,
      'setOrgSettings': setOrgSettings,
      'createOrg': createOrg,
      'listOrgs': listOrgs,
      'getOrgCacheOption': getOrgCacheOption,
      'getHybridServiceAcknowledged': getHybridServiceAcknowledged,
      'setHybridServiceAcknowledged': setHybridServiceAcknowledged
    };

    return service;

    function getOrg(callback, oid, disableCache) {
      var scomUrl = null;
      if (oid) {
        scomUrl = Config.getScomUrl() + '/' + oid;
      } else {
        scomUrl = Config.getScomUrl() + '/' + Authinfo.getOrgId();
      }

      if (disableCache) {
        scomUrl = scomUrl + '?disableCache=true';
      }

      $http.get(scomUrl)
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

    function getAdminOrg(callback, oid) {
      var adminUrl = null;
      if (oid) {
        adminUrl = Config.getAdminServiceUrl() + 'organizations/' + oid;
      } else {
        adminUrl = Config.getAdminServiceUrl() + 'organizations/' + Authinfo.getOrgId();
      }

      $http.get(adminUrl)
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
      var adminUrl = Config.getAdminServiceUrl() + 'customers/' + orgId + '/usage';
      return $http.get(adminUrl);
    }

    function getLicensesUsage() {
      return getAdminOrgUsage().then(function (response) {

        var usageLicenses = [];
        usageLicenses = response.data || [];
        var statusLicenses = Authinfo.getLicenses();

        var result = [];
        for (var index in usageLicenses) {
          result.push(_.filter(usageLicenses[index].licenses, function (license) {
            var match = _.find(statusLicenses, {
              'licenseId': license.licenseId
            });
            return !(match.status === 'CANCELLED' || match.status === 'SUSPENDED');
          }));
        }
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

    function getUnlicensedUsers(callback, oid) {
      var adminUrl = null;
      if (oid) {
        adminUrl = Config.getAdminServiceUrl() + 'organizations/' + oid + "/unlicensedUsers";
      } else {
        adminUrl = Config.getAdminServiceUrl() + 'organizations/' + Authinfo.getOrgId() + "/unlicensedUsers";
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
      var adminUrl = Config.getAdminServiceUrl() + 'organizations/' + Authinfo.getOrgId() + '/setup';

      return $http({
        method: 'PATCH',
        url: adminUrl
      });
    }

    /**
     * Get the latest orgSettings, merge with new settings, and PATCH the org
     */
    function setOrgSettings(orgId, settings, callback) {
      var orgUrl = Config.getAdminServiceUrl() + 'organizations/' + orgId + '/settings';

      getOrg(function (orgData, orgStatus) {
        var orgSettings = orgData.orgSettings;
        _.assign(orgSettings, settings);

        $http({
            method: 'PATCH',
            url: orgUrl,
            data: orgSettings
          })
          .success(function (data, status) {
            data = data || {};
            data.success = true;
            Log.debug('PATCHed orgSettings: ' + orgSettings);
            callback(data, status);
          })
          .error(function (data, status) {
            data = data || {};
            data.success = false;
            data.status = status;
            callback(data, status);
          });
      }, orgId, true);
    }

    function createOrg(enc, callback) {
      var orgUrl = Config.getAdminServiceUrl() + 'organizations';
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

    function listOrgs(filter, callback) {
      if (!filter || filter.length <= 3) {
        callback('error', 100);
        return;
      }
      var orgUrl = Config.getProdAdminServiceUrl() + 'organizations?displayName=' + filter;

      return $http.get(orgUrl);
    }

    function getOrgCacheOption(callback, oid, config) {
      var scomUrl = null;
      if (oid) {
        scomUrl = Config.getScomUrl() + '/' + oid;
      } else {
        scomUrl = Config.getScomUrl() + '/' + Authinfo.getOrgId();
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
      var serviceUrl = Config.getHerculesUrl() + '/organizations/' + Authinfo.getOrgId() + '/services';
      return $http({
        method: 'GET',
        url: serviceUrl
      });
    }

    function setHybridServiceAcknowledged(serviceName) {
      var serviceUrl = Config.getHerculesUrl() + '/organizations/' + Authinfo.getOrgId() + '/services/';
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
  }
})();
