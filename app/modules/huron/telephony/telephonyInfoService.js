'use strict';

angular.module('Huron')
  .factory('TelephonyInfoService', ['$rootScope', '$http', '$q', 'RemoteDestinationService', 'Log',
    function($rootScope, $http, $q, RemoteDestinationService, Log) {
      var service = {};
      service.broadcastEvent = "telephonyInfoUpdated";

      service.telephonyInfo = {
        services: [],
        currentDirectoryNumber: null,
        directoryNumbers: [],
        voicemail : 'Off',
        singleNumberReach : 'Off',
        snrInfo: {
          destination : null,
          remoteDestinations : null,
          singleNumberReachEnabled : false
        }
      };

      service.getTelephonyInfo = function() {
        return this.telephonyInfo;
      };

      service.updateDirectoryNumbers = function(directoryNumbers) {
        this.telephonyInfo.directoryNumbers = directoryNumbers;
        $rootScope.$broadcast(this.broadcastEvent);
      };

      service.updateUserServices = function(services) {
        this.telephonyInfo.services = services;
        // rip thru services and toggle display values.
        // voicemail is the only one we care about currently
        var voicemailEnabled = false;
        if (this.telephonyInfo.services !== null && this.telephonyInfo.services.length > 0) {
          for (var j=0; j< this.telephonyInfo.services.length; j++) {
            if(this.telephonyInfo.services[j] === 'VOICEMAIL') {
              voicemailEnabled = true
            }
          }
        }
        this.telephonyInfo.voicemail = (voicemailEnabled === true) ? 'On' : 'Off';
        $rootScope.$broadcast(this.broadcastEvent);
      };

      service.updateSnr = function(snr) {
        this.telephonyInfo.snrInfo = snr;
        this.telephonyInfo.singleNumberReach = (this.telephonyInfo.snrInfo.singleNumberReachEnabled === true) ? 'On' : 'Off';
        $rootScope.$broadcast(this.broadcastEvent);
      };

      service.updateCurrentDirectoryNumber = function(directoryNumber) {
        this.telephonyInfo.currentDirectoryNumber = directoryNumber;
        $rootScope.$broadcast(this.broadcastEvent);   
      };

      service.getRemoteDestinationInfo = function(user) {
        var deferred = $q.defer();
        // TODO: Remove the following line when we are authenticating with CMI
        delete $http.defaults.headers.common.Authorization;
        RemoteDestinationService.query({customerId: user.meta.organizationID, userId: user.id},
          function(data) {
            deferred.resolve(data);
          },function(error) {
            Log.debug('getRemoteDestinationInfo failed.  Status: ' + error.status + ' Response: ' + error.data);
            deferred.reject(error);
          });
        return deferred.promise;
      };

      service.processRemoteDestinationInfo = function(remoteDestinationInfo) {
        var snrInfo = angular.copy(this.telephonyInfo.snrInfo);
        if (remoteDestinationInfo) {
          snrInfo.remoteDestinations = remoteDestinationInfo;
          if (remoteDestinationInfo !== null && remoteDestinationInfo !== undefined && remoteDestinationInfo.length > 0) {
            snrInfo.singleNumberReachEnabled = true;
            snrInfo.destination = remoteDestinationInfo[0].destination;
          } else {
            snrInfo.singleNumberReachEnabled = false;
          }
        } else {
          snrInfo.remoteDestinations = null;
        }
        this.updateSnr(snrInfo);
      };

      return service;
    }
]);
