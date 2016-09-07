(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .factory('AAMediaUploadService', AAMediaUploadService);

  /* @ngInject */
  function AAMediaUploadService($window, $http, Authinfo, Upload) {
    var service = {
      upload: upload,
      uploadByUploadService: uploadByUploadService,
      uploadByAngular: uploadByAngular,
      validateFile: validateFile,
    };

    var devUploadBaseUrl = 'http://54.183.25.170:8001/api/notify/upload';
    // var clioUploadBaseUrl = 'https://clio-manager-integration.wbx2.com/clio-manager/api/v1/recordings/media';

    // We are using the dev test upload endpoint for now
    var uploadBaseUrl = devUploadBaseUrl;

    return service;

    function upload(file, event) {
      return uploadByAngular(file, event);
    }

    function getUploadUrl() {
      if (uploadBaseUrl == devUploadBaseUrl) {
        return uploadBaseUrl + '?customerId=' + Authinfo.getOrgId();
      } else {
        return uploadBaseUrl;
      }
    }


    function uploadByUploadService(file, event) {

      // this is to stop the complaint about event being unused
      var uploadUrl = event;

      uploadUrl = getUploadUrl();

      var blob = new $window.Blob([file], {
        type: 'multipart/form-data'
      });

      return Upload.http({
        url: uploadUrl,
        method: 'POST',
        headers: {
          'Content-Type': undefined
        },
        data: blob
      });

    }


    function uploadByAngular(file, event) {

      // this is to stop the complaint about event being unused
      var uploadUrl = event;

      uploadUrl = getUploadUrl();

      var fd = new $window.FormData();
      fd.append('file', file);
      return $http.post(uploadUrl, fd, {
        transformRequest: angular.identity,
        headers: {
          'Content-Type': undefined
        }
      });
    }

  }

  function validateFile(fileName) {
    if (_.endsWith(fileName, '.wav')) {
      return true;
    } else {
      return false;
    }
  }

})();
