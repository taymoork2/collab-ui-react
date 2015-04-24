'use strict';

describe('Service: USSService', function () {
  beforeEach(module('wx2AdminWebClientApp'));

  var $httpBackend, Service;
  var rootPath = 'https://uss-a.wbx2.com/uss/api/v1/';

  beforeEach(function () {
    module(function ($provide) {
      var win = {
        location: {
          search: ''
        }
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

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('should fetch and return data from the correct backend', function () {
    $httpBackend
      .when('GET', rootPath + 'userStatuses?userId=123')
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
      .when('GET', rootPath + 'userStatuses?userId=123')
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
      .when('POST', rootPath + 'userStatuses/actions/refreshEntitlementsForUser/invoke/?userId=123')
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
      .when('POST', rootPath + 'userStatuses/actions/refreshEntitlementsForUser/invoke/?userId=123')
      .respond(500);

    var callback = sinon.stub();
    Service.pollCIForUser('123', callback);
    $httpBackend.flush();

    expect(callback.callCount).toBe(1);
    expect(callback.args[0][0]).toBeTruthy();
    expect(callback.args[0][1]).toBeFalsy();
  });

  it('should return userStatuses summary', function () {
    $httpBackend
      .when('GET', rootPath + 'userStatuses/summary')
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
      .when('GET', rootPath + 'userStatuses/summary')
      .respond(500);

    var callback = sinon.stub();
    Service.getStatusesSummary(callback);
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
        expect(status).toBe('pending_deactivation');
      });

      it('other state is unknown', function () {
        var status = Service.decorateWithStatus({
          entitled: false,
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
