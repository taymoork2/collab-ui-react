'use strict';

describe('Service: LineListService', function () {
  var $httpBackend, $q, $scope, FeatureToggleService, HuronConfig, LineListService, PstnSetupService;

  var lines = getJSONFixture('huron/json/lines/numbers.json');
  var count = getJSONFixture('huron/json/lines/count.json');
  var linesExport = getJSONFixture('huron/json/lines/numbersCsvExport.json');
  var pendingLines = getJSONFixture('huron/json/lines/pendingNumbers.json');
  var formattedPendingLines = getJSONFixture('huron/json/lines/formattedPendingNumbers.json');

  var Authinfo = {
    getOrgId: jasmine.createSpy('getOrgId').and.returnValue('1')
  };

  beforeEach(module('Huron'));

  var authInfo = {
    getOrgId: sinon.stub().returns('1')
  };

  beforeEach(module(function ($provide) {
    $provide.value('Authinfo', authInfo);
  }));

  beforeEach(inject(function ($rootScope, _$httpBackend_, _$q_, _FeatureToggleService_, _HuronConfig_, _LineListService_, _PstnSetupService_) {
    $scope = $rootScope.$new();
    $httpBackend = _$httpBackend_;
    $q = _$q_;
    FeatureToggleService = _FeatureToggleService_;
    HuronConfig = _HuronConfig_;
    LineListService = _LineListService_;
    PstnSetupService = _PstnSetupService_;

    spyOn(FeatureToggleService, 'supports').and.returnValue($q.when());
    spyOn(PstnSetupService, 'listPendingOrders').and.returnValue($q.when());
  }));

  afterEach(function () {
    $httpBackend.flush();
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  describe('getLineList', function () {
    it('should use default search criteria', function () {
      $httpBackend.expectGET(HuronConfig.getCmiUrl() + '/voice/customers/' + Authinfo.getOrgId() + '/userlineassociations?limit=100&offset=0&order=userid-asc').respond(lines);
      LineListService.getLineList(0, 100, 'userid', '-asc', '', 'all').then(function (response) {
        expect(angular.equals(response, lines)).toBe(true);
      });
    });

    it('should set search criteria order=internalnumber-desc', function () {
      $httpBackend.expectGET(HuronConfig.getCmiUrl() + '/voice/customers/1/userlineassociations?limit=100&offset=0&order=internalnumber-desc').respond(lines);
      LineListService.getLineList(0, 100, 'internalnumber', '-desc', '', 'all').then(function (response) {
        expect(angular.equals(response, lines)).toBe(true);
      });
    });

    it('should set search filter, search criteria', function () {
      $httpBackend.expectGET(HuronConfig.getCmiUrl() + '/voice/customers/' + Authinfo.getOrgId() + '/userlineassociations?externalnumber=%25asuna%25&internalnumber=%25asuna%25&limit=100&offset=0&order=userid-asc&predicatejoinoperator=or&userid=%25asuna%25').respond(lines);
      LineListService.getLineList(0, 100, 'userid', '-asc', 'asuna', 'all').then(function (response) {
        expect(angular.equals(response, lines)).toBe(true);
      });
    });

    it('should set seach criteria assignedlines=true', function () {
      $httpBackend.expectGET(HuronConfig.getCmiUrl() + '/voice/customers/' + Authinfo.getOrgId() + '/userlineassociations?assignedlines=false&limit=100&offset=0&order=userid-asc').respond(lines);
      LineListService.getLineList(0, 100, 'userid', '-asc', '', 'unassignedLines').then(function (response) {
        expect(angular.equals(response, lines)).toBe(true);
      });
    });

    it('should set seach criteria assignedlines=false', function () {
      $httpBackend.expectGET(HuronConfig.getCmiUrl() + '/voice/customers/' + Authinfo.getOrgId() + '/userlineassociations?assignedlines=true&limit=100&offset=0&order=userid-asc').respond(lines);
      LineListService.getLineList(0, 100, 'userid', '-asc', '', 'assignedLines').then(function (response) {
        expect(angular.equals(response, lines)).toBe(true);
      });
    });

    it('should set seach criteria pending and return pending orders', function () {
      PstnSetupService.listPendingOrders.and.returnValue($q.when(pendingLines));
      FeatureToggleService.supports.and.returnValue($q.when(true));
      $httpBackend.expectGET(HuronConfig.getCmiUrl() + '/voice/customers/' + Authinfo.getOrgId() + '/userlineassociations?limit=100&offset=0&order=userid-asc').respond(lines);
      $scope.$apply();
      LineListService.getLineList(0, 100, 'userid', '-asc', '', 'pending').then(function (response) {
        expect(response).toEqual(formattedPendingLines);
      });
    });

    it('should set seach criteria all and include pending orders', function () {
      PstnSetupService.listPendingOrders.and.returnValue($q.when(pendingLines));
      FeatureToggleService.supports.and.returnValue($q.when(true));
      $httpBackend.expectGET(HuronConfig.getCmiUrl() + '/voice/customers/' + Authinfo.getOrgId() + '/userlineassociations?limit=100&offset=0&order=userid-asc').respond(lines);
      $scope.$apply();
      LineListService.getLineList(0, 100, 'userid', '-asc', '', 'all').then(function (response) {
        expect(angular.equals(response, lines.concat(formattedPendingLines))).toBe(true);
      });
    });

    it('should set seach criteria to pending and and return nothing if lines is empty', function () {
      PstnSetupService.listPendingOrders.and.returnValue($q.when(pendingLines));
      FeatureToggleService.supports.and.returnValue($q.when(true));
      $httpBackend.expectGET(HuronConfig.getCmiUrl() + '/voice/customers/' + Authinfo.getOrgId() + '/userlineassociations?limit=100&offset=0&order=userid-asc').respond([]);
      $scope.$apply();
      LineListService.getLineList(0, 100, 'userid', '-asc', '', 'pending').then(function (response) {
        expect(angular.equals(response, [])).toBe(true);
      });
    });
  });

  describe('getCount', function () {
    it('should use default search criteria', function () {
      $httpBackend.expectGET(HuronConfig.getCmiUrl() + '/voice/customers/' + Authinfo.getOrgId() + '/userlineassociationcounts').respond([count]);
      LineListService.getCount('').then(function (response) {
        expect(angular.equals(response, count)).toBe(true);
      });
    });

    it('should set search filter, search criteria', function () {
      $httpBackend.expectGET(HuronConfig.getCmiUrl() + '/voice/customers/' + Authinfo.getOrgId() + '/userlineassociationcounts?externalnumber=%25asuna%25&internalnumber=%25asuna%25&predicatejoinoperator=or&userid=%25asuna%25').respond([count]);
      LineListService.getCount('asuna').then(function (response) {
        expect(angular.equals(response, count)).toBe(true);
      });
    });
  });

  it('should exportCSV', function () {
    $httpBackend.expectGET(HuronConfig.getCmiUrl() + '/voice/customers/' + Authinfo.getOrgId() + '/userlineassociations?limit=100&offset=0&order=internalnumber-asc').respond(lines);
    $httpBackend.expectGET(HuronConfig.getCmiUrl() + '/voice/customers/' + Authinfo.getOrgId() + '/userlineassociations?limit=100&offset=101&order=internalnumber-asc').respond([]);
    LineListService.exportCSV({})
      .then(function (response) {
        expect(response.length).toBe(linesExport.length);
      });
  });

});
