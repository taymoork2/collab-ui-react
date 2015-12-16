(function () {
  'use strict';

  angular
    .module('Core')
    .directive('ucAvgRooms', ucAvgRooms);

  function ucAvgRooms() {
    var directive = {
      restrict: 'EA',
      scope: false,
      templateUrl: 'modules/core/customerReports/avgRooms/avgRooms.tpl.html'
    };

    return directive;
  }

})();
