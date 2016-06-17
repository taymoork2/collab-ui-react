'use strict';

describe('Service: DirectoryNumber', function () {
  var $httpBackend, $rootScope, DirectoryNumber, HuronConfig;

  beforeEach(module('Huron'));
  beforeEach(module('ngResource'));

  var authInfo = {
    getOrgId: sinon.stub().returns('1')
  };

  beforeEach(module(function ($provide) {
    $provide.value("Authinfo", authInfo);
  }));

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
      destination: ''
    },
    callForwardBusy: {
      intVoiceMailEnabled: false,
      voicemailEnabled: false,
      intDestination: '',
      destination: ''
    },
    callForwardNoAnswer: {
      intVoiceMailEnabled: false,
      voicemailEnabled: false,
      intDestination: '',
      destination: ''
    },
    callForwardNotRegistered: {
      intVoiceMailEnabled: false,
      voicemailEnabled: false,
      intDestination: '',
      destination: ''
    }
  };

  beforeEach(
    inject(
      function (_$httpBackend_, _$rootScope_, _DirectoryNumber_, _HuronConfig_) {
        $httpBackend = _$httpBackend_;
        $rootScope = _$rootScope_;
        DirectoryNumber = _DirectoryNumber_;
        HuronConfig = _HuronConfig_;
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

  describe('updateDirectoryNumber function', function () {
    it('should exist', function () {
      expect(DirectoryNumber.updateDirectoryNumber).toBeDefined();
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
