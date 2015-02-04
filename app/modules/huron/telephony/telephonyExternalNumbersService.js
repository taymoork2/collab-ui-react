  (function () {
    'use strict';

    angular
      .module('Huron')
      .factory('ExternalNumberPool', ExternalNumberPool)

    /* @ngInject */
    function ExternalNumberPool($q, Authinfo, ExternalNumberPoolService) {

      var service = {
        create: create,
        deletePool: deletePool,
        deleteAll: deleteAll
      };

      return service;
      /////////////////////

      function create(didList) {
        var results = {
          successes: [],
          failures: []
        };
        var didCount = didList.length;
        var deferred = $q.defer();

        for (var i = 0; i < didCount; i++) {
          var externalNumber = {
            'pattern': didList[i]
          };
          ExternalNumberPoolService.save({
            customerId: Authinfo.getOrgId()
          }, externalNumber, function (data) {
            results.successes.push(data.pattern);
            didCount--;
            if (didCount === 0) {
              deferred.resolve(results)
            }
          }, function (err) {
            results.failures.push(err.config.data.pattern);
            didCount--;
            if (didCount === 0) {
              deferred.resolve(results)
            }

          });
        };

        return deferred.promise;
      }

      function deletePool(externalNumberUuid) {
        return ExternalNumberPoolService.delete({
          customerId: Authinfo.getOrgId(),
          externalNumberId: externalNumberUuid
        }).$promise;
      }

      function deleteAll() {
        return ExternalNumberPoolService.query({
          customerId: Authinfo.getOrgId()
        }, function (data) {

          var promises = [];

          for (var i = 0; i < data.length; i++) {

            var externalNumber = {
              'pattern': data[i]
            };
            var promise = ExternalNumberPoolService.delete({
              customerId: Authinfo.getOrgId(),
              externalNumberId: data[i].uuid
            });

            promises.push(promise);
          };

          return $q.all(promises);
        }).$promise;
      }

    }
  })();
