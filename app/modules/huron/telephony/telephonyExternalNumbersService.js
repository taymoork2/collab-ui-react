  (function () {
    'use strict';

    angular
      .module('Huron')
      .factory('ExternalNumberPool', ExternalNumberPool);

    /* @ngInject */
    function ExternalNumberPool($q, ExternalNumberPoolService) {

      var service = {
        create: create,
        deletePool: deletePool,
        deleteAll: deleteAll
      };

      return service;
      /////////////////////

      function create(_customerId, didList) {
        var results = {
          successes: [],
          failures: []
        };
        var customerId = _customerId;
        var didCount = didList.length;
        var deferred = $q.defer();

        for (var i = 0; i < didCount; i++) {
          var externalNumber = {
            'pattern': didList[i]
          };
          ExternalNumberPoolService.save({
            customerId: customerId
          }, externalNumber, function (data) {
            results.successes.push(data.pattern);
            didCount--;
            if (didCount === 0) {
              deferred.resolve(results);
            }
          }, function (err) {
            results.failures.push(err.config.data.pattern);
            didCount--;
            if (didCount === 0) {
              deferred.resolve(results);
            }

          });
        }

        return deferred.promise;
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
