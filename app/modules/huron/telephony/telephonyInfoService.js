(function () {
  'use strict';

  angular
    .module('Huron')
    .factory('TelephonyInfoService', TelephonyInfoService);

  /* @ngInject */

  function TelephonyInfoService($rootScope, $q, $translate, Authinfo, RemoteDestinationService, UserServiceCommon, UserDirectoryNumberService, AlternateNumberService, InternalNumberPoolService, ExternalNumberPoolService, ServiceSetup, DirectoryNumberUserService, DirectoryNumber) {

    var broadcastEvent = "telephonyInfoUpdated";

    var telephonyInfo = {
      services: [],
      currentDirectoryNumber: {
        uuid: 'none',
        pattern: '',
        dnUsage: 'Undefined',
        userDnUuid: 'none',
        dnSharedUsage: ''
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
      },
      siteSteeringDigit: '',
      siteCode: ''
    };

    var internalNumberPool = [];
    var externalNumberPool = [];

    var telephonyInfoService = {
      getTelephonyInfo: getTelephonyInfo,
      resetTelephonyInfo: resetTelephonyInfo,
      resetCurrentUser: resetCurrentUser,
      updateDirectoryNumbers: updateDirectoryNumbers,
      updateUserServices: updateUserServices,
      updateSnr: updateSnr,
      updateCurrentDirectoryNumber: updateCurrentDirectoryNumber,
      updateAlternateDirectoryNumber: updateAlternateDirectoryNumber,
      getRemoteDestinationInfo: getRemoteDestinationInfo,
      getUserDnInfo: getUserDnInfo,
      getTelephonyUserInfo: getTelephonyUserInfo,
      getInternalNumberPool: getInternalNumberPool,
      loadInternalNumberPool: loadInternalNumberPool,
      getExternalNumberPool: getExternalNumberPool,
      loadExternalNumberPool: loadExternalNumberPool
    };

    return telephonyInfoService;

    /**
      Function to inspect dnUsage from Huron and change the display
      value to what UX team wants.
    **/
    function getDnType(dnUsage, uuid) {
      return (dnUsage === 'Primary') ? 'Primary' : '';
    }

    function getTelephonyInfo() {
      if (telephonyInfo.siteSteeringDigit === '') {
        ServiceSetup.listSites().then(function () {
          if (ServiceSetup.sites.length !== 0) {
            ServiceSetup.getSite(ServiceSetup.sites[0].uuid).then(function (site) {
              telephonyInfo.siteSteeringDigit = site.siteSteeringDigit;
              telephonyInfo.siteCode = site.siteCode;
            });
          }
        });
      }
      return telephonyInfo;
    }

    function resetTelephonyInfo() {
      telephonyInfo.services = [];
      telephonyInfo.currentDirectoryNumber = {
        uuid: 'none',
        pattern: '',
        dnUsage: 'Undefined',
        userDnUuid: 'none',
        dnSharedUsage: ''
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
    }

    /**
      Function to reset the current user in the case that a newly
      created line would not have userDnUuid set.
    **/
    function resetCurrentUser(uuid) {
      for (var num in telephonyInfo.directoryNumbers) {
        var dn = telephonyInfo.directoryNumbers[num];
        if (dn.uuid === uuid) {
          updateCurrentDirectoryNumber(dn.uuid, dn.pattern, dn.dnUsage, dn.userDnUuid, dn.dnSharedUsage);
          break;
        }
      }
    }

    function updateDirectoryNumbers(directoryNumbers) {
      telephonyInfo.directoryNumbers = directoryNumbers;
      $rootScope.$broadcast(broadcastEvent);
    }

    function updateUserServices(services) {
      telephonyInfo.services = services;
      // rip thru services and toggle display values.
      // voicemail is the only one we care about currently
      var voicemailEnabled = false;
      if (telephonyInfo.services !== null && telephonyInfo.services.length > 0) {
        for (var j = 0; j < telephonyInfo.services.length; j++) {
          if (telephonyInfo.services[j] === 'VOICEMAIL') {
            voicemailEnabled = true;
          }
        }
      }
      telephonyInfo.voicemail = (voicemailEnabled === true) ? 'On' : 'Off';
      $rootScope.$broadcast(broadcastEvent);
    }

    function updateSnr(snr) {
      telephonyInfo.snrInfo = snr;
      telephonyInfo.singleNumberReach = (telephonyInfo.snrInfo.singleNumberReachEnabled === true) ? 'On' : 'Off';
      $rootScope.$broadcast(broadcastEvent);
    }

    function updateCurrentDirectoryNumber(dnUuid, pattern, dnUsage, userDnUuid, dnSharedUsage, broadcast) {
      broadcast = typeof broadcast !== 'undefined' ? broadcast : true;
      telephonyInfo.currentDirectoryNumber.uuid = dnUuid;
      telephonyInfo.currentDirectoryNumber.pattern = pattern;
      telephonyInfo.currentDirectoryNumber.dnUsage = dnUsage;
      telephonyInfo.currentDirectoryNumber.dnSharedUsage = dnSharedUsage;
      if (userDnUuid) {
        telephonyInfo.currentDirectoryNumber.userDnUuid = userDnUuid;
      } else {
        telephonyInfo.currentDirectoryNumber.userDnUuid = "none";
      }
      if (broadcast) {
        $rootScope.$broadcast("currentLineChanged");
      }
    }

    function updateAlternateDirectoryNumber(altNumUuid, pattern) {
      telephonyInfo.alternateDirectoryNumber.uuid = altNumUuid;
      telephonyInfo.alternateDirectoryNumber.pattern = pattern;
    }

    function getRemoteDestinationInfo(userUuid) {
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
          updateSnr(snrInfo);
        })
        .catch(function (response) {
          updateSnr({});
          $q.reject(response);
        });
    }

    function getUserDnInfo(userUuid) {
      return UserDirectoryNumberService.query({
          customerId: Authinfo.getOrgId(),
          userId: userUuid
        }).$promise
        .then(function (userDnInfo) {
          if (userDnInfo) {
            var userDnList = [];
            for (var i = 0; i < userDnInfo.length; i++) {
              var userLine = {
                'dnUsage': getDnType(userDnInfo[i].dnUsage, userDnInfo[i].directoryNumber.uuid),
                'uuid': userDnInfo[i].directoryNumber.uuid,
                'pattern': userDnInfo[i].directoryNumber.pattern,
                'userDnUuid': userDnInfo[i].uuid,
                'altDnUuid': '',
                'altDnPattern': '',
                'dnSharedUsage': ''
              };

              // get External (alternate) number if exists
              DirectoryNumber.getAlternateNumbers(userLine.uuid).then(function (altNumList) {
                if (angular.isArray(altNumList) && altNumList[0]) {
                  this.altDnUuid = altNumList[0].uuid;
                  this.altDnPattern = altNumList[0].numMask;
                }
              }.bind(userLine));

              DirectoryNumberUserService.query({
                  'customerId': Authinfo.getOrgId(),
                  'directoryNumberId': userLine.uuid
                }).$promise
                .then(function (data) {
                  if (this.dnUsage === 'Primary') {
                    this.dnSharedUsage = 'Primary';
                  }
                  if (data.length > 1) {
                    this.dnSharedUsage = this.dnSharedUsage + ' Shared';
                  }
                }.bind(userLine));

              // Put the Primary line first in array
              if (userLine.dnUsage === 'Primary') {
                userDnList.unshift(userLine);
              } else {
                userDnList.push(userLine);
              }
            }
            updateDirectoryNumbers(userDnList);
          } else {
            updateDirectoryNumbers(null);
          }
        })
        .catch(function (response) {
          updateDirectoryNumbers(null);
          $q.reject(response);
        });
    }

    function getTelephonyUserInfo(userUuid) {
      return UserServiceCommon.get({
          customerId: Authinfo.getOrgId(),
          userId: userUuid
        }).$promise
        .then(function (telephonyUserInfo) {
          updateUserServices(telephonyUserInfo.services);
        })
        .catch(function (response) {
          updateUserServices([]);
          $q.reject(response);
        });
    }

    function getInternalNumberPool() {
      return angular.copy(internalNumberPool);
    }

    function loadInternalNumberPool() {
      var intNumPool = [{
        uuid: 'none',
        pattern: $translate.instant('directoryNumberPanel.chooseNumber')
      }];
      return InternalNumberPoolService.query({
          customerId: Authinfo.getOrgId(),
          directorynumber: '',
          order: 'pattern'
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
          return angular.copy(internalNumberPool);
        })
        .catch(function (response) {
          internalNumberPool = [];
          $q.reject(response);
        });
    }

    function getExternalNumberPool() {
      return angular.copy(externalNumberPool);
    }

    function loadExternalNumberPool() {
      var extNumPool = [{
        uuid: 'none',
        pattern: $translate.instant('directoryNumberPanel.none')
      }];
      return ExternalNumberPoolService.query({
          customerId: Authinfo.getOrgId(),
          directorynumber: '',
          order: 'pattern'
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
          return angular.copy(externalNumberPool);
        })
        .catch(function (response) {
          externalNumberPool = [];
          $q.reject(response);
        });
    }
  }
})();
