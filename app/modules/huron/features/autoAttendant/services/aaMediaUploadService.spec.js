'use strict';

describe('Service: AAMediaUploadService', function () {
  var Upload;
  var AAMediaUploadService;
  var $window;

  var validFileByName = 'validFile.wav';
  var invalidFileByName = 'validFile.invalid';
  var fileToUpload = {
    name: validFileByName,
    size: 1,
  };
  var postParams = {};
  var fd = {};
  var blob = {};
  var uploadUrl = 'http://54.183.25.170:8001/api/notify/upload' + '?customerId=' + null;

  beforeEach(angular.mock.module('uc.autoattendant'));
  beforeEach(angular.mock.module('Huron'));

  beforeEach(inject(function (_Upload_, _AAMediaUploadService_, _$window_) {
    Upload = _Upload_;
    AAMediaUploadService = _AAMediaUploadService_;
    $window = _$window_;
  }));

  afterEach(function () {

  });

  describe('uploadByUpload', function () {
    beforeEach(function () {
      spyOn(Upload, 'http');
      fd = new $window.FormData();
      fd.append('file', fileToUpload);
      postParams = {
        url: uploadUrl,
        transFormRequest: _.identity,
        headers: {
          'Content-Type': undefined
        },
        data: fd,
      };
    });

    it('should upload by upload http and send the data', function () {
      AAMediaUploadService.uploadByUpload(fileToUpload);
      expect(Upload.http).toHaveBeenCalled();
    });
  });

  describe('uploadByUploadService', function () {
    beforeEach(function () {
      spyOn(Upload, 'http');
      blob = new $window.Blob([fileToUpload], {
        type: 'multipart/form-data'
      });
      postParams = {
        url: uploadUrl,
        method: 'POST',
        headers: {
          'Content-Type': undefined
        },
        data: blob,
      };
    });

    it('should upload by upload service and send the data', function () {
      AAMediaUploadService.uploadByUploadService(fileToUpload, '');
      expect(Upload.http).toHaveBeenCalledWith(postParams);
    });
  });

  describe('validateFile', function () {
    it('should return true with a valid file ext of .wav', function () {
      expect(AAMediaUploadService.validateFile(validFileByName)).toEqual(true);
    });

    it('should return false with an invalid file ext not of .wav', function () {
      expect(AAMediaUploadService.validateFile(invalidFileByName)).toEqual(false);
    });
  });
});
