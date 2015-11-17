(function () {
  'use strict';

  /*ngInject*/
  function HelpdeskService($http, Config, $q, HelpdeskMockData) {
    var urlBase = Config.getAdminServiceUrl();

    function extractItems(res) {
      return res.data.items;
    }

    function extractData(res) {
      return res.data;
    }

    function searchUsers(searchString, orgId) {
      if (HelpdeskMockData.use) {
        var deferred = $q.defer();
        deferred.resolve(HelpdeskMockData.users);
        return deferred.promise;
      }
      return $http
        .get(urlBase + 'helpdesk/search/users?phrase=' + searchString + '&limit=5' + (orgId ? '&orgId=' + orgId : ''))
        .then(extractItems);
    }

    function searchOrgs(searchString) {
      if (HelpdeskMockData.use) {
        var deferred = $q.defer();
        deferred.resolve(HelpdeskMockData.orgs);
        return deferred.promise;
      }
      return $http
        .get(urlBase + 'helpdesk/search/organizations?phrase=' + searchString + '&limit=5')
        .then(extractItems);
    }

    function getUser(orgId, userId) {
      return $http
        .get(urlBase + 'helpdesk/organizations/' + orgId + '/users/' + userId)
        .then(extractData);
    }

    function getOrg(orgId) {
      return $http
        .get(urlBase + 'helpdesk/organizations/' + orgId)
        .then(extractData);
    }

    return {
      searchUsers: searchUsers,
      searchOrgs: searchOrgs,
      getUser: getUser,
      getOrg: getOrg
    };

  }

  angular.module('Squared')
    .service('HelpdeskService', HelpdeskService);
}());
