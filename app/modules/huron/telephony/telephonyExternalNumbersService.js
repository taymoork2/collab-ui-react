  (function () {
    'use strict';

    angular
      .module('Huron')
      .factory('ExternalNumberPool', ExternalNumberPool);

    /* @ngInject */
    function ExternalNumberPool($q, ExternalNumberPoolService) {

      var service = {
        create: create,
        getAll: getAll,
        deletePool: deletePool,
        deleteAll: deleteAll
      };

      return service;
      /////////////////////

      function create(_customerId, pattern) {
        var externalNumber = {
          'pattern': pattern
        };

        return ExternalNumberPoolService.save({
          customerId: _customerId
        }, externalNumber).$promise;
      }

      function getAll(_customerId) {
        var customerId = _customerId;
        return ExternalNumberPoolService.query({
          customerId: customerId,
          order: 'pattern'
        }).$promise;
      }

      function deletePool(_customerId, externalNumberUuid) {
        var customerId = _customerId;
        return ExternalNumberPoolService.delete({
          customerId: customerId,
          externalNumberId: externalNumberUuid
        }).$promise;
      }

      function deleteAll(_customerId) {
        var customerId = _customerId;
        return ExternalNumberPoolService.query({
          customerId: customerId
        }, function (data) {
          var promises = [];
          for (var i = 0; i < data.length; i++) {
            var promise = ExternalNumberPoolService.delete({
              customerId: customerId,
              externalNumberId: data[i].uuid
            });

            promises.push(promise);
          }
          return $q.all(promises);
        }).$promise;
      }
    }
  })();
