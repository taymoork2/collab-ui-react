'use strict';

describe('NotificationConfigService', function () {
  beforeEach(module('wx2AdminWebClientApp'));

  var $httpBackend, Service;

  beforeEach(inject(function ($injector, NotificationConfigService) {
    Service = NotificationConfigService;

    $httpBackend = $injector.get('$httpBackend');
    $httpBackend
      .when('GET', 'l10n/en_US.json')
      .respond({});
  }));

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('should read all the data', function () {
    $httpBackend
      .when('GET', 'https://hercules-integration.wbx2.com/v1/notification_config')
      .respond('notification_config_yay');

    var callback = sinon.stub();
    Service.read(callback);
    $httpBackend.flush();

    expect(callback.callCount).toBe(1);
    expect(callback.args[0][0]).toBe(null);
    expect(callback.args[0][1]).toBe('notification_config_yay');
  });

  it('should callback when read fails', function () {
    $httpBackend
      .when('GET', 'https://hercules-integration.wbx2.com/v1/notification_config')
      .respond(500, 'notification_config_yay');

    var callback = sinon.stub();
    Service.read(callback);
    $httpBackend.flush();

    expect(callback.callCount).toBe(1);
    expect(callback.args[0][0]).toBeTruthy();
    expect(callback.args[0][1]).toBeFalsy();
  });

  it('should post all the data', function () {
    var data = {
      username: 'foo',
      password: 'bar',
      wx2users: 'yo,lo'
    };
    $httpBackend
      .when('PUT', 'https://hercules-integration.wbx2.com/v1/notification_config', data)
      .respond('nc');

    var callback = sinon.stub();
    Service.write(data, callback);
    $httpBackend.flush();

    expect(callback.callCount).toBe(1);
    expect(callback.args[0][0]).toBe(null);
    expect(callback.args[0][1]).toBe('nc');
  });

  it('should callback when post fails', function () {
    var data = {
      username: 'foo',
      password: 'bar',
      wx2users: 'yo,lo'
    };
    $httpBackend
      .when('PUT', 'https://hercules-integration.wbx2.com/v1/notification_config', data)
      .respond(500);

    var callback = sinon.stub();
    Service.write(data, callback);
    $httpBackend.flush();

    expect(callback.callCount).toBe(1);
    expect(callback.args[0][0]).toBeTruthy();
    expect(callback.args[0][1]).toBe(null);
  });

});
