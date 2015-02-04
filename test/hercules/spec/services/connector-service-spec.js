'use strict';

describe('Service: ConnectorService', function () {
  beforeEach(module('wx2AdminWebClientApp'));

  var $httpBackend, Service, converter, notification, win;

  beforeEach(function() {
    module(function ($provide) {
      converter = {
        convertClusters: sinon.stub()
      };
      notification = {
        notify: sinon.stub()
      };
      win = {
        location: { search: '' }
      };
      $provide.value('ConverterService', converter);
      $provide.value('XhrNotificationService', notification);
      $provide.value('$window', win);
    });
  });

  beforeEach(inject(function ($injector, _ConnectorService_) {
    Service = _ConnectorService_;

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
      .when('GET', 'https://hercules.hitest.huron-dev.com/v1/clusters')
      .respond({});

    converter.convertClusters.returns('foo');

    var callback = sinon.stub();
    Service.fetch(callback);
    $httpBackend.flush();

    expect(callback.callCount).toBe(1);
    expect(callback.args[0][0]).toBe(null);
    expect(callback.args[0][1]).toBe('foo');

  });

  it('should upgrade software using the correct backend', function () {
    $httpBackend
      .when(
        'POST',
        'https://hercules.hitest.huron-dev.com/v1/clusters/foo/services/bar/upgrade',
        {}
      )
      .respond({foo: 'bar'});

    var callback = sinon.stub();
    Service.upgradeSoftware('foo', 'bar', callback);
    $httpBackend.flush();

    expect(callback.callCount).toBe(1);
    expect(callback.args[0][0]).toBe(null);
    expect(callback.args[0][1].foo).toBe('bar');
  });

  it('sw upgrade should log on 500 errors', function () {
    $httpBackend
      .when(
        'POST',
        'https://hercules.hitest.huron-dev.com/v1/clusters/foo/services/bar/upgrade',
        {}
      )
      .respond(500, {foo: 'bar'});

    expect(notification.notify.callCount).toBe(0);

    var callback = sinon.stub();
    Service.upgradeSoftware('foo', 'bar', callback);
    $httpBackend.flush();

    expect(callback.callCount).toBe(1);
    expect(callback.args[0][0]).not.toBe(null);
    expect(callback.args[0][1]).toBeFalsy();

    expect(notification.notify.callCount).toBe(1);
  });

  it('should log when fetch fails', function () {
    $httpBackend
      .when('GET', 'https://hercules.hitest.huron-dev.com/v1/clusters')
      .respond(500, {});

    expect(notification.notify.callCount).toBe(0);

    var callback = sinon.stub();
    Service.fetch(callback);
    $httpBackend.flush();

    expect(callback.callCount).toBe(1);
    expect(callback.args[0][0]).not.toBe(null);
    expect(callback.args[0][1]).toBeFalsy();

    expect(notification.notify.callCount).toBe(1);
  });

  it('should be possible to set mock backend', function() {
    win.location.search = 'hercules-backend=mock'
    converter.convertClusters.returns('foo');

    var callback = sinon.stub();
    Service.fetch(callback);
    $httpBackend.flush();

    expect(callback.callCount).toBe(1);
    expect(callback.args[0][0]).toBeFalsy();
    expect(callback.args[0][1]).toBe('foo');

    expect(converter.convertClusters.callCount).toBe(1);
    expect(converter.convertClusters.args[0][0].length).toBe(5);
  });

  it('should be possible to set empty backend', function() {
    win.location.search = 'hercules-backend=nodata'

    var callback = sinon.stub();
    Service.fetch(callback);
    $httpBackend.flush();

    expect(callback.callCount).toBe(1);
    expect(callback.args[0][0]).toBeFalsy();
    expect(callback.args[0][1].length).toBe(0);
  });

  it('should delete a host', function () {
    $httpBackend
      .when(
        'DELETE',
        'https://hercules.hitest.huron-dev.com/v1/clusters/clusterid/hosts/serial'
      )
      .respond(200);

    var callback = sinon.stub();
    Service.deleteHost('clusterid', 'serial', callback);
    $httpBackend.flush();

    expect(callback.callCount).toBe(1);
  });

  it('should handle host deletion failures', function () {
    $httpBackend
      .when(
        'DELETE',
        'https://hercules.hitest.huron-dev.com/v1/clusters/clusterid/hosts/serial'
      )
      .respond(500);

    expect(notification.notify.callCount).toBe(0);

    var callback = sinon.stub();
    Service.deleteHost('clusterid', 'serial', callback);
    $httpBackend.flush();

    expect(callback.callCount).toBe(1);
    expect(notification.notify.callCount).toBe(1);
  });

  it('should be possible to squelch errors when fetch fails', function () {
    $httpBackend
      .when('GET', 'https://hercules.hitest.huron-dev.com/v1/clusters')
      .respond(500, null);
    expect(notification.notify.callCount).toBe(0);

    var callback = sinon.stub()
    Service.fetch(callback, {squelchErrors: true});
    $httpBackend.flush();

    expect(callback.callCount).toBe(1);
    expect(notification.notify.callCount).toBe(0);

    expect(callback.args[0][0]).toBeTruthy();
  });

});
