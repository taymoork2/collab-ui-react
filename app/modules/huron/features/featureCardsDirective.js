/**
 * Created by sjalipar on 10/6/15.
 */
(function () {
  'use strict';

  angular
    .module('uc.hurondetails')
    .directive('featureCards', featureCards);

  function featureCards() {
    return {
      restrict: 'E',
      scope: false,
      templateUrl: 'modules/huron/features/featureCards.tpl.html'
    };
  }
})();
