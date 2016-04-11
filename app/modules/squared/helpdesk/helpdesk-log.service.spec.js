'use strict';
describe('Service: HelpdeskLogService', function () {
  beforeEach(module('wx2AdminWebClientApp'));

  var Service, LogService, q, scope, httpBackend, urlBase;

  beforeEach(inject(function (UrlConfig, $httpBackend, _HelpdeskLogService_, _LogService_, _$q_, _$rootScope_) {
    Service = _HelpdeskLogService_;
    LogService = _LogService_;
    httpBackend = $httpBackend;
    scope = _$rootScope_.$new();
    q = _$q_;
    urlBase = UrlConfig.getAdminServiceUrl();

    httpBackend
      .when('GET', 'l10n/en_US.json')
      .respond({});

    var logs = {
      success: true,
      metadataList: [{
        filename: "logFile1",
        timestamp: "2016-01-25T11:46:24.757Z"
      }, {
        filename: "logFile2",
        timestamp: "2016-02-04T11:02:48.354Z"
      }, {
        filename: "logFile3",
        timestamp: "2016-02-08T09:18:54.238Z"
      }, {
        filename: "logFile4",
        timestamp: "2016-01-25T11:19:19.443Z"
      }]
    };
    var download = {
      success: true,
      tempURL: 'http://download.com'
    };

    sinon.stub(LogService, 'searchLogs');
    sinon.stub(LogService, 'listLogs');
    sinon.stub(LogService, 'downloadLog');
    LogService.searchLogs.yields(logs);
    LogService.listLogs.yields(logs);
    LogService.downloadLog.yields(download);
  }));

  it('fetches the last log on search', function (done) {
    Service.searchForLastPushedLog('searchterm').then(function (log) {
      expect(log.filename).toEqual("logFile3");
      done();
    }, function (reason) {
      fail(reason);
    });
    scope.$apply();
  });

  it('fetches the last log on user id', function (done) {
    Service.getLastPushedLogForUser('userid').then(function (log) {
      expect(log.filename).toEqual("logFile3");
      done();
    }, function (reason) {
      fail(reason);
    });
    scope.$apply();
  });

  it('can download log', function (done) {
    Service.downloadLog('filename').then(function (url) {
      expect(url).toEqual('http://download.com');
      done();
    }, function (reason) {
      fail(reason);
    });
    scope.$apply();
  });

});
