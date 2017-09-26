
'use strict';

var testModule = require('./index').default;

describe(' URService', function () {
  var URService, $httpBackend, queueId;

  var spiedAuthinfo = {
    getOrgId: jasmine.createSpy('getOrgId').and.returnValue('deba1221-ab12-cd34-de56-abcdef123456'),
  };
  var errorData = {
    errorType: 'Internal Server Error',
  };

  beforeEach(angular.mock.module(testModule));
  beforeEach(angular.mock.module(function ($provide) {
    $provide.value('Authinfo', spiedAuthinfo);
  }));

  beforeEach(inject(function (_URService_, _$httpBackend_, UrlConfig, Authinfo) {
    URService = _URService_;
    $httpBackend = _$httpBackend_;
    sunlightURQueueURUrl = UrlConfig.getSunlightURServiceUrl() + '/organization/' + Authinfo.getOrgId() + '/queue';
  }));

});
