'use strict';

angular.module('Core')
  .service('Orgservice', ['$http', '$rootScope', '$location', 'Storage', 'Config', 'Authinfo', 'Log', 'Auth',
    function ($http, $rootScope, $location, Storage, Config, Authinfo, Log, Auth) {

      var token = Storage.get('accessToken');

      return {

        getOrg: function (callback, oid) {
          var scomUrl = null;
          if (oid) {
            scomUrl = Config.scomUrl + '/' + oid;
          } else {
            scomUrl = Config.scomUrl + '/' + Authinfo.getOrgId();
          }
          $http.defaults.headers.common.Authorization = 'Bearer ' + token;
          $http.get(scomUrl)
            .success(function (data, status) {
              data.success = true;
              callback(data, status);
            })
            .error(function (data, status) {
              data.success = false;
              data.status = status;
              callback(data, status);
              Auth.handleStatus(status);
            });
        },

        getAdminOrg: function (callback, oid) {
          var adminUrl = null;
          if (oid) {
            adminUrl = Config.getAdminServiceUrl() + 'organizations/' + oid;
          } else {
            adminUrl = Config.getAdminServiceUrl() + 'organizations/' + Authinfo.getOrgId();
          }
          $http.defaults.headers.common.Authorization = 'Bearer ' + token;
          $http.get(adminUrl)
            .success(function (data, status) {
              data.success = true;
              callback(data, status);
            })
            .error(function (data, status) {
              data.success = false;
              data.status = status;
              callback(data, status);
              Auth.handleStatus(status);
            });
        }

      };
    }
  ]);
