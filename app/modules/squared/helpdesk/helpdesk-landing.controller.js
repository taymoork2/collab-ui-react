(function () {
  'use strict';

  /* @ngInject */
  function HelpdeskLandingController($q, $timeout) {
    var vm = this;
    vm.search = search;
    vm.selectSearchResult = selectSearchResult;
    vm.searchingForUsers = false;
    vm.searchingForOrgs = false;
    vm.searchResults = null;

    function search() {
      vm.searchingForUsers = true;
      vm.searchingForOrgs = true;
      $timeout(function () {
        vm.searchingForUsers = false;
        vm.userSearchResults = vm.mockUsers;
      }, 300);
      $timeout(function () {
        vm.searchingForOrgs = false;
        vm.orgSearchResults = vm.mockOrgs;
      }, 200);
    }

    function selectSearchResult(result) {

    }

    vm.mockUsers = [
      {
        "id": "7c9cfe25-2981-4062-af7a-98d7f4d3097d",
        "organizationId": "1eb65fdf-9643-417f-9974-ad72cae0e10f",
        "userName": "thomitte@cisco.com",
        "displayName": "Thomas Mittet (thomitte)",
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
        "id": "8c9cfe25-2981-4062-af7a-98d7f4d3097d",
        "organizationId": "1eb65fdf-9643-417f-9974-ad72cae0e10f",
        "userName": "tvasset@cisco.com",
        "displayName": "Tom Vasset (tvasset)",
        "phoneNumbers": []
      }];

    vm.mockOrgs = [
      {
        "id": "1eb65fdf-9643-417f-9974-ad72cae0e10f",
        "displayName": "Cisco Systems, Inc."
      }
    ];
  }

  angular
    .module('Squared')
    .controller('HelpdeskLandingController', HelpdeskLandingController);
}());
