(function () {
  'use strict';

  var pageDirectiveNames = [
    'cpName',
    'cpNumberLookup',
    'cpMemberLookup'
  ];

  pageDirectiveNames.forEach(function (directiveName) {
    angular
      .module('Huron')
      .directive(directiveName, function () {
        return createSetupAssistantPageDirective(directiveName + '.tpl.html');
      });
  });

  function createSetupAssistantPageDirective(pageFile) {
    var directive = {
      link: function () {},
      templateUrl: 'modules/huron/features/callPark/setupAssistantPages/' + pageFile,
      restrict: 'EA',
      scope: false
    };

    return directive;
  }

})();
