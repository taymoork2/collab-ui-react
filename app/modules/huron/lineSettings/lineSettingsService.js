(function () {
  'use strict';

  angular
    .module('Huron')
    .factory('LineSettings', LineSettings);

  /* @ngInject */
  function LineSettings($q, Authinfo, DirectoryNumber, TelephonyInfoService, HuronAssignedLine, SimultaneousCallsServiceV2) {
    var service = {
      addNewLine: addNewLine,
      changeInternalLine: changeInternalLine,
      disassociateInternalLine: disassociateInternalLine,
      addExternalLine: addExternalLine,
      getSimultaneousCalls: getSimultaneousCalls,
      updateSimultaneousCalls: updateSimultaneousCalls,
      changeExternalLine: changeExternalLine,
      deleteExternalLine: deleteExternalLine,
      updateLineSettings: updateLineSettings
    };

    return service;
    /////////////////////

    function addNewLine(_userUuid, _dnUsage, _pattern, _dnSettings, _altNum) {
      var userUuid = _userUuid;
      var dnUsage = _dnUsage;
      var pattern = _pattern;
      var altNum = _altNum;
      var dnSettings = angular.copy(_dnSettings);
      dnSettings.pattern = pattern;

      return HuronAssignedLine.assignDirectoryNumber(userUuid, dnUsage, pattern)
        .then(function (dn) {
          TelephonyInfoService.updateCurrentDirectoryNumber(dn.uuid, dn.pattern, dnUsage, null, false);
          if (typeof altNum.pattern !== 'undefined' && altNum.pattern !== 'None') {
            var telInfo = TelephonyInfoService.getTelephonyInfo();
            return addExternalLine(telInfo.currentDirectoryNumber.uuid, altNum.pattern);
          }
        })
        .then(function () {
          var telInfo = TelephonyInfoService.getTelephonyInfo();
          return DirectoryNumber.updateDirectoryNumber(telInfo.currentDirectoryNumber.uuid, dnSettings);
        })
        .then(function () {
          return $q.all([TelephonyInfoService.loadInternalNumberPool(), TelephonyInfoService.loadExternalNumberPool()]);
        });
    }

    function changeInternalLine(_dnUuid, _dnUsage, _pattern, _dnSettings) {
      var dnUuid = _dnUuid;
      var dnUsage = _dnUsage;
      var pattern = _pattern;
      var dnSettings = angular.copy(_dnSettings);
      dnSettings.pattern = pattern;

      return DirectoryNumber.updateDirectoryNumber(dnUuid, dnSettings)
        .then(function (dn) {
          TelephonyInfoService.updateCurrentDirectoryNumber(dnUuid, dn.pattern, dnUsage, null, false);
          return TelephonyInfoService.loadInternalNumberPool();
        });
    }

    function disassociateInternalLine(_userUuid, _dnUuid) {
      var userUuid = _userUuid;
      var dnUuid = _dnUuid;
      return DirectoryNumber.disassociateDirectoryNumber(userUuid, dnUuid);
    }

    function addExternalLine(_dnUuid, _pattern) {
      var dnUuid = _dnUuid;
      var pattern = _pattern;

      return DirectoryNumber.addAlternateNumber(dnUuid, pattern)
        .then(function (newAltNumber) {
          TelephonyInfoService.updateAlternateDirectoryNumber(newAltNumber.uuid, newAltNumber.numMask);
          return TelephonyInfoService.loadExternalNumberPool();
        });
    }

    function changeExternalLine(_dnUuid, _altNumUuid, _altNum) {
      var dnUuid = _dnUuid;
      var altNumUuid = _altNumUuid;
      var altNum = _altNum;

      return DirectoryNumber.updateAlternateNumber(dnUuid, altNumUuid, altNum)
        .then(function (updatedAltNumber) {
          TelephonyInfoService.updateAlternateDirectoryNumber(updatedAltNumber.uuid, updatedAltNumber.numMask);
          return TelephonyInfoService.loadExternalNumberPool();
        });
    }
    // get the customer's simultaneous call profile
    function getSimultaneousCalls(numberId, placesId) {
      var queryString = {
        customerId: Authinfo.getOrgId(),
        numberId: numberId,
        placesId: placesId
      };
      return SimultaneousCallsServiceV2.get(queryString).$promise;
    }

    function updateSimultaneousCalls(numberId, placesId, incomingCallMaximumValue) {
      var multipleCalls = {
        incomingCallMaximum: incomingCallMaximumValue
      };
      return SimultaneousCallsServiceV2.update({
        customerId: Authinfo.getOrgId(),
        numberId: numberId,
        placesId: placesId
      }, multipleCalls).$promise;
    }

    function deleteExternalLine(_dnUuid, _altNumUuid) {
      var dnUuid = _dnUuid;
      var altNumUuid = _altNumUuid;

      return DirectoryNumber.deleteAlternateNumber(dnUuid, altNumUuid)
        .then(function () {
          TelephonyInfoService.updateAlternateDirectoryNumber('none', '');
          return TelephonyInfoService.loadExternalNumberPool();
        });
    }

    function updateLineSettings(dnSettings) {
      return DirectoryNumber.updateDirectoryNumber(dnSettings.uuid, dnSettings);
    }

  }
})();
