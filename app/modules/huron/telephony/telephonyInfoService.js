'use strict';

angular.module('Huron')
  .factory('TelephonyInfoService', ['$rootScope', '$filter', 'Authinfo', 'RemoteDestinationService', 'UserServiceCommon', 'UserDirectoryNumberService', 'AlternateNumberService', 'InternalNumberPoolService', 'ExternalNumberPoolService',
    function ($rootScope, $filter, Authinfo, RemoteDestinationService, UserServiceCommon, UserDirectoryNumberService, AlternateNumberService, InternalNumberPoolService, ExternalNumberPoolService) {

      var broadcastEvent = "telephonyInfoUpdated";

      var telephonyInfo = {
        services: [],
        currentDirectoryNumber: {
          uuid: 'none',
          pattern: '',
          dnUsage: 'Undefined'
        },
        alternateDirectoryNumber: {
          uuid: 'none',
          pattern: ''
        },
        directoryNumbers: [],
        voicemail: 'Off',
        singleNumberReach: 'Off',
        snrInfo: {
          destination: null,
          remoteDestinations: null,
          singleNumberReachEnabled: false
        }
      };

      var internalNumberPool = {};
      var externalNumberPool = {};

      /**
        Function to inspect dnUsage from Huron and change the display
        value to what UX team wants.
      **/
      var getDnType = function (dnUsage) {
        return (dnUsage === 'Primary') ? 'Primary' : '';
      };

      return {
        getTelephonyInfo: function () {
          return telephonyInfo;
        },

        resetTelephonyInfo: function () {
          telephonyInfo.services = [];
          telephonyInfo.currentDirectoryNumber = {
            uuid: 'none',
            pattern: '',
            dnUsage: 'Undefined'
          };
          telephonyInfo.alternateDirectoryNumber = {
            uuid: 'none',
            pattern: ''
          };
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

        updateCurrentDirectoryNumber: function (dnUuid, pattern, dnUsage) {
          telephonyInfo.currentDirectoryNumber.uuid = dnUuid;
          telephonyInfo.currentDirectoryNumber.pattern = pattern;
          telephonyInfo.currentDirectoryNumber.dnUsage = dnUsage;
          $rootScope.$broadcast("currentLineChanged");
        },

        updateAlternateDirectoryNumber: function (altNumUuid, pattern) {
          telephonyInfo.alternateDirectoryNumber.uuid = altNumUuid;
          telephonyInfo.alternateDirectoryNumber.pattern = pattern;
        },

        getRemoteDestinationInfo: function (userUuid) {
          return RemoteDestinationService.query({
              customerId: Authinfo.getOrgId(),
              userId: userUuid
            }).$promise
            .then(function (remoteDestinationInfo) {
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
            }.bind(this));
        },

        getUserDnInfo: function (userUuid) {
          UserDirectoryNumberService.query({
              customerId: Authinfo.getOrgId(),
              userId: userUuid
            }).$promise
            .then(function (userDnInfo) {
              if (userDnInfo) {
                var userDnList = [];
                for (var i = 0; i < userDnInfo.length; i++) {
                  var userLine = {
                    'dnUsage': getDnType(userDnInfo[i].dnUsage),
                    'uuid': userDnInfo[i].directoryNumber.uuid,
                    'pattern': userDnInfo[i].directoryNumber.pattern,
                    'altDnUuid': '',
                    'altDnPattern': ''
                  };

                  // Put the Primary line first in array
                  if (userLine.dnUsage === 'Primary') {
                    userDnList.unshift(userLine);
                  } else {
                    userDnList.push(userLine);
                  }

                  // get External (alternate) number if exists
                  AlternateNumberService.query({
                    customerId: Authinfo.getOrgId(),
                    directoryNumberId: userLine.uuid
                  }, function (altNumList) {
                    if (angular.isArray(altNumList) && altNumList[0]) {
                      // using 'this' to ensure we are changing the current
                      // userLine object referenced in the for loop
                      this.altDnUuid = altNumList[0].uuid;
                      this.altDnPattern = altNumList[0].numMask;
                    }
                  }.bind(userLine))
                }
                this.updateDirectoryNumbers(userDnList);
              } else {
                this.updateDirectoryNumbers(null);
              }
            }.bind(this))
        },

        getTelephonyUserInfo: function (userUuid) {
          return UserServiceCommon.get({
              customerId: Authinfo.getOrgId(),
              userId: userUuid
            }).$promise
            .then(function (telephonyUserInfo) {
              this.updateUserServices(telephonyUserInfo.services);
            }.bind(this));
        },

        getInternalNumberPool: function () {
          return angular.copy(internalNumberPool);
        },

        updateInternalNumberPool: function () {
          var intNumPool = [{
            uuid: 'none',
            pattern: $filter('translate')('directoryNumberPanel.chooseNumber')
          }];
          return InternalNumberPoolService.query({
              customerId: Authinfo.getOrgId(),
              directorynumber: ''
            }).$promise
            .then(function (intPool) {
              for (var i = 0; i < intPool.length; i++) {
                var dn = {
                  uuid: intPool[i].uuid,
                  pattern: intPool[i].pattern
                };
                intNumPool.push(dn);
              }
              internalNumberPool = intNumPool;
              $rootScope.$broadcast("internalNumberPoolChanged");
            });
        },

        getExternalNumberPool: function () {
          return angular.copy(externalNumberPool);
        },

        updateExternalNumberPool: function () {
          var extNumPool = [{
            uuid: 'none',
            pattern: $filter('translate')('directoryNumberPanel.none')
          }];
          return ExternalNumberPoolService.query({
              customerId: Authinfo.getOrgId(),
              directorynumber: ''
            }).$promise
            .then(function (extPool) {
              for (var i = 0; i < extPool.length; i++) {
                var dn = {
                  uuid: extPool[i].uuid,
                  pattern: extPool[i].pattern
                };
                extNumPool.push(dn);
              }
              externalNumberPool = extNumPool;
              $rootScope.$broadcast("externalNumberPoolChanged");
            });
        }

      }; // end return
    }
  ]);
