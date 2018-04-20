'use strict';

describe('Service: cbgService', function () {
  var cbgService, $httpBackend, UrlConfig;
  var groupId = 'ff8080815823e72c0158244952240022';
  var customerId = 'ff808081527ccb3f0152e39ec555010c';

  beforeEach(function () {
    this.preData = _.cloneDeep(getJSONFixture('gemini/common.json'));
  });

  beforeEach(angular.mock.module('Core'));
  beforeEach(angular.mock.module('Gemini'));
  beforeEach(inject(dependencies));

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
    cbgService = $httpBackend = UrlConfig = undefined;
  });

  function dependencies(_$httpBackend_, _cbgService_, _UrlConfig_) {
    UrlConfig = _UrlConfig_;
    cbgService = _cbgService_;
    $httpBackend = _$httpBackend_;
  }

  it('should return correct data in getOneCallbackGroup', function () {
    var url = UrlConfig.getGeminiUrl() + 'callbackgroup/customerId/' + customerId + '/groupId/' + groupId;
    $httpBackend.expectGET(url).respond(200, this.preData.getCurrentCallbackGroup);

    cbgService.getOneCallbackGroup(customerId, groupId).then(function (res) {
      var groupName = _.get(res, 'groupName');
      expect(groupName).toBe('CB_Atlas-Test1_Test-1125');
    });
    $httpBackend.flush();
  });

  it('should return correct response data when updateCallbackGroup', function () {
    var url = UrlConfig.getGeminiUrl() + 'callbackgroup';
    $httpBackend.expectPUT(url).respond(200, this.preData.common);

    cbgService.updateCallbackGroup({}).then(function (res) {
      var returnCode = _.get(res.content.data, 'returnCode');
      expect(returnCode).toEqual(0);
    });
    $httpBackend.flush();
  });

  it('should return correct response info when cancelCBSubmission', function () {
    var url = UrlConfig.getGeminiUrl() + 'callbackgroup/customerId/' + customerId + '/groupId/' + groupId + '/cancel';
    $httpBackend.expectPUT(url).respond(200, this.preData.common);

    cbgService.cancelCBSubmission(customerId, groupId).then(function (res) {
      var returnCode = _.get(res.content.data, 'returnCode');
      expect(returnCode).toEqual(0);
    });
    $httpBackend.flush();
  });

  it('should return correct response info when getCountries', function () {
    var url = UrlConfig.getGeminiUrl() + 'countries';
    $httpBackend.expectGET(url).respond(200, this.preData.getCountries);

    cbgService.getCountries().then(function (res) {
      expect(res.length).toBe(4);
    });
    $httpBackend.flush();
  });

  it('should return correct response info when postRequest', function () {
    var url = UrlConfig.getGeminiUrl() + 'callbackgroup/customerId/' + customerId;
    $httpBackend.expectPOST(url).respond(200, this.preData.common);

    cbgService.postRequest(customerId, {}).then(function (res) {
      var returnCode = _.get(res.content.data, 'returnCode');
      expect(returnCode).toEqual(0);
    });
    $httpBackend.flush();
  });

  it('should return correct response info when moveSite', function () {
    var url = UrlConfig.getGeminiUrl() + 'callbackgroup/movesite';
    $httpBackend.expectPUT(url).respond(200, this.preData.common);

    cbgService.moveSite({}).then(function (res) {
      var returnCode = _.get(res.content.data, 'returnCode');
      expect(returnCode).toEqual(0);
    });
    $httpBackend.flush();
  });

  it('should return correct response info when postNote', function () {
    var url = UrlConfig.getGeminiUrl() + 'notes';
    $httpBackend.expectPOST(url).respond(200, this.preData.common);

    cbgService.postNote({}).then(function (res) {
      var returnCode = _.get(res.content.data, 'returnCode');
      expect(returnCode).toEqual(0);
    });
    $httpBackend.flush();
  });

  it('should return correct response info when getHistories', function () {
    var url = UrlConfig.getGeminiUrl() + 'activityLogs';
    $httpBackend.expectPUT(url).respond(200, this.preData.getHistories);

    cbgService.getHistories().then(function (res) {
      expect(res.length).toBe(3);
    });
    $httpBackend.flush();
  });

  it('should return empty array when cbgsExportCSV', function () {
    var url = UrlConfig.getGeminiUrl() + 'callbackgroup/customerId/' + customerId;
    $httpBackend.expectGET(url).respond(200, []);

    cbgService.cbgsExportCSV(customerId).then(function (res) {
      expect(res.length).toEqual(1);
    });
    $httpBackend.flush();
  });

  it('should return correct data when cbgsExportCSV', function () {
    var url = UrlConfig.getGeminiUrl() + 'callbackgroup/customerId/' + customerId;
    $httpBackend.expectGET(url).respond(200, this.preData.getCallbackGroups);

    cbgService.cbgsExportCSV(customerId).then(function (res) {
      expect(res.length).toEqual(4);
    });
    $httpBackend.flush();
  });

  it('should return correct download URL', function () {
    var url = UrlConfig.getGeminiUrl() + 'files/templates/country_regions_template';
    expect(cbgService.getDownloadCountryUrl()).toBe(url);
  });
});
