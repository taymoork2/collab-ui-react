'use strict';

/* global lodash */

angular.module('Core')
  .service('Orgservice', ['$http', '$rootScope', '$location', '$q', 'Storage', 'Config', 'Authinfo', 'Log', 'Auth',
    function ($http, $rootScope, $location, $q, Storage, Config, Authinfo, Log, Auth) {

      return {

        getOrg: function (callback, oid, disableCache) {
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
              callback(data, status);
            })
            .error(function (data, status) {
              data = data || {};
              data.success = false;
              data.status = status;
              callback(data, status);
            });
        },

        getAdminOrg: function (callback, oid) {
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
              data = data || {};
              data.success = false;
              data.status = status;
              callback(data, status);
            });
        },

        /**
         * Compare the two lists of licenses and filter out invalid ones
         */
        getValidLicenses: function () {
          var d = $q.defer();

          this.getAdminOrg(function (data, status) {
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
        },

        getUnlicensedUsers: function (callback, oid) {
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
        },

        setSetupDone: function () {
          var adminUrl = Config.getAdminServiceUrl() + 'organizations/' + Authinfo.getOrgId() + '/setup';

          return $http({
            method: 'PATCH',
            url: adminUrl
          });
        },

        setOrgSettings: function (orgId, settings, callback) {
          var orgUrl = Config.getAdminServiceUrl() + 'organizations/' + orgId + '/settings';

          $http({
              method: 'PATCH',
              url: orgUrl,
              data: settings
            })
            .success(function (data, status) {
              data = data || {};
              data.success = true;
              Log.debug('Posted orgSettings: ' + settings);
              callback(data, status);
            })
            .error(function (data, status) {
              data = data || {};
              data.success = false;
              data.status = status;
              callback(data, status);
            });
        },

        createOrg: function (enc, callback) {
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
        },

        listOrgs: function (filter, callback) {
          if (!filter || filter.length <= 3) {
            callback('error', 100);
            return;
          }
          var orgUrl = Config.getProdAdminServiceUrl() + 'organizationstemp?displayName=' + filter;

          $http.get(orgUrl)
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
        },

        getOrgCacheOption: function (callback, oid, config) {
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
      };
    }
  ]);
