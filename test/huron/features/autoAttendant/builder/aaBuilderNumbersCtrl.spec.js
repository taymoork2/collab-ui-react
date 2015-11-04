'use strict';

describe('Controller: AABuilderNumbersCtrl', function () {
  var handler;
  var controller, Notification, AutoAttendantCeService, ExternalNumberPoolService;
  var AAModelService, AutoAttendantCeInfoModelService, Authinfo, AAUiModelService;
  var $rootScope, $scope, $q, deferred, $translate, $stateParams;
  var $httpBackend, HuronConfig, Config;

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
    }]
  };

  var aaModel = {};

  var listCesSpy;
  var saveCeSpy;

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
    _AAModelService_, _ExternalNumberPoolService_, _Authinfo_, _Notification_) {
    $rootScope = _$rootScope_;
    $q = _$q_;
    $scope = $rootScope;
    deferred = $q.defer();
    ExternalNumberPoolService = _ExternalNumberPoolService_;
    $httpBackend = _$httpBackend_;
    HuronConfig = _HuronConfig_;
    Config = _Config_;

    AAUiModelService = _AAUiModelService_;

    AAModelService = _AAModelService_;
    AutoAttendantCeInfoModelService = _AutoAttendantCeInfoModelService_;
    Authinfo = _Authinfo_;

    Notification = _Notification_;

    spyOn(AAModelService, 'getAAModel').and.returnValue(aaModel);

    $httpBackend.whenGET(HuronConfig.getCmiUrl() + '/voice/customers/1/externalnumberpools?order=pattern').respond(200, [{
      'pattern': '+9999999991',
      'uuid': '9999999991-id'
    }, {
      'pattern': '+8888888881',
      'uuid': '8888888881-id'
    }]);

    // listCesSpy = spyOn(AutoAttendantCeService, 'listCes').and.returnValue($q.when(angular.copy(ces)));

    controller = $controller('AABuilderNumbersCtrl', {
      $scope: $scope
    });
    $scope.$apply();
  }));

  afterEach(function () {

  });

  describe('addNumber', function () {

    beforeEach(function () {
      controller.availablePhoneNums[0] = "1(206)426-1234";

      aaModel.ceInfos = [];
      aaModel.aaRecords = [];
      aaModel.aaRecord = aCe;

      controller.name = rawCeInfo.callExperienceName;
      controller.ui = {};
      controller.ui.ceInfo = ce2CeInfo(rawCeInfo);

    });

    it('should move a phone number from available to selected successfully', function () {
      aaModel.ceInfos.push({
        name: rawCeInfo.callExperienceName
      });

      controller.addNumber("1(206)426-1234");

      $scope.$apply();

      var resources = controller.ui.ceInfo.getResources();

      expect(controller.availablePhoneNums.length === 0);

    });

  });

  describe('deleteAAResource', function () {

    beforeEach(function () {

      aaModel.ceInfos = [];
      aaModel.aaRecords = [];
      aaModel.aaRecord = aCe;

      // controller.name = rawCeInfo.callExperienceName;
      controller.ui = {};
      controller.ui.ceInfo = ce2CeInfo(rawCeInfo);
    });

    it('should move a phone number from available to selected successfully', function () {
      var index;

      controller.deleteAAResource(rawCeInfo.assignedResources[0].number);

      $scope.$apply();

      expect(controller.availablePhoneNums.length).toEqual(1);

      index = controller.availablePhoneNums.indexOf(rawCeInfo.assignedResources[0].number);

      expect(index).toEqual(0);

    });

  });
  describe('filter', function () {

    beforeEach(function () {

      aaModel.ceInfos = [];
      aaModel.aaRecords = [];
      aaModel.aaRecord = aCe;

      // controller.name = rawCeInfo.callExperienceName;
      controller.ui = {};
      controller.ui.ceInfo = ce2CeInfo(rawCeInfo);

    });

    it('should format a phone number successfully', function () {
      var number;

      number = controller.filter("12064261234");

      $scope.$apply();

      expect(number).toEqual("1 (206) 426-1234");

      number = controller.filter("2064261234");

      $scope.$apply();

      expect(number).toEqual("(206) 426-1234");

      number = controller.filter("206");

      $scope.$apply();

      expect(number).toEqual("206");
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

    it('should load external numbers', function () {

      var ret = controller.getExternalNumbers();

      $httpBackend.flush();

      $scope.$apply();

      expect(controller.availablePhoneNums.length > 0);

    });

  });

});
