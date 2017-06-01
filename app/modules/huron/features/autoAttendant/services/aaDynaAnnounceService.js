(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .factory('AADynaAnnounceService', AADynaAnnounceService);

  /* @ngInject */
  function AADynaAnnounceService($window) {

    var service = {
      getRange: getRange,
    };

    return service;

    /////////////////////

    function getRange() {
      var selection;
      var range;
      if ($window.getSelection) {
        selection = $window.getSelection();
        if (selection.getRangeAt && selection.rangeCount) {
          range = selection.getRangeAt(0);
          return range;
        }
      }
    }

  }
})();
