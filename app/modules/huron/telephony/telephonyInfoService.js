(function () {
  'use strict';

  angular
    .module('Huron')
    .factory('TelephonyInfoService', TelephonyInfoService);

  /* @ngInject */

  function TelephonyInfoService($rootScope, $q, $translate, Authinfo, RemoteDestinationService, UserServiceCommon, UserDirectoryNumberService, AlternateNumberService, InternalNumberPoolService, ExternalNumberPoolService, ServiceSetup, DirectoryNumberUserService, DirectoryNumber, HuronCustomer, InternationalDialing, FeatureToggleService) {

    var broadcastEvent = "telephonyInfoUpdated";

    var INTERNATIONAL_DIALING = 'DIALINGCOSTAG_INTERNATIONAL';
    var cbUseGlobal = $translate.instant('internationalDialingPanel.useGlobal');
    var cbAlwaysAllow = $translate.instant('internationalDialingPanel.alwaysAllow');
    var cbNeverAllow = $translate.instant('internationalDialingPanel.neverAllow');

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
      esn: '',
      directoryNumbers: [],
      voicemail: 'Off',
      singleNumberReach: 'Off',
      snrInfo: {
        destination: null,
        remoteDestinations: null,
        singleNumberReachEnabled: false
      },
      steeringDigit: '',
      siteSteeringDigit: '',
      siteCode: '',
      hasCustomerVoicemail: undefined,
      internationalDialingStatus: cbUseGlobal,
      hideInternationalDialing: undefined
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
      loadExternalNumberPool: loadExternalNumberPool,
      loadExtPoolWithMapping: loadExtPoolWithMapping,
      getPrimarySiteInfo: getPrimarySiteInfo,
      checkCustomerVoicemail: checkCustomerVoicemail,
      getTelephonyInfoObject: getTelephonyInfoObject,
      getInternationalDialing: getInternationalDialing,
      getUserInternationalDialingDetails: getUserInternationalDialingDetails
    };

    return telephonyInfoService;

    /**
      Function to inspect dnUsage from Huron and change the display
      value to what UX team wants.
    **/
    function getDnType(dnUsage) {
      return (dnUsage === 'Primary') ? 'Primary' : '';
    }

    //TODO Need to cleanup/remove this function.
    function getTelephonyInfo() {
      if (telephonyInfo.siteSteeringDigit === '') {
        getPrimarySiteInfo();
      }
      if (angular.isUndefined(telephonyInfo.hasCustomerVoicemail)) {
        checkCustomerVoicemail();
      }

      return telephonyInfo;
    }

    function getTelephonyInfoObject() {
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
      telephonyInfo.internationalDialingStatus = cbUseGlobal;
      telephonyInfo.hasCustomerVoicemail = undefined;
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
      telephonyInfo.snrInfo = angular.copy(snr);
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
              snrInfo.answerTooLateTimer = remoteDestinationInfo[0].answerTooLateTimer;
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
          return $q.reject(response);
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
                'dnUsage': getDnType(userDnInfo[i].dnUsage),
                'uuid': userDnInfo[i].directoryNumber.uuid,
                'pattern': userDnInfo[i].directoryNumber.pattern,
                'userDnUuid': userDnInfo[i].uuid,
                'altDnUuid': '',
                'altDnPattern': '',
                'dnSharedUsage': ''
              };

              if (userLine.dnUsage === 'Primary') {
                DirectoryNumber.getDirectoryNumberESN(userLine.uuid).then(function (lineEsn) {
                  telephonyInfo.esn = lineEsn;
                });
              }

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
          return $q.reject(response);
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
          return $q.reject(response);
        });
    }

    function getPrimarySiteInfo() {
      return ServiceSetup.listSites().then(function () {
        if (ServiceSetup.sites.length !== 0) {
          return ServiceSetup.getSite(ServiceSetup.sites[0].uuid).then(function (site) {
            telephonyInfo.steeringDigit = site.steeringDigit;
            telephonyInfo.siteSteeringDigit = site.siteSteeringDigit;
            telephonyInfo.siteCode = site.siteCode;
            return telephonyInfo;
          });
        }
      });
    }

    function getInternalNumberPool() {
      return angular.copy(internalNumberPool);
    }

    function loadInternalNumberPool(pattern, limit) {
      var intNumPool = [];
      var patternQuery = pattern ? '%' + pattern + '%' : undefined;
      var patternlimit = limit ? limit : undefined;
      return InternalNumberPoolService.query({
          customerId: Authinfo.getOrgId(),
          directorynumber: '',
          order: 'pattern',
          pattern: patternQuery,
          limit: patternlimit
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
        }).catch(function (response) {
          internalNumberPool = [];
          return $q.reject(response);
        });
    }

    function getExternalNumberPool() {
      return angular.copy(externalNumberPool);
    }

    function loadExternalNumberPool(pattern) {
      var extNumPool = [{
        uuid: 'none',
        pattern: $translate.instant('directoryNumberPanel.none')
      }];
      var patternQuery = pattern ? '%' + pattern + '%' : undefined;
      return ExternalNumberPoolService.query({
          customerId: Authinfo.getOrgId(),
          directorynumber: '',
          order: 'pattern',
          pattern: patternQuery
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
          if (telephonyInfo.alternateDirectoryNumber.uuid !== 'none') {
            externalNumberPool.push(telephonyInfo.alternateDirectoryNumber);
          }
          return angular.copy(externalNumberPool);
        }).catch(function (response) {
          externalNumberPool = [];
          return $q.reject(response);
        });
    }

    function loadExtPoolWithMapping(count) {
      return ExternalNumberPoolService.query({
          customerId: Authinfo.getOrgId(),
          directorynumber: '',
          order: 'pattern',
          automaptodn: true,
          automaptodncount: count
        }).$promise
        .then(function (extPool) {
          var extNumPool = extPool.map(function (extPoolValue) {
            var dn = {
              uuid: extPoolValue.uuid,
              pattern: extPoolValue.pattern,
              directoryNumber: extPoolValue.directoryNumber
            };
            return dn;
          });
          externalNumberPool = extNumPool;
          return angular.copy(externalNumberPool);
        }).catch(function (response) {
          externalNumberPool = [];
          return $q.reject(response);
        });
    }

    function checkCustomerVoicemail() {
      if (angular.isUndefined(telephonyInfo.hasCustomerVoicemail)) {
        telephonyInfo.hasCustomerVoicemail = false;
      }
      return HuronCustomer.get().then(function (customer) {
        angular.forEach(customer.links, function (service) {
          if (service.rel === 'voicemail') {
            telephonyInfo.hasCustomerVoicemail = true;
          }
        });
      });
    }

    function getUserInternationalDialingDetails(userUuid) {
      return InternationalDialing.listCosRestrictions(userUuid).then(function (cosRestriction) {
        var overRide = null;
        var custRestriction = null;

        if (cosRestriction.user.length > 0) {
          for (var j = 0; j < cosRestriction.user.length; j++) {
            if (cosRestriction.user[j].restriction === INTERNATIONAL_DIALING) {
              overRide = true;
              break;
            }
          }
        }
        if (cosRestriction.customer.length > 0) {
          for (var k = 0; k < cosRestriction.customer.length; k++) {
            if (cosRestriction.customer[k].restriction === INTERNATIONAL_DIALING) {
              custRestriction = true;
              break;
            }
          }
        }

        if (overRide) {
          if (cosRestriction.user[0].blocked) {
            telephonyInfo.internationalDialingStatus = cbNeverAllow;
          } else {
            telephonyInfo.internationalDialingStatus = cbAlwaysAllow;
          }
        }
        var globalText;
        if (custRestriction) {
          globalText = cbUseGlobal + " " + $translate.instant('internationalDialingPanel.off');
        } else {
          globalText = cbUseGlobal + " " + $translate.instant('internationalDialingPanel.on');
        }
        if (!overRide) {
          telephonyInfo.internationalDialingStatus = globalText;
        }
      });
    }

    function getInternationalDialing(userUuid) {
      return $q.when(InternationalDialing.isDisableInternationalDialing())
        .then(function (isHide) {
          telephonyInfo.hideInternationalDialing = isHide;

          // don't get details if feature is hidden
          if (!isHide) {
            return getUserInternationalDialingDetails(userUuid);
          }
        });
    }

  }
})();
