'use strict';

describe('Service: ResourceGroupService', function () {
  var ResourceGroupService, $httpBackend;

  beforeEach(angular.mock.module('Hercules'));
  beforeEach(angular.mock.module(mockDependencies));
  beforeEach(inject(dependencies));

  function dependencies(_$httpBackend_, _ResourceGroupService_) {
    $httpBackend = _$httpBackend_;
    ResourceGroupService = _ResourceGroupService_;
  }

  function mockDependencies($provide) {
    var Authinfo = {
      getOrgId: sinon.stub().returns('0FF1C3')
    };
    $provide.value('Authinfo', Authinfo);
    var UrlConfig = {
      getHerculesUrlV2: sinon.stub().returns('http://elg.no')
    };
    $provide.value('UrlConfig', UrlConfig);
  }

  describe('getAll()', function () {
    afterEach(verifyHttpBackend);

    function verifyHttpBackend() {
      $httpBackend.flush();
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    }

    it('should call the right backend with no orgId', function () {
      $httpBackend.expectGET('http://elg.no/organizations/0FF1C3/resourceGroups').respond([]);
      ResourceGroupService.getAll();
    });

    it('should call the right backend when orgId is given', function () {
      $httpBackend.expectGET('http://elg.no/organizations/ladida/resourceGroups').respond([]);
      ResourceGroupService.getAll('ladida');
    });

  });

  describe('get()', function () {

    afterEach(verifyHttpBackend);

    function verifyHttpBackend() {
      $httpBackend.flush();
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    }

    it('should call the right backend with no orgId', function () {
      $httpBackend
        .expectGET('http://elg.no/organizations/0FF1C3/resourceGroups/myResourceGroup')
        .respond(200, 'dummy response');
      ResourceGroupService.get('myResourceGroup');
    });

    it('should call the right backend when orgId is given', function () {
      $httpBackend
        .expectGET('http://elg.no/organizations/ladida/resourceGroups/myResourceGroup')
        .respond(200, 'dummy response');
      ResourceGroupService.get('myResourceGroup', 'ladida');
    });

  });

});
