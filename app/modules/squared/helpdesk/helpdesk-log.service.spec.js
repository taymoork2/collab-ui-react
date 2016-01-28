'use strict';
describe('Service: HelpdeskLogService', function() {
  beforeEach(module('wx2AdminWebClientApp'));

  var Service, LogService, q, scope, httpBackend, urlBase;

  beforeEach(inject(function(_Config_, $httpBackend, _HelpdeskLogService_, _LogService_, _$q_, _$rootScope_) {
    Service = _HelpdeskLogService_;
    LogService = _LogService_;
    httpBackend = $httpBackend;
    scope = _$rootScope_.$new();
    q = _$q_;
    urlBase = _Config_.getAdminServiceUrl();

    httpBackend
      .when('GET', 'l10n/en_US.json')
      .respond({});

    var logs = {
      success: true,
      metadataList: [{
        filename: "logFile1",
        timestamp: "2016-04-25T11:46:24.757Z"
      }, {
        filename: "logFile2",
        timestamp: "2016-02-25T11:46:24.757Z"
      }, {
        filename: "logFile3",
        timestamp: "2016-01-25T11:46:24.757Z"
      }, {
        filename: "logFile4",
        timestamp: "2016-04-25T11:46:25.757Z"
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

  it('fetches the last log on search', function(done) {
    Service.searchForLastPushedLog('searchterm').then(function(log) {
      expect(log.filename).toEqual("logFile4");
      done();
    }, function(reason) {
      fail(reason);
    });
    scope.$apply();
  });

  it('fetches the last log on user id', function(done) {
    console.log("koko");
    Service.getLastPushedLogForUser('userid').then(function(log) {
      expect(log.filename).toEqual("logFile4");
      done();
    }, function(reason) {
      fail(reason);
    });
    scope.$apply();
  });

  it('can download log', function(done) {
    Service.downloadLog('filename').then(function(url) {
      expect(url).toEqual('http://download.com');
      done();
    }, function(reason) {
      fail(reason);
    });
    scope.$apply();
  });

});
