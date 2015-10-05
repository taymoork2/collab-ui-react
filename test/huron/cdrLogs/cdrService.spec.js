'use strict';

describe('Controller: CdrService', function () {
  beforeEach(module('uc.cdrlogsupport'));
  beforeEach(module('Huron'));

  var $httpBackend, $q, CdrService, Notification;
  var timezone = "Etc/GMT";
  var proxyResponse = getJSONFixture('huron/json/cdrLogs/proxyResponse.json');

  var model = {
    'searchUpload': 'SEARCH',
    'startTime': '04:16:06 PM',
    'endTime': '04:16:06 PM',
    'startDate': '2015-09-29',
    'endDate': '2015-09-30',
    'hitSize': 1
  };

  beforeEach(inject(function (_$httpBackend_, _$q_, _CdrService_, _Notification_) {
    CdrService = _CdrService_;
    Notification = _Notification_;
    $q = _$q_;
    $httpBackend = _$httpBackend_;

    spyOn(Notification, 'notify');
  }));

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('should be registered', function () {
    expect(CdrService).toBeDefined();
  });

  it('should return elastic search data from all servers', function () {
    $httpBackend.whenGET('http://localhost:8080').respond(proxyResponse);

    CdrService.query(model).then(function (response) {
      expect(response[0][0][0]).toEqual(proxyResponse.hits.hits[0]._source);
    });

    $httpBackend.flush();
  });

  it('should return a date from a yyyy-mm-dd and hh:mm:ss', function () {
    expect(CdrService.formDate(model.startDate, model.startTime).tz(timezone).format()).toEqual('2015-09-29T21:16:06+00:00');
  });
});
