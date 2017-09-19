require('./_user-add.scss');

(function () {
  'use strict';

  angular.module('Core')
    .directive('crServicesPanels', crServicesPanels);

  function crServicesPanels() {
    return {
      restrict: 'EA',
      template: require('modules/core/users/userAdd/servicesPanels.tpl.html'),
    };
  }
})();
