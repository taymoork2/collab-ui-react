(function () {
  'use strict';

  angular
    .module('Messenger')
    .factory('CiService', CiService);

  /** @ngInject */
  function CiService($rootScope, Authinfo, UserListService) {
    // Interface ---------------------------------------------------------------

    var ciService = {
      orgId: Authinfo.getOrgId(),
      orgName: Authinfo.getOrgName(),
      getCiOrgInfo: getCiOrgInfo,
      getCiAdmins: getCiAdmins,
      getCiNonAdmins: getCiNonAdmins
    };

    // Return the service
    return ciService;

    ////////////////////////////////////////////////////////////////////////////

    // Implementation ----------------------------------------------------------

    function getCiOrgInfo() {
      return [{
        key: 'Org Name',
        value: Authinfo.getOrgName()
      }, {
        key: 'Org ID',
        value: Authinfo.getOrgId()
      }, {
        key: 'Email',
        value: Authinfo.getEmail()
      }, {
        key: 'Primary Email',
        value: Authinfo.getPrimaryEmail()
      }, {
        key: 'Roles',
        value: Authinfo.getRoles()
      }, {
        key: 'Services',
        value: Authinfo.getServices()
      }, {
        key: 'CMR Services',
        value: Authinfo.getCmrServices()
      }, {
        key: 'Communication Services',
        value: Authinfo.getCommunicationServices()
      }, {
        key: 'Conference Services',
        value: Authinfo.getConferenceServices()
      }, {
        key: 'Managed Orgs',
        value: Authinfo.getManagedOrgs()
      }, {
        key: 'Message Services',
        value: Authinfo.getMessageServices()
      }, {
        key: 'User Entitlements',
        value: Authinfo.getUserEntitlements()
      }, {
        key: 'User Name',
        value: Authinfo.getUserName()
      }, {
        key: 'OAuth2 Token',
        value: $rootScope.token
      }];
    }

    function getCiAdmins(admins) {
      getUsers(true, admins);
    }

    function getCiNonAdmins(nonAdmins) {
      getUsers(false, nonAdmins);
    }

    function getUsers(getAdmins, receivedUsers) {
      UserListService.listUsers(0, 20, null, null, function (data, status, searchStr) {
        var i = 0;

        if (true === data.success) {
          var users = data.Resources;

          for (i = 0; i < users.length; i++) {
            var user = users[i];
            receivedUsers.push({
              userName: user.userName,
              DisplayName: user.displayName,
              id: user.id,
              status: user.userStatus,
              created: user.meta.created,
              entitlements: user.entitlements,
              roles: user.roles
            });
          }
        } else {
          var errors = data.Errors;

          for (i = 0; i < errors.length; i++) {
            var error = errors[i];
            window.console.error('Error ' + (i + 1) + ': Code ' + error.code + '; Error Code ' + error.errorCode + ': "' + error.description + '"');
          }
        }
      }, '', getAdmins);
    }
  }
})();
