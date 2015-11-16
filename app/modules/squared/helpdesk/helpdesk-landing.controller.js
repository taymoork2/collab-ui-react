(function () {
  'use strict';

  /* @ngInject */
  function HelpdeskLandingController(HelpdeskService, $log, $translate) {
    var vm = this;
    vm.search = search;
    vm.searchingForUsers = false;
    vm.searchingForOrgs = false;
    vm.userSearchResults = null;
    vm.orgSearchResults = null;
    vm.searchString = '';
    vm.userSearchFailure = null;
    vm.orgSearchFailure = null;
    angular.element('#searchInput').focus();

    function search() {
      if (!vm.searchString) return;
      vm.userSearchResults = null;
      vm.orgSearchResults = null;
      vm.userSearchFailure = null;
      vm.orgSearchFailure = null;

      if (vm.searchString.length >= 3) {
        vm.searchingForUsers = true;
        HelpdeskService.searchUsers(vm.searchString).then(function (res) {
          vm.userSearchResults = res;
          vm.searchingForUsers = false;
        }, function (err) {
          vm.searchingForUsers = false;
          vm.userSearchResults = null;
          if (err.status === 400) {
            vm.userSearchFailure = $translate.instant('helpdesk.badUserSearchInput');
          } else {
            vm.userSearchFailure = $translate.instant('helpdesk.unexpectedError');
          }
          $log.error(err);
        });
      } else {
        vm.userSearchFailure = $translate.instant('helpdesk.badUserSearchInput');
      }

      vm.searchingForOrgs = true;
      HelpdeskService.searchOrgs(vm.searchString).then(function (res) {
        vm.orgSearchResults = res;
        vm.searchingForOrgs = false;
      }, function (err) {
        vm.searchingForOrgs = false;
        vm.orgSearchFailure = $translate.instant('helpdesk.unexpectedError');
        $log.error(err);
      });
    }
  }

  angular
    .module('Squared')
    .controller('HelpdeskLandingController', HelpdeskLandingController);
}());
