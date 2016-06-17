(function () {
  'use strict';

  angular
    .module('Squared')
    .service('Inviteservice', InviteService);

  /* @ngInject */
  function InviteService(UrlConfig) {
    var userUrl = UrlConfig.getAdminServiceUrl();

    var service = {
      userUrl: userUrl
    };

    return service;
  }
})();
