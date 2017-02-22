(function () {
  'use strict';

  angular.module('Huron')
    .filter('externalNumberList', externalNumberList);

  function externalNumberList() {
    var nonDigitRegex = /[()-\s]/g;
    var searchFields = [
      'pattern',
      'label',
    ];

    return filter;

    function filter(numbers, _search) {
      if (!_search) {
        return numbers;
      }

      var search = _.replace(_search, nonDigitRegex, '');

      return _.filter(numbers, filterNumber);

      // search multiple fields on the object for matching digits
      function filterNumber(number) {
        return _.some(searchFields, function (searchField) {
          return _.chain(number)
            .get(searchField)
            .replace(nonDigitRegex, '')
            .includes(search)
            .value();
        });
      }
    }
  }

})();
