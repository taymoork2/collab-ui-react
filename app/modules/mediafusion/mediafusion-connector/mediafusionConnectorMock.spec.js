'use strict';

describe('MediafusionConnectorMock', function () {
  beforeEach(module('wx2AdminWebClientApp'));

  var Service;

  beforeEach(inject(function ($injector, _ConnectorMock_) {
    Service = _ConnectorMock_;
  }));

  it('should create mock data', function () {
    var mock = Service.mockData();
    expect(mock.length).toBe(5);
  });

});
