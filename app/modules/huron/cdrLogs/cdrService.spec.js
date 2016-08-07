'use strict';

describe('Controller: CdrService', function () {
  beforeEach(angular.mock.module('uc.cdrlogsupport'));
  beforeEach(angular.mock.module('Huron'));

  var $httpBackend, CdrService, Notification, Authinfo;
  var proxyResponse = getJSONFixture('huron/json/cdrLogs/proxyResponse.json');
  var proxyUrl = 'https://hades.huron-int.com/api/v1/elasticsearch/logstash*/_search?pretty';
  var name = 'call0CDR0';

  var model = {
    'searchUpload': 'SEARCH',
    'startTime': '04:16:06 PM',
    'endTime': '04:16:06 PM',
    'startDate': '2015-09-29',
    'endDate': '2015-09-30',
    'hitSize': 1
  };

  var formDate = function (date, time) {
    var returnDate = moment(date);
    if (time.substring(9, 10).toLowerCase() === 'p') {
      returnDate.hours(parseInt(time.substring(0, 2)) + 12);
    } else {
      returnDate.hours(parseInt(time.substring(0, 2)));
    }
    returnDate.minutes(parseInt(time.substring(3, 5)));
    returnDate.seconds(parseInt(time.substring(6, 8)));
    return returnDate.utc().format();
  };

  describe("browsers: chrome, firefox, and misc - ", function () {
    beforeEach(inject(function (_$httpBackend_, _CdrService_, _Notification_, _Authinfo_, $window) {
      CdrService = _CdrService_;
      Notification = _Notification_;
      $httpBackend = _$httpBackend_;
      Authinfo = _Authinfo_;
      $window.URL.createObjectURL = jasmine.createSpy('createObjectURL').and.callFake(function () {
        return 'blob';
      });
      $window.webkitURL.createObjectURL = jasmine.createSpy('createObjectURL').and.callFake(function () {
        return 'blob';
      });
      $window.navigator.msSaveOrOpenBlob = undefined;

      spyOn(Notification, 'notify');
      spyOn(Authinfo, 'getOrgId').and.returnValue('1');
    }));

    afterEach(function () {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    });

    it('should be defined', function () {
      expect(CdrService).toBeDefined();
    });

    it('should return elastic search data from all servers', function () {
      $httpBackend.whenPOST(proxyUrl).respond(proxyResponse);
      var logstashPath = 'logstash*';

      CdrService.query(model, logstashPath).then(function (response) {
        var returnValue = proxyResponse.hits.hits[0]._source;
        returnValue.name = name;
        expect(response[0][0][0]).toEqual(returnValue);
      });

      $httpBackend.flush();
    });

    it('should return a date from a yyyy-mm-dd and hh:mm:ss', function () {
      expect(CdrService.formDate(model.startDate, model.startTime).format()).toEqual(formDate(model.startDate, model.startTime));
    });

    it('should create jsonblob and url from call data', function () {
      var downloadData = CdrService.createDownload('blob');
      expect(angular.isDefined(downloadData.jsonBlob)).toBeTruthy();
      expect(downloadData.jsonUrl).toEqual('blob');
    });
  });

  describe("browsers: IE 10/11 - ", function () {
    var win;

    beforeEach(inject(function (_CdrService_, $window) {
      CdrService = _CdrService_;
      $window.navigator.msSaveOrOpenBlob = jasmine.createSpy('msSaveOrOpenBlob').and.callFake(function () {});
      win = $window;
    }));

    it('should only create the jsonblob from call data', function () {
      var downloadData = CdrService.createDownload('blob');
      expect(angular.isDefined(downloadData.jsonBlob)).toBeTruthy();
      expect(downloadData.jsonUrl).not.toBeDefined();
    });

    it('downloadInIE should call msSaveOrOpenBlob', function () {
      expect(win.navigator.msSaveOrOpenBlob).not.toHaveBeenCalled();
      CdrService.downloadInIE('blob', 'filename.json');
      expect(win.navigator.msSaveOrOpenBlob).toHaveBeenCalledWith('blob', 'filename.json');
    });
  });
});
