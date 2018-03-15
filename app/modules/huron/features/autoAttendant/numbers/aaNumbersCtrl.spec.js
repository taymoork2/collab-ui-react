'use strict';

describe('Controller: AABuilderNumbersCtrl', function () {
  var control, AANotificationService;
  var AAModelService, AAUiModelService, AutoAttendantCeInfoModelService, Authinfo, AANumberAssignmentService, AACommonService;
  var $rootScope, $scope, $q;
  var $httpBackend, HuronConfig;
  var url, cmiAAAsignmentURL;

  var cesWithNumber = getJSONFixture('huron/json/autoAttendant/callExperiencesWithNumber.json');
  var aCe = getJSONFixture('huron/json/autoAttendant/aCallExperience.json');
  var rawCeInfo = {
    callExperienceName: 'AAA2',
    callExperienceURL: 'https://ces.hitest.huron-dev.com/api/v1/customers/6662df48-b367-4c1e-9c3c-aa408aaa79a1/callExperiences/c16a6027-caef-4429-b3af-9d61ddc7964b',
    assignedResources: [{
      id: '00097a86-45ef-44a7-aa78-6d32a0ca1d3b',
      type: 'directoryNumber',
      trigger: 'incomingCall',
      number: '999999',
      uuid: '00097a86-45ef-44a7-aa78-6d32a0ca1d3b',
    }, {
      id: '00097a86-45ef-44a7-aa78-6d32a0ca1d3c',
      type: 'externalNumber',
      trigger: 'incomingCall',
      number: '12068551179',
      uuid: '00097a86-45ef-44a7-aa78-6d32a0ca1d3c',
    }, {
      id: '00097a86-45ef-44a7-aa78-6d32a0ca1d3d',
      type: 'externalNumber',
      trigger: 'incomingCall',
      number: '+12068551179',
      uuid: '00097a86-45ef-44a7-aa78-6d32a0ca1d3d',
    }],
  };

  var cmiAAAssignedNumbers = [{
    number: '2578',
    type: 'NUMBER_FORMAT_EXTENSION',
    uuid: '29d70a54-cf0a-4279-ad75-09116eedb7a7',
  }, {
    number: '8002578',
    type: 'NUMBER_FORMAT_ENTERPRISE_LINE',
    uuid: '29d70b54-cf0a-4279-ad75-09116eedb7a7',
  }, {
    number: '1111111',
    type: 'NUMBER_FORMAT_EXTENSION',
    uuid: '29d70b54-cf0a-4279-ad75-09116eedb7a8',
  }, {
    number: '+2222222',
    type: 'externalNumber',
    uuid: '29d70b54-cf0a-4279-ad75-09116eedb7a9',
  }];

  var cmiAAAsignment = {
    numbers: cmiAAAssignedNumbers,
    url: 'https://cmi.huron-int.com/api/v2/customers/3338d491-d6ca-4786-82ed-cbe9efb02ad2/features/autoattendants/23a42558-6485-4dab-9505-704b6204410c/numbers',
  };

  var cmiAAAsignments = [cmiAAAsignment];

  var aaModel = {};
  var aaUiModel = {};

  var errorSpy;

  function ce2CeInfo(rawCeInfo) {
    var _ceInfo = AutoAttendantCeInfoModelService.newCeInfo();
    for (var j = 0; j < rawCeInfo.assignedResources.length; j++) {
      var resource = AutoAttendantCeInfoModelService.newResource();
      resource.setId(rawCeInfo.assignedResources[j].id);
      resource.setTrigger(rawCeInfo.assignedResources[j].trigger);
      resource.setType(rawCeInfo.assignedResources[j].type);
      resource.setUUID(rawCeInfo.assignedResources[j].uuid);
      if (!_.isUndefined(rawCeInfo.assignedResources[j].number)) {
        resource.setNumber(rawCeInfo.assignedResources[j].number);
      }
      _ceInfo.addResource(resource);
    }
    _ceInfo.setName(rawCeInfo.callExperienceName);
    _ceInfo.setCeUrl(rawCeInfo.callExperienceURL);
    return _ceInfo;
  }

  beforeEach(angular.mock.module('uc.autoattendant'));
  beforeEach(angular.mock.module('Huron'));
  beforeEach(angular.mock.module('Sunlight'));

  var authInfo = {
    getOrgId: jasmine.createSpy('getOrgId').and.returnValue('1'),
    getOrgName: jasmine.createSpy('getOrgName').and.returnValue('awesomeco'),
  };

  beforeEach(angular.mock.module(function ($provide) {
    $provide.value('Authinfo', authInfo);
  }));

  beforeEach(inject(function (_$rootScope_, _$q_, $controller, _$httpBackend_, _HuronConfig_, _AutoAttendantCeInfoModelService_,
    _AAModelService_, _AANumberAssignmentService_, _AACommonService_, _Authinfo_, _AANotificationService_, _AAUiModelService_) {
    $rootScope = _$rootScope_;
    $q = _$q_;
    $scope = $rootScope;
    $httpBackend = _$httpBackend_;
    HuronConfig = _HuronConfig_;
    AAModelService = _AAModelService_;
    AAUiModelService = _AAUiModelService_;

    AANumberAssignmentService = _AANumberAssignmentService_;
    AutoAttendantCeInfoModelService = _AutoAttendantCeInfoModelService_;
    Authinfo = _Authinfo_;
    AACommonService = _AACommonService_;

    AANotificationService = _AANotificationService_;

    spyOn(AAModelService, 'getAAModel').and.returnValue(aaModel);
    spyOn(AAUiModelService, 'getUiModel').and.returnValue(aaUiModel);

    $httpBackend.whenGET(HuronConfig.getCmiUrl() + '/voice/customers/1/externalnumberpools?directorynumber=&order=pattern').respond(200, [{
      pattern: '+19005451234',
      uuid: '9999999991-id',
    }, {
      pattern: '+8888888881',
      uuid: '8888888881-id',
    }]);

    // for an external number query, return the number formatted with a +
    var externalNumberQueryUri = /\/externalnumberpools\?directorynumber=&order=pattern&pattern=(.+)/;
    $httpBackend.whenGET(externalNumberQueryUri)
      .respond(function (method, url) {
        var pattern = decodeURI(url).match(new RegExp(externalNumberQueryUri))[1];

        var response = [{
          pattern: '+' + pattern.replace(/\D/g, ''),
          uuid: pattern.replace(/\D/g, '') + '-id',
        }];

        return [200, response];
      });

    $httpBackend.whenGET(HuronConfig.getCmiUrl() + '/voice/customers/1/internalnumberpools?directorynumber=&order=pattern').respond([{
      pattern: '4000',
      uuid: '3f51ef5b-584f-42db-9ad8-8810b5e9e9ea',
    }]);

    // CMI assignment will fail when there is any bad number in the list
    $httpBackend.when('PUT', HuronConfig.getCmiV2Url() + '/customers/1/features/autoattendants/2/numbers').respond(function (method, url, data) {
      if (JSON.stringify(data).indexOf('bad') > -1) {
        return [500, 'bad'];
      } else {
        return [200, 'good'];
      }
    });

    // By default CMI will just return happy code
    url = HuronConfig.getCmiV2Url() + '/customers/' + Authinfo.getOrgId() + '/features/autoattendants';
    cmiAAAsignmentURL = url + '/' + '2' + '/numbers';
    $httpBackend.whenGET(cmiAAAsignmentURL).respond(cmiAAAsignments);

    aaModel.aaRecordUUID = '2';

    var rawCeInfo2 = {
      assignedResources: [{
        id: '00097a86-45ef-44a7-aa78-6d32a0ca1d3b',
        type: 'directoryNumber',
        trigger: 'incomingCall',
        number: '999999',
        uuid: '00097a86-45ef-44a7-aa78-6d32a0ca1d3b',
      }, {
        id: '00097a86-45ef-44a7-aa78-6d32a0ca1d3d',
        type: 'externalNumber',
        trigger: 'incomingCall',
        number: '1190',
        uuid: '00097a86-45ef-44a7-aa78-6d32a0ca1d3c',
      }, {
        id: '00097a86-45ef-44a7-aa78-6d32a0ca1d3d',
        type: 'externalNumber',
        trigger: 'incomingCall',
        number: '+12068551179',
        uuid: '00097a86-45ef-44a7-aa78-6d32a0ca1d3d',
      }, {
        id: '00097a86-45ef-44a7-aa78-6d32a0ca1d3d',
        type: 'externalNumber',
        trigger: 'incomingCall',
        number: '+12068551179',
        uuid: '',
      }],
    };

    aaUiModel.ceInfo = ce2CeInfo(rawCeInfo2);

    $httpBackend.whenGET(HuronConfig.getCmiUrl() + '/voice/customers/1/internalnumberpools/00097a86-45ef-44a7-aa78-6d32a0ca1d3b').respond({
      pattern: '999990',
      uuid: '00097a86-45ef-44a7-aa78-6d32a0ca1d3b',
    });

    $httpBackend.whenGET(HuronConfig.getCmiUrl() + '/voice/customers/1/externalnumberpools/00097a86-45ef-44a7-aa78-6d32a0ca1d3d').respond({
      pattern: 'testNum',
      uuid: '00097a86-45ef-44a7-aa78-6d32a0ca1d3d',
    });

    control = $controller;
  }));

  afterEach(function () {
    $rootScope = null;
    $q = null;
    $scope = null;
    $httpBackend = null;
    HuronConfig = null;
    AAModelService = null;
    AAUiModelService = null;
    AANumberAssignmentService = null;
    AutoAttendantCeInfoModelService = null;
    Authinfo = null;
    AACommonService = null;

    AANotificationService = null;
    control = null;
  });
  describe('checkResourceNumbers', function () {
    it('should map an E164 phone number correctly', function () {
      var c = control('AABuilderNumbersCtrl', {
        $scope: $scope,
      });
      $scope.$apply();

      c.ui.ceInfo = ce2CeInfo(rawCeInfo);

      c.loadNums();
      $httpBackend.flush();
      $scope.$apply();

      expect(c.availablePhoneNums[0].label).toEqual('(900) 545-1234');

      expect(c.numberTypeList[c.ui.ceInfo.resources[0].number]).toEqual('directoryNumber');

      expect(c.numberTypeList[c.ui.ceInfo.resources[1].number]).toEqual('externalNumber');
    });
    it('should query and/or not query phone numbers', function () {
      var c = control('AABuilderNumbersCtrl', {
        $scope: $scope,
      });
      $scope.$apply();

      c.ui.ceInfo = ce2CeInfo(rawCeInfo);

      c.loadNums('dummy query');
      $httpBackend.flush();
      $scope.$apply();
      expect(c.availablePhoneNums.length).toEqual(6);

      c.availablePhoneNums = [];
      c.loadNums('dummy query');
      expect(c.availablePhoneNums.length).toEqual(0);
    });
  });

  describe('addNumber', function () {
    var controller;
    var isValidSpy;

    beforeEach(function () {
      controller = control('AABuilderNumbersCtrl', {
        $scope: $scope,
      });
      $scope.$apply();

      controller.numberTypeList[2064261234] = 'externalNumber';
      controller.numberTypeList[1234] = 'directoryNumber';

      aaModel.ceInfos = [];
      aaModel.aaRecords = [];
      aaModel.aaRecord = rawCeInfo;

      controller.name = rawCeInfo.callExperienceName;
      controller.ui = {};
      controller.ui.ceInfo = ce2CeInfo(rawCeInfo);
      isValidSpy = jasmine.createSpy('setIsValid');
      AACommonService.setIsValid = isValidSpy;
    });

    it('should move an external phone number from available to selected successfully', function () {
      var resource;

      aaModel.ceInfos.push({
        name: rawCeInfo.callExperienceName,
      });
      var phoneNumber = { value: '2064261234' };

      controller.addNumber(phoneNumber);

      $scope.$apply();
      resource = _.last(controller.ui.ceInfo.resources);

      expect(resource.number).toEqual(phoneNumber.value);
    });


    it('should sort combination of internal/external numbers with internals sorting last', function () {
      aaModel.ceInfos.push({
        name: rawCeInfo.callExperienceName,
      });

      controller.numberTypeList['2064261234'] = 'externalNumber';
      controller.addNumber({
        value: '2064261234',
      });

      controller.numberTypeList['1234'] = 'directoryNumber';
      controller.numberTypeList['1234567'] = 'directoryNumber';
      controller.numberTypeList['999999'] = 'directoryNumber';
      controller.numberTypeList['2065431111'] = 'externalNumber';

      // add internal
      controller.addNumber({
        value: '1234',
      });

      $httpBackend.flush();
      $scope.$apply();

      // add another
      controller.addNumber({
        value: '1234567',
      });
      $httpBackend.flush();
      $scope.$apply();

      // add another
      controller.addNumber({
        value: '2065431111',
      });
      $httpBackend.flush();
      $scope.$apply();

      var resources = controller.ui.ceInfo.getResources();

      // top line header is used for preferred, e164 should be on top.
      expect(resources[0].number).toEqual('12068551179');

      // and the +12068551179 should have sorted first after that
      expect(resources[1].number).toEqual('+12068551179');

      // and the 2064261234 should have sorted first after that
      expect(resources[2].number).toEqual('2064261234');

      // and the 2065431111 should have sorted first after that even though added last
      expect(resources[3].number).toEqual('2065431111');

      // and the internal 999999should have sorted last - special case for internal
      expect(resources[resources.length - 1].number).toEqual('999999');

      expect(isValidSpy.calls.count()).toEqual(8);
      expect(isValidSpy.calls.allArgs()).toEqual([['numbersCtrl1', false], ['numbersCtrl1', false], ['numbersCtrl1', true], ['numbersCtrl1', true], ['numbersCtrl1', false], ['numbersCtrl1', true], ['numbersCtrl1', false], ['numbersCtrl1', true]]);
    });

    it('should report error when cannot format extension on assignment', function () {
      aaModel.ceInfos.push({
        name: rawCeInfo.callExperienceName,
      });
      controller.availablePhoneNums[0] = {
        label: '1234',
        value: '1234',
      };

      errorSpy = jasmine.createSpy('error');
      AANotificationService.errorResponse = errorSpy;

      spyOn(AANumberAssignmentService, 'formatAAExtensionResourcesBasedOnCMI').and.callFake(function () {
        return $q.reject({
          statusText: 'server error',
          status: 500,
        });
      });

      controller.addNumber({
        value: '1234',
      });

      $httpBackend.flush();

      expect(errorSpy).toHaveBeenCalled();
      expect(isValidSpy.calls.count()).toEqual(2);
      expect(isValidSpy.calls.allArgs()).toEqual([['numbersCtrl1', false], ['numbersCtrl1', true]]);
    });
  });

  describe('removeNumber', function () {
    var controller;

    beforeEach(function () {
      spyOn(AANumberAssignmentService, 'formatAAE164ResourcesBasedOnCMI').and.callFake(function () {
        return $q.resolve('{}');
      });

      aaModel.ceInfos = [];
      aaModel.aaRecords = [];
      aaModel.aaRecord = aCe;

      controller = control('AABuilderNumbersCtrl', {
        $scope: $scope,
      });
      $scope.$apply();

      // controller.name = rawCeInfo.callExperienceName;
      controller.ui = {};
      controller.ui.ceInfo = ce2CeInfo(rawCeInfo);
    });

    it('should move a phone number to available successfully', function () {
      spyOn(AANumberAssignmentService, 'setAANumberAssignment').and.callFake(function () {
        return $q.resolve('{}');
      });

      var orig_length;

      var resources = controller.ui.ceInfo.getResources();
      orig_length = resources.length;

      controller.removeNumber(resources[0]);
      $scope.$apply();

      // we should have 3 numbers now
      expect(AACommonService.isFormDirty()).toBe(true);


      expect(resources.length).toEqual(orig_length - 1);
    });

    it('should not move a bad or missing phone number to available', function () {
      controller.availablePhoneNums = [];
      var resource = AutoAttendantCeInfoModelService.newResource();
      resource.setType(aCe.assignedResources.type);
      resource.setId('bad');
      resource.setNumber('');
      controller.removeNumber(resource);

      $scope.$apply();

      expect(controller.availablePhoneNums.length).toEqual(0);
    });

    it('should warn when fail to assign to CMI on remove', function () {
      spyOn(AANumberAssignmentService, 'setAANumberAssignment').and.callFake(function () {
        return $q.reject('{}');
      });


      errorSpy = jasmine.createSpy('error');
      AANotificationService.errorResponse = errorSpy;

      var resource = AutoAttendantCeInfoModelService.newResource();
      resource.setType(aCe.assignedResources.type);
      resource.setId('bad');
      resource.setNumber('bad');

      var resources = controller.ui.ceInfo.getResources();

      resources.push(resource);
      controller.removeNumber(resources[0]);
      $scope.$apply();
      expect(AACommonService.isValid()).toBe(false);
      expect(errorSpy).toHaveBeenCalled();
    });
  });

  describe('getExternalNumbers', function () {
    var controller;

    beforeEach(function () {
      controller = control('AABuilderNumbersCtrl', {
        $scope: $scope,
      });
      $scope.$apply();

      aaModel.ceInfos = [];
      aaModel.aaRecords = cesWithNumber;
      aaModel.aaRecord = aCe;

      // controller.name = rawCeInfo.callExperienceName;
      controller.ui = {};
      controller.ui.ceInfo = ce2CeInfo(rawCeInfo);
    });

    it('should load external numbers', function () {
      controller.getExternalNumbers();

      $httpBackend.flush();

      $scope.$apply();

      expect(controller.availablePhoneNums.length > 0);
    });
  });

  describe('getInternalNumbers', function () {
    var controller;

    beforeEach(function () {
      controller = control('AABuilderNumbersCtrl', {
        $scope: $scope,
      });
      $scope.$apply();

      aaModel.ceInfos = [];
      aaModel.aaRecords = cesWithNumber;
      aaModel.aaRecord = aCe;

      // controller.name = rawCeInfo.callExperienceName;
      controller.ui = {};
      controller.ui.ceInfo = ce2CeInfo(rawCeInfo);
    });

    it('should load internal numbers', function () {
      controller.getInternalNumbers();

      $httpBackend.flush();

      $scope.$apply();

      expect(controller.availablePhoneNums.length > 0);
    });
  });

  describe('warnOnAssignedNumberDiscrepancies', function () {
    var controller;
    var errorResponseSpy;

    beforeEach(function () {
      controller = control('AABuilderNumbersCtrl', {
        $scope: $scope,
      });
      $scope.$apply();

      aaModel.ceInfos = [];
      aaModel.aaRecords = cesWithNumber;
      aaModel.aaRecord = aCe;

      // controller.name = rawCeInfo.callExperienceName;
      controller.ui = {};
      controller.ui.ceInfo = ce2CeInfo(rawCeInfo);

      errorSpy = jasmine.createSpy('error');
      AANotificationService.error = errorSpy;
    });

    it('should not warn when assignments return no error', function () {
      spyOn(AANumberAssignmentService, 'checkAANumberAssignments').and.callFake(function () {
        return $q.resolve('{}');
      });

      controller.warnOnAssignedNumberDiscrepancies();

      expect(errorSpy).not.toHaveBeenCalled();
    });

    it('should warn when assignments return error and we have numbers in CE', function () {
      spyOn(AANumberAssignmentService, 'checkAANumberAssignments').and.callFake(function (customerId, cesId, resources, onlyResources, onlyCMI) {
        onlyCMI.push('5551212');
        onlyResources.push('5552323');
        return $q.resolve('{}');
      });

      var resource = AutoAttendantCeInfoModelService.newResource();
      resource.setType(aCe.assignedResources.type);
      resource.setId('1234567');
      resource.setNumber('1234567');

      var resources = controller.ui.ceInfo.getResources();

      resources.push(resource);

      controller.warnOnAssignedNumberDiscrepancies();
      $scope.$apply();

      expect(errorSpy).toHaveBeenCalled();
    });

    it('should warn when CMI call fails', function () {
      errorResponseSpy = jasmine.createSpy('errorReponse');
      AANotificationService.errorResponse = errorResponseSpy;

      spyOn(AANumberAssignmentService, 'checkAANumberAssignments').and.returnValue($q.reject('bad'));

      controller.warnOnAssignedNumberDiscrepancies();
      $scope.$apply();

      expect(errorResponseSpy).toHaveBeenCalled();
      expect(AACommonService.isValid()).toBe(false);
    });
  });

  describe('UUID ', function () {
    var controller;

    beforeEach(function () {
      aaModel.ceInfos = [];
      aaModel.aaRecords = [];
      aaModel.aaRecord = aCe;
    });

    it('should substitute new phone number based on uuid', function () {
      var fromCMI = [{ number: '+12068551179', uuid: '00097a86-45ef-44a7-aa78-6d32a0ca1d3d' }];

      spyOn(AANumberAssignmentService, 'getAANumberAssignments').and.callFake(function () {
        return $q.resolve(fromCMI);
      });

      controller = control('AABuilderNumbersCtrl', {
        $scope: $scope,
      });
      $scope.$apply();
      expect(controller.ui.ceInfo.resources[2].getNumber()).toEqual('+12068551179');
    });

    it('should set the uuid based on phone number', function () {
      var fromCMI = [{ number: '12068551179', uuid: '00097a86-45ef-44a7-aa78-6d32a0ca1d3d' }];

      spyOn(AANumberAssignmentService, 'getAANumberAssignments').and.callFake(function () {
        return $q.resolve(fromCMI);
      });

      controller = control('AABuilderNumbersCtrl', {
        $scope: $scope,
      });

      $scope.$apply();

      expect(controller.ui.ceInfo.resources[2].getUUID()).toEqual('00097a86-45ef-44a7-aa78-6d32a0ca1d3d');
    });

    it('should set the uuid based on phone number with plus', function () {
      var fromCMI = [{ number: '+12068551179', uuid: '00097a86-45ef-44a7-aa78-6d32a0ca1d3d' }];

      spyOn(AANumberAssignmentService, 'getAANumberAssignments').and.callFake(function () {
        return $q.resolve(fromCMI);
      });

      controller = control('AABuilderNumbersCtrl', {
        $scope: $scope,
      });

      $scope.$apply();

      expect(controller.ui.ceInfo.resources[2].getUUID()).toEqual('00097a86-45ef-44a7-aa78-6d32a0ca1d3d');
    });

    it('should set the uuid when original uuid not found', function () {
      var fromCMI = [{ number: '12068551179', uuid: '00097a86-45ef-44a7-aa78-6d32a0ca1d3d' }];

      spyOn(AANumberAssignmentService, 'getAANumberAssignments').and.callFake(function () {
        return $q.resolve(fromCMI);
      });

      controller = control('AABuilderNumbersCtrl', {
        $scope: $scope,
      });

      $scope.$apply();

      expect(controller.ui.ceInfo.resources[2].getUUID()).toEqual('00097a86-45ef-44a7-aa78-6d32a0ca1d3d');
    });
  });
});
