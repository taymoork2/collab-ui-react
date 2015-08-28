(function () {
  'use strict';

  angular.module('Huron')
    .directive('ucPstnProviderCard', ucPstnProviderCard);

  /* @ngInject */
  function ucPstnProviderCard() {
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
