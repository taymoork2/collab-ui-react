(function () {
  'use strict';
  angular
    .module('Squared')
    .controller('RemoteSupportController',

      /* @ngInject */
      function ($scope, $q, $timeout, Notification, $translate, Utils, Authinfo, CsdmDeviceService, currentDevice) {
        var rs = this;

        rs.currentDevice = currentDevice;

        rs.resetRsuKeyAndWait = function () {
          rs.resetDone = false;
          rs.resetFailed = false;
          rs.resetting = true;
          rs.oldRsuKey = rs.currentDevice.rsuKey;
          return CsdmDeviceService.renewRsuKey(rs.currentDevice.url, Utils.getUUID(), Authinfo.getPrimaryEmail())
            .then(waitForDeviceToUpdate)
            .catch(function () {
              rs.resetFailed = true;
            })
            .finally(function () {
              rs.oldRsuKey = null;
              rs.resetting = false;
            });
        };

        function waitForDeviceToUpdate() {
          var deferred = $q.defer();
          pollDeviceForNewRsuKey(new Date().getTime() + 5000, deferred);
          return deferred.promise;
        }

        function pollDeviceForNewRsuKey(endTime, deferred) {
          CsdmDeviceService.getDevice(rs.currentDevice.url).then(function (device) {
            if (device.rsuKey != rs.oldRsuKey) {
              rs.resetDone = true;
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
              currentDevice: _.constant(currentDevice)
            },
            controllerAs: 'rs',
            controller: 'RemoteSupportController',
            templateUrl: 'modules/squared/devices/remoteSupport/remoteSupport.html',
            modalId: 'remoteSupportModal'
          }).result;
        }

        return {
          open: open
        };
      }
    );
})();
