(function () {
  'use strict';

  /* @ngInject */
  function HelpdeskController(HelpdeskService, $log, $translate) {
    var vm = this;
    vm.search = search;
    vm.setFilterByOrg = setFilterByOrg;
    vm.searchingForUsers = false;
    vm.searchingForOrgs = false;
    vm.searchString = '';
    vm.currentSearch = {
      searchString: '',
      userSearchResults: null,
      orgSearchResults: null,
      userSearchFailure: null,
      orgSearchFailure: null,
      orgFilter: null,
      initSearch: function (searchString) {
        this.searchString = searchString;
        this.userSearchResults = null;
        this.orgSearchResults = null;
        this.userSearchFailure = null;
        this.orgSearchFailure = null;
      }
    };
    angular.element('#searchInput').focus();

    function search() {
      if (!vm.searchString) return;
      vm.currentSearch.initSearch(vm.searchString);

      if (vm.searchString.length >= 3) {
        vm.searchingForUsers = true;
        HelpdeskService.searchUsers(vm.searchString).then(function (res) {
          vm.currentSearch.userSearchResults = res;
          vm.searchingForUsers = false;
        }, function (err) {
          vm.searchingForUsers = false;
          vm.currentSearch.userSearchResults = null;
          if (err.status === 400) {
            vm.currentSearch.userSearchFailure = $translate.instant('helpdesk.badUserSearchInput');
          } else {
            vm.currentSearch.userSearchFailure = $translate.instant('helpdesk.unexpectedError');
          }
          $log.error(err);
        });
      } else {
        vm.currentSearch.userSearchFailure = $translate.instant('helpdesk.badUserSearchInput');
      }

      vm.searchingForOrgs = true;
      HelpdeskService.searchOrgs(vm.searchString).then(function (res) {
        vm.currentSearch.orgSearchResults = res;
        vm.searchingForOrgs = false;
      }, function (err) {
        vm.searchingForOrgs = false;
        vm.currentSearch.orgSearchResults = null;
        vm.currentSearch.orgSearchFailure = $translate.instant('helpdesk.unexpectedError');
        $log.error(err);
      });
    }

    function setFilterByOrg(org) {
      vm.currentSearch.orgFilter = org;
    }
  }

  angular
    .module('Squared')
    .controller('HelpdeskController', HelpdeskController);
}());
