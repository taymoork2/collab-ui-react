'use strict';

angular
  .module('Squared')
  .service('Inviteservice', InviteService);

/* @ngInject */
function InviteService($http, Config, Auth) {
  var userUrl = Config.getAdminServiceUrl();

  var service = {
    userUrl: userUrl,
    resolveInvitedUser: resolveInvitedUser
  };

  return service;

  function resolveInvitedUser(encryptedParam) {
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
}
