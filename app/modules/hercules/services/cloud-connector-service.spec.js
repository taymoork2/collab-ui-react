'use strict';

describe('Service: CloudConnectorService', function () {

  var CloudConnectorService, $scope;

  beforeEach(angular.mock.module('Hercules'));
  beforeEach(angular.mock.module(mockDependencies));
  beforeEach(inject(dependencies));

  function dependencies(_CloudConnectorService_, $rootScope) {
    CloudConnectorService = _CloudConnectorService_;
    $scope = $rootScope.$new();
  }

  function mockDependencies($provide) {
    var Authinfo = {
      getOrgId: sinon.stub().returns('fe5acf7a-6246-484f-8f43-3e8c910fc50d'),
      isFusionGoogleCal: sinon.stub().returns(true),
    };
    $provide.value('Authinfo', Authinfo);
  }

  describe('.isServiceSetup()', function () {

    it('should return true if service is set up', function () {
      var serviceId = 'squared-fusion-gcal';
      CloudConnectorService.isServiceSetup(serviceId)
        .then(function (isSetup) {
          expect(isSetup).toBe(true);
        });
      $scope.$apply();
    });

    it('should return false for services that do not exist', function () {
      var serviceId = 'squared-fusion-bogus';
      CloudConnectorService.isServiceSetup(serviceId)
        .then(function (isSetup) {
          expect(isSetup).toBe(false);
        });
      $scope.$apply();
    });

  });

  describe('.getServiceAccount()', function () {

    it('should return a Google Calendar service account', function () {
      var serviceId = 'squared-fusion-gcal';
      CloudConnectorService.getServiceAccount(serviceId)
        .then(function (serviceAccount) {
          expect(serviceAccount).toBe('google@example.org');
        });
      $scope.$apply();
    });


  });


});
