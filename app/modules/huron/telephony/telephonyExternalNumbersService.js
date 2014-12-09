(function () {
  'use strict';

  angular
    .module('Huron')
    .factory('ExternalNumberPool', ['$q', 'Authinfo', 'ExternalNumberPoolService',
      function ($q, Authinfo, ExternalNumberPoolService) {

        // TODO: Hard coded until test user is configured
        var customerId = Authinfo.getOrgId();
        // var customerId = '93090770-303c-4dd7-a53a-ea342fd095f0';

        return {
          create: function (didList) {
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
                customerId: customerId
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
          },
          delete: function (externalNumberUuid) {
            return ExternalNumberPoolService.remove({
              customerId: customerId,
              externalNumberId: externalNumberUuid
            });
          },
          deleteAll: function () {

            var UuidList = [];

            return ExternalNumberPoolService.query({
              customerId: customerId
            }, function (data) {

              var promises = [];

              for (var i = 0; i < data.length; i++) {

                var externalNumber = {
                  'pattern': data[i]
                };
                var promise = ExternalNumberPoolService.delete({
                    customerId: customerId,
                    externalNumberId: data[i].uuid
                  }, externalNumber,
                  function (data) {},
                  function (err) {});

                promises.push(promise);
              };

              return $q.all(promises);
            }, function (err) {
              return;
            });
          }
        };
      }
    ]);
})();
