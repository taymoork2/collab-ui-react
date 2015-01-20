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
      $provide.value('Notification', notification);
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

    Service.fetch(function(err, data) {
      expect(data).toBe('foo');
    });

    $httpBackend.flush();
  });

  it('should upgrade software using the correct backend', function () {
    $httpBackend
      .when(
        'POST',
        'https://hercules.hitest.huron-dev.com/v1/clusters/foo/services/bar/upgrade',
        {tlp: 'yolo'}
      )
      .respond({foo: 'bar'});

    Service.upgradeSoftware({
      tlpUrl: 'yolo',
      clusterId: 'foo',
      serviceType: 'bar',
      callback: function(data) {
        expect(data.foo).toBe('bar');
      }
    });

    $httpBackend.flush();
  });

  it('sw upgrade should log on 500 errors', function () {
    $httpBackend
      .when(
        'POST',
        'https://hercules.hitest.huron-dev.com/v1/clusters/foo/services/bar/upgrade',
        {tlp: 'yolo'}
      )
      .respond(500, {foo: 'bar'});

    expect(notification.notify.callCount).toBe(0);

    Service.upgradeSoftware({
      tlpUrl: 'yolo',
      clusterId: 'foo',
      serviceType: 'bar',
      callback: function() {}
    });

    $httpBackend.flush();

    expect(notification.notify.callCount).toBe(1);
  });

  it('should log when fetch fails', function () {
    $httpBackend
      .when('GET', 'https://hercules.hitest.huron-dev.com/v1/clusters')
      .respond(500, {});

    expect(notification.notify.callCount).toBe(0);

    Service.fetch(function(err, data) {});

    $httpBackend.flush();

    expect(notification.notify.callCount).toBe(1);
  });

  it('should be possible to override url', function() {
    win.location.search = 'hercules-url=fake-url'

    $httpBackend
      .when('GET', 'fake-url')
      .respond({});

    Service.fetch(function() {});

    $httpBackend.flush();
  });

  it('should be possible to set error url', function() {
    win.location.search = 'hercules-backend=error'

    $httpBackend
      .when('GET', 'https://hercules.hitest.huron-dev.com/fubar')
      .respond({});

    Service.fetch(function() {});

    $httpBackend.flush();
  });

  it('should be possible to set mock backend', function() {
    win.location.search = 'hercules-backend=mock'

    Service.fetch(function(err, data) {
      // assume all is good if no XHR's
    });

    $httpBackend.flush();
  });

  it('should be possible to set empty backend', function() {
    win.location.search = 'hercules-backend=nodata'

    Service.fetch(function(err, data) {
      expect(data.length).toBe(0);
    });

    $httpBackend.flush();
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

});
