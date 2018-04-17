'use strict';

describe('Service: CommonLineService', function () {
  var CommonLineService, TelephonyInfoService, NumberService, $q, $rootScope;
  var internalNumberPool = [];
  var externalNumberPool = [];
  var entitylist;

  beforeEach(angular.mock.module('Squared'));
  beforeEach(angular.mock.module('Huron'));

  beforeEach(inject(function (_$q_, _$rootScope_, _CommonLineService_, _TelephonyInfoService_, _NumberService_) {
    $q = _$q_;
    $rootScope = _$rootScope_;
    CommonLineService = _CommonLineService_;
    TelephonyInfoService = _TelephonyInfoService_;
    NumberService = _NumberService_;

    internalNumberPool = getJSONFixture('huron/json/internalNumbers/numbersInternalNumbers.json');
    externalNumberPool = getJSONFixture('huron/json/externalNumbers/externalNumbers.json');
    externalNumberPool = getJSONFixture('huron/json/externalNumberPoolMap/externalNumberPool.json');

    spyOn(NumberService, 'getNumberList').and.returnValue($q.resolve(internalNumberPool));
    spyOn(TelephonyInfoService, 'loadExternalNumberPool').and.returnValue($q.resolve(externalNumberPool));
    spyOn(TelephonyInfoService, 'loadExtPoolWithMapping');
  }));

  describe('Existence of the services', function () {
    it('loadPrimarySiteInfo exists', function () {
      expect(CommonLineService.loadPrimarySiteInfo).toBeDefined();
    });

    it('loadInternalNumberPool exists', function () {
      expect(CommonLineService.loadInternalNumberPool).toBeDefined();
    });

    it('loadExternalNumberPool exists', function () {
      expect(CommonLineService.loadExternalNumberPool).toBeDefined();
    });

    it('checkDnOverlapsSteeringDigit exists', function () {
      expect(CommonLineService.checkDnOverlapsSteeringDigit).toBeDefined();
    });

    it('assignDNForUserList exists', function () {
      expect(CommonLineService.assignDNForUserList).toBeDefined();
    });

    it('returnInternalNumberList exists', function () {
      expect(CommonLineService.returnInternalNumberList).toBeDefined();
    });

    it('returnExternalNumberList exists', function () {
      expect(CommonLineService.returnExternalNumberList).toBeDefined();
    });

    it('getEntitylist exists', function () {
      expect(CommonLineService.getEntitylist).toBeDefined();
    });

    it('setEntitylist exists', function () {
      expect(CommonLineService.setEntitylist).toBeDefined();
    });

    it('getInternalNumberPool exists', function () {
      expect(CommonLineService.getInternalNumberPool).toBeDefined();
    });

    it('getExternalNumberPool exists', function () {
      expect(CommonLineService.getExternalNumberPool).toBeDefined();
    });

    it('getNameTemplate exists', function () {
      expect(CommonLineService.getNameTemplate).toBeDefined();
    });

    it('mapDidToDn exists', function () {
      expect(CommonLineService.mapDidToDn).toBeDefined();
    });

    it('isDnNotAvailable exists', function () {
      expect(CommonLineService.isDnNotAvailable).toBeDefined();
    });
  });

  describe('UserAdd DID and DN assignment', function () {
    beforeEach(function () {
      entitylist = [{
        name: 'Old River Room',
      }];
    });

    it('assignDNForUserList', function () {
      CommonLineService.assignDNForUserList(entitylist);
      expect(entitylist[0].assignedDn).toEqual(undefined);
      expect(entitylist[0].externalNumber).toEqual(undefined);

      CommonLineService.loadInternalNumberPool();
      CommonLineService.loadExternalNumberPool();
      $rootScope.$digest();

      CommonLineService.assignDNForUserList(entitylist);
      expect(entitylist[0].assignedDn).toEqual(internalNumberPool[0]);
      expect(entitylist[0].externalNumber).toEqual(externalNumberPool[0]);
    });

    it('mapDidToDn', function () {
      CommonLineService.mapDidToDn(entitylist);
      expect(TelephonyInfoService.loadExtPoolWithMapping).toHaveBeenCalledWith(1);
    });
  });

  describe('checkDnOverlapsSteeringDigit function', function () {
    var entity;
    beforeEach(function () {
      spyOn(TelephonyInfoService, 'getPrimarySiteInfo').and.returnValue($q.resolve({
        steeringDigit: '9',
      }));
      entity = {
        assignedDn: {
          pattern: '912',
        },
      };
    });

    it('should be false if telephonyInfo has never been loaded', function () {
      expect(CommonLineService.checkDnOverlapsSteeringDigit(entity)).toBe(false);
      CommonLineService.loadPrimarySiteInfo();
      $rootScope.$digest();
      expect(CommonLineService.checkDnOverlapsSteeringDigit(entity)).toBe(true);
    });

    it('should be false if telephonyInfo is undefined', function () {
      TelephonyInfoService.getPrimarySiteInfo.and.returnValue($q.resolve());
      expect(CommonLineService.checkDnOverlapsSteeringDigit(entity)).toBe(false);
      CommonLineService.loadPrimarySiteInfo();
      $rootScope.$digest();
      expect(CommonLineService.checkDnOverlapsSteeringDigit(entity)).toBe(false);
    });
  });
});
