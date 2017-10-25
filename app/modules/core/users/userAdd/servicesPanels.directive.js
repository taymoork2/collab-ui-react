require('./_user-add.scss');

// TODO: rm this after 'cr-services-panels' component fulfills this functionality
(function () {
  'use strict';

  angular.module('Core')
    .directive('crServicesPanelsLegacy', crServicesPanels);

  function crServicesPanels() {
    return {
      restrict: 'EA',
      template: require('modules/core/users/userAdd/servicesPanels.tpl.html'),
    };
  }
})();
