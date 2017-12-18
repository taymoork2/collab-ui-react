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
    'ctChatEscalationBehavior',
  ];

  pageDirectiveNames.forEach(function (directiveName) {
    angular
      .module('Sunlight')
      .directive(directiveName, function () {
        return createCustomerSupportTemplateDirective(directiveName);
      });
  });

  function createCustomerSupportTemplateDirective(pageFile) {
    var directive = {
      link: function ($scope, element, $attributes) {
        $scope.careSetupAssistant.cardMode = $attributes.mode;
      },
      template: require('modules/sunlight/features/customerSupportTemplate/wizardPages/' + pageFile + '.tpl.html'),
      restrict: 'EA',
      scope: false,
    };

    return directive;
  }
})();
