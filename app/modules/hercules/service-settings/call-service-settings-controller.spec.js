'use strict';

describe('Controller: CallServiceSettingsController', function () {
  beforeEach(function () {
    this.initModules('Hercules', 'Squared');
    this.injectDependencies('$controller', '$httpBackend', '$modal', '$scope', '$q', 'Analytics');

    spyOn(this.Analytics, 'trackHSNavigation');

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

  it('should open the correct modal window ', function () {
    spyOn(this.$modal, 'open').and.callFake(function () {
      return {
        result: function () {},
      };
    });
    this.controller.openSipTestResults();

    expect(this.$modal.open).toHaveBeenCalledWith(jasmine.objectContaining({
      controller: 'VerifySipDestinationModalController',
      controllerAs: 'vm',
      template: require('modules/hercules/service-settings/verify-sip-destination/verify-sip-destination-modal.html'),
    }));
  });
});
