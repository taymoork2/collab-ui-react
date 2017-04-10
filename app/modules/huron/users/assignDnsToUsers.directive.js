(function () {
  'use strict';

  angular
    .module('Huron')
    .directive('crAssignDnsToUsers', crAssignDnsToUsers);

  function crAssignDnsToUsers() {
    var directive = {
      restrict: 'EA',
      transclude: true,
      templateUrl: 'modules/huron/users/assignDnsToUsers.tpl.html',
    };

    return directive;
  }

})();
