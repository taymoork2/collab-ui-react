'use strict';

angular.module('Huron')
  .factory('HuronUnassignedLine', ['Authinfo', 'UnassignedLineService',
    function (Authinfo, UnassignedLineService) {
      return {
        getFirst: function () {
          return UnassignedLineService.query({
              customerId: Authinfo.getOrgId()
            }).$promise
            .then(function (lines) {
              if (angular.isArray(lines) && lines.length > 0) {
                return lines[0].uuid;
              }
            });
        }
      };
    }
  ]);
