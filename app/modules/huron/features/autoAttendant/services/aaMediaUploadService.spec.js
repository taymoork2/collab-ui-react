'use strict';

describe('Service: AAMediaUploadService', function () {
  var Upload;
  var AAMediaUploadService;
  var AACommonService;
  var Config;

  var validFileByName = 'validFile.wav';
  var invalidFileByName = 'validFile.invalid';
  var fileToUpload = {
    name: validFileByName,
    size: 1,
  };
  var variantUrlPlayback = 'recordingPlayBackUrl';
  var orgId = '?orgId=null';
  var variantKeys = '12987-253235-235235-235235';
  var variantsMap = {};
  variantsMap[variantKeys] = {
    variantUrl: variantUrlPlayback
  };
  var clioValidRetrieve = {
    variants: variantsMap,
  };
  var clioInvalidRetrieveEmptyVariants = {
  };
  var clioInvalidRetrieveUndefinedVariants = {
    variants: undefined,
  };
  var clioInvalidRetrieveNoKeys = {
    variants: {
    }
  };
  var clioInvalidRetrieveNoVariantKeysMap = {
    variants: {
      noNestedFields: undefined
    }
  };
  var clioInvalidRetrieveNoVariantKeys = {
    variants: {
      noNestedFields: {
      }
    }
  };
  var clioInvalidRetrieveNoVariantUrl = {
    variants: {
      noNestedFields: {
        notVariantUrlField: 'sampleValue'
      }
    }
  };
  var clioInvalidRetrieveEmptyVariantUrl = {
    variants: {
      noNestedFields: {
        variantUrl: undefined
      }
    }
  };
  var successResultLackingPath = {
    malformed: {
    }
  };
  var successResultRecording = {
    data: {
      metadata: {
        variants: variantsMap
      },
    }
  };

  beforeEach(angular.mock.module('uc.autoattendant'));
  beforeEach(angular.mock.module('Huron'));

  beforeEach(inject(function (_Upload_, _Config_, _AACommonService_, _AAMediaUploadService_) {
    Upload = _Upload_;
    AAMediaUploadService = _AAMediaUploadService_;
    AACommonService = _AACommonService_;
    Config = _Config_;
  }));

  afterEach(function () {

  });

  describe('getRecordingUrl', function () {
    beforeEach(function () {
    });

    it('happy path', function () {
      expect(AAMediaUploadService.getRecordingUrl(clioValidRetrieve)).toEqual(variantUrlPlayback + orgId);
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

      it('should retrieve the recording url from a structure that has such in the success result', function () {
        expect(AAMediaUploadService.retrieve(successResultRecording)).toEqual(variantUrlPlayback + orgId);
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
