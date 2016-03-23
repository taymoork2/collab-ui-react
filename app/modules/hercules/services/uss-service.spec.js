'use strict';

describe('Service: USSService', function () {
  beforeEach(module('wx2AdminWebClientApp'));

  var $httpBackend, Service, authinfo;
  var rootPath = 'https://uss-integration.wbx2.com/uss/api/v1/';

  beforeEach(inject(function (_$httpBackend_, _USSService_, _Authinfo_) {
    authinfo = _Authinfo_;
    authinfo.getOrgId = sinon.stub().returns("456");

    Service = _USSService_;
    $httpBackend = _$httpBackend_;
    $httpBackend
      .when('GET', 'l10n/en_US.json')
      .respond({});
  }));

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('should fetch and return data from the correct backend', function () {
    $httpBackend
      .when('GET', rootPath + 'userStatuses?userId=123&orgId=456')
      .respond({
        "userStatuses": [{
          "userId": "123",
          "orgId": "cisco",
          "serviceId": "squared-fusion-cal",
          "entitled": false,
          "state": "deactivated"
        }, {
          "userId": "123",
          "orgId": "cisco",
          "serviceId": "squared-fusion-uc",
          "entitled": false,
          "state": "pendingDeactivation"
        }, {
          "userId": "123",
          "orgId": "cisco",
          "serviceId": "squared-fusion-yolo",
          "entitled": true,
          "state": "deactivated"
        }, {
          "userId": "123",
          "orgId": "cisco",
          "serviceId": "squared-fusion-voicemail",
          "entitled": true,
          "state": "activated"
        }]
      });

    var callback = sinon.stub();
    Service.getStatusesForUser('123', callback);
    $httpBackend.flush();

    expect(callback.callCount).toBe(1);
    expect(callback.args[0][0]).toBeFalsy();
    expect(callback.args[0][1].userStatuses.length).toBe(3);
    expect(callback.args[0][1].userStatuses[0].serviceId).toBe('squared-fusion-uc');
    expect(callback.args[0][1].userStatuses[1].serviceId).toBe('squared-fusion-yolo');
    expect(callback.args[0][1].userStatuses[2].serviceId).toBe('squared-fusion-voicemail');
  });

  it('should do the jazz', function () {
    $httpBackend
      .when('GET', rootPath + 'userStatuses?userId=123&orgId=456')
      .respond({
        "userStatuses": [{
          "userId": "123",
          "orgId": "cisco",
          "serviceId": "squared-fusion-cal",
          "entitled": false,
          "state": "deactivated"
        }]
      });

    var callback = sinon.stub();
    Service.getStatusesForUser('123', callback);
    $httpBackend.flush();

    expect(callback.args[0][1].userStatuses.length).toBe(0);
  });

  it('should return error status if unable to fetch data from backend', function () {
    $httpBackend
      .when('GET', rootPath + 'userStatuses?userId=123&orgId=456')
      .respond(500);

    var callback = sinon.stub();
    Service.getStatusesForUser('123', callback);
    $httpBackend.flush();

    expect(callback.callCount).toBe(1);
    expect(callback.args[0][0]).toBeTruthy();
  });

  it('should return userStatuses summary', function () {
    $httpBackend
      .when('GET', rootPath + 'userStatuses/summary?orgId=456')
      .respond({});

    var callback = sinon.stub();
    Service.getStatusesSummary(callback);
    $httpBackend.flush();

    expect(callback.callCount).toBe(1);
    expect(callback.args[0][0]).toBeFalsy();
    expect(callback.args[0][1]).toBeTruthy();
  });

  it('should set error when userStatuses summary fails', function () {
    $httpBackend
      .when('GET', rootPath + 'userStatuses/summary?orgId=456')
      .respond(500);

    var callback = sinon.stub();
    Service.getStatusesSummary(callback);
    $httpBackend.flush();

    expect(callback.callCount).toBe(1);
    expect(callback.args[0][0]).toBeTruthy();
    expect(callback.args[0][1]).toBeFalsy();
  });

  it('should return userStatuses in getStatuses', function () {
    $httpBackend
      .when('GET', rootPath + 'userStatuses?serviceId=squared-fusion-cal&state=error&limit=20&orgId=456')
      .respond({});

    var callback = sinon.stub();
    Service.getStatuses(callback, 'squared-fusion-cal', 'error', 20);
    $httpBackend.flush();

    expect(callback.callCount).toBe(1);
    expect(callback.args[0][0]).toBeFalsy();
    expect(callback.args[0][1]).toBeTruthy();
  });

  it('should set error when userStatuses get fails', function () {
    $httpBackend
      .when('GET', rootPath + 'userStatuses?serviceId=squared-fusion-cal&state=error&limit=20&orgId=456')
      .respond(500);

    var callback = sinon.stub();
    Service.getStatuses(callback, 'squared-fusion-cal', 'error', 20);
    $httpBackend.flush();

    expect(callback.callCount).toBe(1);
    expect(callback.args[0][0]).toBeTruthy();
    expect(callback.args[0][1]).toBeFalsy();
  });

  describe('status decoration', function () {

    afterEach(function () {
      $httpBackend.flush();
    });

    describe('when not entitled', function () {

      it('error state is not entitled', function () {
        var status = Service.decorateWithStatus({
          entitled: false,
          state: 'error'
        });
        expect(status).toBe('not_entitled');
      });

      it('deactivated state is not entitled', function () {
        var status = Service.decorateWithStatus({
          entitled: false,
          state: 'deactivated'
        });
        expect(status).toBe('not_entitled');
      });

      it('notActivated state is not entitled', function () {
        var status = Service.decorateWithStatus({
          entitled: false,
          state: 'notActivated'
        });
        expect(status).toBe('not_entitled');
      });

      it('activated state is pending deactivation', function () {
        var status = Service.decorateWithStatus({
          entitled: false,
          state: 'activated'
        });
        expect(status).toBe('not_entitled');
      });

      it('other state is unknown', function () {
        var status = Service.decorateWithStatus({
          entitled: true,
          state: 'other'
        });
        expect(status).toBe('unknown');
      });

    });

    describe('when entitled', function () {

      it('deactivated state is pending activation', function () {
        var status = Service.decorateWithStatus({
          entitled: true,
          state: 'deactivated'
        });
        expect(status).toBe('pending_activation');
      });

      it('notActivated state is pending activation', function () {
        var status = Service.decorateWithStatus({
          entitled: true,
          state: 'notActivated'
        });
        expect(status).toBe('pending_activation');
      });

      it('activated state is activated', function () {
        var status = Service.decorateWithStatus({
          entitled: true,
          state: 'activated'
        });
        expect(status).toBe('activated');
      });

      it('error state is error', function () {
        var status = Service.decorateWithStatus({
          entitled: true,
          state: 'error'
        });
        expect(status).toBe('error');
      });

      it('other state is unknown', function () {
        var status = Service.decorateWithStatus({
          entitled: true,
          state: 'other'
        });
        expect(status).toBe('unknown');
      });

    });

  });

});
