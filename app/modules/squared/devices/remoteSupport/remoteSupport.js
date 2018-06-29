(function () {
  'use strict';

  angular
    .module('Squared')
    .controller('RemoteSupportController',

      /* @ngInject */
      function ($q, $timeout, Utils, Authinfo, CsdmDeviceService, CsdmDataModelService, Notification, currentDevice) {
        var rs = this;

        rs.currentDevice = currentDevice;

        rs.resetRsuKeyAndWait = function () {
          rs.oldRsuKey = rs.currentDevice.rsuKey;
          return CsdmDeviceService.renewRsuKey(rs.currentDevice.url, Utils.getUUID(), Authinfo.getPrimaryEmail())
            .then(waitForDeviceToUpdate)
            .catch(function () {
              Notification.error(
                'spacesPage.remoteAccessKey.rsuKeyResetFailedText',
                undefined,
                'spacesPage.remoteAccessKey.rsuKeyResetFailedTitle');
            })
            .finally(function () {
              rs.oldRsuKey = null;
            });
        };

        function waitForDeviceToUpdate() {
          var deferred = $q.defer();
          pollDeviceForNewRsuKey(new Date().getTime() + 5000, deferred);
          return deferred.promise;
        }

        function pollDeviceForNewRsuKey(endTime, deferred) {
          CsdmDataModelService.reloadDevice(rs.currentDevice).then(function (device) {
            if (device.rsuKey !== rs.oldRsuKey) {
              Notification.success('spacesPage.remoteAccessKey.rsuKeyWasReset');
              rs.resetDone = true;
              rs.currentDevice = device;
              return deferred.resolve();
            }
            if (new Date().getTime() > endTime) {
              return deferred.reject();
            }
            $timeout(function () {
              pollDeviceForNewRsuKey(endTime, deferred);
            }, 1000);
          });
        }
      }
    )
    .service('RemoteSupportModal',
      /* @ngInject */
      function ($modal) {
        function open(currentDevice) {
          return $modal.open({
            resolve: {
              currentDevice: _.constant(currentDevice),
            },
            controllerAs: 'rs',
            controller: 'RemoteSupportController',
            template: require('modules/squared/devices/remoteSupport/remoteSupport.html'),
            modalId: 'remoteSupportModal',
          }).result;
        }

        return {
          open: open,
        };
      }
    );
})();
