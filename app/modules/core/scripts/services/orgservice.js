'use strict';

angular.module('Core')
  .service('Orgservice', ['$http', '$rootScope', '$location', 'Storage', 'Config', 'Authinfo', 'Log', 'Auth',
    function ($http, $rootScope, $location, Storage, Config, Authinfo, Log, Auth) {

      return {

        getOrg: function (callback, oid) {
          var scomUrl = null;
          if (oid) {
            scomUrl = Config.scomUrl + '/' + oid;
          } else {
            scomUrl = Config.scomUrl + '/' + Authinfo.getOrgId();
          }

          $http.get(scomUrl)
            .success(function (data, status) {
              data.success = true;
              callback(data, status);
            })
            .error(function (data, status) {
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
              data.success = true;
              callback(data, status);
            })
            .error(function (data, status) {
              data.success = false;
              data.status = status;
              callback(data, status);
            });
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
              data.success = true;
              callback(data, status);
            })
            .error(function (data, status) {
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

        setOrgSettings: function (orgId, reportingSiteUrl, reportingSiteDesc, helpUrl, callback) {
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

          $http({
              method: 'PATCH',
              url: orgUrl,
              data: payload
            })
            .success(function (data, status) {
              data.success = true;
              Log.debug('Posted orgSettings: ' + payload);
              callback(data, status);
            })
            .error(function (data, status) {
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
                data.success = true;
                callback(data, status);
              })
              .error(function (data, status) {
                data.success = false;
                data.status = status;
                callback(data, status);
              });
          });
        }
      };
    }
  ]);
