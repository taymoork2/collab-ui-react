'use strict';


describe('Service: CsdmService', function () {
  beforeEach(module('wx2AdminWebClientApp'));

  var $httpBackend, Service, notification;
  var rootPath = 'https://csdm-integration.wbx2.com/csdm/api/v1';

  beforeEach(function () {
    module(function ($provide) {
      notification = {
        notify: sinon.stub()
      };
      $provide.value('Authinfo', {getOrgId: function(){return 'myyoloorg';}});
      $provide.value('XhrNotificationService', notification);
    });
  });

  beforeEach(inject(function ($injector, _CsdmService_) {
    Service = _CsdmService_;
    $httpBackend = $injector.get('$httpBackend');
    $httpBackend
      .when('GET', 'l10n/en_US.json')
      .respond({});
  }));

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('should fetch data when fill cache is called', function () {
    $httpBackend
      .when('GET', rootPath + '/organization/myyoloorg/devices')
      .respond({"device": {foo: "bar"}});
    $httpBackend
      .when('GET', rootPath + '/organization/myyoloorg/codes')
      .respond({"code": {bar: "baz"}});

    var callback = sinon.stub();
    Service.fillCodesAndDevicesCache(callback);
    $httpBackend.flush();

    expect(callback.callCount).toBe(1);
    expect(Service.listCodesAndDevices().length).toBe(2);
    expect(Service.listCodesAndDevices()[0]).toEqual({bar: "baz"});
    expect(Service.listCodesAndDevices()[1]).toEqual({foo: "bar"});
  });
});

