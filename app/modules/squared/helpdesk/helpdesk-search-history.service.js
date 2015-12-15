(function () {
  'use strict';

  /*ngInject*/
  function HelpdeskSearchHistoryService(Storage) {
    var self = this;
    self.limit = 10;
    self.userSearchHistoryStorageKey = 'helpdesk.user-search-history';
    self.orgSearchHistoryStorageKey = 'helpdesk.org-search-history';
    self.userSearchHistory = Storage.getObject(self.userSearchHistoryStorageKey) || [];
    self.orgSearchHistory = Storage.getObject(self.orgSearchHistoryStorageKey) || [];

    function userSearchExists(search) {
      var exists = _.find(self.userSearchHistory, function (us) {
        return search.searchString == us.searchString;
      });
      return exists;
    }

    function orgSearchExists(search) {
      var exists = _.find(self.orgSearchHistory, function (us) {
        return search.searchString == us.searchString;
      });
      return exists;
    }

    function saveUserSearch(userSearch) {
      var search = _.clone(userSearch, true);
      if (search.userSearchResults && search.userSearchResults.length > 0 && !userSearchExists(search)) {
        if (self.userSearchHistory.length == self.limit) {
          self.userSearchHistory = _.drop(self.userSearchHistory);
        }
        self.userSearchHistory.push(search);
        Storage.putObject(self.userSearchHistoryStorageKey, self.userSearchHistory);
      }
    }

    function saveOrgSearch(orgSearch) {
      var search = _.clone(orgSearch, true);
      if (search.orgSearchResults && search.orgSearchResults.length > 0 && !orgSearchExists(search)) {
        if (self.orgSearchHistory.length == self.limit) {
          self.orgSearchHistory = _.drop(self.orgSearchHistory);
        }
        self.orgSearchHistory.push(search);
        Storage.putObject(self.orgSearchHistoryStorageKey, self.orgSearchHistory);
      }
    }

    function getUserSearches() {
      return self.userSearchHistory;
    }

    function getOrgSearches() {
      return self.orgSearchHistory;
    }

    function getAllSearches() {
      return self.userSearchHistory.concat(self.orgSearchHistory);
    }

    function getLastSearches() {
      return {
        user: _.last(self.userSearchHistory),
        org: _.last(self.orgSearchHistory)
      };
    }

    function clearSearchHistory() {
      self.userSearchHistory = [];
      self.orgSearchHistory = [];
      Storage.remove(self.userSearchHistoryStorageKey);
      Storage.remove(self.orgSearchHistoryStorageKey);
    }

    return {
      saveUserSearch: saveUserSearch,
      saveOrgSearch: saveOrgSearch,
      getUserSearches: getUserSearches,
      getOrgSearches: getOrgSearches,
      getAllSearches: getAllSearches,
      getLastSearches: getLastSearches,
      clearSearchHistory: clearSearchHistory
    };
  }

  angular.module('Squared')
    .service('HelpdeskSearchHistoryService', HelpdeskSearchHistoryService);

}());
