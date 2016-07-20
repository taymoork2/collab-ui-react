'use strict';

describe('Service: CommonLineService', function () {
  var CommonLineService, TelephonyInfoService, Notification, $translate;
  var internalNumberPool = [];
  var externalNumberPool = [];
  var externalNumberPoolMap = [];
  var telephonyInfo = {};
  var assignedDn;
  var PATTERN_LIMIT = 50;
  var nameTemplate;
  var entitylist;

  beforeEach(module('Squared'));
  beforeEach(module('Huron'));

  beforeEach(inject(function (_Notification_, _TelephonyInfoService_, $translate, _CommonLineService_) {

    Notification = _Notification_;
    $translate = $translate;
    CommonLineService = _CommonLineService_;
    TelephonyInfoService = _TelephonyInfoService_;

    internalNumberPool = getJSONFixture('huron/json/internalNumbers/internalNumbers.json');
    externalNumberPool = getJSONFixture('huron/json/externalNumbers/externalNumbers.json');
    externalNumberPool = getJSONFixture('huron/json/externalNumberPoolMap/externalNumberPool.json');
    externalNumberPoolMap = getJSONFixture('huron/json/externalNumberPoolMap/externalNumberPoolMap.json');

    telephonyInfo = getJSONFixture('huron/json/settings/sites.json');

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

      it('getInternalNumberlist exists', function () {
        expect(CommonLineService.getInternalNumberlist).toBeDefined();
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
          "name": "Old River Room"
        }];
      });

      it('assignDNForUserList', function () {
        CommonLineService.assignDNForUserList(entitylist);
        expect(entitylist[0].assignedDn).toEqual(internalNumberPool[0]);
        expect(entitylist[0].externalNumber).toEqual(externalNumberPool[0]);
      });

      it('mapDidToDn', function () {
        CommonLineService.mapDidToDn();
        expect(externalNumberPoolMap.length).toEqual(1);
        expect(entitylist[0].externalNumber.pattern).toEqual('+14084744532');
        expect(entitylist[0].assignedDn).toEqual('4532');
      });
    });

  }));
});
