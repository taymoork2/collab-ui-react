(function () {
  'use strict';

  angular
    .module('Huron')
    .factory('LineSettings', ['$filter', 'Authinfo', 'Log', 'Notification', 'DirectoryNumber', 'TelephonyInfoService', 'HuronAssignedLine',
      function ($filter, Authinfo, Log, Notification, DirectoryNumber, TelephonyInfoService, HuronAssignedLine) {

        return {
          addInternalLine: function (_userUuid, _dnUsage, _pattern, _dnSettings, _altNum) {
            var userUuid = _userUuid;
            var dnUsage = _dnUsage;
            var pattern = _pattern;
            var dnSettings = _dnSettings;
            var altNum = _altNum;

            return HuronAssignedLine.assignDirectoryNumber(userUuid, dnUsage, pattern)
              .then(function (dn) {
                TelephonyInfoService.updateCurrentDirectoryNumber(dn.uuid, dn.pattern, dnUsage, false);
                return DirectoryNumber.updateDirectoryNumber(dn.uuid, dnSettings);
              })
              .then(function () {
                if (typeof altNum.pattern !== 'undefined' && altNum.pattern !== 'None') {
                  var telInfo = TelephonyInfoService.getTelephonyInfo();
                  return DirectoryNumber.updateAlternateNumber(telInfo.currentDirectoryNumber.uuid, altNum.pattern)
                    .then(function (newAltNumber) {
                      TelephonyInfoService.updateAlternateDirectoryNumber(newAltNumber.uuid, newAltNumber.numMask);
                    });
                }
              });
          },

          changeInternalLine: function (_oldDnUuid, _newDnUuid, _userUuid, _dnUsage, _pattern, _dnSettings, _altNum) {
            var newDnUuid = _newDnUuid;
            var userUuid = _userUuid;
            var dnUsage = _dnUsage;
            var pattern = _pattern;
            var dnSettings = _dnSettings;
            var altNum = _altNum;

            return DirectoryNumber.deleteDirectoryNumber(_oldDnUuid)
              .then(function () {
                return HuronAssignedLine.assignDirectoryNumber(userUuid, dnUsage, pattern);
              })
              .then(function (dn) {
                TelephonyInfoService.updateCurrentDirectoryNumber(dn.uuid, dn.pattern, dnUsage, false);
                TelephonyInfoService.updateAlternateDirectoryNumber(altNum.uuid, altNum.numMask);
                return DirectoryNumber.updateDirectoryNumber(dn.uuid, dnSettings);
              })
              .then(function () {
                if (typeof altNum.pattern !== 'undefined' && altNum.pattern !== 'None') {
                  var telInfo = TelephonyInfoService.getTelephonyInfo();
                  return DirectoryNumber.updateAlternateNumber(telInfo.currentDirectoryNumber.uuid, altNum.pattern)
                    .then(function (newAltNumber) {
                      TelephonyInfoService.updateAlternateDirectoryNumber(newAltNumber.uuid, newAltNumber.numMask);
                    });
                }
              });
          },

          addExternalLine: function (_dnUuid, _userUuid, pattern, _dnSettings) {
            var dnUuid = _dnUuid;
            var userUuid = _userUuid;
            var dnSettings = _dnSettings;

            return DirectoryNumber.updateAlternateNumber(dnUuid, pattern)
              .then(function (newAltNumber) {
                TelephonyInfoService.updateAlternateDirectoryNumber(newAltNumber.uuid, newAltNumber.numMask);
                TelephonyInfoService.getUserDnInfo(userUuid);
                return DirectoryNumber.updateDirectoryNumber(dnUuid, dnSettings);
              });
          },

          changeExternalLine: function (_dnUuid, oldAltNumUuid, _userUuid, _altNum, _dnSettings) {
            var dnUuid = _dnUuid;
            var userUuid = _userUuid;
            var altNum = _altNum;
            var dnSettings = _dnSettings;

            return DirectoryNumber.deleteAlternateNumber(dnUuid, oldAltNumUuid)
              .then(function () {
                return DirectoryNumber.updateAlternateNumber(dnUuid, altNum);
              })
              .then(function (newAltNumber) {
                TelephonyInfoService.updateAlternateDirectoryNumber(newAltNumber.uuid, newAltNumber.numMask);
                TelephonyInfoService.getUserDnInfo(userUuid);
                return DirectoryNumber.updateDirectoryNumber(dnUuid, dnSettings);
              });
          },

          deleteExternalLine: function (_dnUuid, altNumUuid, _userUuid, _dnSettings) {
            var dnUuid = _dnUuid;
            var userUuid = _userUuid;
            var dnSettings = _dnSettings;

            return DirectoryNumber.deleteAlternateNumber(dnUuid, altNumUuid)
              .then(function () {
                TelephonyInfoService.updateAlternateDirectoryNumber('', '');
                TelephonyInfoService.getUserDnInfo(userUuid);
                return DirectoryNumber.updateDirectoryNumber(dnUuid, dnSettings);
              });
          },

          updateLineSettings: function (dnSettings) {
            return DirectoryNumber.updateDirectoryNumber(dnSettings.uuid, dnSettings)
              .then(function (response) {
                var msg = $filter('translate')('directoryNumberPanel.success');
                var type = 'success';
                Notification.notify([msg], type);
              })
              .catch(function (response) {
                Log.debug('updateLineSettings failed.  Status: ' + response.status + ' Response: ' + response.data);
                var msg = $filter('translate')('directoryNumberPanel.error');
                var type = 'error';
                Notification.notify([msg], type);
              });
          }

        }; // end return

      }
    ]);
})();
