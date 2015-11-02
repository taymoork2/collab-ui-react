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
    getHuntListUrl = HuronConfig.getMockHgUrl() + '/customers/' + customerId + '/features/huntgroups?secret=sunlight';
    deleteHGUrl = HuronConfig.getMockHgUrl() + '/customers/' + customerId + '/features/huntgroups/' + huntGroupId + '?secret=sunlight';
    huntList = {
      "url": getHuntListUrl,
      "items": [{
        "uuid": "abcd1234-abcd-abcd-abcddef123456",
        "name": "Technical Support",
        "numbers": ["5076", "4145551244"],
        "memberCount": 2
      }, {
        "uuid": "bbcd1234-abcd-abcd-abcddef123456",
        "name": "Marketing",
        "numbers": ["5076", "1244567890", "4145551244", "4145551245"],
        "memberCount": 16
      }]
    };
  }));

  afterEach(function () {
    $httpBackend.flush();
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('should be able to get list of huntGroups for a given customerId', function () {
    $httpBackend.expectGET(getHuntListUrl).respond(200, huntList);
    huntGroupService.getListOfHuntGroups(customerId).then(function (response) {
      expect(response.url).toEqual(getHuntListUrl);
      expect(response.items).toEqual(huntList.items);
    });
  });

  it('should fail to get list of huntGroups when server gives an error', function () {
    $httpBackend.expectGET(getHuntListUrl).respond(500);
    huntGroupService.getListOfHuntGroups(customerId).then(function (response) {}, function (response) {
      expect(response.status).toEqual(500);
    });
  });

  it('should be able to delete a given huntGroup for a given customerId and huntGroupId', function () {
    $httpBackend.expectDELETE(deleteHGUrl).respond('OK');
    huntGroupService.deleteHuntGroup(customerId, huntGroupId).then(function (resp) {
      expect(resp[0]).toEqual('O');
      expect(resp[1]).toEqual('K');
    });
  });

  it('should fail to delete a given huntGroup when server gives an error', function () {
    $httpBackend.expectDELETE(deleteHGUrl).respond(500);
    huntGroupService.deleteHuntGroup(customerId, huntGroupId).then(function (response) {}, function (response) {
      expect(response.status).toEqual(500);
    });
  });
});
