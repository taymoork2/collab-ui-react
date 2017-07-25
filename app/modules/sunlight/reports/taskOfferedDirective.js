(function () {
  'use strict';

  angular
  .module('Core')
  .directive('ccTaskOffered', ccTaskOffered);

  function ccTaskOffered() {
    var directive = {
      restict: 'EA',
      scope: false,
      templateUrl: 'modules/sunlight/reports/taskOffered.tpl.html',
    };

    return directive;
  }
})();
