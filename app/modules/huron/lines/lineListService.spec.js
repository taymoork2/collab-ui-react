'use strict';

describe('Service: LineListService', function () {
  var $httpBackend, $q, $scope, ExternalNumberService, FeatureToggleService, HuronConfig, LineListService, PstnService;
  var lines = getJSONFixture('huron/json/lines/numbers.json');
  var locationLines = getJSONFixture('huron/json/lines/locationNumbers.json');
  var linesExport = getJSONFixture('huron/json/lines/numbersCsvExport.json');
  var locationLinesExport = getJSONFixture('huron/json/lines/locationNumbersCsvExport.json');
  var pendingLines = _.cloneDeep(getJSONFixture('huron/json/lines/pendingNumbersV2.json'));
  var formattedPendingLines = getJSONFixture('huron/json/lines/formattedPendingNumbers.json');
  var carrierInfo = getJSONFixture('huron/json/lines/carrierInfo.json');

  var Authinfo = {
    getOrgId: jasmine.createSpy('getOrgId').and.returnValue('1'),
  };

  beforeEach(angular.mock.module('Huron'));
  beforeEach(angular.mock.module('Sunlight'));

  var authInfo = {
    getOrgId: jasmine.createSpy('getOrgId').and.returnValue('1'),
  };

  beforeEach(angular.mock.module(function ($provide) {
    $provide.value('Authinfo', authInfo);
  }));

  beforeEach(inject(function ($rootScope, _$httpBackend_, _$q_, _ExternalNumberService_, _FeatureToggleService_, _HuronConfig_, _LineListService_, _PstnService_) {
    $scope = $rootScope.$new();
    $httpBackend = _$httpBackend_;
    $q = _$q_;
    ExternalNumberService = _ExternalNumberService_;
    HuronConfig = _HuronConfig_;
    LineListService = _LineListService_;
    PstnService = _PstnService_;
    FeatureToggleService = _FeatureToggleService_;

    spyOn(PstnService, 'listPendingOrdersWithDetail').and.returnValue($q.resolve());
    spyOn(PstnService, 'translateStatusMessage');
    spyOn(ExternalNumberService, 'isTerminusCustomer').and.returnValue($q.resolve());
    spyOn(ExternalNumberService, 'getCarrierInfo').and.returnValue($q.resolve(carrierInfo));
  }));

  describe('getLineList', function () {
    beforeEach(function () {
      spyOn(FeatureToggleService, 'supports').and.returnValue($q.resolve(false));
    });
    it('should have the right carrierInfo', function () {
      $httpBackend.expectGET(HuronConfig.getCmiUrl() + '/voice/customers/' + Authinfo.getOrgId() + '/userlineassociations?limit=100&offset=0&order=userid-asc').respond(lines);
      LineListService.getLineList(0, 100, 'userid', '-asc', '', 'all').then(function (response) {
        expect(angular.equals(response, lines)).toBe(true);
        expect(LineListService.getApiImplementation()).toEqual('SWIVEL');
        expect(LineListService.getCarrierName()).toEqual('BYO-PSTN');
      });
    });

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

    it('should set search criteria assignedlines=true', function () {
      $httpBackend.expectGET(HuronConfig.getCmiUrl() + '/voice/customers/' + Authinfo.getOrgId() + '/userlineassociations?assignedlines=false&limit=100&offset=0&order=userid-asc').respond(lines);
      LineListService.getLineList(0, 100, 'userid', '-asc', '', 'unassignedLines').then(function (response) {
        expect(angular.equals(response, lines)).toBe(true);
      });
    });

    it('should set search criteria assignedlines=false', function () {
      $httpBackend.expectGET(HuronConfig.getCmiUrl() + '/voice/customers/' + Authinfo.getOrgId() + '/userlineassociations?assignedlines=true&limit=100&offset=0&order=userid-asc').respond(lines);
      LineListService.getLineList(0, 100, 'userid', '-asc', '', 'assignedLines').then(function (response) {
        expect(angular.equals(response, lines)).toBe(true);
      });
    });

    it('should set search criteria pending and return pending orders', function () {
      PstnService.listPendingOrdersWithDetail.and.returnValue($q.resolve(pendingLines));
      PstnService.translateStatusMessage.and.returnValue('Order cannot be fulfilled for trials');
      $httpBackend.expectGET(HuronConfig.getCmiUrl() + '/voice/customers/' + Authinfo.getOrgId() + '/userlineassociations?limit=100&offset=0&order=userid-asc').respond(lines);
      $scope.$apply();
      LineListService.getLineList(0, 100, 'userid', '-asc', '', 'pending').then(function (response) {
        expect(response).toEqual(formattedPendingLines);
      });
    });

    it('should set search criteria all and include pending orders', function () {
      PstnService.listPendingOrdersWithDetail.and.returnValue($q.resolve(pendingLines));
      PstnService.translateStatusMessage.and.returnValue('Order cannot be fulfilled for trials');
      $httpBackend.expectGET(HuronConfig.getCmiUrl() + '/voice/customers/' + Authinfo.getOrgId() + '/userlineassociations?limit=100&offset=0&order=userid-asc').respond(lines);
      $scope.$apply();
      LineListService.getLineList(0, 100, 'userid', '-asc', '', 'all').then(function (response) {
        expect(angular.equals(response, lines.concat(formattedPendingLines))).toBe(true);
      });
    });

    it('should set search criteria to pending and and return nothing if lines is empty', function () {
      PstnService.listPendingOrdersWithDetail.and.returnValue($q.resolve(pendingLines));
      $httpBackend.expectGET(HuronConfig.getCmiUrl() + '/voice/customers/' + Authinfo.getOrgId() + '/userlineassociations?limit=100&offset=0&order=userid-asc').respond([]);
      $scope.$apply();
      LineListService.getLineList(0, 100, 'userid', '-asc', '', 'pending').then(function (response) {
        expect(angular.equals(response, [])).toBe(true);
      });
    });

    it('should set search criteria to all and and return lines and not query pending since not a terminus customer', function () {
      ExternalNumberService.isTerminusCustomer.and.returnValue($q.reject());
      $httpBackend.expectGET(HuronConfig.getCmiUrl() + '/voice/customers/' + Authinfo.getOrgId() + '/userlineassociations?limit=100&offset=0&order=userid-asc').respond(lines);
      $scope.$apply();
      LineListService.getLineList(0, 100, 'userid', '-asc', '', 'all').then(function (response) {
        expect(angular.equals(response, lines)).toBe(true);
        expect(PstnService.listPendingOrdersWithDetail).not.toHaveBeenCalled();
      });
    });

    it('should set search criteria to pending and and return nothing since not a terminus customer', function () {
      ExternalNumberService.isTerminusCustomer.and.returnValue($q.reject());
      $httpBackend.expectGET(HuronConfig.getCmiUrl() + '/voice/customers/' + Authinfo.getOrgId() + '/userlineassociations?limit=100&offset=0&order=userid-asc').respond([]);
      $scope.$apply();
      LineListService.getLineList(0, 100, 'userid', '-asc', '', 'pending').then(function (response) {
        expect(angular.equals(response, [])).toBe(true);
        expect(PstnService.listPendingOrdersWithDetail).not.toHaveBeenCalled();
      });
    });

    it('should remove any lines that already exist in the overall list and replace them', function () {
      var exisitingLines = lines.concat(formattedPendingLines);
      var length = exisitingLines.length;
      PstnService.listPendingOrdersWithDetail.and.returnValue($q.resolve(pendingLines));
      PstnService.translateStatusMessage.and.returnValue('Order cannot be fulfilled for trials');
      $httpBackend.expectGET(HuronConfig.getCmiUrl() + '/voice/customers/' + Authinfo.getOrgId() + '/userlineassociations?limit=100&offset=100&order=userid-asc').respond(formattedPendingLines);
      $scope.$apply();
      LineListService.getLineList(100, 100, 'userid', '-asc', '', 'all', exisitingLines).then(function (response) {
        expect(angular.equals(response, formattedPendingLines)).toBe(true);
        exisitingLines = exisitingLines.concat(response);
        expect(length).toEqual(exisitingLines.length);
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

  describe('get LineList with Toggle SET', function () {
    beforeEach(function () {
      spyOn(FeatureToggleService, 'supports').and.returnValue($q.resolve(true));
    });
    it('should exportCSV', function () {
      $httpBackend.expectGET(HuronConfig.getCmiUrl() + '/voice/customers/' + Authinfo.getOrgId() + '/userlineassociations?limit=100&offset=0&order=internalnumber-asc').respond(locationLines);
      $httpBackend.expectGET(HuronConfig.getCmiUrl() + '/voice/customers/' + Authinfo.getOrgId() + '/userlineassociations?limit=100&offset=101&order=internalnumber-asc').respond([]);
      LineListService.exportCSV({})
        .then(function (response) {
          expect(response.length).toBe(locationLinesExport.length);
        });
    });
  });
});
