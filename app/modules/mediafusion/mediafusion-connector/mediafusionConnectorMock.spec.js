'use strict';

describe('MediafusionConnectorMock', function () {
  beforeEach(module('wx2AdminWebClientApp'));

  var Service;

  beforeEach(inject(function (_MediafusionConnectorMock_) {
    Service = _MediafusionConnectorMock_;
  }));

  it('should create mock data', function () {
    var mock = Service.mockData();
    expect(mock.length).toBe(5);
  });

});
