'use strict';

describe('Controller: CallServiceSettingsController', function () {

  beforeEach(angular.mock.module('Hercules'));
  beforeEach(angular.mock.module('Squared'));

  var controller, $scope, $httpBackend;
  beforeEach(inject(function ($controller, $rootScope, _$httpBackend_) {
    $httpBackend = _$httpBackend_;
    $httpBackend.expectGET('https://uss-integration.wbx2.com/uss/api/v1/orgs/null').respond(500, []);
    $httpBackend.expectGET('https://certs-integration.wbx2.com/certificate/api/v1/certificates?expand=decoded&orgId=null').respond(200, [{
      decoded: {
        subjectDN: 'O="Cisco Systems, Inc."'
      }
    }]);

    $scope = $rootScope.$new();
    controller = $controller('CallServiceSettingsController', {
      $scope: $scope,
      hasVoicemailFeatureToggle: true,
    });
    $scope.$apply();
  }));

  it('should use the formatting function to format its data', function () {
    controller.readCerts();
    $scope.$apply();
    $httpBackend.flush();
    expect(controller.formattedCertificateList[0].organization).toBe('Cisco Systems, Inc.');
  });

});
