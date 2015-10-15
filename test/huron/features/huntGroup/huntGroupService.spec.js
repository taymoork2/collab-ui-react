/**
 * Created by sjalipar on 10/12/15.
 */

'use strict';

describe('Hunt Group Service', function () {

  var HuronConfig, $q, $httpBackend, huntGroupService, customerId, huntGroupId, huntList, getHuntListUrl, deleteHGUrl;

  beforeEach(module('Huron'));

  beforeEach(inject(function (_$rootScope_, $controller, _$q_, _HuronConfig_, _$httpBackend_, _HuntGroupService_) {
    $q = _$q_;
    HuronConfig = _HuronConfig_;
    $httpBackend = _$httpBackend_;
    huntGroupService = _HuntGroupService_;
    customerId = '123';
    huntGroupId = '456';
    getHuntListUrl = HuronConfig.getCmiV2Url() + "/customers/123/features/huntgroups";
    deleteHGUrl = HuronConfig.getCmiV2Url() + '/customers/123/features/huntgroups/456';
    huntList = {
      "url": getHuntListUrl,
      "items": [{
        "uuid": "abcd1234-abcd-abcd-abcddef123456",
        "name": "Technical Support",
        "numbers": ["5076", "(414) 555-1244"],
        "memberCount": 2
      }, {
        "uuid": "bbcd1234-abcd-abcd-abcddef123456",
        "name": "Marketing",
        "numbers": ["5076", "(124) 456-7890", "(414) 555-1244", "(414) 555-1245"],
        "memberCount": 16
      }]
    };
  }));

  it('should be able to get list of huntGroups for a given customerId', function () {
    $httpBackend.whenGET(getHuntListUrl).respond(200, huntList);
    huntGroupService.getListOfHuntGroups(customerId).then(function (response) {
      expect(response.data.url).toBe(getHuntListUrl);
      expect(response.data.items).toBe(huntList.items);
    });
  });

  it('should fail to get list of huntGroups when server gives an error', function () {
    $httpBackend.whenGET(getHuntListUrl).respond(500);
    huntGroupService.getListOfHuntGroups(customerId).then(function (response) {}, function (response) {
      expect(response.status).toBe(500);
    });
  });

  it('should be able to delete a given huntGroup for a given customerId', function () {
    $httpBackend.whenDELETE(deleteHGUrl).respond(200);
    huntGroupService.deleteHuntGroup(customerId, huntGroupId).then(function (response) {
      expect(response.status).toBe(200);
    });
  });

  it('should fail to delete a given huntGroup when server gives an error', function () {
    $httpBackend.whenDELETE(deleteHGUrl).respond(500);
    huntGroupService.deleteHuntGroup(customerId, huntGroupId).then(function (response) {}, function (response) {
      expect(response.status).toBe(500);
    });
  });
});
