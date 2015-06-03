'use strict';

describe('ConfigService', function () {
  beforeEach(module('wx2AdminWebClientApp'));

  var Service, $location;
  var rootPath = 'https://hercules-integration.wbx2.com';

  beforeEach(inject(function ($injector, _$location_, _ConfigService_) {
    Service = _ConfigService_;
    $location = _$location_;
  }));

  it('should return the correct url', function () {
    expect(Service.getUrl()).toBe(rootPath + '/v1');
  });

  it('should be possible to override url', function () {
    $location.search('hercules-url', 'fake-url');
    expect(Service.getUrl()).toBe('fake-url');
  });

  it('should return a decoded overridden url', function () {
    $location.search('hercules-url', 'this%20is%21an%2Bencoded%25url');
    expect(Service.getUrl()).toBe('this is!an+encoded%url');
  });

  it('should return uss url', function () {
    expect(Service.getUSSUrl()).toBe('https://uss-integration.wbx2.com/uss/api/v1');
  });

  it('should be possible to override USS url', function () {
    $location.search('uss-url', 'fake-url');
    expect(Service.getUSSUrl()).toBe('fake-url');
  });
});
