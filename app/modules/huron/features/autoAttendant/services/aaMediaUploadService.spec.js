'use strict';

describe('Service: AAMediaUploadService', function () {
  var Upload;
  var AAMediaUploadService;
  var $http;
  var AACommonService;
  var Config;

  var validFileByName = 'validFile.wav';
  var invalidFileByName = 'validFile.invalid';
  var fileToUpload = {
    name: validFileByName,
    size: 1,
  };
  var recordingId = 'recordingId';
  var successResultLackingPath = {
    malformed: {
    }
  };
  var successResultRecordingId = {
    data: {
      recordingId: recordingId
    }
  };
  var variantUrlPlayback = 'recordingPlayBackUrl';
  var variantKeys = '12987-253235-235235-235235';
  var variantsMap = {};
  variantsMap[variantKeys] = {
    variantUrl: variantUrlPlayback
  };
  var clioValidRetrieve = {
    data: {
      variants: variantsMap,
    },
  };
  var clioInvalidRetrieveEmptyVariants = {
    data: {
    },
  };
  var clioInvalidRetrieveUndefinedVariants = {
    data: {
      variants: undefined,
    },
  };
  var clioInvalidRetrieveNoKeys = {
    data: {
      variants: {
      }
    }
  };
  var clioInvalidRetrieveNoVariantKeysMap = {
    data: {
      variants: {
        noNestedFields: undefined
      }
    }
  };
  var clioInvalidRetrieveNoVariantKeys = {
    data: {
      variants: {
        noNestedFields: {
        }
      }
    }
  };
  var clioInvalidRetrieveNoVariantUrl = {
    data: {
      variants: {
        noNestedFields: {
          notVariantUrlField: 'sampleValue'
        }
      }
    }
  };
  var clioInvalidRetrieveEmptyVariantUrl = {
    data: {
      variants: {
        noNestedFields: {
          variantUrl: undefined
        }
      }
    }
  };

  beforeEach(angular.mock.module('uc.autoattendant'));
  beforeEach(angular.mock.module('Huron'));

  beforeEach(inject(function (_Upload_, _Config_, _AACommonService_, _AAMediaUploadService_, _$http_) {
    Upload = _Upload_;
    AAMediaUploadService = _AAMediaUploadService_;
    $http = _$http_;
    AACommonService = _AACommonService_;
    Config = _Config_;
  }));

  afterEach(function () {

  });

  describe('getRecordingUrl', function () {
    beforeEach(function () {
    });

    it('happy path', function () {
      expect(AAMediaUploadService.getRecordingUrl(clioValidRetrieve)).toEqual(variantUrlPlayback);
    });

    it('no keys sets', function () {
      expect(AAMediaUploadService.getRecordingUrl(clioInvalidRetrieveNoKeys)).toEqual('');
    });

    it('no variant url', function () {
      expect(AAMediaUploadService.getRecordingUrl(clioInvalidRetrieveNoVariantUrl)).toEqual('');
    });

    it('empty variant url', function () {
      expect(AAMediaUploadService.getRecordingUrl(clioInvalidRetrieveEmptyVariantUrl)).toEqual('');
    });

    it('no variant keys', function () {
      expect(AAMediaUploadService.getRecordingUrl(clioInvalidRetrieveNoVariantKeys)).toEqual('');
    });

    it('empty variants', function () {
      expect(AAMediaUploadService.getRecordingUrl(clioInvalidRetrieveEmptyVariants)).toEqual('');
    });

    it('no variant keys to map', function () {
      expect(AAMediaUploadService.getRecordingUrl(clioInvalidRetrieveNoVariantKeysMap)).toEqual('');
    });

    it('undefined variants', function () {
      expect(AAMediaUploadService.getRecordingUrl(clioInvalidRetrieveUndefinedVariants)).toEqual('');
    });
  });

  describe('retrieve', function () {
    beforeEach(function () {
      spyOn(AACommonService, 'isClioToggle').and.returnValue(true);
    });

    describe('production', function () {
      beforeEach(function () {
        spyOn(Config, 'isProd').and.returnValue(true);
      });

      it('should retrieve an empty string on a non iterable success result', function () {
        expect(AAMediaUploadService.retrieve(1)).toEqual('');
      });
    });

    describe('not production', function () {
      beforeEach(function () {
        spyOn(Config, 'isProd').and.returnValue(false);
      });

      it('should retrieve an empty string on an empty success result', function () {
        expect(AAMediaUploadService.retrieve(undefined)).toEqual('');
      });

      it('should retrieve an empty string from a lacking path success result', function () {
        expect(AAMediaUploadService.retrieve(successResultLackingPath)).toEqual('');
      });

      it('should retrieve the recording id from a structure that has such in the success result', function () {
        spyOn($http, 'get').and.callFake(function () {
          return true;
        });
        AAMediaUploadService.retrieve(successResultRecordingId);
        expect($http.get).toHaveBeenCalled();
      });
    });
  });

  describe('upload', function () {
    beforeEach(function () {
      spyOn(Upload, 'http');
    });

    it('should upload by upload http and send the data', function () {
      spyOn(AAMediaUploadService, 'validateFile').and.returnValue(true);
      AAMediaUploadService.upload(fileToUpload);
      expect(Upload.http).toHaveBeenCalled();
    });

    it('should not upload with a null file', function () {
      AAMediaUploadService.upload(null);
      expect(Upload.http).not.toHaveBeenCalled();
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
