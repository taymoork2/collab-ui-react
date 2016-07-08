(function () {
  'use strict';

  var pageDirectiveNames = [
    'cpName',
    'cpNumberLookup',
    'cpMemberLookup'
  ];

  pageDirectiveNames.map(function (directiveName) {
    angular
      .module('Huron')
      .directive(directiveName, function () {
        return createSetupAssistantPageDirective(directiveName + '.tpl.html');
      });
  });

  function createSetupAssistantPageDirective(pageFile) {
    var callParkSA;

    var directive = {
      link: function (scope, element, attrs) {
        callParkSA = scope.callParkSA;
      },
      templateUrl: 'modules/huron/features/callPark/setupAssistantPages/' + pageFile,
      restrict: 'EA',
      scope: false
    };

    return directive;
  }

})();
