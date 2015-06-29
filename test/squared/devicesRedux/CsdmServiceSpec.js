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

});
