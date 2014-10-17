'use strict';

describe('Service: ConnectorService', function () {

  // load the service's module
  beforeEach(module('wx2AdminWebClientApp'));

  // instantiate service
  var Service;
  beforeEach(inject(function (_ConnectorService_) {
    Service = _ConnectorService_;
  }));

  it('should inject status if not exists', function () {
    var mockData = [{}];
    var decorated = Service._decorate(mockData);
    expect(decorated[0].status.state).toBe('unknown');
    expect(decorated[0].status.status).toBe(undefined);
  });

  it('should inject status if alerts exist', function () {
    var mockData = [{
      status: {
        status: 'foo',
        alerts: [{}]
      }
    }];
    var decorated = Service._decorate(mockData);
    expect(decorated[0].status.state).toBe('unknown');
    expect(decorated[0].status.status).toBe('error');
    expect(decorated[0].status_code).toBe('error');
  });

  it('should inject classes based on status', function () {
    var decorated = null;
    decorated = Service._decorate([{ status: { status: 'ok' } }]);
    expect(decorated[0].status_class).toBe('success');

    decorated = Service._decorate([{ status: { status: 'warning' } }]);
    expect(decorated[0].status_class).toBe('warning');

    decorated = Service._decorate([{ status: { status: Math.random() } }]);
    expect(decorated[0].status_class).toBe('danger');
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
