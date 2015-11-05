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
        return createCallParkRanges(callParks);
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
        deferreds.push(CallParkService.save({
          customerId: Authinfo.getOrgId()
        }, data, saveSuccess, saveError).$promise);
      }
      return $q.all(deferreds).finally(function () {
        Notification.notify(success, 'success');
        Notification.notify(error, 'error');
      });
    }

    function remove(callPark) {
      var success = [];
      var error = [];
      var deferreds = [];
      var deleteSuccess = function (response) {
        success.push(response.pattern + ' deleted successfully');
      };
      var deleteError = function (response) {
        error.push(response.pattern + ' not deleted correctly');
      };

      if (angular.isDefined(callPark.data) && angular.isArray(callPark.data)) {
        for (var i = 0; i < callPark.data.length; i++) {
          var data = angular.copy(callPark.data[i]);
          deferreds.push(CallParkService.remove({
            customerId: Authinfo.getOrgId(),
            callParkId: data.uuid
          }, data, deleteSuccess, deleteError).$promise);
        }
        return $q.all(deferreds).finally(function () {
          Notification.notify(success, 'success');
          Notification.notify(error, 'error');
        });
      } else {
        Notification.notify('Failed to delete', 'error');
      }

    }

    //return the index of the inserted CP in the array
    function pushInitialCallParkRange(rangedCallParks, rawCallPark) {
      rangedCallParks.push({
        'retrievalPrefix': rawCallPark.retrievalPrefix,
        'pattern': rawCallPark.pattern,
        'description': rawCallPark.description,
        'data': [rawCallPark]
      });
      return rangedCallParks.length - 1;
    }

    function createCallParkRanges(rawCallParks) {
      var rangedCallParks = [];
      var map = {};
      var i = 0;

      //load all like CPs in a single array based on description and store each arry in map object
      for (; i < rawCallParks.length; i++) {
        if (!map.hasOwnProperty(rawCallParks[i].description)) {
          map[rawCallParks[i].description] = [];
        }
        map[rawCallParks[i].description].push(rawCallParks[i]);
      }
      //Sort each array in map
      for (var propertyName in map) {
        //sort CPs in order
        map[propertyName].sort(function (a, b) {
          return a.pattern - b.pattern;
        });

        //make continuous CP ranges
        var index = pushInitialCallParkRange(rangedCallParks, map[propertyName][0]);
        var currentCallPark = rangedCallParks[index];
        for (i = 1; i < map[propertyName].length; i++) {
          if ((Number(map[propertyName][i - 1].pattern) + 1) === Number(map[propertyName][i].pattern)) {
            currentCallPark.data.push(map[propertyName][i]);
          } else {
            if (currentCallPark.data.length > 1) {
              //finish the range pattern
              currentCallPark.pattern += ' - ' + currentCallPark.data[currentCallPark.data.length - 1].pattern;
            }
            //create a new CP range, because the range must be continuous
            index = pushInitialCallParkRange(rangedCallParks, map[propertyName][i]);
            currentCallPark = rangedCallParks[index];
          }
        }
        if (currentCallPark.data.length > 1) {
          //finish the range pattern
          currentCallPark.pattern += ' - ' + currentCallPark.data[currentCallPark.data.length - 1].pattern;
        }
      }
      return rangedCallParks;
    }
  }
})();
