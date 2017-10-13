(function () {
  'use strict';

  var pageDirectiveNames = [
    'ctName',
    'ctVirtualAssistant',
    'ctProfile',
    'ctOverview',
    'ctProactivePrompt',
    'ctCustomer',
    'ctFeedback',
    'ctAgentUnavailable',
    'ctOffHours',
    'ctChatStatusMessages',
    'ctSummary',
  ];

  pageDirectiveNames.forEach(function (directiveName) {
    angular
      .module('Sunlight')
      .directive(directiveName, function () {
        return createSetupAssistantPageDirective(directiveName);
      });
  });

  function createSetupAssistantPageDirective(pageFile) {
    var directive = {
      link: function ($scope, element, $attributes) {
        $scope.careSetupAssistant.cardMode = $attributes.mode;
      },
      template: require('modules/sunlight/features/template/setupAssistantPages/' + pageFile + '.tpl.html'),
      restrict: 'EA',
      scope: false,
    };

    return directive;
  }
})();
