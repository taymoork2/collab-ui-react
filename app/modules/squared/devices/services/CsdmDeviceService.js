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

    function fetchItem(url) {
      return $http.get(url).then(function (res) {
        return CsdmConverter.convertCloudberryDevice(res.data);
      });
    }

    function deleteDevice(deviceUrl) {
      return $http.delete(deviceUrl);
    }

    function deleteItem(device) {
      return $http.delete(device.url);
    }

    function updateItemName(device, newName) {
      return $http.patch(device.url, {
        name: newName
      });
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
      deleteItem: deleteItem,
      updateItemName: updateItemName,
      updateTags: updateTags,
      fetchItem: fetchItem,

//Grey list:
      //on: deviceCache.on,
      //getDevice: getDevice,
      uploadLogs: uploadLogs,
      deleteDevice: deleteDevice,

      renewRsuKey: renewRsuKey
    };
  }

  angular
    .module('Squared')
    .service('CsdmDeviceService', CsdmDeviceService);

})();
