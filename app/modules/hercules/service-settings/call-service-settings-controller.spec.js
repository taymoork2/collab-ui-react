'use strict';

describe('Controller: CallServiceSettingsController', function () {

  beforeEach(angular.mock.module('Hercules'));
  beforeEach(angular.mock.module('Squared'));

  var controller, $scope, $httpBackend;
  beforeEach(inject(function ($controller, $rootScope, _$httpBackend_, Analytics) {
    $httpBackend = _$httpBackend_;
    $httpBackend.expectGET('https://atlas-intb.ciscospark.com/admin/api/v1/organizations/null?basicInfo=true&disableCache=false').respond(200, true);
    $httpBackend.expectGET('https://uss-intb.ciscospark.com/uss/api/v1/orgs/null').respond(500, []);
    $httpBackend.expectGET('https://certs-intb.ciscospark.com/certificate/api/v1/certificates?expand=decoded&orgId=null').respond(200, [{
      decoded: {
        subjectDN: 'O="Cisco Systems, Inc."',
      },
    }]);

    spyOn(Analytics, 'trackHSNavigation');

    $scope = $rootScope.$new();
    controller = $controller('CallServiceSettingsController', {
      $scope: $scope,
      hasVoicemailFeatureToggle: true,
      hasAtlasHybridCallDiagnosticTool: false,
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
