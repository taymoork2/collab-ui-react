(function () {
  'use strict';

  /* @ngInject */
  function HelpdeskController(HelpdeskService, $translate, $scope) {
    $('body').css('background', 'white');
    $scope.$on('$viewContentLoaded', function () {
      angular.element('#searchInput').focus();
    });
    var vm = this;
    var searchResultsPageSize = 5;
    var searchResultsLimit = 20;
    vm.search = search;
    vm.setOrgFilter = setOrgFilter;
    vm.clearOrgFilter = clearOrgFilter;
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
        angular.element('#searchInput').focus();
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
        HelpdeskService.searchUsers(searchString, orgId, searchResultsLimit).then(function (res) {
          vm.currentSearch.userSearchResults = res;
          vm.searchingForUsers = false;
          findAndResolveOrgsForUserResults(vm.currentSearch.userSearchResults);
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

    function setOrgFilter(org) {
      vm.searchString = '';
      vm.currentSearch.initSearch('');
      vm.currentSearch.orgFilter = org;
    }

    function clearOrgFilter() {
      vm.searchString = '';
      vm.currentSearch.initSearch('');
      vm.currentSearch.orgFilter = null;
    }

    function showMoreResults(type) {
      switch (type) {
      case 'user':
        vm.currentSearch.userLimit += searchResultsPageSize;
        findAndResolveOrgsForUserResults(vm.currentSearch.userSearchResults);
        break;
      case 'org':
        vm.currentSearch.orgLimit += searchResultsPageSize;
        break;
      case 'device':
        vm.currentSearch.deviceLimit += searchResultsPageSize;
        break;
      }
    }

    function findAndResolveOrgsForUserResults(userSearchResults) {
      if (_.size(userSearchResults) > 0) {
        if (vm.currentSearch.orgFilter) {
          _.each(userSearchResults, function (user) {
            user.organization.displayName = vm.currentSearch.orgFilter.displayName;
          });
        } else {
          var orgs = [];
          var currentResults = _.take(userSearchResults, vm.currentSearch.userLimit);
          _.each(currentResults, function (user) {
            if (!user.organization.displayName) {
              orgs.push(user.organization.id);
            }
          });
          _.each(_.uniq(orgs), function (orgId) {
            HelpdeskService.getOrgDisplayName(orgId).then(function (displayName) {
              _.each(userSearchResults, function (user) {
                if (user.organization && user.organization.id === orgId) {
                  user.organization.displayName = displayName;
                }
              });
            }, angular.noop);
          });
        }

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
      var activeCard = angular.element(document.activeElement)[0]["tabIndex"];
      var newTabIndex = activeCard;
      switch (event.keyCode) {
      case 37: // Left arrow
        newTabIndex = parseInt(activeCard) - 1;
        break;

      case 38: // Up arrow
        newTabIndex = parseInt(activeCard) - 10;
        break;

      case 39: // Right arrow
        newTabIndex = parseInt(activeCard) + 1;
        break;

      case 40: // Down arrow
        newTabIndex = parseInt(activeCard) + 10;
        break;

      case 27: // Esc
        newTabIndex = "-1";
        vm.searchString = '';
        vm.currentSearch.initSearch('');
        break;

      case 13: // Enter
        if (angular.element(document.activeElement)[0]["id"] !== "searchInput") {
          newTabIndex = 1;
        } else {
          angular.element(document.activeElement).click();
        }
        break;
      }
      if (newTabIndex != "-1") {
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
