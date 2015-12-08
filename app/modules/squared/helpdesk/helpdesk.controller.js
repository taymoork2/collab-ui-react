(function () {
  'use strict';

  /* @ngInject */
  function HelpdeskController(HelpdeskService, $translate, $scope) {
    $('body').css('background', 'white');
    $scope.$on('$viewContentLoaded', function () {
      if (HelpdeskService.checkIfMobile()) {
        angular.element('#searchInput').blur();
      } else {
        angular.element('#searchInput').focus();
      }
    });
    var vm = this;
    var searchResultsPageSize = 5;
    var searchResultsLimit = 20;
    vm.search = search;
    vm.initSearchWithOrgFilter = initSearchWithOrgFilter;
    vm.initSearchWithoutOrgFilter = initSearchWithoutOrgFilter;
    vm.searchingForUsers = false;
    vm.searchingForOrgs = false;
    vm.searchingForDevices = false;
    vm.searchString = '';
    vm.keyPressHandler = keyPressHandler;
    vm.showMoreResults = showMoreResults;
    vm.currentSearch = {
      searchString: '',
      userSearchResults: null,
      orgSearchResults: null,
      deviceSearchResults: null,
      userSearchFailure: null,
      orgSearchFailure: null,
      deviceSearchFailure: null,
      orgFilter: null,
      orgLimit: searchResultsPageSize,
      userLimit: searchResultsPageSize,
      deviceLimit: searchResultsPageSize,
      initSearch: function (searchString) {
        this.searchString = searchString;
        this.userSearchResults = null;
        this.orgSearchResults = null;
        this.deviceSearchResults = null;
        this.userSearchFailure = null;
        this.orgSearchFailure = null;
        this.deviceSearchFailure = null;
        this.orgLimit = searchResultsPageSize;
        this.userLimit = searchResultsPageSize;
        this.deviceLimit = searchResultsPageSize;
        if (HelpdeskService.checkIfMobile()) {
          angular.element('#searchInput').blur();
        } else {
          angular.element('#searchInput').focus();
        }
      },
      clear: function () {
        this.initSearch('');
        this.orgFilter = null;
      }
    };

    function search() {
      if (!vm.searchString) return;
      vm.currentSearch.initSearch(vm.searchString);
      var orgFilterId = vm.currentSearch.orgFilter ? vm.currentSearch.orgFilter.id : null;
      searchUsers(vm.searchString, orgFilterId);
      if (!orgFilterId) {
        searchOrgs(vm.searchString);
      } else {
        searchDevices(vm.searchString, orgFilterId);
      }
    }

    function searchUsers(searchString, orgId) {
      if (searchString.length >= 3) {
        vm.searchingForUsers = true;
        HelpdeskService.searchUsers(searchString, orgId, searchResultsLimit, null, true).then(function (res) {
          vm.currentSearch.userSearchResults = res;
          vm.searchingForUsers = false;
          HelpdeskService.findAndResolveOrgsForUserResults(
            vm.currentSearch.userSearchResults,
            vm.currentSearch.orgFilter,
            vm.currentSearch.userLimit);
        }, function (err) {
          vm.searchingForUsers = false;
          vm.currentSearch.userSearchResults = null;
          if (err.status === 400) {
            vm.currentSearch.userSearchFailure = $translate.instant('helpdesk.badUserSearchInput');
          } else {
            vm.currentSearch.userSearchFailure = $translate.instant('helpdesk.unexpectedError');
          }
        });
      } else {
        vm.currentSearch.userSearchFailure = $translate.instant('helpdesk.badUserSearchInput');
      }
    }

    function searchOrgs(searchString) {
      if (searchString.length >= 3) {
        vm.searchingForOrgs = true;
        HelpdeskService.searchOrgs(searchString, searchResultsLimit).then(function (res) {
          vm.currentSearch.orgSearchResults = res;
          vm.searchingForOrgs = false;
        }, function (err) {
          vm.searchingForOrgs = false;
          vm.currentSearch.orgSearchResults = null;
          vm.currentSearch.orgSearchFailure = $translate.instant('helpdesk.unexpectedError');
        });
      } else {
        vm.currentSearch.orgSearchFailure = $translate.instant('helpdesk.badOrgSearchInput');
      }
    }

    function searchDevices(searchString, orgId) {
      vm.searchingForDevices = true;
      HelpdeskService.searchCloudberryDevices(searchString, orgId, searchResultsLimit).then(function (res) {
        vm.currentSearch.deviceSearchResults = res;
        vm.searchingForDevices = false;
        setOrgOnDeviceSearchResults(vm.currentSearch.deviceSearchResults);
      }, function (err) {
        vm.searchingForDevices = false;
        vm.currentSearch.deviceSearchResults = null;
        vm.currentSearch.deviceSearchFailure = $translate.instant('helpdesk.unexpectedError');
      });
    }

    function initSearchWithOrgFilter(org) {
      vm.searchString = '';
      vm.currentSearch.clear();
      vm.currentSearch.orgFilter = org;
    }

    function initSearchWithoutOrgFilter() {
      vm.searchString = '';
      vm.currentSearch.clear();
    }

    function showMoreResults(type) {
      switch (type) {
      case 'user':
        vm.currentSearch.userLimit += searchResultsPageSize;
        HelpdeskService.findAndResolveOrgsForUserResults(
          vm.currentSearch.userSearchResults,
          vm.currentSearch.orgFilter,
          vm.currentSearch.userLimit);
        break;
      case 'org':
        vm.currentSearch.orgLimit += searchResultsPageSize;
        break;
      case 'device':
        vm.currentSearch.deviceLimit += searchResultsPageSize;
        break;
      }
    }

    function setOrgOnDeviceSearchResults(deviceSearchResults) {
      _.each(deviceSearchResults, function (device) {
        device.organization = {
          id: vm.currentSearch.orgFilter.id,
          displayName: vm.currentSearch.orgFilter.displayName
        };
      });
    }

    function keyPressHandler(event) {
      var activeElement = angular.element(document.activeElement);
      var inputFieldHasFocus = activeElement[0]["id"] === "searchInput";
      if (inputFieldHasFocus && !(event.keyCode === 27 || event.keyCode === 13)) {
        return; // if not escape and enter, nothing to do
      }
      var activeTabIndex = activeElement[0]["tabIndex"];
      var newTabIndex = -1;

      switch (event.keyCode) {
      case 37: // Left arrow
        newTabIndex = activeTabIndex - 1;
        break;

      case 38: // Up arrow
        newTabIndex = activeTabIndex - 10;
        break;

      case 39: // Right arrow
        newTabIndex = activeTabIndex + 1;
        break;

      case 40: // Down arrow
        newTabIndex = activeTabIndex + 10;
        break;

      case 27: // Esc
        if (inputFieldHasFocus) {
          initSearchWithoutOrgFilter();
        } else {
          if (HelpdeskService.checkIfMobile()) {
            angular.element('#searchInput').blur();
          } else {
            angular.element('#searchInput').focus().select();
          }
          newTabIndex = -1;
        }
        break;

      case 13: // Enter
        if (!inputFieldHasFocus) {
          activeElement.click();
        }
        break;

      case 83: // S
        var orgLink = JSON.parse(activeElement.find("a")[0]["name"]);
        if (orgLink) {
          initSearchWithOrgFilter(orgLink);
        }
        break;
      }

      if (newTabIndex != -1) {
        $('[tabindex=' + newTabIndex + ']').focus();
      }
    }
  }

  angular
    .module('Squared')
    .controller('HelpdeskController', HelpdeskController)
    .config([
      '$compileProvider',
      function ($compileProvider) {
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|mailto):/);
      }
    ]);
}());
