(function () {
  'use strict';

  angular
    .module('Core')
    .service('CustomerAdministratorService', CustomerAdministratorService);

  /* @ngInject */
  function CustomerAdministratorService($http, $q, Authinfo, UrlConfig) {
    var partnerOrgId = Authinfo.getOrgId();
    var partnerScimUrl = UrlConfig.getScimUrl(partnerOrgId);
    var partnerAdminServiceUrl = UrlConfig.getAdminServiceUrl(partnerOrgId);

    var service = {
      getAssignedSalesAdministrators: getAssignedSalesAdministrators,
      getPartnerUsers: getPartnerUsers,
      addCustomerAdmin: addCustomerAdmin,
      removeCustomerSalesAdmin: removeCustomerSalesAdmin,
      patchSalesAdminRole: patchSalesAdminRole
    };

    return service;

    function getAssignedSalesAdministrators(customerOrgId) {
      if (!customerOrgId || customerOrgId === '') {
        return $q.reject('A Customer Organization Id must be passed');
      }
      var url = partnerScimUrl + encodeURI('?filter=managedOrgs[orgId eq "') + customerOrgId + encodeURI('"]');

      return $http.get(url);
    }

    function getPartnerUsers(str) {
      var url = partnerScimUrl + encodeURI('?filter=active eq true and userName sw "') + str + encodeURI('" or name.givenName sw "') + str + encodeURI('" or name.familyName sw "') + str + encodeURI('" or displayName sw "') + str + encodeURI('"&attributes=name,userName,userStatus,entitlements,displayName,photos,roles,active,trainSiteNames,licenseID&count=8&sortBy=name&sortOrder=ascending');

      return $http.get(url);
    }

    function addCustomerAdmin(customerOrgId, uuid) {
      if (!customerOrgId || customerOrgId === '') {
        return $q.reject('A Customer Organization Id must be passed');
      }
      var url = partnerScimUrl + '/' + uuid;

      var request = {
        schemas: ['urn:scim:schemas:core:1.0', 'urn:scim:schemas:extension:cisco:commonidentity:1.0'],
        managedOrgs: [{
          orgId: customerOrgId,
          role: 'ID_Full_Admin'
        }]
      };

      return $http.patch(url, request);
    }

    function removeCustomerSalesAdmin(customerOrgId, uuid) {
      if (!customerOrgId || customerOrgId === '') {
        return $q.reject('A Customer Organization Id must be passed');
      }
      var url = partnerScimUrl + '/' + uuid;

      var request = {
        schemas: ['urn:scim:schemas:core:1.0', 'urn:scim:schemas:extension:cisco:commonidentity:1.0'],
        managedOrgs: [{
          orgId: customerOrgId,
          role: 'ID_Full_Admin',
          operation: 'delete'
        }]
      };

      return $http.patch(url, request);
    }

    function patchSalesAdminRole(email) {
      var url = partnerAdminServiceUrl + 'organization/' + partnerOrgId + '/users/roles';

      var request = {
        users: [{
          userRoles: {
            roleName: 'Sales_Admin',
            roleState: 'ACTIVE'
          },
          email: email
        }]
      };

      return $http.patch(url, request);
    }
  }
})();
