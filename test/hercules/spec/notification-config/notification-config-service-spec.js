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

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('should read all the data', function() {
    $httpBackend
      .when('GET', 'https://hercules.hitest.huron-dev.com/v1/notification_config')
      .respond('notification_config_yay');

    var callback = sinon.stub();
    Service.read(callback);
    $httpBackend.flush();

    expect(callback.callCount).toBe(1);
    expect(callback.args[0][0]).toBe(null);
    expect(callback.args[0][1]).toBe('notification_config_yay');
  });

  it('should post all the data', function() {
    var data = {username: 'foo', password: 'bar', wx2users: 'yo,lo'}
    $httpBackend
      .when('POST', 'https://hercules.hitest.huron-dev.com/v1/notification_config', data)
      .respond('nc');

    var callback = sinon.stub();
    Service.write(data, callback);
    $httpBackend.flush();

    expect(callback.callCount).toBe(1);
    expect(callback.args[0][0]).toBe(null);
    expect(callback.args[0][1]).toBe('nc');
  });

});
