(function () {
  'use strict';

  /*ngInject*/
  function HelpdeskService($http, Config, $q) {
    var urlBase = 'http://localhost:8080/admin/api/v1/'; // Config.getAdminServiceUrl();
    var mock = false;
    var mockUsers = [
      {
        "id": "ddb4dd78-26a2-45a2-8ad8-4c181c5b3f0a",
        "organization": {id: "ce8d17f8-1734-4a54-8510-fae65acc505e"},
        "userName": "tom.vasset+marvelhelpdesk@gmail.com",
        "displayName": "Tom Vasset",
        "phoneNumbers": [
          {
            "type": "work",
            "value": "+47 67 51 14 67"
          },
          {
            "type": "mobile",
            "value": "+47 92 01 30 30"
          }
        ]
      },
      {
        "id": "335bf4a2-a09c-45ba-a72a-e3f1de613295",
        "organization": {"id": "ce8d17f8-1734-4a54-8510-fae65acc505e"},
        "userName": "jayScott@marvel.com",
        "displayName": "Jay Scott",
        "phoneNumbers": []
      },
      {
        "id": "2f4c85f7-e827-4b28-b567-0e49693b3f75",
        "organization": {"id": "ce8d17f8-1734-4a54-8510-fae65acc505e"},
        "userName": "shamim.pirzada+marvelenduser@gmail.com",
        "displayName": "Shamim",
        "phoneNumbers": []
      }];

    var mockOrgs = [
      {
        "id": "ce8d17f8-1734-4a54-8510-fae65acc505e",
        "displayName": "Marvel Partners"
      }
    ];

    function extractItems(res) {
      return res.data.items;
    }

    function extractData(res) {
      return res.data;
    }

    function searchUsers(searchString) {
      if (mock) {
        var deferred = $q.defer();
        deferred.resolve(mockUsers);
        return deferred.promise;
      }
      return $http
        .get(urlBase + 'helpdesk/search/users?phrase=' + searchString + '&limit=5')
        .then(extractItems);
    }

    function searchOrgs(searchString) {
      if (mock) {
        var deferred = $q.defer();
        deferred.resolve(mockOrgs);
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

    return {
      searchUsers: searchUsers,
      searchOrgs: searchOrgs,
      getUser: getUser
    };


  }

  angular.module('Squared')
    .service('HelpdeskService', HelpdeskService);
}());
