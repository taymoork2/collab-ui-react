'use strict';

describe('Service: ConnectorService', function () {
  beforeEach(module('wx2AdminWebClientApp'));

  var $httpBackend, Service, converter;

  beforeEach(function() {
    module(function ($provide) {
      converter = {
        convertClusters: sinon.stub()
      };
      $provide.value('ConverterService', converter);
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
      success: function(data) {
        expect(data.foo).toBe('bar');
      }
    });

    $httpBackend.flush();
  });

});
