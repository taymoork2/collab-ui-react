'use strict';

describe('Service: USSService', function () {
  beforeEach(module('wx2AdminWebClientApp'));

  var $httpBackend, Service;
  var rootPath = 'https://hercules-a.wbx2.com/uss/api/v1/';

  beforeEach(function() {
    module(function ($provide) {
      var win = {
        location: { search: '' }
      };
      $provide.value('$window', win);
    });
  });

  beforeEach(inject(function ($injector, _USSService_) {
    Service = _USSService_;
    $httpBackend = $injector.get('$httpBackend');
    $httpBackend
      .when('GET', 'l10n/en_US.json')
      .respond({});
  }));

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('should fetch and return data from the correct backend', function () {
    $httpBackend
      .when('GET', rootPath + 'userStatuses?userId=123')
      .respond({foo: 'bar'});

    var callback = sinon.stub();
    Service.getStatusesForUser('123', callback);
    $httpBackend.flush();

    expect(callback.callCount).toBe(1);
    expect(callback.args[0][0]).toBeFalsy();
    expect(callback.args[0][1].foo).toBe('bar');
  });

  it('should return error status if unable to fetch data from backend', function() {
    $httpBackend
      .when('GET', rootPath + 'userStatuses?userId=123')
      .respond(500);

    var callback = sinon.stub();
    Service.getStatusesForUser('123', callback);
    $httpBackend.flush();

    expect(callback.callCount).toBe(1);
    expect(callback.args[0][0]).toBeTruthy();
  });

  it('should refresh CI status for user', function () {
    $httpBackend
      .when('POST', rootPath + 'pollCI/123')
      .respond({});

    var callback = sinon.stub();
    Service.pollCIForUser('123', callback);
    $httpBackend.flush();

    expect(callback.callCount).toBe(1);
    expect(callback.args[0][0]).toBeFalsy();
    expect(callback.args[0][1]).toBeTruthy();
  });

  it('should set error when CI refresh fails', function () {
    $httpBackend
      .when('POST', rootPath + 'pollCI/123')
      .respond(500);

    var callback = sinon.stub();
    Service.pollCIForUser('123', callback);
    $httpBackend.flush();

    expect(callback.callCount).toBe(1);
    expect(callback.args[0][0]).toBeTruthy();
    expect(callback.args[0][1]).toBeFalsy();
  });

});
