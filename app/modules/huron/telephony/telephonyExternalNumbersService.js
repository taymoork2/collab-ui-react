  (function () {
    'use strict';

    var cmiServicesModule = require('./cmiServices');

    module.exports = angular
      .module('huron.external-number-pool', [
        cmiServicesModule,
      ])
      .factory('ExternalNumberPool', ExternalNumberPool)
      .name;

    /* @ngInject */
    function ExternalNumberPool($q, ExternalNumberPoolService) {

      var ALL_EXTERNAL_NUMBER_TYPES = 'atlasUiAllExternalNumberTypes';
      var ASSIGNED_AND_UNASSIGNED_NUMBERS = 'atlasUiAssignedAndUnassignedNumbers';
      var NO_PATTERN_MATCHING = 'atlasUiNoPatternMatching';
      var UNASSIGNED_NUMBERS = 'atlasUiUnassignedNumbers';

      // external number types in externalnumberpools
      var FIXED_LINE_OR_MOBILE = 'Fixed Line or Mobile';
      var TOLL_FREE = 'Toll Free';

      var service = {
        ALL_EXTERNAL_NUMBER_TYPES: ALL_EXTERNAL_NUMBER_TYPES,
        ASSIGNED_AND_UNASSIGNED_NUMBERS: ASSIGNED_AND_UNASSIGNED_NUMBERS,
        FIXED_LINE_OR_MOBILE: FIXED_LINE_OR_MOBILE,
        TOLL_FREE: TOLL_FREE,
        NO_PATTERN_MATCHING: NO_PATTERN_MATCHING,
        UNASSIGNED_NUMBERS: UNASSIGNED_NUMBERS,
        create: create,
        deletePool: deletePool,
        deleteAll: deleteAll,
        getAll: getAll,
        getExternalNumbers: getExternalNumbers,
        queryExternalNumberPools: queryExternalNumberPools,
      };

      return service;
      /////////////////////

      function create(_customerId, pattern) {
        var externalNumber = {
          'pattern': pattern,
        };

        return ExternalNumberPoolService.save({
          customerId: _customerId,
        }, externalNumber).$promise;
      }

      function getAll(_customerId) {
        var query = {
          order: 'pattern',
        };
        return queryExternalNumberPools(_customerId, query);
      }

      function getExternalNumbers(customerId, pattern, assignment, numberType, extraQueries) {
        var query = {
          externalnumbertype: numberType,
          order: 'pattern',
          pattern: pattern ? '%' + pattern + '%' : undefined,
        };
        if (extraQueries) {
          _.extend(query, extraQueries);
        }
        if (pattern === NO_PATTERN_MATCHING) {
          query.pattern = undefined;
        }
        if (assignment === UNASSIGNED_NUMBERS) {
          query.directorynumber = '';
        } else if (assignment === ASSIGNED_AND_UNASSIGNED_NUMBERS) {
          query.directorynumber = undefined;
        }
        if (numberType === ALL_EXTERNAL_NUMBER_TYPES) {
          query.externalnumbertype = undefined;
        }
        return queryExternalNumberPools(customerId, query);
      }

      function queryExternalNumberPools(customerId, queries) {
        var finalQueries = {};
        _.extend(finalQueries, queries);
        finalQueries.customerId = customerId;
        return ExternalNumberPoolService.query(
          finalQueries
        ).$promise;
      }

      function deletePool(_customerId, externalNumberUuid) {
        var customerId = _customerId;
        return ExternalNumberPoolService.delete({
          customerId: customerId,
          externalNumberId: externalNumberUuid,
        }).$promise;
      }

      function deleteAll(_customerId) {
        var customerId = _customerId;
        return ExternalNumberPoolService.query({
          customerId: customerId,
        }, function (data) {
          var promises = [];
          for (var i = 0; i < data.length; i++) {
            var promise = ExternalNumberPoolService.delete({
              customerId: customerId,
              externalNumberId: data[i].uuid,
            });

            promises.push(promise);
          }
          return $q.all(promises);
        }).$promise;
      }
    }
  })();
