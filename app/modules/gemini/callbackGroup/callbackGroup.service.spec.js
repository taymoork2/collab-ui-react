'use strict';

describe('Service: cbgService', function () {
  var cbgService, GmHttpService, $scope, $q, mockResponse;
  var groupId = 'ff8080815823e72c0158244952240022';
  var customerId = 'ff808081527ccb3f0152e39ec555010c';
  var preData = getJSONFixture('gemini/common.json');

  beforeEach(angular.mock.module('Core'));
  beforeEach(angular.mock.module('Gemini'));
  beforeEach(inject(dependencies));
  beforeEach(initSpies);

  afterEach(function () {
    cbgService = GmHttpService = $scope = $q = mockResponse = undefined;
  });

  afterAll(function () {
    preData = undefined;
  });

  function dependencies(_GmHttpService_, _$rootScope_, _$q_, _cbgService_) {
    cbgService = _cbgService_;
    GmHttpService = _GmHttpService_;
    $scope = _$rootScope_.$new();
    $q = _$q_;
  }

  function initSpies() {
    spyOn(GmHttpService, 'httpGet').and.returnValue($q.resolve());
    spyOn(GmHttpService, 'httpPost').and.returnValue($q.resolve());
    spyOn(GmHttpService, 'httpPut').and.returnValue($q.resolve());
    spyOn(cbgService, 'getCallbackGroups').and.returnValue($q.resolve());
    mockResponse = preData.common;
  }

  it('should return correct data in getOneCallbackGroup', function () {
    mockResponse.content.data.body = preData.getCurrentCallbackGroup;
    GmHttpService.httpGet.and.returnValue($q.resolve(mockResponse));

    cbgService.getOneCallbackGroup(customerId, groupId).then(function (res) {
      var groupName = _.get(res.content.data.body, 'groupName');
      expect(groupName).toBe('CB_Atlas-Test1_Test-1125');
    });
  });

  it('should return correct response data in updateCallbackGroup', function () {
    mockResponse.content.data.body = 'ff8080815708077601581a417ded1a1e';
    GmHttpService.httpPut.and.returnValue($q.resolve(mockResponse));

    cbgService.updateCallbackGroup({}).then(function (res) {
      var returnCode = _.get(res.content.data, 'returnCode');
      expect(returnCode).toEqual(0);
    });
  });

  it('should return correct response info in updateCallbackGroupStatus when status is decline', function () {
    mockResponse.content.data.body = 'ff8080815708077601581a417ded1a1e';
    GmHttpService.httpPut.and.returnValue($q.resolve(mockResponse));

    cbgService.updateCallbackGroupStatus(customerId, groupId, 'decline', {}).then(function (res) {
      expect(res.content.data.body).toBe('ff8080815708077601581a417ded1a1e');
    });
  });

  it('should return correct response info in updateCallbackGroupStatus when status is approve and data is null', function () {
    mockResponse.content.data.body = 'ff8080815708077601581a417ded1a1e';
    GmHttpService.httpPut.and.returnValue($q.resolve(mockResponse));

    cbgService.updateCallbackGroupStatus(customerId, groupId, 'approve', '').then(function (res) {
      expect(res.content.data.body).toBe('ff8080815708077601581a417ded1a1e');
    });
  });

  it('should return correct response info in getCountries', function () {
    mockResponse = preData.getCountries;
    GmHttpService.httpGet.and.returnValue($q.resolve(mockResponse));

    cbgService.getCountries().then(function (res) {
      expect(res.content.data.length).toBe(4);
    });
  });

  it('should return correct response info in postRequest', function () {
    GmHttpService.httpPost.and.returnValue($q.resolve(mockResponse));

    cbgService.postRequest(customerId, {}).then(function (res) {
      expect(res.content.health.status).toBe('OK');
    });
  });

  it('should return correct response info in moveSite', function () {
    GmHttpService.httpPut.and.returnValue($q.resolve(mockResponse));

    cbgService.moveSite({}).then(function (res) {
      expect(res.content.health.code).toBeDefined(200);
    });
  });

  it('should return correct response info in postNote', function () {
    GmHttpService.httpPost.and.returnValue($q.resolve(mockResponse));

    cbgService.postNote({}).then(function (res) {
      expect(res.content.data.returnCode).toBe(0);
    });
  });

  it('should return correct response info in getNotes', function () {
    mockResponse.content.data.body = preData.getNotes;
    GmHttpService.httpGet.and.returnValue($q.resolve(mockResponse));

    cbgService.getNotes(customerId, groupId).then(function (res) {
      expect(res.content.data.body.length).toBe(2);
    });
  });

  it('should return correct response info in getHistories', function () {
    var groupName = 'groupName';
    mockResponse.content.data.body = preData.getHistories;
    GmHttpService.httpGet.and.returnValue($q.resolve(mockResponse));

    cbgService.getHistories(customerId, groupId, groupName).then(function (res) {
      expect(res.content.data.body.length).toBe(3);
    });
  });

  it('should return empty array in cbgsExportCSV', function () {
    var mockHttpResponse = {
      data: mockResponse,
    };

    mockResponse.content.data.returnCode = 0;
    mockResponse.content.data.body = [];
    GmHttpService.httpGet.and.returnValue($q.resolve(mockHttpResponse));
    cbgService.getCallbackGroups.and.returnValue($q.resolve(mockResponse));

    cbgService.cbgsExportCSV(customerId).then(function (res) {
      expect(res.length).toEqual(1);
    });
    $scope.$apply();
  });

  it('should return correct data in cbgsExportCSV', function () {
    var mockHttpResponse = {
      data: mockResponse,
    };

    mockResponse.content.data.returnCode = 0;
    mockResponse.content.data.body = preData.getCallbackGroups;
    GmHttpService.httpGet.and.returnValue($q.resolve(mockHttpResponse));
    cbgService.getCallbackGroups.and.returnValue($q.resolve(mockResponse));

    cbgService.cbgsExportCSV(customerId).then(function (res) {
      expect(res.length).toEqual(4);
    });
    $scope.$apply();
  });

  it('should return correct download URL', function () {
    mockResponse.content.data.returnCode = 0;
    mockResponse.content.data.body = 'https://atlascca1.qa.webex.com';
    GmHttpService.httpGet.and.returnValue($q.resolve(mockResponse));

    cbgService.getDownloadCountryUrl().then(function (res) {
      expect(res.content.data.body).toBe('https://atlascca1.qa.webex.com');
    });
  });
});
