  (function () {
    'use strict';

    angular
      .module('Huron')
      .factory('ExternalNumberPool', ExternalNumberPool);

    /* @ngInject */
    function ExternalNumberPool($q, ExternalNumberPoolService, Log) {

      var service = {
        create: create,
        getAll: getAll,
        deleteExtNums: deleteExtNums,
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
            Log.error("Failure to add did " + err);
            results.failures.push(err.config.data.pattern);
            didCount--;
            if (didCount === 0) {
              deferred.resolve(results);
            }

          });
        }

        return deferred.promise;
      }

      function getAll(_customerId) {
        var customerId = _customerId;
        return ExternalNumberPoolService.query({
          customerId: customerId
        }).$promise;
      }

      function deletePool(_customerId, externalNumberUuid) {
        var customerId = _customerId;
        return ExternalNumberPoolService.delete({
          customerId: customerId,
          externalNumberId: externalNumberUuid
        }).$promise;
      }

      function deleteExtNums(_customerId, didList) {
        var results = {
          successes: 0,
          failures: 0
        };
        var customerId = _customerId;
        var didCount = didList.length;
        var deferred = $q.defer();

        for (var i = 0; i < didCount; i++) {

          deletePool(customerId, didList[i].uuid).then(function (data) {
            results.successes++;
          }, function (err) {
            Log.error("Failure to delete did " + err);
            results.failures++;
          }).finally(function () {
            didCount--;
            if (didCount === 0) {
              deferred.resolve(results);
            }
          });
        }

        return deferred.promise;

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
