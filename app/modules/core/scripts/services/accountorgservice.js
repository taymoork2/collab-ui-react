'use strict';

angular
  .module('Core')
  .service('AccountOrgService', ['$http', '$rootScope', 'Config', 'Auth',
    function ($http, $rootScope, Config, Auth) {
      var accountUrl = Config.getAdminServiceUrl();
      return {
        getAccount: function (org, callback) {
          var url = accountUrl + 'organization/' + org + '/accounts';
          return $http.get(url);
        },
        getServices: function (org, filter, callback) {
          var url = accountUrl + 'organizations/' + org + '/services';
          if (!_.isUndefined(filter) && !_.isNull(filter)) {
            url += '?filter=' + filter;
          }
          $http.get(url)
            .success(function (data, status) {
              callback(data, status);
            })
            .error(function (data, status) {
              callback(data, status);
            });
        },
        addMessengerInterop: function (org, callback) {
          var url = accountUrl + 'organizations/' + org + '/services/messengerInterop';
          var request = {};
          $http.post(url, request)
            .success(function (data, status) {
              callback(data, status);
            })
            .error(function (data, status) {
              callback(data, status);
            });
        },
        deleteMessengerInterop: function (org, callback) {
          var url = accountUrl + 'organizations/' + org + '/services/messengerInterop';

          $http.delete(url)
            .success(function (data, status) {
              callback(data, status);
            })
            .error(function (data, status) {
              callback(data, status);
            });
        },
        addOrgCloudSipUri: function (org, cloudSipUri, callback) {
          var url = accountUrl + 'organization/' + org + '/settings';
          var request = {
            'id': org,
            'settings': [{
              'key': 'orgCloudSipUri',
              'value': cloudSipUri + '.ciscospark.com'
            }]
          };

          $http.put(url, request)
            .success(function (data, status) {
              callback(data, status);
            })
            .error(function (data, status) {
              callback(data, status);
            });
        },

        addOrgDataRetentionPeriodDays: function (org, dataRetentionPeriodDays, callback) {
          var url = accountUrl + 'organization/' + org + '/settings';
          var request = {
            'id': org,
            'settings': [{
              'key': 'dataRetentionPeriodDays',
              'value': dataRetentionPeriodDays
            }]
          };

          $http.put(url, request)
            .success(function (data, status) {
              callback(data, status);
            })
            .error(function (data, status) {
              callback(data, status);
            });
        },

        modifyOrgDataRetentionPeriodDays: function (org, dataRetentionPeriodDays, callback) {
          var url = accountUrl + 'organization/' + org + '/settings';
          var request = {
            'id': org,
            'settings': [{
              'key': 'dataRetentionPeriodDays',
              'value': dataRetentionPeriodDays
            }]
          };

          $http.patch(url, request)
            .success(function (data, status) {
              callback(data, status);
            })
            .error(function (data, status) {
              callback(data, status);
            });
        },

        deleteOrgSettings: function (org, callback) {
          var url = accountUrl + 'organization/' + org + '/settings/' + org;

          $http.delete(url)
            .success(function (data, status) {
              callback(data, status);
            })
            .error(function (data, status) {
              callback(data, status);
            });
        },

        getOrgSettings: function (org, callback) {
          var url = accountUrl + 'organization/' + org + '/settings/' + org;

          $http.get(url)
            .success(function (data, status) {
              callback(data, status);
            })
            .error(function (data, status) {
              callback(data, status);
            });
        }
      };
    }
  ]);
