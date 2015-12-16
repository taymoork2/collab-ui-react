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
    vm.showDeviceResultPane = showDeviceResultPane;
    vm.showUsersResultPane = showUsersResultPane;
    vm.showOrgsResultPane = showOrgsResultPane;

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
          if (err.status === 400 || err.status === -1) {
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

    function showUsersResultPane() {
      return vm.searchingForUsers || vm.currentSearch.userSearchResults || vm.currentSearch.userSearchFailure;
    }

    function showOrgsResultPane() {
      return vm.searchingForOrgs || vm.currentSearch.orgSearchResults || vm.currentSearch.orgSearchFailure;
    }

    function showDeviceResultPane() {
      return vm.currentSearch.orgFilter && (vm.searchingForDevices || vm.currentSearch.deviceSearchResults || vm.currentSearch.deviceSearchFailure);
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
      var LEFT_ARROW = 37;
      var UP_ARROW = 38;
      var RIGHT_ARROW = 39;
      var DOWN_ARROW = 40;
      var ESC = 27;
      var ENTER = 13;
      var S = 83;

      var activeElement = angular.element(document.activeElement);
      var inputFieldHasFocus = activeElement[0]["id"] === "searchInput";
      if (inputFieldHasFocus && !(event.keyCode === 27 || event.keyCode === 13)) {
        return; // if not escape and enter, nothing to do
      }
      var activeTabIndex = activeElement[0]["tabIndex"];
      var newTabIndex = -1;

      switch (event.keyCode) {
      case LEFT_ARROW:
        newTabIndex = activeTabIndex - 1;
        break;

      case UP_ARROW:
        newTabIndex = activeTabIndex - 10;
        break;

      case RIGHT_ARROW:
        newTabIndex = activeTabIndex + 1;
        break;

      case DOWN_ARROW:
        newTabIndex = activeTabIndex + 10;
        break;

      case ESC:
        if (inputFieldHasFocus) {
          initSearchWithoutOrgFilter();
        } else {
          if (HelpdeskService.checkIfMobile()) {
            // TODO: Why is mobile relevant here ?
            angular.element('#searchInput').blur();
          } else {
            // TODO: Why .select ?
            angular.element('#searchInput').focus().select();
          }
          newTabIndex = -1;
        }
        break;

      case ENTER:
        if (!inputFieldHasFocus) {
          activeElement.click();
        }
        break;

      case S:
        var orgLink = JSON.parse(activeElement.find("a")[0]["name"]);
        // TODO: Avoid throwing console error when element not found !
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
    .controller('HelpdeskController', HelpdeskController);
}());
