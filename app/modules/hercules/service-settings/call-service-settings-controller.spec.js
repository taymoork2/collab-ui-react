'use strict';

describe('Controller: CallServiceSettingsController', function () {
  beforeEach(function () {
    this.initModules('Hercules', 'Squared');
    this.injectDependencies('$controller', '$httpBackend', '$scope', '$q', 'Analytics', 'FeatureToggleService');

    spyOn(this.Analytics, 'trackHSNavigation');
    spyOn(this.FeatureToggleService, 'atlas2017NameChangeGetStatus').and.returnValue(this.$q.resolve(false));

    this.$httpBackend.whenGET('https://atlas-intb.ciscospark.com/admin/api/v1/organizations/null?basicInfo=true&disableCache=false').respond(200, true);
    this.$httpBackend.whenGET('https://uss-intb.ciscospark.com/uss/api/v1/orgs/null').respond(500, []);
    this.$httpBackend.whenGET('https://certs-intb.ciscospark.com/certificate/api/v1/certificates?expand=decoded&orgId=null').respond(200, [{
      decoded: {
        subjectDN: 'O="Cisco Systems, Inc."',
      },
    }]);

    this.initController = function () {
      this.controller = this.$controller('CallServiceSettingsController', {
        $scope: this.$scope,
        hasVoicemailFeatureToggle: true,
        hasAtlasHybridCallDiagnosticTool: false,
      });
      this.$scope.$apply();
    };
    this.initController();
  });

  it('should use the formatting function to format its data', function () {
    this.controller.readCerts();
    this.$scope.$apply();
    this.$httpBackend.flush();
    expect(this.controller.formattedCertificateList[0].organization).toBe('Cisco Systems, Inc.');
  });

  // 2017 name change
  it('nameChangeEnabled should always match what atlas2017NameChangeGetStatus returns', function () {
    this.$httpBackend.flush();
    expect(this.controller.nameChangeEnabled).toBeFalsy();

    this.FeatureToggleService.atlas2017NameChangeGetStatus.and.returnValue(this.$q.resolve(true));
    this.initController();
    this.$httpBackend.flush();
    expect(this.controller.nameChangeEnabled).toBeTruthy();
  });
});
