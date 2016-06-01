(function () {
  'use strict';

  angular
    .module('Core')
    .service('CustomerAdministratorService', CustomerAdministratorService);

  /* @ngInject */
  function CustomerAdministratorService($http, $q, Authinfo, UrlConfig) {
    var partnerScimUrl = UrlConfig.getScimUrl(Authinfo.getOrgId());
    var partnerAdminServiceUrl = UrlConfig.getAdminServiceUrl(Authinfo.getOrgId());

    var service = {
      getAssignedSalesAdministrators: getAssignedSalesAdministrators,
      getPartnerUsers: getPartnerUsers,
      addCustomerAdmin: addCustomerAdmin,
      unassignCustomerSalesAdmin: unassignCustomerSalesAdmin,
      assignRole: assignRole
    };

    return service;

    function getAssignedSalesAdministrators(customerOrgId) {
      if (!customerOrgId || customerOrgId === '') {
        return $q.reject('A Customer Organization Id must be passed');
      }
      var url = partnerScimUrl + '?filter=managedOrgs%5borgId%20eq%20%22' + customerOrgId + '%22%5d';

      return $http.get(url);
    }

    function getPartnerUsers() {
      var url = partnerScimUrl + '?filter=active%20eq%20true';

      return $http.get(url);
    }

    function addCustomerAdmin(customerOrgId, uuid) {
      if (!customerOrgId || customerOrgId === '') {
        return $q.reject('A Customer Organization Id must be passed');
      }
      var url = partnerScimUrl + '/' + uuid;

      var request = {
        'schemas': ['urn:scim:schemas:core:1.0', 'urn:scim:schemas:extension:cisco:commonidentity:1.0'],
        'managedOrgs': [{
          'orgId': customerOrgId,
          'role': 'ID_Full_Admin'
        }]
      };

      return $http.patch(url, request);
    }

    function unassignCustomerSalesAdmin(customerOrgId, uuid) {
      if (!customerOrgId || customerOrgId === '') {
        return $q.reject('A Customer Organization Id must be passed');
      }
      var url = partnerScimUrl + '/' + uuid;

      var request = {
        'schemas': ['urn:scim:schemas:core:1.0', 'urn:scim:schemas:extension:cisco:commonidentity:1.0'],
        'managedOrgs': [{
          'orgId': customerOrgId,
          'role': 'ID_Full_Admin',
          'operation': 'delete'
        }]
      };

      return $http.patch(url, request);
    }

    function assignRole(role, email) {
      var url = partnerAdminServiceUrl + '/roles';

      var request = {
        'users': [{
          'userRoles': {
            'roleName': role,
            'roleState': 'ACTIVE'
          },
          'email': email
        }]
      };

      return $http.patch(url, request);
    }
  }
})();
