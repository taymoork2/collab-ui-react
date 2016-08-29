'use strict';

describe('Service: SpeedDialsService', function () {
  var SpeedDialsService, $httpBackend, HuronConfig;
  var Authinfo = {
    getOrgId: jasmine.createSpy('getOrgId').and.returnValue('1')
  };

  var successSpy;
  var failureSpy;

  beforeEach(angular.mock.module('Squared'));
  beforeEach(angular.mock.module('Huron'));

  beforeEach(angular.mock.module(function ($provide) {
    $provide.value("Authinfo", Authinfo);
  }));

  beforeEach(inject(function (_SpeedDialsService_, _$httpBackend_, _HuronConfig_) {
    SpeedDialsService = _SpeedDialsService_;
    $httpBackend = _$httpBackend_;
    HuronConfig = _HuronConfig_;

    successSpy = jasmine.createSpy('success');
    failureSpy = jasmine.createSpy('failure');
  }));

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  describe('getSpeedDials', function () {
    it('should get list of speed dials', function () {
      $httpBackend.whenGET(HuronConfig.getCmiV2Url() + '/customers/1/users/2/speeddials').respond(200);
      SpeedDialsService.getSpeedDials(2).then(
        successSpy,
        failureSpy
      );
      $httpBackend.flush();
      expect(successSpy).toHaveBeenCalled();
      expect(failureSpy).not.toHaveBeenCalled();
    });

    it('should call error on 404', function () {
      $httpBackend.whenGET(HuronConfig.getCmiV2Url() + '/customers/1/users/2/speeddials').respond(404);
      SpeedDialsService.getSpeedDials(2).then(
        successSpy,
        failureSpy
      );
      $httpBackend.flush();
      expect(successSpy).not.toHaveBeenCalled();
      expect(failureSpy).toHaveBeenCalled();
    });
  });

  describe('updateSpeedDials', function () {
    it('should update the list of speed dials', function () {
      $httpBackend.whenPUT(HuronConfig.getCmiV2Url() + '/customers/1/users/2/bulk/speeddials').respond(200);
      SpeedDialsService.updateSpeedDials(2, []).then(
        successSpy,
        failureSpy
      );
      $httpBackend.flush();
      expect(successSpy).toHaveBeenCalled();
      expect(failureSpy).not.toHaveBeenCalled();
    });

    it('should call error on 404', function () {
      $httpBackend.whenPUT(HuronConfig.getCmiV2Url() + '/customers/1/users/2/bulk/speeddials').respond(404);
      SpeedDialsService.updateSpeedDials(2, []).then(
        successSpy,
        failureSpy
      );
      $httpBackend.flush();
      expect(successSpy).not.toHaveBeenCalled();
      expect(failureSpy).toHaveBeenCalled();
    });
  });
});
