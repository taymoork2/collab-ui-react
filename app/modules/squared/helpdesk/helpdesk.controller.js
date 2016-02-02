(function () {
  'use strict';

  /* @ngInject */
  function HelpdeskController(ReportsService, HelpdeskService, $translate, $scope, $state, $modal, HelpdeskSearchHistoryService, HelpdeskHuronService, LicenseService, Config) {
    $scope.$on('$viewContentLoaded', function () {
      if (HelpdeskService.checkIfMobile()) {
        angular.element('#searchInput').blur();
      } else {
        angular.element('#searchInput').focus();
      }
    });
    var vm = this;
    vm.search = search;
    vm.searchResultsPageSize = 5;
    vm.searchResultsLimit = 20;
    vm.initSearchWithOrgFilter = initSearchWithOrgFilter;
    vm.initSearchWithoutOrgFilter = initSearchWithoutOrgFilter;
    vm.searchingForUsers = false;
    vm.searchingForOrgs = false;
    vm.searchingForDevices = false;
    vm.lookingUpOrgFilter = false;
    vm.searchString = '';
    vm.keyPressHandler = keyPressHandler;
    vm.showMoreResults = showMoreResults;
    vm.showDeviceResultPane = showDeviceResultPane;
    vm.showUsersResultPane = showUsersResultPane;
    vm.showOrgsResultPane = showOrgsResultPane;
    vm.loadSearch = loadSearch;
    vm.clearSearchHistory = clearSearchHistory;
    vm.searchHistory = HelpdeskSearchHistoryService.getAllSearches() || [];
    vm.showSearchHelp = showSearchHelp;
    vm.populateHistory = populateHistory;
    vm.sparkStatusShow = false;
    vm.healthyStatus = "unknown";
    vm.statusPageUrl = Config.getStatusPageUrl();

    getHealthMetrics();

    function populateHistory() {
      vm.searchHistory = HelpdeskSearchHistoryService.getAllSearches() || [];
    }

    function showSearchHelp() {
      var searchHelpUrl = "modules/squared/helpdesk/helpdesk-search-help-dialog.html";
      var searchHelpMobileUrl = "modules/squared/helpdesk/helpdesk-search-help-dialog-mobile.html";
      $modal.open({
        templateUrl: HelpdeskService.checkIfMobile() ? searchHelpMobileUrl : searchHelpUrl
      });
    }

    function loadSearch(search) {
      _.assign(vm.currentSearch, search);
      vm.searchString = search.searchString;
      HelpdeskService.findAndResolveOrgsForUserResults(
        vm.currentSearch.userSearchResults,
        vm.currentSearch.orgFilter,
        vm.currentSearch.userLimit);
      HelpdeskHuronService.setOwnerUserOnDeviceSearchResults(_.take(vm.currentSearch.deviceSearchResults, vm.currentSearch.deviceLimit));
      $state.go('helpdesk.search');
    }

    function clearSearchHistory() {
      HelpdeskSearchHistoryService.clearSearchHistory();
      vm.searchHistory = [];
    }

    vm.currentSearch = {
      searchString: '',
      userSearchResults: null,
      orgSearchResults: null,
      deviceSearchResults: null,
      userSearchFailure: null,
      orgSearchFailure: null,
      deviceSearchFailure: null,
      orgFilter: null,
      orgLimit: vm.searchResultsPageSize,
      userLimit: vm.searchResultsPageSize,
      deviceLimit: vm.searchResultsPageSize,
      initSearch: function (searchString) {
        this.searchString = searchString;
        this.userSearchResults = null;
        this.orgSearchResults = null;
        this.deviceSearchResults = null;
        this.userSearchFailure = null;
        this.orgSearchFailure = null;
        this.deviceSearchFailure = null;
        this.orgLimit = vm.searchResultsPageSize;
        this.userLimit = vm.searchResultsPageSize;
        this.deviceLimit = vm.searchResultsPageSize;
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
      if (HelpdeskService.noOutstandingRequests()) {
        doSearch();
      } else {
        HelpdeskService.cancelAllRequests().then(doSearch);
      }
    }

    function doSearch() {
      vm.currentSearch.initSearch(vm.searchString);
      var orgFilterId = vm.currentSearch.orgFilter ? vm.currentSearch.orgFilter.id : null;
      searchUsers(vm.searchString, orgFilterId);
      if (!orgFilterId) {
        searchOrgs(vm.searchString);
      } else {
        searchDevices(vm.searchString, vm.currentSearch.orgFilter);
      }
    }

    function searchUsers(searchString, orgId) {
      if (searchString.length >= 3) {
        vm.searchingForUsers = true;
        HelpdeskService.searchUsers(searchString, orgId, vm.searchResultsLimit, null, true).then(function (res) {
          vm.currentSearch.userSearchResults = res;
          vm.currentSearch.userSearchFailure = null;
          vm.searchingForUsers = false;
          HelpdeskService.findAndResolveOrgsForUserResults(
            vm.currentSearch.userSearchResults,
            vm.currentSearch.orgFilter,
            vm.currentSearch.userLimit);
          HelpdeskSearchHistoryService.saveSearch(vm.currentSearch);
          vm.searchHistory = HelpdeskSearchHistoryService.getAllSearches();
        }, function (err) {
          vm.searchingForUsers = false;
          vm.currentSearch.userSearchResults = null;
          if (err.status === 400) {
            vm.currentSearch.userSearchFailure = $translate.instant('helpdesk.badUserSearchInput');
          } else if (err.cancelled === true || err.timedout === true) {
            vm.currentSearch.userSearchFailure = $translate.instant('helpdesk.cancelled');
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
        HelpdeskService.searchOrgs(searchString, vm.searchResultsLimit).then(function (res) {
          vm.currentSearch.orgSearchResults = res;
          vm.currentSearch.orgSearchFailure = null;
          vm.searchingForOrgs = false;
          HelpdeskSearchHistoryService.saveSearch(vm.currentSearch);
          vm.searchHistory = HelpdeskSearchHistoryService.getAllSearches();
        }, function (err, status) {
          vm.searchingForOrgs = false;
          vm.currentSearch.orgSearchResults = null;
          vm.currentSearch.orgSearchFailure = null;
          if (err.status === 400) {
            vm.currentSearch.orgSearchFailure = $translate.instant('helpdesk.badOrgSearchInput');
          } else if (err.cancelled === true || err.timedout === true) {
            vm.currentSearch.orgSearchFailure = $translate.instant('helpdesk.cancelled');
          } else {
            vm.currentSearch.orgSearchFailure = $translate.instant('helpdesk.unexpectedError');
          }
        });
      } else {
        vm.currentSearch.orgSearchFailure = $translate.instant('helpdesk.badOrgSearchInput');
      }
    }

    function searchDevices(searchString, org) {
      var orgIsEntitledToCloudBerry = LicenseService.orgIsEntitledTo(org, Config.entitlements.room_system);
      var orgIsEntitledToHuron = LicenseService.orgIsEntitledTo(org, Config.entitlements.huron);
      vm.searchingForDevices = orgIsEntitledToCloudBerry || orgIsEntitledToHuron;
      if (!(orgIsEntitledToCloudBerry || orgIsEntitledToHuron)) {
        vm.currentSearch.deviceSearchFailure = $translate.instant('helpdesk.noDeviceEntitlements');
      }
      if (orgIsEntitledToCloudBerry) {
        vm.searchingForCloudberryDevices = true;
        HelpdeskService.searchCloudberryDevices(searchString, org.id, vm.searchResultsLimit).then(function (res) {
          if (vm.currentSearch.deviceSearchResults) {
            res = vm.currentSearch.deviceSearchResults.concat(res);
          }
          vm.currentSearch.deviceSearchResults = _.sortBy(res, function (device) {
            return device.displayName ? device.displayName.toLowerCase() : '';
          });
          vm.searchingForCloudberryDevices = false;
          vm.searchingForDevices = vm.searchingForHuronDevices;
          setOrgOnDeviceSearchResults(vm.currentSearch.deviceSearchResults);
          HelpdeskSearchHistoryService.saveSearch(vm.currentSearch);
          vm.searchHistory = HelpdeskSearchHistoryService.getAllSearches();
        }, function (err) {
          vm.searchingForCloudberryDevices = false;
          vm.searchingForDevices = vm.searchingForHuronDevices;
          vm.currentSearch.deviceSearchFailure = $translate.instant('helpdesk.unexpectedError');
        });
      }
      if (orgIsEntitledToHuron) {
        vm.searchingForHuronDevices = true;
        HelpdeskHuronService.searchDevices(searchString, org.id, vm.searchResultsLimit).then(function (res) {
          if (vm.currentSearch.deviceSearchResults) {
            res = vm.currentSearch.deviceSearchResults.concat(res);
          }
          vm.currentSearch.deviceSearchResults = _.sortBy(res, function (device) {
            return device.displayName ? device.displayName.toLowerCase() : '';
          });
          vm.searchingForHuronDevices = false;
          vm.searchingForDevices = vm.searchingForCloudberryDevices;
          setOrgOnDeviceSearchResults(vm.currentSearch.deviceSearchResults);
          HelpdeskHuronService.setOwnerUserOnDeviceSearchResults(_.take(vm.currentSearch.deviceSearchResults, vm.currentSearch.deviceLimit));
          HelpdeskSearchHistoryService.saveSearch(vm.currentSearch);
          vm.searchHistory = HelpdeskSearchHistoryService.getAllSearches();
        }, function (err) {
          vm.searchingForHuronDevices = false;
          vm.searchingForDevices = vm.searchingForCloudberryDevices;
          if (err.status === 404) {
            vm.currentSearch.deviceSearchFailure = $translate.instant('helpdesk.huronNotActivated');
          } else {
            vm.currentSearch.deviceSearchFailure = $translate.instant('helpdesk.unexpectedError');
          }
        });
      }
    }

    function initSearchWithOrgFilter(org) {
      vm.lookingUpOrgFilter = true;
      vm.searchingForDevices = false;
      vm.searchingForUsers = false;
      if (HelpdeskService.noOutstandingRequests()) {
        vm.searchString = '';
        vm.currentSearch.clear();
        HelpdeskService.getOrg(org.id).then(function (fullOrg) {
          vm.lookingUpOrgFilter = false;
          vm.currentSearch.orgFilter = fullOrg;
        }, angular.noop);
      } else {
        HelpdeskService.cancelAllRequests().then(function () {
          vm.searchString = '';
          vm.currentSearch.clear();
          HelpdeskService.getOrg(org.id).then(function (fullOrg) {
            vm.lookingUpOrgFilter = false;
            vm.currentSearch.orgFilter = fullOrg;
          }, angular.noop);
        });
      }
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
        vm.currentSearch.userLimit += vm.searchResultsPageSize;
        HelpdeskService.findAndResolveOrgsForUserResults(
          vm.currentSearch.userSearchResults,
          vm.currentSearch.orgFilter,
          vm.currentSearch.userLimit);
        break;
      case 'org':
        vm.currentSearch.orgLimit += vm.searchResultsPageSize;
        break;
      case 'device':
        vm.currentSearch.deviceLimit += vm.searchResultsPageSize;
        HelpdeskHuronService.setOwnerUserOnDeviceSearchResults(_.take(vm.currentSearch.deviceSearchResults, vm.currentSearch.deviceLimit));
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

    function getHealthMetrics() {
      ReportsService.healthMonitor(function (data, status) {
        if (data.success) {
          vm.healthMetrics = data.components;
          // check Squared for error
          for (var health in vm.healthMetrics) {
            if (vm.healthMetrics[health].status !== 'operational') {
              vm.healthyStatus = "error";
              return;
            }
          }
          vm.healthyStatus = "ok";

        }
      });
    }

  }

  angular
    .module('Squared')
    .controller('HelpdeskController', HelpdeskController);
}());
