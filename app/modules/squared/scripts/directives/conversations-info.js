'use strict';

//Setting it to false just for this file because it does not recognize jQuery's '$' symbol.
/* global $ */

angular.module('Squared')
  .directive('sqConversationsInfo', function () {
    return {
      restrict: 'A',
      scope: {
        userEmail: '=',
        currentUser: '=',
        entitlements: '=',
        queryuserslist: '='
      },
      templateUrl: 'modules/squared/scripts/directives/views/conversations-info.html',
      link: function (scope, elem, attrs) {}
    };
  });
