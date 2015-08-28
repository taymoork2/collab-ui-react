'use strict';

describe('Service: PstnSetupService', function () {
  var $rootScope, $q, ExternalNumberService, PstnSetupService, ExternalNumberPool;
  var allNumbers, pendingNumbers, unassignedNumbers, assignedNumbers, externalNumbers;
  var pstnSetupDefer, externalNumberDefer;

  beforeEach(module('Huron'));

  beforeEach(inject(function (_$rootScope_, _$q_, _ExternalNumberService_, _PstnSetupService_, _ExternalNumberPool_) {
    $rootScope = _$rootScope_;
    $q = _$q_;
    ExternalNumberService = _ExternalNumberService_;
    PstnSetupService = _PstnSetupService_;
    ExternalNumberPool = _ExternalNumberPool_;

    pendingNumbers = [{
      pattern: '123'
    }, {
      pattern: '456'
    }];

    unassignedNumbers = [{
      uuid: '55555555',
      pattern: '555'
    }, {
      uuid: '66666666',
      pattern: '666',
      directoryNumber: null
    }];

    assignedNumbers = [{
      uuid: '77777777',
      pattern: '777',
      directoryNumber: {
        uuid: '7777-7777'
      }
    }, {
      uuid: '88888888',
      pattern: '888',
      directoryNumber: {
        uuid: '8888-8888'
      }
    }];

    externalNumbers = unassignedNumbers.concat(assignedNumbers);
    allNumbers = pendingNumbers.concat(externalNumbers);

    spyOn(PstnSetupService, 'listPendingNumbers').and.returnValue($q.when(pendingNumbers));
    spyOn(ExternalNumberPool, 'getAll').and.returnValue($q.when(externalNumbers));
  }));

  it('should refresh numbers', function () {
    var promise = ExternalNumberService.refreshNumbers();

    $rootScope.$apply();
    expect(ExternalNumberService.getAllNumbers()).toEqual(allNumbers);
    expect(ExternalNumberService.getPendingNumbers()).toEqual(pendingNumbers);
    expect(ExternalNumberService.getUnassignedNumbers()).toEqual(unassignedNumbers);
  });

  it('should clear numbers on pending error', function () {
    PstnSetupService.listPendingNumbers.and.returnValue($q.reject({}));
    var promise = ExternalNumberService.refreshNumbers();

    $rootScope.$apply();
    expect(ExternalNumberService.getAllNumbers()).toEqual([]);
    expect(ExternalNumberService.getPendingNumbers()).toEqual([]);
    expect(ExternalNumberService.getUnassignedNumbers()).toEqual([]);
  });

  it('should clear only pending numbers on pending 404', function () {
    PstnSetupService.listPendingNumbers.and.returnValue($q.reject({
      status: 404
    }));
    var promise = ExternalNumberService.refreshNumbers();

    $rootScope.$apply();
    expect(ExternalNumberService.getAllNumbers()).toEqual(externalNumbers);
    expect(ExternalNumberService.getPendingNumbers()).toEqual([]);
    expect(ExternalNumberService.getUnassignedNumbers()).toEqual(unassignedNumbers);
  });

  it('should clear numbers on external number error', function () {
    ExternalNumberPool.getAll.and.returnValue($q.reject({}));
    var promise = ExternalNumberService.refreshNumbers();

    $rootScope.$apply();
    expect(ExternalNumberService.getAllNumbers()).toEqual([]);
    expect(ExternalNumberService.getPendingNumbers()).toEqual([]);
    expect(ExternalNumberService.getUnassignedNumbers()).toEqual([]);
  });

});
