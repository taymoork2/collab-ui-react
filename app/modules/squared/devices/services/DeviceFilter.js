(function () {
  'use strict';

  angular.module('Squared').service('DeviceFilter',

    /* @ngInject  */
    function ($translate) {

      var currentSearch, currentFilter, arr = [];

      var filters = [{
        count: 0,
        name: $translate.instant('common.all'),
        filterValue: 'all'
      }, {
        count: 0,
        name: $translate.instant('CsdmStatus.OnlineWithIssues'),
        filterValue: 'issues'
      }, {
        count: 0,
        name: $translate.instant('CsdmStatus.Offline'),
        filterValue: 'offline'
      }, {
        count: 0,
        name: $translate.instant('CsdmStatus.RequiresActivation'),
        filterValue: 'codes'
      }, {
        count: 0,
        name: $translate.instant('CsdmStatus.Online'),
        filterValue: 'online'
      }];

      var getFilters = function () {
        return filters;
      };

      var updateFilters = function (list) {
        _.find(filters, {
          filterValue: 'codes'
        }).count = _.chain(list)
          .filter(isActivationCode)
          .filter(matchesSearch)
          .value().length;

        _.find(filters, {
          filterValue: 'issues'
        }).count = _.chain(list)
          .filter(hasIssues)
          .filter(matchesSearch)
          .value().length;

        _.find(filters, {
          filterValue: 'online'
        }).count = _.chain(list)
          .filter(isOnline)
          .filter(matchesSearch)
          .value().length;

        _.find(filters, {
          filterValue: 'offline'
        }).count = _.chain(list)
          .filter(isOffline)
          .filter(matchesSearch)
          .value().length;

        _.find(filters, {
          filterValue: 'all'
        }).count = _.filter(list, matchesSearch).length;
      };

      function isActivationCode(item) {
        return item.needsActivation;
      }

      function hasIssues(item) {
        return item.hasIssues && item.isOnline && !item.isUnused;
      }

      function isOnline(item) {
        return item.isOnline;
      }

      function isOffline(item) {
        return !item.isOnline && !item.needsActivation && !item.isUnused;
      }

      function setCurrentSearch(search) {
        currentSearch = (search || '').toLowerCase();
      }

      function setCurrentFilter(filter) {
        currentFilter = (filter || '').toLowerCase();
      }

      function getFilteredList(data) {
        arr.length = 0;
        updateFilters(data);

        _.each(data, function (item) {
          if (matchesSearch(item) && matchesFilter(item)) {
            arr.push(item);
          }
        });

        return arr;
      }

      function matchesSearch(item) {
        var terms = (currentSearch || '').split(/[\s,]+/);
        return terms.every(function (term) {
          var matchesAnyFieldOfItem = termMatchesAnyFieldOfItem(term, item);
          var matchesState = termMatchesState(item.state, term);
          var matchesAnyTag = termMatchesAnyTag(item.tags, term);
          var matchesAnyIssue = termMatchesAnyIssue(item.diagnosticsEvents, term);
          var matchedAnyUpgradeChannel = termMatchesUpgradeChannel(item.upgradeChannel, term);
          var matchesFormattedMac = (item.mac || '').toLowerCase().replace(/:/g, '').indexOf((term || '')) != -1;
          return matchesAnyFieldOfItem || matchesState || matchesAnyTag || matchesAnyIssue || matchedAnyUpgradeChannel || matchesFormattedMac;
        });
      }

      function termMatchesAnyTag(tags, term) {
        return (tags || []).some(function (tag) {
          return (tag || '').toLowerCase().indexOf(term || '') != -1;
        });
      }

      function termMatchesAnyIssue(issues, term) {
        return (issues || []).some(function (issue) {
          return (issue.type || '').toLowerCase().indexOf(term || '') != -1 || (issue.message || '').toLowerCase().indexOf(term || '') != -1;
        });
      }

      function termMatchesState(state, term) {
        return state && (state.readableState || '').toLowerCase().indexOf(term || '') != -1;
      }

      function termMatchesUpgradeChannel(upgradeChannel, term) {
        return upgradeChannel && (upgradeChannel.label || '').toLowerCase().indexOf(term || '') != -1;
      }

      function termMatchesAnyFieldOfItem(term, item) {
        return ['displayName', 'product', 'ip', 'mac', 'serial'].some(function (field) {
          return item && (item[field] || '').toLowerCase().indexOf(term || '') != -1;
        });
      }

      function matchesFilter(item) {
        switch (currentFilter) {
          case 'all':
            return true;
          case 'codes':
            return isActivationCode(item);
          case 'issues':
            return hasIssues(item);
          case 'online':
            return isOnline(item);
          case 'offline':
            return isOffline(item);
          default:
            return true;
        }
      }

      return {
        getFilters: getFilters,
        getFilteredList: getFilteredList,
        setCurrentFilter: setCurrentFilter,
        setCurrentSearch: setCurrentSearch,
      };

    }
  );
})();
