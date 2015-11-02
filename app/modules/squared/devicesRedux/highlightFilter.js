(function () {
  'use strict';

  angular
    .module('Squared')
    .filter('highlight', HighlightFilter);

  function HighlightFilter() {
    return function (input, term) {
      if (input && term) {
        var regex = new RegExp('(' + term + ')', 'gi');
        return input.replace(regex, "<span class='hl'>$1</span>");
      }
      return input;
    };
  }
})();
