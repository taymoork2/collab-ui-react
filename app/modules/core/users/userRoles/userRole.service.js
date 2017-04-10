(function () {
  'use strict';

  angular
    .module('Core')
    .service('UserRoleService', UserRoleService);

  /* @ngInject */
  function UserRoleService($http, $interpolate, Authinfo, Config, UrlConfig) {
    var atlasUrl = UrlConfig.getAdminServiceUrl();
    var getUsersRolesUrl = $interpolate(atlasUrl + 'organization/{{orgId}}/users/roles');

    var service = {
      enableSalesAdmin: enableSalesAdmin,
      disableSalesAdmin: disableSalesAdmin,
      enableFullAdmin: enableFullAdmin,
      disableFullAdmin: disableFullAdmin,
      patchUserWithRoleChangeSpecsList: patchUserWithRoleChangeSpecsList,
      _helpers: {
        getUsersRolesUrl: getUsersRolesUrl,
        mkRoleChangePartial: mkRoleChangePartial,
        mkRoleChangesList: mkRoleChangesList,
        mkPayload: mkPayload,
        patchUserWithRoleChanges: patchUserWithRoleChanges,
        patch: patch,
      },
    };

    return service;

    ////////////////

    function mkRoleChangePartial(roleName, roleState, targetOrgId) {
      var result = {
        roleName: roleName,
        roleState: roleState,
      };
      if (targetOrgId) {
        result.orgId = targetOrgId;
      }
      return result;
    }

    // each element is a list of args fitting for use with 'mkRoleChangePartial()'
    function mkRoleChangesList(roleChangeSpecsList) {
      // compose a list of role change objects
      return _.map(roleChangeSpecsList, function (roleChangeSpecs) {
        return service._helpers.mkRoleChangePartial.apply(null, roleChangeSpecs);
      });
    }

    function mkPayload(userName, roleChanges) {
      return {
        users: [{
          email: userName,
          userRoles: roleChanges,
        }],
      };
    }

    function patch(payload) {
      var orgId = Authinfo.getOrgId();
      var usersRolesUrl = service._helpers.getUsersRolesUrl({ orgId: orgId });
      return $http.patch(usersRolesUrl, payload);
    }

    function patchUserWithRoleChangeSpecsList(userName, roleChangeSpecsList) {
      var roleChanges = service._helpers.mkRoleChangesList(roleChangeSpecsList);
      return service._helpers.patchUserWithRoleChanges(userName, roleChanges);
    }

    function patchUserWithRoleChanges(userName, roleChanges) {
      var payload = service._helpers.mkPayload(userName, roleChanges);
      return service._helpers.patch(payload);
    }

    function enableSalesAdmin(userName) {
      var roleChange = service._helpers.mkRoleChangePartial(Config.roles.sales, Config.roleState.active);
      return service._helpers.patchUserWithRoleChanges(userName, [roleChange]);
    }

    function disableSalesAdmin(userName) {
      var roleChange = service._helpers.mkRoleChangePartial(Config.roles.sales, Config.roleState.inactive);
      return service._helpers.patchUserWithRoleChanges(userName, [roleChange]);
    }

    function enableFullAdmin(userName, targetOrgId) {
      var roleChange = service._helpers.mkRoleChangePartial(Config.roles.full_admin, Config.roleState.active, targetOrgId);
      return service._helpers.patchUserWithRoleChanges(userName, [roleChange]);
    }

    function disableFullAdmin(userName, targetOrgId) {
      var roleChange = service._helpers.mkRoleChangePartial(Config.roles.full_admin, Config.roleState.inactive, targetOrgId);
      return service._helpers.patchUserWithRoleChanges(userName, [roleChange]);
    }
  }
})();
