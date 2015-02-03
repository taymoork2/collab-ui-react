'use strict';

describe('ConfigService', function () {
  beforeEach(module('wx2AdminWebClientApp'));

  var $httpBackend, Service, win;

  beforeEach(function() {
    module(function ($provide) {
      win = {
        location: { search: '' }
      };
      $provide.value('$window', win);
    });
  });

  beforeEach(inject(function ($injector, _ConfigService_) {
    Service = _ConfigService_;
  }));

  it('should return the correct url', function() {
    expect(Service.getUrl()).toBe('https://hercules.hitest.huron-dev.com/v1');
  });

  it('should be possible to set error url', function() {
    win.location.search = 'hercules-backend=error'
    expect(Service.getUrl()).toBe('https://hercules.hitest.huron-dev.com/fubar');
  });

  it('should be possible to override url', function() {
    win.location.search = 'hercules-url=fake-url'
    expect(Service.getUrl()).toBe('fake-url');
  });

});
