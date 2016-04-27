'use strict';

describe('Controller: AABuilderNumbersCtrl', function () {
  var handler;
  var controller, AANotificationService, AutoAttendantCeService, ExternalNumberPoolService;
  var AAModelService, AutoAttendantCeInfoModelService, Authinfo, AAUiModelService, AANumberAssignmentService, AACommonService;
  var $rootScope, $scope, $q, deferred, $translate, $stateParams;
  var $httpBackend, HuronConfig, Config;
  var url, cmiAAAsignmentURL;

  var ces = getJSONFixture('huron/json/autoAttendant/callExperiences.json');
  var cesWithNumber = getJSONFixture('huron/json/autoAttendant/callExperiencesWithNumber.json');
  var aCe = getJSONFixture('huron/json/autoAttendant/aCallExperience.json');
  var rawCeInfo = {
    "callExperienceName": "AAA2",
    "callExperienceURL": "https://ces.hitest.huron-dev.com/api/v1/customers/6662df48-b367-4c1e-9c3c-aa408aaa79a1/callExperiences/c16a6027-caef-4429-b3af-9d61ddc7964b",
    "assignedResources": [{
      "id": "00097a86-45ef-44a7-aa78-6d32a0ca1d3b",
      "type": "directoryNumber",
      "trigger": "incomingCall",
      "number": "999999"
    }, {
      "id": "00097a86-45ef-44a7-aa78-6d32a0ca1d3c",
      "type": "directoryNumber",
      "trigger": "incomingCall",
      "number": "12068551179"
    }]
  };

  var cmiAAAssignedNumbers = [{
    "number": "2578",
    "type": "NUMBER_FORMAT_EXTENSION",
    "uuid": "29d70a54-cf0a-4279-ad75-09116eedb7a7"
  }, {
    "number": "8002578",
    "type": "NUMBER_FORMAT_ENTERPRISE_LINE",
    "uuid": "29d70b54-cf0a-4279-ad75-09116eedb7a7"
  }];

  var cmiAAAsignment = {
    "numbers": cmiAAAssignedNumbers,
    "url": "https://cmi.huron-int.com/api/v2/customers/3338d491-d6ca-4786-82ed-cbe9efb02ad2/features/autoattendants/23a42558-6485-4dab-9505-704b6204410c/numbers"
  };

  var cmiAAAsignments = [cmiAAAsignment];

  var aaModel = {};

  var listCesSpy;
  var saveCeSpy;

  var errorSpy;

  function ce2CeInfo(rawCeInfo) {
    var _ceInfo = AutoAttendantCeInfoModelService.newCeInfo();
    for (var j = 0; j < rawCeInfo.assignedResources.length; j++) {
      var resource = AutoAttendantCeInfoModelService.newResource();
      resource.setId(rawCeInfo.assignedResources[j].id);
      resource.setTrigger(rawCeInfo.assignedResources[j].trigger);
      resource.setType(rawCeInfo.assignedResources[j].type);
      if (angular.isDefined(rawCeInfo.assignedResources[j].number)) {
        resource.setNumber(rawCeInfo.assignedResources[j].number);
      }
      _ceInfo.addResource(resource);
    }
    _ceInfo.setName(rawCeInfo.callExperienceName);
    _ceInfo.setCeUrl(rawCeInfo.callExperienceURL);
    return _ceInfo;
  }

  beforeEach(module('uc.autoattendant'));
  beforeEach(module('Huron'));

  var authInfo = {
    getOrgId: sinon.stub().returns('1'),
    getOrgName: sinon.stub().returns('awesomeco')
  };

  beforeEach(module(function ($provide) {
    $provide.value("Authinfo", authInfo);
  }));

  beforeEach(inject(function (_$rootScope_, _$q_, $controller, _$httpBackend_, _HuronConfig_, _Config_, _AAUiModelService_, _AutoAttendantCeInfoModelService_,
    _AAModelService_, _AANumberAssignmentService_, _AACommonService_, _ExternalNumberPoolService_, _Authinfo_, _Notification_, _AANotificationService_) {
    $rootScope = _$rootScope_;
    $q = _$q_;
    $scope = $rootScope;
    deferred = $q.defer();
    ExternalNumberPoolService = _ExternalNumberPoolService_;
    $httpBackend = _$httpBackend_;
    HuronConfig = _HuronConfig_;
    Config = _Config_;

    AAUiModelService = _AAUiModelService_;
    AANumberAssignmentService = _AANumberAssignmentService_;
    AAModelService = _AAModelService_;
    AutoAttendantCeInfoModelService = _AutoAttendantCeInfoModelService_;
    Authinfo = _Authinfo_;
    AACommonService = _AACommonService_;

    AANotificationService = _AANotificationService_;

    spyOn(AAModelService, 'getAAModel').and.returnValue(aaModel);

    $httpBackend.whenGET(HuronConfig.getCmiUrl() + '/voice/customers/1/externalnumberpools?directorynumber=&order=pattern').respond(200, [{
      'pattern': '+9999999991',
      'uuid': '9999999991-id'
    }, {
      'pattern': '+8888888881',
      'uuid': '8888888881-id'
    }]);

    // for an external number query, return the number formatted with a +
    var externalNumberQueryUri = /\/externalnumberpools\?directorynumber=\&order=pattern\&pattern=(.+)/;
    $httpBackend.whenGET(externalNumberQueryUri)
      .respond(function (method, url, data, headers) {

        var pattern = decodeURI(url).match(new RegExp(externalNumberQueryUri))[1];

        var response = [{
          'pattern': '+' + pattern.replace(/\D/g, ''),
          'uuid': pattern.replace(/\D/g, '') + '-id'
        }];

        return [200, response];
      });

    $httpBackend.whenGET(HuronConfig.getCmiUrl() + '/voice/customers/1/internalnumberpools?directorynumber=&order=pattern').respond([{
      "pattern": "4000",
      "uuid": "3f51ef5b-584f-42db-9ad8-8810b5e9e9ea"
    }]);

    // CMI assignment will fail when there is any bad number in the list
    $httpBackend.when('PUT', HuronConfig.getCmiV2Url() + '/customers/1/features/autoattendants/2/numbers').respond(function (method, url, data, headers) {
      if (JSON.stringify(data).indexOf("bad") > -1) {
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

    controller = $controller('AABuilderNumbersCtrl', {
      $scope: $scope
    });
    $scope.$apply();
  }));

  afterEach(function () {

  });
  describe('checkResourceNumbers', function () {

    it('should map an E164 phone number correctly', function () {

      controller.ui.ceInfo = ce2CeInfo(rawCeInfo);

      controller.loadNums();

      $scope.$apply();

      expect(controller.numberTypeList[controller.ui.ceInfo.resources[0].number]).toEqual("directoryNumber");

      expect(controller.numberTypeList[controller.ui.ceInfo.resources[1].number]).toEqual("externalNumber");

    });

  });

  describe('addNumber', function () {

    beforeEach(function () {

      controller.numberTypeList[2064261234] = "externalNumber";
      controller.numberTypeList[1234] = "directoryNumber";

      aaModel.ceInfos = [];
      aaModel.aaRecords = [];
      aaModel.aaRecord = rawCeInfo;

      controller.name = rawCeInfo.callExperienceName;
      controller.ui = {};
      controller.ui.ceInfo = ce2CeInfo(rawCeInfo);

    });

    it('should move an external phone number from available to selected successfully', function () {
      aaModel.ceInfos.push({
        name: rawCeInfo.callExperienceName
      });

      controller.availablePhoneNums[0] = {
        label: "2064261234",
        value: "2064261234"
      };

      controller.addNumber("2064261234");

      $scope.$apply();

      expect(controller.availablePhoneNums.length === 0);

    });

    it('should remove an internal phone number from available successfully', function () {
      aaModel.ceInfos.push({
        name: rawCeInfo.callExperienceName
      });

      controller.availablePhoneNums[0] = {
        label: "1234",
        value: "1234"
      };

      controller.addNumber("1234");

      $scope.$apply();

      var resources = controller.ui.ceInfo.getResources();

      expect(controller.availablePhoneNums.length === 0);

    });

    it('should sort combination of internal/external numbers with internals sorting last', function () {

      aaModel.ceInfos.push({
        name: rawCeInfo.callExperienceName
      });

      // start out with 2 external available numbers, with an internal in-between, that are not sorted
      controller.availablePhoneNums[0] = {
        label: "2064261234",
        value: "2064261234"
      };
      controller.numberTypeList["2064261234"] = "externalNumber";

      controller.availablePhoneNums[1] = {
        label: "1234",
        value: "1234"
      };
      controller.numberTypeList["1234"] = "directoryNumber";

      controller.availablePhoneNums[2] = {
        label: "1234567",
        value: "1234567"
      };
      controller.numberTypeList["1234567"] = "externalNumber";

      // add a number
      controller.addNumber("2064261234");
      $httpBackend.flush();
      $scope.$apply();

      // and we should be down to 2 available now
      expect(controller.availablePhoneNums.length === 2);

      // add internal
      controller.addNumber("1234");
      $httpBackend.flush();
      $scope.$apply();

      // we should be down to 1 available
      expect(controller.availablePhoneNums.length === 1);

      // add another
      controller.addNumber("1234567");
      $httpBackend.flush();
      $scope.$apply();

      // we should be down to 0 available
      expect(controller.availablePhoneNums.length === 0);

      var resources = controller.ui.ceInfo.getResources();

      // top line header is used for preferred, e164 should be on top.
      expect(resources[0].number).toEqual("12068551179");

      // and the 1234567 should have sorted first after that - even though we added it last
      expect(resources[1].number).toEqual("1234567");

      // and the internal 1234 should have sorted last - special case for internal
      expect(resources[resources.length - 1].number).toEqual("1234");

    });

    it('should not move a bad or missing phone number from available', function () {
      aaModel.ceInfos.push({
        name: rawCeInfo.callExperienceName
      });

      controller.availablePhoneNums[0] = {
        label: "2064261234",
        value: "2064261234"
      };
      controller.availablePhoneNums[1] = {
        label: "1234",
        value: "1234"
      };

      controller.addNumber('');
      controller.addNumber('bogus');

      $scope.$apply();

      var resources = controller.ui.ceInfo.getResources();

      expect(controller.availablePhoneNums.length === 2);

    });

    it('should not move a number that fails to assign in CMI', function () {
      aaModel.ceInfos.push({
        name: rawCeInfo.callExperienceName
      });

      controller.availablePhoneNums[0] = {
        label: "bad",
        value: "bad"
      };

      controller.addNumber('bad');

      $httpBackend.flush();

      $scope.$apply();

      var resources = controller.ui.ceInfo.getResources();

      expect(resources.length === 1);

    });

    it('should report error when cannot format extension on assignment', function () {
      aaModel.ceInfos.push({
        name: rawCeInfo.callExperienceName
      });

      controller.availablePhoneNums[0] = {
        label: "1234",
        value: "1234"
      };

      errorSpy = jasmine.createSpy('error');
      AANotificationService.errorResponse = errorSpy;

      spyOn(AANumberAssignmentService, 'formatAAExtensionResourcesBasedOnCMI').and.returnValue($q.reject({
        statusText: "server error",
        status: 500
      }));

      controller.addNumber("1234");

      $scope.$apply();
      $httpBackend.flush();

      expect(errorSpy).toHaveBeenCalled();

    });

  });

  describe('removeNumber', function () {

    beforeEach(function () {

      aaModel.ceInfos = [];
      aaModel.aaRecords = [];
      aaModel.aaRecord = aCe;

      // controller.name = rawCeInfo.callExperienceName;
      controller.ui = {};
      controller.ui.ceInfo = ce2CeInfo(rawCeInfo);
    });

    it('should move a phone number to available successfully', function () {

      // start out as 2 available numbers that are not sorted
      controller.availablePhoneNums[0] = {
        label: "2345678",
        value: "2345678"
      };
      controller.availablePhoneNums[1] = {
        label: "1234567",
        value: "1234567"
      };

      controller.removeNumber(rawCeInfo.assignedResources[0].number);
      $scope.$apply();

      // we should have 3 numbers now
      expect(controller.availablePhoneNums.length).toEqual(3);
      // and the 1234567 should have sorted first
      expect(controller.availablePhoneNums[0].value).toEqual("1234567");
      $httpBackend.flush();
      expect(AACommonService.isFormDirty()).toBe(true);
      var numobj = controller.availablePhoneNums.filter(function (obj) {
        return obj.value == rawCeInfo.assignedResources[0].number;
      });

      expect(numobj).toBeDefined();

    });

    it('should not move a bad or missing phone number to available', function () {
      var index;

      controller.availablePhoneNums = [];

      controller.removeNumber('');

      $scope.$apply();

      expect(controller.availablePhoneNums.length).toEqual(0);

    });

    it('should warn when fail to assign to CMI on remove', function () {

      errorSpy = jasmine.createSpy('error');
      AANotificationService.errorResponse = errorSpy;

      var resource = AutoAttendantCeInfoModelService.newResource();
      resource.setType(aCe.assignedResources.type);
      resource.setId("bad");
      resource.setNumber("bad");

      var resources = controller.ui.ceInfo.getResources();

      resources.push(resource);
      controller.removeNumber(rawCeInfo.assignedResources[0].number);
      $scope.$apply();
      $httpBackend.flush();
      expect(AACommonService.isValid()).toBe(false);
      expect(errorSpy).toHaveBeenCalled();

    });
  });

  describe('getDupeNumberAnyAA', function () {

    beforeEach(function () {

      aaModel.ceInfos = [];
      aaModel.aaRecords = cesWithNumber;
      aaModel.aaRecord = aCe;

      // controller.name = rawCeInfo.callExperienceName;
      controller.ui = {};
      controller.ui.ceInfo = ce2CeInfo(rawCeInfo);

    });

    it('should find a duplicate phone number', function () {

      var ret = controller.getDupeNumberAnyAA(cesWithNumber[0].assignedResources[0].number);

      $scope.$apply();

      expect(ret).toEqual(true);

    });

    it('should not find a duplicate phone number', function () {

      var ret = controller.getDupeNumberAnyAA("1234567");

      $scope.$apply();

      expect(ret).toEqual(false);

    });

  });

  describe('getExternalNumbers', function () {

    beforeEach(function () {

      aaModel.ceInfos = [];
      aaModel.aaRecords = cesWithNumber;
      aaModel.aaRecord = aCe;

      // controller.name = rawCeInfo.callExperienceName;
      controller.ui = {};
      controller.ui.ceInfo = ce2CeInfo(rawCeInfo);

    });

    it('should load external numbers', function () {

      var ret = controller.getExternalNumbers();

      $httpBackend.flush();

      $scope.$apply();

      expect(controller.availablePhoneNums.length > 0);

    });

  });

  describe('getInternalNumbers', function () {

    beforeEach(function () {

      aaModel.ceInfos = [];
      aaModel.aaRecords = cesWithNumber;
      aaModel.aaRecord = aCe;

      // controller.name = rawCeInfo.callExperienceName;
      controller.ui = {};
      controller.ui.ceInfo = ce2CeInfo(rawCeInfo);

    });

    it('should load internal numbers', function () {

      var ret = controller.getInternalNumbers();

      $httpBackend.flush();

      $scope.$apply();

      expect(controller.availablePhoneNums.length > 0);

    });

  });

  describe('warnOnAssignedNumberDiscrepancies', function () {

    beforeEach(function () {

      aaModel.ceInfos = [];
      aaModel.aaRecords = cesWithNumber;
      aaModel.aaRecord = aCe;

      // controller.name = rawCeInfo.callExperienceName;
      controller.ui = {};
      controller.ui.ceInfo = ce2CeInfo(rawCeInfo);

      errorSpy = jasmine.createSpy('error');
      AANotificationService.errorResponse = errorSpy;

    });

    it('should not warn when assignments return no error', function () {

      spyOn(AANumberAssignmentService, 'checkAANumberAssignments').and.callFake(function (customerId, cesId, resources, onlyResources, onlyCMI) {
        onlyCMI = [];
        onlyResources = [];
        return $q.when("{}");
      });

      var ret = controller.warnOnAssignedNumberDiscrepancies();

      expect(errorSpy).not.toHaveBeenCalled();

    });

    it('should warn when assignments return error and we have numbers in CE', function () {

      spyOn(AANumberAssignmentService, 'checkAANumberAssignments').and.callFake(function (customerId, cesId, resources, onlyResources, onlyCMI) {
        onlyCMI.push('5551212');
        onlyResources.push('5552323');
        return $q.when("{}");
      });

      var resource = AutoAttendantCeInfoModelService.newResource();
      resource.setType(aCe.assignedResources.type);
      resource.setId("1234567");
      resource.setNumber("1234567");

      var resources = controller.ui.ceInfo.getResources();

      resources.push(resource);

      var ret = controller.warnOnAssignedNumberDiscrepancies();

      $httpBackend.flush();

      $scope.$apply();

      expect(errorSpy).toHaveBeenCalled();

    });

    it('should warn when CMI call fails', function () {

      spyOn(AANumberAssignmentService, 'checkAANumberAssignments').and.returnValue($q.reject("bad"));

      var ret = controller.warnOnAssignedNumberDiscrepancies();

      $httpBackend.flush();

      $scope.$apply();

      expect(errorSpy).toHaveBeenCalled();
      expect(AACommonService.isValid()).toBe(false);

    });

  });

});
