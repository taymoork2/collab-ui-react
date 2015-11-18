module devicesRedux {
  angular
    .module('Squared')
    .filter('highlight', highlightFilter);

  function highlightFilter () {
    return function (input, term) {
      if (input && term) {
        const regex = new RegExp('(' + term + ')', 'gi');
        return input.replace(regex, "<span class='hl'>$1</span>");
      }
      return input;
    }
  }
}
