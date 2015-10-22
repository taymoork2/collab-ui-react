(function () {
  'use strict';

  var pageDirectiveNames = [
    'huntGroupName',
    'huntPilotLookup',
    'huntMethod',
    'huntMembersLookup',
    'fallbackDestination'];

  pageDirectiveNames.map(function(directiveName){
    angular
      .module('uc.huntGroup')
      .directive(directiveName, function() {
        return createSetupAssistantPageDirective(directiveName + '.tpl.html');
      });
  });

  function createSetupAssistantPageDirective(pageFile) {
    var huntGroupSA = undefined;

    var directive = {
      controller: 'HuntGroupSetupAssistantCtrl',
      link: link,
      templateUrl: 'modules/huron/features/huntGroup/setupAssistantPages/' + pageFile,
      restrict: 'EA',
      scope: false
    };

    return directive;

    function link(scope, element, attrs) {
      huntGroupSA = scope.huntGroupSA;
    }
  }

})();
