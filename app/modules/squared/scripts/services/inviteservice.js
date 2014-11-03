'use strict';

angular.module('Squared')
  .service('Inviteservice', ['$http', '$q', 'Config', 'Log', 'Auth',
    // AngularJS will instantiate a singleton by calling "new" on this function
    function Inviteservice($http, $q, Config, Log, Auth) {

      var userUrl = Config.getAdminServiceUrl();

      return {

        resolveInvitedUser: function (encryptedParam) {
          var deferred = $q.defer();
          var requestBody = {
            'encryptedQueryString': encryptedParam
          };

          Auth.getAccessToken()
            .then(function (token) {

              $http.defaults.headers.common.Authorization = 'Bearer ' + token;
              $http({
                  method: 'PATCH',
                  url: userUrl + 'invitations',
                  data: requestBody
                })
                .success(function (data) {
                  deferred.resolve(data);
                })
                .error(function (data, status) {
                  Log.error('Failed to resolve invited user.  Status: ' + status + ' Response: ' + data);
                  deferred.reject(status);
                });
            }, function (reason) {
              deferred.reject(reason);
            });

          return deferred.promise;
        },

        resolveMockedUser: function (encryptedParam) {
          var deferred = $q.defer();
          var data = {
            'email': encryptedParam,
            'displayName': 'Mocked User',
            'entitlements': null
          };

          deferred.resolve(data);
          return deferred.promise;
        }

      };
    }
  ]);
