(function () {
  'use strict';

  angular.module('Squared').service('PlaceFilter',

    /* @ngInject  */
    function ($translate) {
      var currentSearch, currentFilter, arr = [];

      var filters = [];
      var resetFilters = function () {
        filters = [{
          count: 0,
          name: $translate.instant('common.all'),
          filterValue: 'all'
        }, {
          count: 0,
          name: $translate.instant('CsdmStatus.WithDevices'),
          filterValue: 'devices'
        }];
        setCurrentSearch('');
        setCurrentFilter('');
      };
      resetFilters();

      var getFilters = function () {
        return filters;
      };

      var updateFilters = function (list) {
        _.find(filters, {
          filterValue: 'devices'
        }).count = _.chain(list)
          .filter(hasDevices)
          .filter(matchesSearch)
          .value().length;

        _.find(filters, {
          filterValue: 'all'
        }).count = _.filter(list, matchesSearch).length;
      };

      function hasDevices(item) {
        return _.size(item.devices) > 0;
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
          var matchesAnyTag = termMatchesAnyTag(item.tags, term);
          return matchesAnyFieldOfItem || matchesAnyTag;
        });
      }

      function termMatchesAnyTag(tags, term) {
        return (tags || []).some(function (tag) {
          return (tag || '').toLowerCase().indexOf(term || '') != -1;
        });
      }

      function termMatchesAnyFieldOfItem(term, item) {
        return ['displayName'].some(function (field) {
          return item && (item[field] || '').toLowerCase().indexOf(term || '') != -1;
        })
          || ['readableType'].some(function (field) {
            return item && (item[field] || '').toLowerCase().indexOf(term || '') != -1;
          })
          || ['sipUrl'].some(function (field) {
            return item && (item[field] || '').toLowerCase().indexOf(term || '') != -1;
          });
      }

      function matchesFilter(item) {
        switch (currentFilter) {
          case 'all':
            return true;
          case 'devices':
            return hasDevices(item);
          default:
            return true;
        }
      }

      return {
        getFilters: getFilters,
        getFilteredList: getFilteredList,
        resetFilters: resetFilters,
        setCurrentFilter: setCurrentFilter,
        setCurrentSearch: setCurrentSearch
      };

    }
  );
})();
