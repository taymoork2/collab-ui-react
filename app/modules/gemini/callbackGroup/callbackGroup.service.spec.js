'use strict';

describe('Service: cbgService', function () {
  var cbgService, $httpBackend, UrlConfig, mockResponse;
  var groupId = 'ff8080815823e72c0158244952240022';
  var customerId = 'ff808081527ccb3f0152e39ec555010c';
  var preData = getJSONFixture('gemini/common.json');

  beforeEach(angular.mock.module('Core'));
  beforeEach(angular.mock.module('Gemini'));
  beforeEach(inject(dependencies));
  beforeEach(initSpies);

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
    cbgService = $httpBackend = UrlConfig = mockResponse = undefined;
  });
  afterAll(function () {
    preData = undefined;
  });

  function dependencies(_$httpBackend_, _cbgService_, _UrlConfig_) {
    UrlConfig = _UrlConfig_;
    cbgService = _cbgService_;
    $httpBackend = _$httpBackend_;
  }

  function initSpies() {
    mockResponse = preData.common;
  }

  it('should return correct data in getOneCallbackGroup', function () {
    mockResponse.content.data.body = preData.getCurrentCallbackGroup;
    var url = UrlConfig.getGeminiUrl() + 'callbackgroup/customerId/' + customerId + '/groupId/' + groupId;
    $httpBackend.expectGET(url).respond(200, mockResponse);

    cbgService.getOneCallbackGroup(customerId, groupId).then(function (res) {
      var groupName = _.get(res.content.data.body, 'groupName');
      expect(groupName).toBe('CB_Atlas-Test1_Test-1125');
    });
    $httpBackend.flush();
  });

  it('should return correct response data in updateCallbackGroup', function () {
    mockResponse.content.data.body = 'ff8080815708077601581a417ded1a1e';
    var url = UrlConfig.getGeminiUrl() + 'callbackgroup/';
    $httpBackend.expectPUT(url).respond(200, mockResponse);

    cbgService.updateCallbackGroup({}).then(function (res) {
      var returnCode = _.get(res.content.data, 'returnCode');
      expect(returnCode).toEqual(0);
    });
    $httpBackend.flush();
  });

  it('should return correct response info in updateCallbackGroupStatus when status is decline', function () {
    mockResponse.content.data.body = 'ff8080815708077601581a417ded1a1e';
    var url = UrlConfig.getGeminiUrl() + 'callbackgroup/customerId/' + customerId + '/groupId/' + groupId + '/decline';
    $httpBackend.expectPUT(url).respond(200, mockResponse);

    cbgService.updateCallbackGroupStatus(customerId, groupId, 'decline', {}).then(function (res) {
      expect(res.content.data.body).toBe('ff8080815708077601581a417ded1a1e');
    });
    $httpBackend.flush();
  });

  it('should return correct response info in updateCallbackGroupStatus when status is approve and data is null', function () {
    mockResponse.content.data.body = 'ff8080815708077601581a417ded1a1e';
    var url = UrlConfig.getGeminiUrl() + 'callbackgroup/customerId/' + customerId + '/groupId/' + groupId + '/status/approve';
    $httpBackend.expectPUT(url).respond(200, mockResponse);

    cbgService.updateCallbackGroupStatus(customerId, groupId, 'approve', '').then(function (res) {
      expect(res.content.data.body).toBe('ff8080815708077601581a417ded1a1e');
    });
    $httpBackend.flush();
  });

  it('should return correct response info in getCountries', function () {
    mockResponse = preData.getCountries;
    var url = UrlConfig.getGeminiUrl() + 'countries';
    $httpBackend.expectGET(url).respond(200, mockResponse);

    cbgService.getCountries().then(function (res) {
      expect(res.content.data.length).toBe(4);
    });
    $httpBackend.flush();
  });

  it('should return correct response info in postRequest', function () {
    var url = UrlConfig.getGeminiUrl() + 'callbackgroup/customerId/' + customerId;
    $httpBackend.expectPOST(url).respond(200, mockResponse);

    cbgService.postRequest(customerId, {}).then(function (res) {
      expect(res.content.health.status).toBe('OK');
    });
    $httpBackend.flush();
  });

  it('should return correct response info in moveSite', function () {
    var url = UrlConfig.getGeminiUrl() + 'callbackgroup/movesite';
    $httpBackend.expectPUT(url).respond(200, mockResponse);

    cbgService.moveSite({}).then(function (res) {
      expect(res.content.health.code).toBeDefined(200);
    });
    $httpBackend.flush();
  });

  it('should return correct response info in postNote', function () {
    var url = UrlConfig.getGeminiUrl() + 'activityLogs';
    $httpBackend.expectPOST(url).respond(200, mockResponse);

    cbgService.postNote({}).then(function (res) {
      expect(res.content.data.returnCode).toBe(0);
    });
    $httpBackend.flush();
  });

  it('should return correct response info in getNotes', function () {
    var url = UrlConfig.getGeminiUrl() + 'activityLogs/' + customerId + '/' + groupId + '/add_note';
    mockResponse.content.data.body = preData.getNotes;
    $httpBackend.expectGET(url).respond(200, mockResponse);

    cbgService.getNotes(customerId, groupId).then(function (res) {
      expect(res.content.data.body.length).toBe(2);
    });
    $httpBackend.flush();
  });

  it('should return correct response info in getHistories', function () {
    var url = UrlConfig.getGeminiUrl() + 'activityLogs/' + customerId + '/' + groupId + '/Callback%20Group';
    mockResponse.content.data.body = preData.getHistories;
    $httpBackend.expectGET(url).respond(200, mockResponse);

    cbgService.getHistories(customerId, groupId).then(function (res) {
      expect(res.content.data.body.length).toBe(3);
    });
    $httpBackend.flush();
  });

  it('should return empty array in cbgsExportCSV', function () {
    mockResponse.content.data.returnCode = 0;
    mockResponse.content.data.body = [];
    var url = UrlConfig.getGeminiUrl() + 'callbackgroup/customerId/' + customerId;
    $httpBackend.expectGET(url).respond(200, mockResponse);

    cbgService.cbgsExportCSV(customerId).then(function (res) {
      expect(res.length).toEqual(1);
    });
    $httpBackend.flush();
  });

  it('should return correct data in cbgsExportCSV', function () {
    mockResponse.content.data.returnCode = 0;
    mockResponse.content.data.body = preData.getCallbackGroups;
    var url = UrlConfig.getGeminiUrl() + 'callbackgroup/customerId/' + customerId;
    $httpBackend.expectGET(url).respond(200, mockResponse);

    cbgService.cbgsExportCSV(customerId).then(function (res) {
      expect(res.length).toEqual(4);
    });
    $httpBackend.flush();
  });
});
