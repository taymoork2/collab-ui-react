'use strict';

angular.module('Huron')
  .factory('HuronUnassignedLine', ['$http', 'Authinfo', 'UnassignedLineService',
    function($http, Authinfo, UnassignedLineService) {
      return {
        getFirst: function() {
          delete $http.defaults.headers.common.Authorization;
          return UnassignedLineService.query({customerId: Authinfo.getOrgId()}).$promise
            .then(function(lines){
              if (angular.isArray(lines) && lines.length > 0) {
                return lines[0].uuid;
              }
            });
        }
      };
    }
]);