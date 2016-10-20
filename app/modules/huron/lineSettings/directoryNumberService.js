(function () {
  'use strict';

  angular
    .module('Huron')
    .factory('DirectoryNumber', DirectoryNumber);

  /* @ngInject */
  function DirectoryNumber(Authinfo, UserDirectoryNumberService, DirectoryNumberService, AlternateNumberService) {
    var directoryNumberPayload = {
      uuid: '',
      pattern: '',
      alertingName: '',
      externalCallerIdType: '',
      companyNumber: null,
      customCallerIdName: '',
      customCallerIdNumber: '',
      hasCustomAlertingName: false,
      callForwardAll: {
        voicemailEnabled: false,
        destination: ''
      },
      callForwardBusy: {
        intVoiceMailEnabled: false,
        voicemailEnabled: false,
        intDestination: '',
        destination: ''
      },
      callForwardNoAnswer: {
        intVoiceMailEnabled: false,
        voicemailEnabled: false,
        intDestination: '',
        destination: ''
      },
      callForwardNotRegistered: {
        intVoiceMailEnabled: false,
        voicemailEnabled: false,
        intDestination: '',
        destination: ''
      }
    };

    var service = {
      getNewDirectoryNumber: getNewDirectoryNumber,
      getDirectoryNumber: getDirectoryNumber,
      getDirectoryNumberESN: getDirectoryNumberESN,
      deleteDirectoryNumber: deleteDirectoryNumber,
      disassociateDirectoryNumber: disassociateDirectoryNumber,
      updateDirectoryNumber: updateDirectoryNumber,
      changeInternalNumber: changeInternalNumber,
      getAlternateNumbers: getAlternateNumbers,
      addAlternateNumber: addAlternateNumber,
      updateAlternateNumber: updateAlternateNumber,
      deleteAlternateNumber: deleteAlternateNumber
    };

    return service;
    /////////////////////

    function getNewDirectoryNumber() {
      return angular.copy(directoryNumberPayload);
    }

    function getDirectoryNumberESN(uuid) {
      var esn;
      return DirectoryNumberService.get({
        customerId: Authinfo.getOrgId(),
        directoryNumberId: uuid
      }).$promise
        .then(function (data) {
          if (typeof data.alternateNumbers.enterpriseNumber.pattern !== 'undefined') {
            esn = data.alternateNumbers.enterpriseNumber.pattern;
          }

          return esn;
        });
    }

    function getDirectoryNumber(uuid) {
      return DirectoryNumberService.get({
        customerId: Authinfo.getOrgId(),
        directoryNumberId: uuid
      }).$promise
        .then(function (data) {
          var dn = angular.copy(directoryNumberPayload);
          dn.uuid = data.uuid;
          dn.pattern = data.pattern;
          dn.alertingName = data.alertingName;
          dn.externalCallerIdType = data.externalCallerIdType;
          dn.companyNumber = data.companyNumber;
          dn.customCallerIdName = data.customCallerIdName;
          dn.customCallerIdNumber = data.customCallerIdNumber;

          dn.hasCustomAlertingName = data.hasCustomAlertingName;
          dn.callForwardAll.voicemailEnabled = data.callForwardAll.voicemailEnabled;
          if (typeof data.callForwardAll.destination !== 'undefined') {
            dn.callForwardAll.destination = data.callForwardAll.destination;

          }

          dn.callForwardBusy.intVoiceMailEnabled = data.callForwardBusy.intVoiceMailEnabled;
          dn.callForwardBusy.voicemailEnabled = data.callForwardBusy.voicemailEnabled;
          if (typeof data.callForwardBusy.destination !== 'undefined') {
            dn.callForwardBusy.destination = data.callForwardBusy.destination;
          }
          if (typeof data.callForwardBusy.intDestination !== 'undefined') {
            dn.callForwardBusy.intDestination = data.callForwardBusy.intDestination;
          }

          dn.callForwardNoAnswer.intVoiceMailEnabled = data.callForwardNoAnswer.intVoiceMailEnabled;
          dn.callForwardNoAnswer.voicemailEnabled = data.callForwardNoAnswer.voicemailEnabled;
          if (typeof data.callForwardNoAnswer.destination !== 'undefined') {
            dn.callForwardNoAnswer.destination = data.callForwardNoAnswer.destination;
          }
          if (typeof data.callForwardNoAnswer.intDestination !== 'undefined') {
            dn.callForwardNoAnswer.intDestination = data.callForwardNoAnswer.intDestination;
          }

          dn.callForwardNotRegistered.intVoiceMailEnabled = data.callForwardNotRegistered.intVoiceMailEnabled;
          dn.callForwardNotRegistered.voicemailEnabled = data.callForwardNotRegistered.voicemailEnabled;
          if (typeof data.callForwardNotRegistered.destination !== 'undefined') {
            dn.callForwardNotRegistered.destination = data.callForwardNotRegistered.destination;
          }
          if (typeof data.callForwardNotRegistered.intDestination !== 'undefined') {
            dn.callForwardNotRegistered.intDestination = data.callForwardNotRegistered.intDestination;
          }
          return dn;
        });
    }

    function deleteDirectoryNumber(uuid) {
      return DirectoryNumberService.delete({
        customerId: Authinfo.getOrgId(),
        directoryNumberId: uuid
      }).$promise;
    }

    function disassociateDirectoryNumber(userUuid, dnUuid) {
      return UserDirectoryNumberService.delete({
        customerId: Authinfo.getOrgId(),
        userId: userUuid,
        directoryNumberId: dnUuid
      }).$promise;
    }

    function updateDirectoryNumber(dnUuid, dnSettings) {
      var dnPayload = angular.copy(dnSettings);
      delete dnPayload.uuid; // causes 500 error if present for PUT
      return DirectoryNumberService.update({
        customerId: Authinfo.getOrgId(),
        directoryNumberId: dnUuid
      }, dnPayload).$promise;
    }

    function changeInternalNumber(oldDnId) {
      return service.deleteDirectoryNumber(oldDnId).then(function () {}).$promise;
    }

    function getAlternateNumbers(dnUuid) {
      return AlternateNumberService.query({
        customerId: Authinfo.getOrgId(),
        directoryNumberId: dnUuid,
        alternatenumbertype: '+E.164 Number'
      }).$promise;
    }

    function addAlternateNumber(dnUuid, pattern) {
      // TODO: remove hardcoding when multi-site requirements are figured out
      var routePartition = Authinfo.getOrgId() + '_000000_E164_RP';

      // TODO: remove directory number once CMI has been fixed
      var alternateNumber = {
        'alternateNumberType': '+E.164 Number',
        'numMask': pattern,
        'routePartition': {
          'name': routePartition
        },
        'addLocalRoutePartition': true
      };

      return AlternateNumberService.save({
        customerId: Authinfo.getOrgId(),
        directoryNumberId: dnUuid
      }, alternateNumber, function (data, headers) {
        data.uuid = headers('location').split("/").pop();
        return data;
      }).$promise;
    }

    function updateAlternateNumber(dnUuid, altNumUuid, pattern) {
      var alternateNumber = {
        'numMask': pattern
      };

      return AlternateNumberService.update({
        customerId: Authinfo.getOrgId(),
        directoryNumberId: dnUuid,
        alternateNumberId: altNumUuid
      }, alternateNumber, function (data) {
        data.uuid = altNumUuid;
        return data;
      }).$promise;
    }

    function deleteAlternateNumber(dnUuid, altNumUuid) {
      return AlternateNumberService.delete({
        customerId: Authinfo.getOrgId(),
        directoryNumberId: dnUuid,
        alternateNumberId: altNumUuid
      }).$promise;
    }

  }
})();
