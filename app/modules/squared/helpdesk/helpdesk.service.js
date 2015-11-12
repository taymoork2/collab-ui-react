(function () {
  'use strict';

  /*ngInject*/
  function HelpdeskService($http, Config, $q) {
    var urlBase = 'http://localhost:8080/admin/api/v1/'; // Config.getAdminServiceUrl();
    var mock = false;
    var mockUsers = [
      {
        "id": "a56ab29e-f8c5-41fb-b169-a5be0b32fb3a",
        "organizationId": "fe5acf7a-6246-484f-8f43-3e8c910fc50d",
        "userName": "helgelangehaug@gmail.com",
        "displayName": "helgelangehaug@gmail.com",
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
        "id": "d1c75b63-edc8-4eb3-afdc-c116f25278d2",
        "organizationId": "fe5acf7a-6246-484f-8f43-3e8c910fc50d",
        "userName": "jewagner56@icloud.com",
        "displayName": "jewagner56@icloud.com",
        "phoneNumbers": []
      },
      {
        "id": "983761d5-3120-4747-9ab3-a3960ecdecc8",
        "organizationId": "fe5acf7a-6246-484f-8f43-3e8c910fc50d",
        "userName": "sqintegration1234@gmail.com",
        "displayName": "first admin",
        "phoneNumbers": []
      }];

    var mockOrgs = [
      {
        "id": "fe5acf7a-6246-484f-8f43-3e8c910fc50d",
        "displayName": "Fusion System Test"
      }
    ];

    function extractItems(res) {
      return res.data.items;
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

    return {
      searchUsers: searchUsers,
      searchOrgs: searchOrgs
    };


  }

  angular.module('Squared')
    .service('HelpdeskService', HelpdeskService);
}());
