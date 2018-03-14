(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .factory('AAMediaUploadService', AAMediaUploadService);

  /* @ngInject */
  function AAMediaUploadService($window, $http, Authinfo, Upload, AACtrlResourcesService, Config) {
    var service = {
      upload: upload,
      retrieve: retrieve,
      getRecordingUrl: getRecordingUrl,
      validateFile: validateFile,
      deleteRecording: deleteRecording,
      httpDeleteRetry: httpDeleteRetry,
      getResources: getResources,
      notifyAsSaved: notifyAsSaved,
      notifyAsActive: notifyAsActive,
      clearResourcesExcept: clearResourcesExcept,
      cleanResourceFieldIndex: cleanResourceFieldIndex,
      resetResources: resetResources,
      saveResources: saveResources,
    };

    var clioProdBase = 'https://clio-manager-a.wbx2.com/clio-manager/api/v1/';
    var clioIntBase = 'https://clio-manager-intb.ciscospark.com/clio-manager/api/v1/';
    var clioUploadRecordingUrlSuffix = 'recordings/media';
    var clioDeleteRecordingUrlSuffix = 'recordings/';
    var clioUploadBaseUrlInt = clioIntBase + clioUploadRecordingUrlSuffix;
    var clioUploadBaseUrlProd = clioProdBase + clioUploadRecordingUrlSuffix;
    var clioDeleteBaseUrlInt = clioIntBase + clioDeleteRecordingUrlSuffix;
    var clioDeleteBaseUrlProd = clioProdBase + clioDeleteRecordingUrlSuffix;
    var uploadBaseUrl = null;
    var deleteBaseUrl = null;
    var CLIO_APP_TYPE = 'AutoAttendant';
    var ENCRYPTION_POLICY = '{"encryptionPolicy":{"strategy":"SERVER"}}';
    var isReset = false;
    //media upload controllers will map their unique control identifiers
    //from aa common service to an array of media resources located in clio
    //after specifying whether or not that media upload is active or not
    //as well as if the array has been saved
    //strategy is to clear out from (head, tail] if array is saved
    //and clear out from [head, tail) if array has not been saved
    //if at anytime the active attribute is false
    //resources example
    /*{
        mediaUploadCtrlN: {
          active: true,
          saved: false,
          uploads: []
        }
      }
    */
    //the resources are mapped from a common controller resource service
    var resources = AACtrlResourcesService.getCtrlToResourceMap();

    setURLForClioFeature();

    return service;


    function upload(file) {
      return uploadByUpload(file);
    }

    function retrieve(result) {
      return retrieveByResult(result);
    }

    //when the aa save is complete, we want to keep the main active
    //media, so delete backwards
    function saveResources() {
      _.each(AACtrlResourcesService.getCtrlKeys(), function (key) {
        cleanResourceFieldIndex('active', getResources(key).uploads.length - 1, key);
      });
    }

    //helper function to clean based on active, or saved fields
    //for the specific controller being referred to
    //closed focuses on the last saved and save focuses on the active
    function cleanResourceFieldIndex(field, index, key) {
      if (key && field) {
        var resource = getResources(key);
        if (resource[field]) {
          clearResourcesExcept(key, index);
        } else {
          deleteResources(resource);
          delete resources[key];
        }
      }
    }

    function notifyAsSaved(unqCtrlId, value) {
      notifyField(unqCtrlId, value, 'saved');
    }

    function notifyAsActive(unqCtrlId, value) {
      notifyField(unqCtrlId, value, 'active');
    }

    function notifyField(unqCtrlId, value, field) {
      if (unqCtrlId && field) {
        getResources(unqCtrlId)[field] = value;
      }
    }

    //get the resources associated with a media controller
    //if that controller doesn't have an entry
    //create as default, then return the media controller values
    function getResources(unqCtrlId) {
      if (unqCtrlId) {
        resources[unqCtrlId] = _.get(resources, unqCtrlId, { uploads: [], active: true, saved: false });
        return resources[unqCtrlId];
      }
      return undefined;
    }

    function isURLActive(deleteUrl) {
      var urlActive = false;
      var activeResources;
      if (isReset) {
        activeResources = _.filter(resources, { active: true, saved: true });
      } else {
        activeResources = _.filter(resources, { active: true });
      }
      _.forEach(activeResources, function (activeResource) {
        if (_.isEqual(deleteUrl, _.get(activeResource, 'uploads[0].deleteUrl', ''))) {
          urlActive = true;
        }
      });
      return urlActive;
    }

    function resetResources() {
      /* make sure any uploaded media files are deleted except for zero
       * the active one.
       */
      _.forEach(resources, function (resource, key) {
        if (resource.uploads.length > 1) {
          isReset = true;
          clearResourcesExcept(key, 0);
        }
        resource.uploads = [];
      });
    }

    //clean all resources except for a specific index from the resource array
    function clearResourcesExcept(unqCtrlId, index) {
      if (index >= 0) {
        var ctrlResources = getResources(unqCtrlId);
        if (ctrlResources.uploads.length > 0) {
          var except = _.pullAt(ctrlResources.uploads, index);
          deleteResources(ctrlResources);
          ctrlResources.uploads = except;
        }
      }
    }

    function deleteResources(ctrl) {
      var target = _.get(ctrl, 'uploads', []);
      _.each(target, function (value) {
        if (_.has(value, 'deleteUrl') && !_.isEmpty(value.deleteUrl) && !isURLActive(value.deleteUrl)) {
          httpDeleteRetry(value.deleteUrl, 0);
        }
      });
      if (target.length > 0) {
        delete ctrl.uploads;
      }
    }

    //for the time being we are attempting to retry deletes 3 times
    //if it fails after that, it's orphaned in clio
    function httpDeleteRetry(internalValue, counter) {
      var deleter = deleteRecording(internalValue);
      if (deleter) {
        deleter.then(function () {
        }, function (response) {
          if (response.status > 0 && !_.inRange(response.status, 403, 405)) {
            if (counter < 3) {
              httpDeleteRetry(internalValue, ++counter);
            }
          }
        });
      }
    }

    //asynchronous delete on the resource, assumes url is valid
    function deleteRecording(deleteUrl) {
      if (deleteUrl && _.startsWith(deleteUrl, 'http')) {
        return $http.delete(deleteUrl);
      } else {
        return undefined;
      }
    }

    //from the very specific metadata returned by clio
    //under the http result promise .data.metadata will be a field
    //called variants which inside will store the recording url
    function getRecordingUrl(metadata) {
      if (metadata) {
        var variants = _.get(metadata, 'variants', undefined);
        if (variants) {
          return getRecordingByVariant(variants);
        }
      }
      return '';
    }

    //from the very specific metadata returned by clio
    //under the http result promise .data.metadata will be a field called
    //recordingId which is the UUID for the resource stored in cliomanager
    function getDeleteUrl(metadata) {
      var recordingId = _.get(metadata, 'recordingId', '');
      if (recordingId) {
        return deleteBaseUrl + recordingId + '?orgId=' + Authinfo.getOrgId();
      }
      return recordingId;
    }

    //get the playback and delete url, store in obj
    function retrieveByResult(successResult) {
      if (!successResult) {
        return '';
      }
      var urls = {};

      if (_.has(successResult, 'data.metadata')) {
        urls.playback = getRecordingUrl(successResult.data.metadata);
        urls.deleteUrl = getDeleteUrl(successResult.data.metadata);
      }
      return urls;
    }

    //once at the variants level, clio stores the recording url under variants[0].variantUrl
    function getRecordingByVariant(variants) {
      var variantKeys = _.keys(variants);
      if (!variantKeys || variantKeys.length === 0) {
        return '';
      }
      var variantUrl = _.get(variants, variantKeys[0] + '.variantUrl', undefined);
      if (!variantUrl) {
        return '';
      }
      return variantUrl + '?orgId=' + Authinfo.getOrgId();
    }

    function getUploadUrl() {
      return uploadBaseUrl;
    }

    function uploadByUpload(file) {
      if (file && validateFile(file.name)) {
        var uploadUrl = getUploadUrl();
        var fd = new $window.FormData();

        fd.append('file', file);
        fd.append('appType', CLIO_APP_TYPE);
        fd.append('policy', ENCRYPTION_POLICY);

        return Upload.http({
          url: uploadUrl,
          transformRequest: _.identity,
          headers: {
            'Content-Type': undefined,
          },
          data: fd,
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

    function setURLForClioFeature() {
      if (!uploadBaseUrl) {
        if (Config.isProd()) {
          uploadBaseUrl = clioUploadBaseUrlProd;
          deleteBaseUrl = clioDeleteBaseUrlProd;
        } else {
          uploadBaseUrl = clioUploadBaseUrlInt;
          deleteBaseUrl = clioDeleteBaseUrlInt;
        }
      }
    }
  }
})();
