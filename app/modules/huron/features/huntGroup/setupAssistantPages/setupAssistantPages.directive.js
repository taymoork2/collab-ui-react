(function () {
  'use strict';

  var pageDirectiveNames = [
    'hgName',
    'hgPilotLookup',
    'hgMethod',
    'hgMemberLookup',
    'hgFallbackDestination'
  ];

  pageDirectiveNames.map(function (directiveName) {
    angular
      .module('Huron')
      .directive(directiveName, function () {
        return createSetupAssistantPageDirective(directiveName + '.tpl.html');
      });
  });

  function createSetupAssistantPageDirective(pageFile) {
    var directive = {
      link: function () {},
      templateUrl: 'modules/huron/features/huntGroup/setupAssistantPages/' + pageFile,
      restrict: 'EA',
      scope: false
    };

    return directive;
  }

})();
