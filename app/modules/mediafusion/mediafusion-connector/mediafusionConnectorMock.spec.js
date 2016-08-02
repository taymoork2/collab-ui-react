'use strict';

describe('MediafusionConnectorMock', function () {
  beforeEach(angular.mock.module('Mediafusion'));

  var Service;

  beforeEach(inject(function (_MediafusionConnectorMock_) {
    Service = _MediafusionConnectorMock_;
  }));

  it('should create mock data', function () {
    var mock = Service.mockData();
    expect(mock.length).toBe(5);
  });

});
