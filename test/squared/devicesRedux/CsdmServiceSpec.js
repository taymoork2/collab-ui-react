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
      $provide.value('Authinfo', {
        getOrgId: function () {
          return 'myyoloorg';
        }
      });
      $provide.value('XhrNotificationService', notification);
    });
  });

  beforeEach(inject(function ($injector, _CsdmService_) {
    Service = _CsdmService_;
    $httpBackend = $injector.get('$httpBackend');
    $httpBackend
      .when('GET', 'l10n/en_US.json')
      .respond({});
    $httpBackend
      .when('GET', rootPath + '/organization/myyoloorg/devices')
      .respond({
        "device": {
          foo: "bar"
        }
      });
    $httpBackend
      .when('GET', rootPath + '/organization/myyoloorg/codes')
      .respond({
        "code": {
          bar: "baz"
        }
      });
  }));

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('should fetch data when fill cache is called', function () {
    var callback = sinon.stub();
    Service.fillCodesAndDevicesCache(callback);
    $httpBackend.flush();

    expect(callback.callCount).toBe(2);

    expect(Service.listCodesAndDevices().length).toBe(2);
    expect(Service.listCodesAndDevices()[0]).toEqual({
      bar: "baz"
    });
    expect(Service.listCodesAndDevices()[1]).toEqual({
      foo: "bar"
    });
  });

  it('updates the cache on create and delete', function () {
    $httpBackend
      .when(
        'POST',
        rootPath + '/organization/myyoloorg/codes'
      )
      .respond({
        url: "url"
      });
    $httpBackend
      .when(
        'DELETE',
        "url"
      )
      .respond(204);

    expect(Service.listCodesAndDevices().length).toBe(0);
    Service.createCode("codeName", sinon.stub());
    $httpBackend.flush();
    expect(Service.listCodesAndDevices().length).toBe(1);
    Service.deleteUrl("url", sinon.stub());
    $httpBackend.flush();
    expect(Service.listCodesAndDevices().length).toBe(0);
  });

  it('can update the device name', function () {
    Service.fillCodesAndDevicesCache(sinon.stub());
    $httpBackend.flush();

    $httpBackend
      .when('PATCH', 'device', {
        name: "newname"
      })
      .respond({
        name: "newname"
      });

    Service.updateDeviceName('device', 'newname', sinon.stub());
    $httpBackend.flush();
    expect(Service.listCodesAndDevices()[1]).toEqual({
      foo: "bar",
      displayName: "newname"
    });
  });

  it('can tell the device to upload its logs', function () {
    var callback = sinon.stub();
    Service.fillCodesAndDevicesCache(callback);
    $httpBackend.flush();

    $httpBackend
      .when('POST', 'device/notify', {
        command: "logUpload",
        eventType: "room.request_logs",
        feedbackId: "id",
        email: "email"
      })
      .respond(200);
    Service.uploadLogs('device', "id", "email", sinon.stub());
    $httpBackend.flush();
  });
});
