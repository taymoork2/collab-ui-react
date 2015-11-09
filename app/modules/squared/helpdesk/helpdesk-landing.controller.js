(function () {
  'use strict';

  /* @ngInject */
  function HelpdeskLandingController($timeout) {
    var vm = this;
    vm.search = search;
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

    vm.mockUsers = [
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
      }];

    vm.mockOrgs = [
      {
        "id": "fe5acf7a-6246-484f-8f43-3e8c910fc50d",
        "displayName": "Fusion System Test"
      }
    ];
  }

  angular
    .module('Squared')
    .controller('HelpdeskLandingController', HelpdeskLandingController);
}());
