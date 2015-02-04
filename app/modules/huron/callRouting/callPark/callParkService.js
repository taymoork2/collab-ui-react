(function () {
  'use strict';

  angular
    .module('uc.callpark')
    .factory('CallPark', CallPark);

  /* @ngInject */
  function CallPark($q, Authinfo, Notification, CallParkService) {
    var service = {
      list: list,
      create: create,
      createByRange: createByRange,
      remove: remove
    };
    return service;

    function list() {
      return CallParkService.query({
        customerId: Authinfo.getOrgId()
      }).$promise.then(function (callParks) {
        return callParks;
      });
    }

    function create(callPark) {
      return CallParkService.save({
        customerId: Authinfo.getOrgId()
      }, callPark, function (response) {
        Notification.notify([response.pattern + ' added successfully'], 'success');
      }, function (response) {
        Notification.notify([response.config.data.pattern + ' not added'], 'error');
      }).$promise;
    }

    function createByRange(callPark, rangeMin, rangeMax) {
      var success = [];
      var error = [];
      var deferreds = [];
      var saveSuccess = function (response) {
        success.push(response.pattern + ' added successfully');
      };
      var saveError = function (response) {
        error.push(response.config.data.pattern + ' not added');
      };
      for (var pattern = rangeMin; pattern <= rangeMax; pattern++) {
        var data = angular.copy(callPark);
        data.pattern = pattern;
        deferreds.push(angular.copy(CallParkService.save({
          customerId: Authinfo.getOrgId()
        }, data, saveSuccess, saveError).$promise));
      }
      return $q.all(deferreds).finally(function () {
        Notification.notify(success, 'success');
        Notification.notify(error, 'error');
      });
    }

    function remove(callPark) {
      return CallParkService.remove({
        customerId: Authinfo.getOrgId(),
        callParkId: callPark.uuid
      }, function (response) {
        Notification.notify([callPark.pattern + ' deleted successfully'], 'success');
      }, function (response) {
        Notification.notify([callPark.pattern + ' not deleted correctly'], 'error');
      }).$promise;
    }
  }
})();
