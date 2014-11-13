'use strict';

angular.module('Huron')
  .factory('DirectoryNumber', ['$filter', 'Authinfo', 'TelephonyInfoService', 'UserDirectoryNumberDetailService', 'AlternateNumberService', 'HuronAssignedLine',
    function ($filter, Authinfo, TelephonyInfoService, UserDirectoryNumberDetailService, AlternateNumberService, HuronAssignedLine) {

      var directoryNumberPayload = {
        uuid: '',
        pattern: '',
        alertingName: '',
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

      return {
        getNewDirectoryNumber: function () {
          return angular.copy(directoryNumberPayload);
        },

        getDirectoryNumber: function (uuid) {
          return UserDirectoryNumberDetailService.get({
              customerId: Authinfo.getOrgId(),
              directoryNumberId: uuid
            }).$promise
            .then(function (data) {
              var dn = angular.copy(directoryNumberPayload);
              dn.uuid = data.uuid;
              dn.pattern = data.pattern;
              dn.alertingName = data.alertingName;
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
        },

        deleteDirectoryNumber: function (uuid) {
          return UserDirectoryNumberDetailService.delete({
            customerId: Authinfo.getOrgId(),
            directoryNumberId: uuid
          }).$promise;
        },

        updateDirectoryNumber: function (dnUuid, dnSettings) {
          var dnPayload = angular.copy(dnSettings);
          delete dnPayload.uuid; // causes 500 error if present for PUT
          delete dnPayload.pattern; // Don't ever want to change the pattern for PUT
          return UserDirectoryNumberDetailService.update({
            customerId: Authinfo.getOrgId(),
            directoryNumberId: dnUuid
          }, dnPayload).$promise;
        },

        changeInternalNumber: function (oldDnId, newDnId) {
          return this.deleteDirectoryNumber(oldDnId)
            .then(function () {

            }).$promise;
        },

        getAlternateNumber: function (dnUuid) {
          return AlternateNumberService.query({
              customerId: Authinfo.getOrgId(),
              directoryNumberId: dnUuid,
              alternatenumbertype: '+E.164 Number'
            }).$promise
            .then(function (altNumbers) {
              if (angular.isArray(altNumbers) && altNumbers.length > 0) {
                return AlternateNumberService.get({
                  customerId: Authinfo.getOrgId(),
                  directoryNumberId: dnUuid,
                  alternateNumberId: altNumbers[0].uuid
                }).$promise;
              }
            });
        },

        updateAlternateNumber: function (dnUuid, pattern) {
          // TODO: remove hardcoding when multi-site requirements are figured out
          var routePartition = Authinfo.getOrgId() + '_000000_E164_RP'

          // TODO: remove directory number once CMI has been fixed
          var alternateNumber = {
            'alternateNumberType': '+E.164 Number',
            'directoryNumber': {
              'uuid': dnUuid
            },
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
        },

        deleteAlternateNumber: function (dnUuid, altNumUuid) {
          return AlternateNumberService.delete({
            customerId: Authinfo.getOrgId(),
            directoryNumberId: dnUuid,
            alternateNumberId: altNumUuid
          }).$promise;
        }

      }; // end return
    }
  ]);
