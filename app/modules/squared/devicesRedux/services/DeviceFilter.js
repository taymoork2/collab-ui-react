'use strict';

angular.module('Squared').service('DeviceFilter',

  /* @ngInject  */
  function () {

    var currentSearch, currentFilter, arr = [];

    var filters = [{
      count: 0,
      name: 'All',
      filterValue: 'all'
    }, {
      count: 0,
      name: 'Needs Activation',
      filterValue: 'codes'
    }, {
      count: 0,
      name: 'Has Issues',
      filterValue: 'issues'
    }, {
      count: 0,
      name: 'Offline',
      filterValue: 'offline'
    }, {
      count: 0,
      name: 'Online',
      filterValue: 'online'
    }];

    var getFilters = function () {
      return filters;
    };

    var updateFilters = function (list) {
      _(filters).find({
          filterValue: 'codes'
        }).count = _.chain(list)
        .filter(isActivationCode)
        .filter(matchesSearch)
        .value().length;

      _(filters).find({
          filterValue: 'issues'
        }).count = _.chain(list)
        .filter(hasIssues)
        .filter(matchesSearch)
        .value().length;

      _(filters).find({
          filterValue: 'online'
        }).count = _.chain(list)
        .filter(isOnline)
        .filter(matchesSearch)
        .value().length;

      _(filters).find({
          filterValue: 'offline'
        }).count = _.chain(list)
        .filter(isOffline)
        .filter(matchesSearch)
        .value().length;

      _(filters).find({
        filterValue: 'all'
      }).count = _.filter(list, matchesSearch).length;
    };

    var isActivationCode = function (item) {
      return item.needsActivation;
    };

    var hasIssues = function (item) {
      return item.hasIssues;
    };

    var isOnline = function (item) {
      return item.isOnline;
    };

    var isOffline = function (item) {
      return !item.isOnline && !item.needsActivation;
    };

    var setCurrentSearch = function (search) {
      currentSearch = (search || '').toLowerCase();
    };

    var setCurrentFilter = function (filter) {
      currentFilter = (filter || '').toLowerCase();
    };

    var getFilteredList = function (data) {
      arr.length = 0;
      updateFilters(data);

      _.each(data, function (item) {
        if (matchesSearch(item) && matchesFilter(item)) {
          arr.push(item);
        }
      });

      return arr;
    };

    var matchesSearch = function (item) {
      return (item.displayName || '').toLowerCase().indexOf(currentSearch || '') != -1;
    };

    var matchesFilter = function (item) {
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
    };

    return {
      getFilters: getFilters,
      getFilteredList: getFilteredList,
      setCurrentFilter: setCurrentFilter,
      setCurrentSearch: setCurrentSearch,
    };

  }
);
