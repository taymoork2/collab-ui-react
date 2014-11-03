'use strict';

/* global _ */

angular.module('Hercules')
  .service('ConnectorGrouper', [

    function () {
      return {
        groupBy: function (data, attr) {
          return _.groupBy(data, attr);
        }
      };
    }
  ]);
