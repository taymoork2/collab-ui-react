(function () {
  'use strict';

  angular
    .module('Messenger')
    .factory('CiService', CiService);

  /** @ngInject */
  function CiService($q, $rootScope, Authinfo, UserListService, Userservice) {
    // Interface ---------------------------------------------------------------

    // Internal storage
    var users = null;
    var partnerAdmins = null;

    var ciService = {
      getCiAdmins: getCiAdmins,
      getCiNonAdmins: getCiNonAdmins,
      getCiOrgInfo: getCiOrgInfo,
      isLoggedInToPartnerPortal: isLoggedInToPartnerPortal,
      isPartnerAdmin: isPartnerAdmin
    };

    // Init data
    init();

    // Return the service
    return ciService;

    ////////////////////////////////////////////////////////////////////////////

    // Implementation ----------------------------------------------------------

    function init() {
      getPartnerAdmins();
    }

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
        key: 'User ID',
        value: Authinfo.getUserId()
      }, {
        key: 'Primary Email',
        value: Authinfo.getPrimaryEmail()
      }, {
        key: 'Is Cisco?',
        value: Authinfo.isCisco()
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

    function getPartnerAdmins() {
      var defer = $q.defer();

      // Cache result
      if (null === partnerAdmins) {
        UserListService.listPartners(Authinfo.getOrgId(), function (response) {
          if (response.success) {
            partnerAdmins = response.partners;
            defer.resolve(partnerAdmins);
          } else {
            var error = 'Failed getting parter list. Response: ' + JSON.stringify(response);
            window.console.error(error);
            defer.reject(error);
          }
        });
      } else {
        defer.resolve(partnerAdmins);
      }

      return defer.promise;
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

    function isLoggedInToPartnerPortal() {
      return Authinfo.getRoles().indexOf('PARTNER_ADMIN') > -1;
    }

    function isPartnerAdmin() {
      var defer = $q.defer();

      // Check if user ID is in the partner admin list
      getPartnerAdmins()
        .then(function (admins) {
          var partnerFound = false;

          // Check for user ID in admin list
          for (var partner in admins) {
            if (Authinfo.getUserId() === admins[partner].id) {
              partnerFound = true;
              break;
            }
          }

          defer.resolve(partnerFound);
        }, function (errorMsg) {
          var error = 'Error checking if user is a partner admin: ' + errorMsg;
          window.console.error(error);
          defer.reject(error);
        });

      return defer.promise;
    }
  }
})();
