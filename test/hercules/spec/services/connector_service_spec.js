'use strict';

describe('Service: ConnectorService', function () {

  // load the service's module
  beforeEach(module('wx2AdminWebClientApp'));

  // instantiate service
  var Service;
  beforeEach(inject(function (_ConnectorService_) {
    Service = _ConnectorService_;
  }));

  it('should inject set display_name if it does not exist', function () {
    var mockData = [{
      connector_type: 'foo'
    }];
    var converted = Service._convert(mockData);
    expect(converted[0].display_name).toBe('foo');
  });

  it('should inject status if not exists', function () {
    var mockData = [{}];
    var converted = Service._convert(mockData);
    expect(converted[0].status.state).toBe('unknown');
    expect(converted[0].status.status).toBe(undefined);
  });

  it('should inject version if not exists', function () {
    var mockData = [{}];
    var converted = Service._convert(mockData);
    expect(converted[0].version).toBe('unknown');
  });

  it('should inject cluster_id if not exists', function () {
    var mockData = [{host_name: 'foo'}];
    var converted = Service._convert(mockData);
    expect(converted[0].cluster_id).toBe('foo');
  });

  it('should inject status if alerts exist', function () {
    var mockData = [{
      status: {
        status: 'foo',
        alerts: [{}]
      }
    }];
    var converted = Service._convert(mockData);
    expect(converted[0].status.state).toBe('unknown');
    expect(converted[0].status_code).toBe('unknown');
  });

  it('should inject classes based on state', function () {
    var converted = null;
    converted = Service._convert([{ status: { state: 'running' } }]);
    expect(converted[0].status_class).toBe('success');

    converted = Service._convert([{ status: { state: 'disabled' } }]);
    expect(converted[0].status_class).toBe('default');

    converted = Service._convert([{ status: { state: 'not_configured' } }]);
    expect(converted[0].status_class).toBe('default');

    converted = Service._convert([{ status: { state: 'foo' } }]);
    expect(converted[0].status_class).toBe('danger');

    converted = Service._convert([{ status: { state:  'running', alerts: [{}] } }]);
    expect(converted[0].status_class).toBe('danger');
  });

  it('should aggregate status', function () {
    var mockData = [
      {status_class: 'foo'},
      {status_class: 'foo'},
      {status_class: 'foo'},
      {status_class: 'foo'},
      {status_class: 'bar'}
    ];

    var aggregated = Service.aggregateStatus(mockData);
    expect(_.size(aggregated)).toBe(2);
    expect(aggregated.foo).toBe(4);
    expect(aggregated.bar).toBe(1);
  });

});
