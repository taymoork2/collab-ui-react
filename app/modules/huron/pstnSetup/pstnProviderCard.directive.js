(function () {
  'use strict';

  angular.module('Huron')
    .directive('hrPstnProviderCard', hrPstnProviderCard);

  /* @ngInject */
  function hrPstnProviderCard() {
    var directive = {
      restrict: 'AE',
      scope: {
        logoSrc: '=',
        logoAlt: '=',
        featureTitle: '=',
        featureList: '=',
        onSelect: '&'
      },
      replace: true,
      templateUrl: 'modules/huron/pstnSetup/pstnProviderCard.tpl.html'
    };

    return directive;
  }
})();
