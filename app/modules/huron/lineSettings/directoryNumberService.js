'use strict';

angular.module('Huron')
  .factory('DirectoryNumber', ['$filter', 'Authinfo', 'Log', 'Notification', 'TelephonyInfoService', 'UserDirectoryNumberDetailService', 'InternalNumberPoolService', 'ExternalNumberPoolService',
    function ($filter, Authinfo, Log, Notification, TelephonyInfoService, UserDirectoryNumberDetailService, InternalNumberPoolService, ExternalNumberPoolService) {

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
              if (typeof dn.callForwardAll.destination !== 'undefined') {
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

        createDirectoryNumber: function (_directoryNumber) {

        },

        updateDirectoryNumber: function (_directoryNumber) {
          var dnPayload = angular.copy(_directoryNumber);
          delete dnPayload.uuid; // causes 500 error if present for PUT
          delete dnPayload.pattern; // Don't ever want to change the pattern for PUT
          return UserDirectoryNumberDetailService.update({
              customerId: Authinfo.getOrgId(),
              directoryNumberId: _directoryNumber.uuid
            }, dnPayload).$promise
            .then(function (response) {
              var msg = $filter('translate')('directoryNumberPanel.success');
              var type = 'success';
              Notification.notify([msg], type);
            })
            .catch(function (response) {
              Log.debug('addDirectoryNumberAssociation failed.  Status: ' + response.status + ' Response: ' + response.data);
              var msg = $filter('translate')('directoryNumberPanel.error');
              var type = 'error';
              Notification.notify([msg], type);
            });
        },

        getAlternateNumber: function (uuid, dnUuid) {
          return UserDirectoryNumberDetailService.get({
            customerId: Authinfo.getOrgId(),
            directoryNumberId: dnUuid,
            alternateNumberId: uuid
          }).$promise;
        },

        getInternalNumberPool: function () {
          return InternalNumberPoolService.query({
              customerId: Authinfo.getOrgId()
            }).$promise
            .then(function (internalNumbers) {
              var telephonyInfo = TelephonyInfoService.getTelephonyInfo();
              if (angular.isArray(internalNumbers) && typeof telephonyInfo.currentDirectoryNumber !== 'undefined' && telephonyInfo.currentDirectoryNumber !== 'new') {
                internalNumbers.push(telephonyInfo.currentDirectoryNumber);
                return internalNumbers;
              }
            });
        },

        getExternalNumberPool: function () {
          return ExternalNumberPoolService.query({
              customerId: Authinfo.getOrgId()
            }).$promise
            .then(function (externalNumbers) {
              var telephonyInfo = TelephonyInfoService.getTelephonyInfo();
              if (angular.isArray(externalNumbers) && typeof telephonyInfo.currentDirectoryNumber !== 'undefined' && telephonyInfo.currentDirectoryNumber !== 'new') {
                externalNumbers.push(telephonyInfo.currentDirectoryNumber);
                return externalNumbers;
              }
            });
        }

      }; // end return
    }
  ]);
