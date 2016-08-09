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
    var directive = {
      link: function () {},
      templateUrl: 'modules/sunlight/features/chat/setupAssistantPages/' + pageFile,
      restrict: 'EA',
      scope: false
    };

    return directive;
  }

})();
