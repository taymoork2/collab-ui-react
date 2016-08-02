/**
 * Created by sjalipar on 10/12/15.
 */

'use strict';

describe('Hunt Group Service', function () {

  var HuronConfig, $q, $httpBackend, huntGroupService, huntGroupId, getHuntListUrl, deleteHGUrl;
  var customerId = '123',
    userSearchServiceV2, numberSearchServiceV2;

  var spiedAuthinfo = {
    getOrgId: jasmine.createSpy('getOrgId').and.returnValue(customerId)
  };
  var huntList = getJSONFixture('huron/json/features/huntGroup/hgList.json');

  beforeEach(angular.mock.module('Huron'));
  beforeEach(angular.mock.module(function ($provide) {
    $provide.value("Authinfo", spiedAuthinfo);
  }));

  beforeEach(inject(function (_$q_, _HuronConfig_, _$httpBackend_, _HuntGroupService_) {
    $q = _$q_;
    HuronConfig = _HuronConfig_;
    $httpBackend = _$httpBackend_;
    huntGroupService = _HuntGroupService_;
    huntGroupId = '456';

    getHuntListUrl = new RegExp(".*/customers/" + customerId + "/features/huntgroups.*");
    deleteHGUrl = new RegExp(".*/customers/" + customerId + "/features/huntgroups/" + huntGroupId + ".*");
  }));

  afterEach(function () {
    $httpBackend.flush();
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('should be able to get list of huntGroups for a given customerId', function () {
    $httpBackend.expectGET(getHuntListUrl).respond(200, huntList);
    huntGroupService.getListOfHuntGroups().then(function (list) {
      expect(angular.equals(list, huntList)).toBeTruthy();
    });
  });

  it('should fail to get list of huntGroups when server gives an error', function () {
    $httpBackend.expectGET(getHuntListUrl).respond(500);
    huntGroupService.getListOfHuntGroups().then(function (response) {}, function (response) {
      expect(response.status).toEqual(500);
    });
  });

  it('should be able to delete a given huntGroup for a given customerId and huntGroupId', function () {
    $httpBackend.expectDELETE(deleteHGUrl).respond('OK');
    huntGroupService.deleteHuntGroup(huntGroupId).then(function (resp) {
      expect(resp[0]).toEqual('O');
      expect(resp[1]).toEqual('K');
    });
  });

  it('should fail to delete a given huntGroup when server gives an error', function () {
    $httpBackend.expectDELETE(deleteHGUrl).respond(500);
    huntGroupService.deleteHuntGroup(huntGroupId).then(function (response) {}, function (response) {
      expect(response.status).toEqual(500);
    });
  });
});
