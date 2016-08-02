(function () {
  'use strict';

  var pageDirectiveNames = [
    'ctName',
    'ctProfile',
    'ctOverview',
    'ctCustomer',
    'ctFeedback',
    'ctAgentUnavailable',
    'ctOffHours',
    'ctChatStatusMessages',
    'ctSummary'
  ];

  pageDirectiveNames.forEach(function (directiveName) {
    angular
      .module('Sunlight')
      .directive(directiveName, function () {
        return createSetupAssistantPageDirective(directiveName + '.tpl.html');
      });
  });

  function createSetupAssistantPageDirective(pageFile) {
    var careChatSA;

    var directive = {
      link: function (scope, element, attrs) {
        careChatSA = scope.careChatSA;
      },
      templateUrl: 'modules/sunlight/features/chat/setupAssistantPages/' + pageFile,
      restrict: 'EA',
      scope: false
    };

    return directive;
  }

})();
