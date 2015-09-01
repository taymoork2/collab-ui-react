(function () {
  "use strict";

  angular
    .module('Messenger')
    .factory('UtilService', UtilService);

  /** @ngInject */
  function UtilService() {
    var service = {
      sortBy: sortBy
    };

    return service;

    ////////////////////////////////////////////////////////////////////////////

    function sortBy(a, b) {
      if (a > b) {
        return 1;
      } else if (a < b) {
        return -1;
      } else {
        return 0;
      }
    }
  }
})();
