'use strict';

angular.module('Huron')
  .factory('TelephonyInfoService', ['$rootScope', '$q', 'RemoteDestinationService', 'Log',
    function ($rootScope, $q, RemoteDestinationService, Log) {

      var broadcastEvent = "telephonyInfoUpdated";

      var telephonyInfo = {
        services: [],
        currentDirectoryNumber: null,
        alternateDirectoryNumber: null,
        directoryNumbers: [],
        voicemail: 'Off',
        singleNumberReach: 'Off',
        snrInfo: {
          destination: null,
          remoteDestinations: null,
          singleNumberReachEnabled: false
        }
      };

      return {
        getTelephonyInfo: function () {
          return telephonyInfo;
        },

        resetTelephonyInfo: function () {
          telephonyInfo.services = [];
          telephonyInfo.currentDirectoryNumber = null;
          telephonyInfo.alternateDirectoryNumber = null,
            telephonyInfo.directoryNumbers = [];
          telephonyInfo.voicemail = 'Off';
          telephonyInfo.singleNumberReach = 'Off';
          telephonyInfo.snrInfo = {
            destination: null,
            remoteDestinations: null,
            singleNumberReachEnabled: false
          };
        },

        updateDirectoryNumbers: function (directoryNumbers) {
          telephonyInfo.directoryNumbers = directoryNumbers;
          $rootScope.$broadcast(broadcastEvent);
        },

        updateUserServices: function (services) {
          telephonyInfo.services = services;
          // rip thru services and toggle display values.
          // voicemail is the only one we care about currently
          var voicemailEnabled = false;
          if (telephonyInfo.services !== null && telephonyInfo.services.length > 0) {
            for (var j = 0; j < telephonyInfo.services.length; j++) {
              if (telephonyInfo.services[j] === 'VOICEMAIL') {
                voicemailEnabled = true
              }
            }
          }
          telephonyInfo.voicemail = (voicemailEnabled === true) ? 'On' : 'Off';
          $rootScope.$broadcast(broadcastEvent);
        },

        updateSnr: function (snr) {
          telephonyInfo.snrInfo = snr;
          telephonyInfo.singleNumberReach = (telephonyInfo.snrInfo.singleNumberReachEnabled === true) ? 'On' : 'Off';
          $rootScope.$broadcast(broadcastEvent);
        },

        updateCurrentDirectoryNumber: function (directoryNumber) {
          telephonyInfo.currentDirectoryNumber = directoryNumber;
          $rootScope.$broadcast(broadcastEvent);
        },

        updateAlternateDirectoryNumber: function (alternateNumber) {
          telephonyInfo.alternateDirectoryNumber = alternateNumber;
        },

        getRemoteDestinationInfo: function (user) {
          var deferred = $q.defer();
          RemoteDestinationService.query({
              customerId: user.meta.organizationID,
              userId: user.id
            },
            function (data) {
              deferred.resolve(data);
            },
            function (error) {
              Log.debug('getRemoteDestinationInfo failed.  Status: ' + error.status + ' Response: ' + error.data);
              deferred.reject(error);
            });
          return deferred.promise;
        },

        processRemoteDestinationInfo: function (remoteDestinationInfo) {
          var snrInfo = angular.copy(telephonyInfo.snrInfo);
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
        }
      }; // end return
    }
  ]);
