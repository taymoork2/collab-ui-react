'use strict';

angular
  .module('Squared')
  .service('Inviteservice', ['$http', 'Config', 'Auth',
    function Inviteservice($http, Config, Auth) {
      var userUrl = Config.getAdminServiceUrl();
      return {
        resolveInvitedUser: function (encryptedParam) {
          return Auth.setAccessToken().then(function () {
            return $http({
              method: 'PATCH',
              url: userUrl + 'invitations',
              data: {
                'encryptedQueryString': encryptedParam
              }
            });
          });
        }
      };
    }
  ]);
