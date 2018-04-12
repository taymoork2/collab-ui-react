
'use strict';

var testModule = require('./index').default;

describe(' URService', function () {
  var URService, $httpBackend, queueId, orgId, queueDetails, sunlightURQueueURUrl;
  var DEFAULT_QUEUE = 'Queue 1';
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
    orgId = 'deba1221-ab12-cd34-de56-abcdef123456';
    queueId = 'deba1221-ab12-cd34-de56-abcdef123456';
    queueDetails = getJSONFixture('sunlight/json/features/config/DefaultQueueDetails.json');
    sunlightURQueueURUrl = UrlConfig.getSunlightURServiceUrl() + '/organization/' + Authinfo.getOrgId() + '/queue';
  }));

  it('should get default queue details', function () {
    $httpBackend.whenGET(sunlightURQueueURUrl + '/' + orgId).respond(200, queueDetails);
    URService.getQueue(queueId).then(function (response) {
      expect(response.data.routingType).toBe('pick');
    });
  });

  it('should update default queue for default queueId', function () {
    var updateQueueRequest = {
      queueName: DEFAULT_QUEUE,
      notificationUrls: [],
      routingType: 'push',
    };
    $httpBackend.whenPUT(sunlightURQueueURUrl + '/' + queueId, updateQueueRequest).respond(200, queueDetails);

    URService.updateQueue(orgId, updateQueueRequest).then(function (response) {
      expect(response.data.orgId).toBe(orgId);
      expect(response.data.queueId).toBe(queueId);
    });
    $httpBackend.flush();
  });

  it('should fail to get queueDetails for a given queueId when there is an http error', function () {
    $httpBackend.whenGET(sunlightURQueueURUrl + '/' + queueId).respond(500, errorData);

    URService.getQueue(queueId).then(function () {}, function (response) {
      expect(response.status).toBe(500);
    });
    $httpBackend.flush();
  });

  it('should fail to get queueDetails when queueId is not defined', function () {
    URService.getQueue(undefined).then(function () {}, function (data) {
      expect(data).toBe('queueId cannot be null or undefined');
    });
  });

  it('should create default queue in sunlight URService', function () {
    var createQueueRequest = {
      queueId: orgId,
      queueName: DEFAULT_QUEUE,
      notificationUrls: [],
      routingType: 'pick',
    };
    $httpBackend.whenPOST(sunlightURQueueURUrl).respond(201);
    URService.createQueue(createQueueRequest).then(function (response) {
      expect(response.status).toBe(201);
    });
    $httpBackend.flush();
  });

  it('should fail to create chat template in sunlight config service when there is a service error', function () {
    var createQueueRequest = {
      queueId: orgId,
      queueName: DEFAULT_QUEUE,
      notificationUrls: [],
      routingType: 'pick',
    };
    $httpBackend.whenPOST(sunlightURQueueURUrl).respond(500, errorData);
    URService.createQueue(createQueueRequest).then(function (response) {
      expect(response.data).toEqual(errorData);
      expect(response.status).toBe(500);
    });
    $httpBackend.flush();
  });
});
