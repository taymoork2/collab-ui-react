(function () {
  'use strict';

  angular
    .module('Core')
    .directive('ucFilesShared', ucFilesShared);

  function ucFilesShared() {
    var directive = {
      restrict: 'EA',
      scope: false,
      templateUrl: 'modules/core/customerReports/filesShared/filesShared.tpl.html'
    };

    return directive;
  }

})();
