'use strict';

describe('Service: AAMediaUploadService', function () {
  var $rootScope;
  var $scope;
  var Upload;
  var AAMediaUploadService;
  var $http;
  var $httpBackend;
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
  /*var successResponse = {
    'status': 200,
    'statusText': 'OK',
    success: true,
  };*/
  /*var errorResponse = {
    'status': 500,
    'statusText': 'Internal Server Error',
  };*/

  beforeEach(angular.mock.module('uc.autoattendant'));
  beforeEach(angular.mock.module('Huron'));

  beforeEach(inject(function (_$rootScope_, _Upload_, _AAMediaUploadService_, _$http_, _$window_, _$httpBackend_) {
    $rootScope = _$rootScope_;
    $scope = $rootScope;
    Upload = _Upload_;
    AAMediaUploadService = _AAMediaUploadService_;
    $http = _$http_;
    $httpBackend = _$httpBackend_;
    $window = _$window_;
  }));

  afterEach(function () {

  });

  describe('uploadByAngular', function () {
    beforeEach(function () {
      spyOn($http, 'post');
      fd = new $window.FormData();
      fd.append('file', fileToUpload);
      postParams = {
        transFormRequest: angular.identity,
        headers: {
          'Content-Type': undefined
        },
      };
    });

    afterEach(function () {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    });

    it('should upload by angular and send the data', function () {
      $httpBackend.whenPOST(uploadUrl).respond(200, true);
      AAMediaUploadService.upload(fileToUpload, '');
      $scope.$apply();
      expect($http.post).toHaveBeenCalled();
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
        data: blob
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
