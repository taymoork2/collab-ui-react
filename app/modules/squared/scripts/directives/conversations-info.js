'use strict';

angular.module('Squared')
  .directive('sqConversationsInfo', function () {
    return {
      restrict: 'A',
      scope: {
        userEmail: '='
      },
      templateUrl: 'modules/squared/scripts/directives/views/conversations-info.html',
      link: function () {}
    };
  });
