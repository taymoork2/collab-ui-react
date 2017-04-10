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
    'ctSummary',
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
      link: function ($scope, element, $attributes) {
        $scope.careSetupAssistant.cardMode = $attributes.mode;
      },
      templateUrl: 'modules/sunlight/features/template/setupAssistantPages/' + pageFile,
      restrict: 'EA',
      scope: false,
    };

    return directive;
  }

})();
