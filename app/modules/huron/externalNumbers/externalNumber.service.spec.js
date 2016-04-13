'use strict';

describe('Service: ExternalNumberService', function () {
  var $rootScope, $httpBackend, $q, ExternalNumberService, HuronConfig, PstnSetupService, ExternalNumberPool;
  var allNumbers, pendingNumbers, unassignedNumbers, assignedNumbers, externalNumbers, numberResponse, noNumberResponse;
  var customerId, externalNumber;

  beforeEach(module('Huron'));

  beforeEach(inject(function (_$rootScope_, _$httpBackend_, _$q_, _ExternalNumberService_, _HuronConfig_, _PstnSetupService_, _ExternalNumberPool_) {
    $rootScope = _$rootScope_;
    $httpBackend = _$httpBackend_;
    $q = _$q_;
    ExternalNumberService = _ExternalNumberService_;
    PstnSetupService = _PstnSetupService_;
    ExternalNumberPool = _ExternalNumberPool_;
    HuronConfig = _HuronConfig_;

    customerId = '12345-67890-12345';
    externalNumber = {
      uuid: '22222-33333',
      pattern: '+14795552233'
    };

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

    numberResponse = {
      numbers: [1, 2, 3]
    };

    noNumberResponse = {
      numbers: []
    };

    externalNumbers = unassignedNumbers.concat(assignedNumbers);
    allNumbers = pendingNumbers.concat(externalNumbers);

    spyOn(PstnSetupService, 'listPendingNumbers').and.returnValue($q.when(pendingNumbers));
    spyOn(PstnSetupService, 'isCarrierSwivel').and.returnValue($q.when(false));
    spyOn(PstnSetupService, 'getCustomer').and.returnValue($q.when());
    spyOn(PstnSetupService, 'deleteNumber');
    spyOn(ExternalNumberPool, 'deletePool');
    spyOn(ExternalNumberPool, 'getAll').and.returnValue($q.when(externalNumbers));
  }));

  it('should only retrieve external numbers if not a terminus customer', function () {
    $httpBackend.expectGET(HuronConfig.getCmiV2Url() + '/customers/' + customerId + '/numbers?type=external').respond(numberResponse);
    PstnSetupService.getCustomer.and.returnValue($q.reject());

    ExternalNumberService.refreshNumbers(customerId);
    $httpBackend.flush();

    expect(ExternalNumberService.getAllNumbers()).toEqual(externalNumbers);
    expect(ExternalNumberService.getPendingNumbers()).toEqual([]);
    expect(ExternalNumberService.getUnassignedNumbers()).toEqual(unassignedNumbers);
  });

  it('should refresh numbers', function () {
    ExternalNumberService.refreshNumbers();

    $rootScope.$apply();
    expect(ExternalNumberService.getAllNumbers()).toEqual(allNumbers);
    expect(ExternalNumberService.getPendingNumbers()).toEqual(pendingNumbers);
    expect(ExternalNumberService.getUnassignedNumbers()).toEqual(unassignedNumbers);
  });

  it('should get unassigned numbers that aren\'t pending', function () {
    var unassignedAndPendingNumbers = unassignedNumbers.concat(pendingNumbers);
    var externalNumbers = unassignedAndPendingNumbers.concat(assignedNumbers);
    ExternalNumberPool.getAll.and.returnValue($q.when(externalNumbers));

    ExternalNumberService.refreshNumbers();

    $rootScope.$apply();
    expect(ExternalNumberService.getAllNumbers()).toEqual(allNumbers);
    expect(ExternalNumberService.getPendingNumbers()).toEqual(pendingNumbers);
    expect(ExternalNumberService.getUnassignedNumbers()).toEqual(unassignedAndPendingNumbers);
    expect(ExternalNumberService.getUnassignedNumbersWithoutPending()).toEqual(unassignedNumbers);
  });

  it('should clear numbers on pending error', function () {
    PstnSetupService.listPendingNumbers.and.returnValue($q.reject({}));
    ExternalNumberService.refreshNumbers();

    $rootScope.$apply();
    expect(ExternalNumberService.getAllNumbers()).toEqual([]);
    expect(ExternalNumberService.getPendingNumbers()).toEqual([]);
    expect(ExternalNumberService.getUnassignedNumbers()).toEqual([]);
  });

  it('should clear only pending numbers on pending 404', function () {
    PstnSetupService.listPendingNumbers.and.returnValue($q.reject({
      status: 404
    }));
    ExternalNumberService.refreshNumbers();

    $rootScope.$apply();
    expect(ExternalNumberService.getAllNumbers()).toEqual(externalNumbers);
    expect(ExternalNumberService.getPendingNumbers()).toEqual([]);
    expect(ExternalNumberService.getUnassignedNumbers()).toEqual(unassignedNumbers);
  });

  it('should clear numbers on external number error', function () {
    ExternalNumberPool.getAll.and.returnValue($q.reject({}));
    ExternalNumberService.refreshNumbers();

    $rootScope.$apply();
    expect(ExternalNumberService.getAllNumbers()).toEqual([]);
    expect(ExternalNumberService.getPendingNumbers()).toEqual([]);
    expect(ExternalNumberService.getUnassignedNumbers()).toEqual([]);
  });

  it('should delete numbers from terminus', function () {
    ExternalNumberService.deleteNumber(customerId, externalNumber);
    $rootScope.$apply();

    expect(PstnSetupService.deleteNumber).toHaveBeenCalledWith(customerId, externalNumber.pattern);
    expect(ExternalNumberPool.deletePool).not.toHaveBeenCalled();
  });

  it('should delete numbers from cmi instead of Terminus', function () {
    $httpBackend.expectGET(HuronConfig.getCmiV2Url() + '/customers/' + customerId + '/numbers?type=external').respond(numberResponse);
    PstnSetupService.getCustomer.and.returnValue($q.reject());

    ExternalNumberService.deleteNumber(customerId, externalNumber);
    $httpBackend.flush();

    expect(PstnSetupService.deleteNumber).not.toHaveBeenCalled();
    expect(ExternalNumberPool.deletePool).toHaveBeenCalledWith(customerId, externalNumber.uuid);
  });

  describe('isTerminus customer function', function () {
    it('should return true for existing Terminus customer', function () {
      ExternalNumberService.isTerminusCustomer(customerId).then(function (response) {
        expect(response).toBe(true);
      });
    });

    it('should return true for no Terminus customer and has no numbers', function () {
      $httpBackend.expectGET(HuronConfig.getCmiV2Url() + '/customers/' + customerId + '/numbers?type=external').respond(noNumberResponse);
      PstnSetupService.getCustomer.and.returnValue($q.reject());
      var value = ExternalNumberService.isTerminusCustomer(customerId);
      $httpBackend.flush();
      $q.when(value).then(function (response) {
        expect(response).toBe(true);
      });
    });

    it('should return false for no Terminus customer and has numbers', function () {
      $httpBackend.expectGET(HuronConfig.getCmiV2Url() + '/customers/' + customerId + '/numbers?type=external').respond(numberResponse);
      PstnSetupService.getCustomer.and.returnValue($q.reject());
      var value = ExternalNumberService.isTerminusCustomer(customerId);
      $httpBackend.flush();
      $q.when(value).then(function (response) {
        expect(response).toBe(false);
      });
    });
  });

});
