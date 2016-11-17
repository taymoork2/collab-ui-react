(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .factory('AAMediaUploadService', AAMediaUploadService);

  /* @ngInject */
  function AAMediaUploadService($window, $http, Authinfo, Upload, AACommonService, Config) {
    var service = {
      upload: upload,
      retrieve: retrieve,
      getRecordingUrl: getRecordingUrl,
      validateFile: validateFile,
    };

    var devUploadBaseUrl = 'http://54.183.25.170:8001/api/notify/upload';

    var clioProdBase = 'https://clio-manager-a.wbx2.com/clio-manager/api/v1/';
    var clioIntBase = 'https://clio-manager-integration.wbx2.com/clio-manager/api/v1/';
    var clioUploadRecordingUrlSuffix = 'recordings/media';
    var clioGetRecordingUrlSuffix = 'recordings/';

    var clioUploadBaseUrlInt = clioIntBase + clioUploadRecordingUrlSuffix;
    var clioUploadBaseUrlProd = clioProdBase + clioUploadRecordingUrlSuffix;
    var clioGetBaseUrlInt = clioIntBase + clioGetRecordingUrlSuffix;
    var clioGetBaseUrlProd = clioProdBase + clioGetRecordingUrlSuffix;
    var uploadBaseUrl = null;
    var getBaseUrl = null;
    var clioEnabled = false;
    var CLIO_APP_TYPE = 'AutoAttendant';
    var ENCRYPTION_POLICY = '{"encryptionPolicy":{"strategy":"SERVER"}}';

    return service;

    function upload(file) {
      return uploadByUpload(file);
    }

    function retrieve(result) {
      return retrieveByResult(result);
    }

    //to call only during promise resolution from the retrieve get response
    function getRecordingUrl(response) {
      if (response) {
        var variants = _.get(response, 'data.variants', undefined);
        if (_.isUndefined(variants)) {
          return '';
        } else {
          return getRecordingByVariant(variants);
        }
      } else {
        return '';
      }
    }

    function retrieveByResult(successResult) {
      if (_.isEmpty(successResult) || _.isUndefined(successResult)) {
        return '';
      }
      if (isClioEnabled()) {
        if (_.has(successResult, 'data.recordingId')) {
          return $http.get(getBaseUrl + successResult.data.recordingId);
        }
      } else {
        if (_.has(successResult, 'data.PlaybackUri')) {
          return getBaseUrl + successResult.data.PlaybackUri;
        }
      }
      return '';
    }

    function getRecordingByVariant(variants) {
      if (!_.isEmpty(variants)) {
        var variantKeys = _.keys(variants);
        if (variantKeys.length > 0) {
          if (_.has(variants, variantKeys[0] + '.variantUrl')) {
            var variantUrl = variants[variantKeys[0]].variantUrl + '?orgId=' + Authinfo.getOrgId();
            if (_.isUndefined(variantUrl)) {
              return '';
            } else {
              return variantUrl;
            }
          } else {
            return '';
          }
        } else {
          return '';
        }
      } else {
        return '';
      }
    }

    function getUploadUrl() {
      if (isClioEnabled()) {
        return uploadBaseUrl;
      } else {
        return uploadBaseUrl + '?customerId=' + Authinfo.getOrgId();
      }
    }

    function uploadByUpload(file) {
      if (!_.isEmpty(file) && validateFile(file.name)) {
        var uploadUrl = getUploadUrl();
        var fd = new $window.FormData();
        fd.append('file', file);
        if (isClioEnabled()) {
          fd.append('appType', CLIO_APP_TYPE);
          fd.append('policy', ENCRYPTION_POLICY);
        }
        return Upload.http({
          url: uploadUrl,
          transformRequest: _.identity,
          headers: {
            'Content-Type': undefined,
          },
          data: fd
        });
      } else {
        return undefined;
      }
    }

    function validateFile(fileName) {
      if (_.endsWith(fileName, '.wav')) {
        return true;
      } else {
        return false;
      }
    }

    function isClioEnabled() {
      setURLFromClioFeatureToggle();
      return clioEnabled;
    }

    function setURLFromClioFeatureToggle() {
      if (_.isEmpty(uploadBaseUrl)) {
        if (AACommonService.isClioToggle()) {
          if (Config.isProd()) {
            uploadBaseUrl = clioUploadBaseUrlProd;
            getBaseUrl = clioGetBaseUrlProd;
          } else {
            uploadBaseUrl = clioUploadBaseUrlInt;
            getBaseUrl = clioGetBaseUrlInt;
          }
          clioEnabled = true;
        } else {
          uploadBaseUrl = devUploadBaseUrl;
          getBaseUrl = 'http://';
        }
      }
    }
  }

})();
