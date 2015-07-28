'use strict';

/* global lodash */

angular.module('Core')
  .service('Orgservice', ['$http', '$rootScope', '$location', '$q', 'Storage', 'Config', 'Authinfo', 'Log', 'Auth',
    function ($http, $rootScope, $location, $q, Storage, Config, Authinfo, Log, Auth) {

      return {

        getOrg: function (callback, oid) {
          var scomUrl = null;
          if (oid) {
            scomUrl = Config.getScomUrl() + '/' + oid;
          } else {
            scomUrl = Config.getScomUrl() + '/' + Authinfo.getOrgId();
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

        setOrgSettings: function (orgId, reportingSiteUrl, reportingSiteDesc, helpUrl, isCiscoHelp, isCiscoSupport, callback) {
          var orgUrl = Config.getAdminServiceUrl() + 'organizations/' + Authinfo.getOrgId() + '/settings';

          var payload = {};
          if (reportingSiteUrl !== '') {
            payload['reportingSiteUrl'] = reportingSiteUrl;
          }
          if (reportingSiteDesc !== '') {
            payload['reportingSiteDesc'] = reportingSiteDesc;
          }
          if (helpUrl !== '') {
            payload['helpUrl'] = helpUrl;
          }
          if (isCiscoHelp !== '') {
            payload['isCiscoHelp'] = isCiscoHelp;
          }
          if (isCiscoSupport !== '') {
            payload['isCiscoSupport'] = isCiscoSupport;
          }

          $http({
              method: 'PATCH',
              url: orgUrl,
              data: payload
            })
            .success(function (data, status) {
              data = data || {};
              data.success = true;
              Log.debug('Posted orgSettings: ' + payload);
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
        }
      };
    }
  ]);
