(function () {
  'use strict';

  angular
    .module('Core')
    .service('CustomerAdministratorService', CustomerAdministratorService);

  /* @ngInject */
  function CustomerAdministratorService($http, $q, Authinfo, Config, UrlConfig, UserRoleService) {
    var partnerOrgId = Authinfo.getOrgId();
    var partnerScimUrl = UrlConfig.getScimUrl(partnerOrgId);

    var service = {
      getCustomerAdmins: getCustomerAdmins,
      getPartnerUsers: getPartnerUsers,
      addCustomerAdmin: addCustomerAdmin,
      removeCustomerAdmin: removeCustomerAdmin,
      _helpers: {
        needsSalesAdminRoleForPartnerOrg: needsSalesAdminRoleForPartnerOrg,
      },
    };

    return service;

    function getCustomerAdmins(customerOrgId) {
      if (!customerOrgId || customerOrgId === '') {
        return $q.reject('A Customer Organization Id must be passed');
      }
      var url = partnerScimUrl + encodeURI('?filter=managedOrgs[orgId eq "') + customerOrgId + encodeURI('"]');

      return $http.get(url);
    }

    function getPartnerUsers(str) {
      str = encodeURIComponent(str);
      var url = partnerScimUrl + encodeURI('?filter=active eq true and userName sw "') + str + encodeURI('" or name.givenName sw "') + str + encodeURI('" or name.familyName sw "') + str + encodeURI('" or displayName sw "') + str + encodeURI('"&attributes=name,userName,userStatus,entitlements,displayName,photos,roles,active,trainSiteNames,linkedTrainSiteNames,licenseID,userSettings,userPreferences&sortBy=name&sortOrder=ascending');

      return $http.get(url);
    }

    function needsSalesAdminRoleForPartnerOrg(user) {
      var hasSufficientRoleAlready = _.some(user.roles, function (role) {
        return role === Config.backend_roles.full_admin || role === Config.backend_roles.sales;
      });
      return !hasSufficientRoleAlready;
    }

    function addCustomerAdmin(user, customerOrgId) {
      if (!customerOrgId) {
        return $q.reject('A Customer Organization Id must be passed');
      }

      if (!_.isObject(user)) {
        return $q.reject('A User must be passed');
      }

      var userName = _.get(user, 'userName');

      // notes:
      // - when we PATCH a user, we can submit multiple role changes in a single transaction
      // - each element is a list of args (one role change object is generated per element)
      // - list of role change objects are then used in the PATCH call
      var roleChangeSpecsList = [];

      // enable full admin for the target customer org
      var fullAdminActive = [Config.roles.full_admin, Config.roleState.active, customerOrgId];
      roleChangeSpecsList.push(fullAdminActive);

      // enable sales admin for the partner org (the same org as this current partner admin user)
      if (needsSalesAdminRoleForPartnerOrg(user)) {
        var salesAdminActive = [Config.roles.sales, Config.roleState.active];
        roleChangeSpecsList.push(salesAdminActive);
      }

      return UserRoleService.patchUserWithRoleChangeSpecsList(userName, roleChangeSpecsList);
    }

    function removeCustomerAdmin(user, customerOrgId) {
      if (!customerOrgId) {
        return $q.reject('A Customer Organization Id must be passed');
      }
      var userName = _.get(user, 'userName');
      return UserRoleService.disableFullAdmin(userName, customerOrgId);
    }
  }
})();
