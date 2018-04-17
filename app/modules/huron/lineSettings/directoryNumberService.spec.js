'use strict';

var testModule = require('./directoryNumberService');

describe('Service: DirectoryNumber', function () {
  beforeEach(angular.mock.module(testModule));

  var $httpBackend, DirectoryNumber, Authinfo;

  var directoryNumber = {
    uuid: '',
    pattern: '',
    alertingName: '',
    externalCallerIdType: '',
    companyNumber: null,
    customCallerIdName: '',
    customCallerIdNumber: '',
    hasCustomAlertingName: false,
    callForwardAll: {
      voicemailEnabled: false,
      destination: '',
    },
    callForwardBusy: {
      intVoiceMailEnabled: false,
      voicemailEnabled: false,
      intDestination: '',
      destination: '',
    },
    callForwardNoAnswer: {
      intVoiceMailEnabled: false,
      voicemailEnabled: false,
      intDestination: '',
      destination: '',
    },
    callForwardNotRegistered: {
      intVoiceMailEnabled: false,
      voicemailEnabled: false,
      intDestination: '',
      destination: '',
    },
  };

  beforeEach(
    inject(
      function (_$httpBackend_, _DirectoryNumber_, _Authinfo_) {
        $httpBackend = _$httpBackend_;
        DirectoryNumber = _DirectoryNumber_;
        Authinfo = _Authinfo_;

        spyOn(Authinfo, 'getOrgId').and.returnValue('1');
      }));

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('should be registered', function () {
    expect(DirectoryNumber).toBeDefined();
  });

  describe('getNewDirectoryNumber function', function () {
    it('should exist', function () {
      expect(DirectoryNumber.getNewDirectoryNumber).toBeDefined();
    });

    it('should return a copy of directoryNumber object', function () {
      expect(DirectoryNumber.getNewDirectoryNumber()).toEqual(directoryNumber);
    });
  });

  describe('getDirectoryNumber function', function () {
    it('should exist', function () {
      expect(DirectoryNumber.getDirectoryNumber).toBeDefined();
    });
  });

  describe('deleteDirectoryNumber function', function () {
    it('should exist', function () {
      expect(DirectoryNumber.deleteDirectoryNumber).toBeDefined();
    });
  });

  describe('disassociateDirectoryNumber function', function () {
    it('should exist', function () {
      expect(DirectoryNumber.disassociateDirectoryNumber).toBeDefined();
    });
  });

  describe('changeInternalNumber function', function () {
    it('should exist', function () {
      expect(DirectoryNumber.changeInternalNumber).toBeDefined();
    });
  });

  describe('getAlternateNumber function', function () {
    it('should exist', function () {
      expect(DirectoryNumber.getAlternateNumbers).toBeDefined();
    });
  });

  describe('addAlternateNumber function', function () {
    it('should exist', function () {
      expect(DirectoryNumber.addAlternateNumber).toBeDefined();
    });
  });

  describe('updateAlternateNumber function', function () {
    it('should exist', function () {
      expect(DirectoryNumber.updateAlternateNumber).toBeDefined();
    });
  });

  describe('deleteAlternateNumber function', function () {
    it('should exist', function () {
      expect(DirectoryNumber.deleteAlternateNumber).toBeDefined();
    });
  });
});
