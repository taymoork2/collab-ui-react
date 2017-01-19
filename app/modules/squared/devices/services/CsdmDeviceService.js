(function () {
  'use strict';

  /* @ngInject  */
  function CsdmDeviceService($http, Authinfo, CsdmConfigService, CsdmConverter, Utils) {
    var devicesUrl = CsdmConfigService.getUrl() + '/organization/' + Authinfo.getOrgId() + '/devices';
    var devicesFastUrlPostFix = "?checkDisplayName=false&checkOnline=false";

    function fetchDevices(requestFullData) {
      var url = devicesUrl;
      if (!requestFullData) {
        url += devicesFastUrlPostFix;
      }
      return $http.get(url).then(function (res) {
        return CsdmConverter.convertCloudberryDevices(res.data);
      });
    }

    function fetchDevicesForUser(userId) {
      return $http.get(devicesUrl + '?cisUuid=' + userId).then(function (res) {
        return CsdmConverter.convertCloudberryDevices(res.data);
      });
    }

    function fetchItem(url) {
      return $http.get(url).then(function (res) {
        return CsdmConverter.convertCloudberryDevice(res.data);
      });
    }

    function deleteDevice(deviceUrl) {
      return $http.delete(deviceUrl);
    }

    function deleteItem(device) {
      return $http.delete(device.url + '?keepPlace=true');
    }

    function updateTags(deviceUrl, tags) {
      return $http.patch(deviceUrl, {
        description: JSON.stringify(tags || [])
      });
    }

    function notifyDevice(deviceUrl, message) {
      return $http.post(deviceUrl + '/notify', message);
    }

    function uploadLogs(deviceUrl, feedbackId, email) {
      return notifyDevice(deviceUrl, {
        command: "logUpload",
        eventType: "room.request_logs",
        feedbackId: feedbackId,
        email: email
      });
    }

    function sendAdvancedSettingsOtp(deviceUrl, token, email, displayName) {
      return notifyDevice(deviceUrl, {
        command: "localAccess",
        eventType: "room.localAccess",
        displayName: displayName,
        email: email,
        token: token
      });
    }

    function renewRsuKey(deviceUrl, feedbackId, email) {
      return notifyDevice(deviceUrl, {
        command: "renewRSU",
        eventType: "room.renewRSU",
        feedbackId: feedbackId,
        email: email,
        message: Utils.getUUID()
      });
    }

    return {
      fetchDevices: fetchDevices,
      fetchDevicesForUser: fetchDevicesForUser,
      deleteItem: deleteItem,
      updateTags: updateTags,
      fetchItem: fetchItem,
      notifyDevice: notifyDevice,
      sendAdvancedSettingsOtp: sendAdvancedSettingsOtp,

//Grey list:
      uploadLogs: uploadLogs,
      deleteDevice: deleteDevice,
      renewRsuKey: renewRsuKey
    };
  }

  angular
    .module('Squared')
    .service('CsdmDeviceService', CsdmDeviceService);

})();
