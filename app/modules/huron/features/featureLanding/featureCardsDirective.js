/**
 * Created by sjalipar on 10/6/15.
 */
(function () {
  'use strict';

  angular
    .module('Huron')
    .directive('featureCards', featureCards);

  function featureCards() {
    return {
      restrict: 'E',
      scope: false,
      template: require('modules/huron/features/featureLanding/featureCards.tpl.html'),
    };
  }
})();
