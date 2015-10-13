(function () {
  'use strict';

  angular.module('uc.hurondetails')
    .factory('NumberSearchService', NumberSearchService);

  /* @ngInject */
  function NumberSearchService(Authinfo, NumberSearchServiceV2, $q) {
    var service = {
      fetchSuggestions: fetchSuggestions
    };

    return service;

    function fetchSuggestions(typedNumber, selections, onFailure) {
      var suggestions = $q.defer();

      if (suggestionsNeeded(typedNumber)) {
        return fetchSuggestionsFromService(typedNumber, selections, onFailure, suggestions);
      }

      suggestions.resolve([]);
      return suggestions.promise;
    }

    function fetchSuggestionsFromService(typedNumber, selections, onFailure, suggestions) {

      NumberSearchServiceV2.get({
        customerId: Authinfo.getOrgId(),
        number: typedNumber
      }).$promise.then(function handleResponse(response) {
        suggestions.resolve(filterSelected(response.numbers, selections));
      }).catch(function (response) {
        suggestions.resolve([]);
        onFailure(response);
      });

      return suggestions.promise;
    }

    function suggestionsNeeded(typedNumber) {
      return (typedNumber.length >= 3);
    }

    function filterSelected(numberList, selectedList) {
      return numberList.filter(function (n) {
        return selectedList.indexOf(n.number) === -1;
      });
    }
  }
})();
