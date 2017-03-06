'use strict';

describe('Service: AAMediaUploadService', function () {
  var Upload;
  var AAMediaUploadService;
  var AACommonService;
  var AACtrlResourcesService;
  var Config;
  var $http;
  var $q;

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
    variantUrl: variantUrlPlayback,
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
    },
  };
  var clioInvalidRetrieveNoVariantKeysMap = {
    variants: {
      noNestedFields: undefined,
    },
  };
  var clioInvalidRetrieveNoVariantKeys = {
    variants: {
      noNestedFields: {
      },
    },
  };
  var clioInvalidRetrieveNoVariantUrl = {
    variants: {
      noNestedFields: {
        notVariantUrlField: 'sampleValue',
      },
    },
  };
  var clioInvalidRetrieveEmptyVariantUrl = {
    variants: {
      noNestedFields: {
        variantUrl: undefined,
      },
    },
  };
  var successResultLackingPath = {
    malformed: {
    },
  };
  var successResultRecording = {
    data: {
      metadata: {
        variants: variantsMap,
      },
    },
  };

  beforeEach(angular.mock.module('uc.autoattendant'));
  beforeEach(angular.mock.module('Huron'));

  beforeEach(inject(function (_Upload_, _Config_, _AACommonService_, _AAMediaUploadService_, _AACtrlResourcesService_, _$http_, _$q_) {
    Upload = _Upload_;
    AAMediaUploadService = _AAMediaUploadService_;
    AACommonService = _AACommonService_;
    AACtrlResourcesService = _AACtrlResourcesService_;
    Config = _Config_;
    $http = _$http_;
    $q = _$q_;
  }));

  afterEach(function () {

  });

  describe('deleteRecording', function () {
    beforeEach(function () {
    });

    it('should return http promise given a truthy url', function () {
      var del = $q.defer();
      spyOn($http, 'delete').and.returnValue(del.promise);
      expect(AAMediaUploadService.deleteRecording('http://url')).toEqual(del.promise);
      expect($http.delete).toHaveBeenCalled();
    });

    it('should not return an http promise given a falsy url', function () {
      spyOn($http, 'delete');
      expect(AAMediaUploadService.deleteRecording('')).toEqual(undefined);
      expect($http.delete).not.toHaveBeenCalled();
    });
  });

  describe('clearResourcesExcept', function () {
    beforeEach(function () {
    });

    it('should not do anything if the index is less than zero', function () {
      spyOn(AAMediaUploadService, 'getResources');
      AAMediaUploadService.clearResourcesExcept('value', -1);
      expect(AAMediaUploadService.getResources).not.toHaveBeenCalled();
    });

    it('should not do anything if the uploads length is less than or equal ot zero', function () {
      spyOn(AAMediaUploadService, 'getResources').and.returnValue({
        mediaUploadCtrlN: {
          active: true,
          saved: false,
          uploads: [],
        },
      });
      AAMediaUploadService.clearResourcesExcept('value', 0);
      expect(AAMediaUploadService.getResources).not.toHaveBeenCalled();
    });
  });

  describe('getResources', function () {
    beforeEach(function () {
    });

    it('should return a resource map with a particular structure', function () {
      expect(AAMediaUploadService.getResources('uniqueIdentifier')).toEqual(jasmine.objectContaining({
        uploads: [],
        active: true,
        saved: false,
      }));
    });

    it('should return undefined with no identifier to select', function () {
      expect(AAMediaUploadService.getResources('')).toEqual(undefined);
    });
  });

  describe('cleanResourceFieldIndex', function () {
    beforeEach(function () {
      spyOn(AAMediaUploadService, 'clearResourcesExcept').and.callFake(function () {});
    });

    it('should not execute clearResources if field is falsy', function () {
      AAMediaUploadService.cleanResourceFieldIndex('', 'value', 'value');
      expect(AAMediaUploadService.clearResourcesExcept).not.toHaveBeenCalled();
    });

    it('should not execute clearResources if key is falsy', function () {
      AAMediaUploadService.cleanResourceFieldIndex('value', 'value', '');
      expect(AAMediaUploadService.clearResourcesExcept).not.toHaveBeenCalled();
    });
  });

  describe('AA Save', function () {
    beforeEach(function () {
      spyOn(AAMediaUploadService, 'cleanResourceFieldIndex').and.callFake(function (field, index, key) {
        return key && index && field;
      });
      spyOn(AACtrlResourcesService, 'getCtrlKeys').and.returnValue(['mediaUploadCtrlN']);
    });

    it('should delete the field information on aa save if not active', function () {
      spyOn(AAMediaUploadService, 'getResources').and.returnValue({
        mediaUploadCtrlN: {
          active: false,
          saved: '',
          uploads: ['value'],
        },
      });
      AAMediaUploadService.saveResources();
      expect(AAMediaUploadService.cleanResourceFieldIndex).not.toHaveBeenCalled();
    });
  });

  describe('AA Close', function () {
    it('should delete out the resources on aa close if not saved', function () {
      var resources = AAMediaUploadService.getResources('someId');
      resources.uploads.push({
        deleteUrl: 'keeper',
        myUrl: 'keeper URL',
      });
      resources.uploads.push({
        deleteUrl: 'should not be here',
        myUrl: 'deleted URL',
      });

      AAMediaUploadService.resetResources();

      expect(resources.uploads.length).toEqual(1);
      expect(resources.uploads[0].myUrl).toEqual('keeper URL');

    });
  });
  describe('Notify', function () {
    it('should moved saved to true', function () {
      var resources = AAMediaUploadService.getResources('someId');

      AAMediaUploadService.notifyAsSaved('someId', true);

      expect(resources.saved).toEqual(true);

    });
    it('should moved active to true', function () {
      var resources = AAMediaUploadService.getResources('someId');

      AAMediaUploadService.notifyAsActive('someId', true);

      expect(resources.active).toEqual(true);

    });
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
        expect(AAMediaUploadService.retrieve(1)).toEqual({});
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
        expect(AAMediaUploadService.retrieve(successResultLackingPath)).toEqual({});
      });

      it('should retrieve the recording url from a structure that has such in the success result', function () {
        expect(AAMediaUploadService.retrieve(successResultRecording).playback).toEqual(variantUrlPlayback + orgId);
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
