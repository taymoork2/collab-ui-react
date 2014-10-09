'use strict';

angular.module('Huron')
  .factory('CallPark', ['$http', '$q', 'Authinfo', 'Notification', 'CallParkService',
    function($http, $q, Authinfo, Notification, CallParkService) {
      return {
        callParks: [],

        create: function(callPark) {
          delete $http.defaults.headers.common.Authorization;
          return CallParkService.save({customerId: Authinfo.getOrgId()}, callPark, function(response){
            Notification.notify([response.pattern + ' added successfully'], 'success');
          }, function(response) {
            Notification.notify([response.config.data.pattern + ' not added'], 'error');
          }).$promise;
        },

        createByRange: function(callPark, rangeMin, rangeMax) {
          var success = [];
          var error = [];
          var deferreds = [];
          var saveSuccess = function(response) {
            success.push(response.pattern + ' added successfully');
          };
          var saveError = function(response) {
            error.push(response.config.data.pattern + ' not added');
          };
          for (var pattern = rangeMin; pattern <= rangeMax; pattern++) {
            var data = angular.copy(callPark);
            data.pattern = pattern;
            delete $http.defaults.headers.common.Authorization;
            deferreds.push(angular.copy(CallParkService.save({customerId: Authinfo.getOrgId()}, data, saveSuccess, saveError).$promise));
          }
          //TODO better way to report errors
          return $q.all(deferreds).finally(function(){
            Notification.notify(success, 'success');
            Notification.notify(error, 'error');
          });
        },

        list: function() {
          delete $http.defaults.headers.common.Authorization;
          return CallParkService.query({customerId: Authinfo.getOrgId()}, angular.bind(this,function(callParks){
            this.callParks = callParks;
          })).$promise;
        },

        remove: function(callParkId) {
          delete $http.defaults.headers.common.Authorization;
          return CallParkService.remove({customerId: Authinfo.getOrgId(), callParkId: callParkId}).$promise;
        }
      };
    }

]);