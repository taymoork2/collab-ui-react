'use strict';

describe('Controller: MediafusionClusterSettingsController', function () {
  beforeEach(function () {
    this.initModules(
      'Hercules',
      'Mediafusion'
    );
    this.injectDependencies(
      '$q',
      'HybridServicesClusterService',
      'MediaClusterServiceV2'
    );

    this.properties = {
      'mf.ucSipTrunk': 'sipurl',
      'mf.trustedSipSources': '1.1.1.1, 2.2.2.2',
    };

    spyOn(this.HybridServicesClusterService, 'getAll').and.returnValue(this.$q.resolve());
    spyOn(this.MediaClusterServiceV2, 'getProperties')
      .and.returnValue(this.$q.resolve(this.properties));
    spyOn(this.MediaClusterServiceV2, 'setProperties').and.returnValue(this.$q.resolve());

    this.initController('MediafusionClusterSettingsController', {
      controllerLocals: {
        hasMFFeatureToggle: true,
        hasMFSIPFeatureToggle: true,
      },
    });
  });

  it('check if saveSipTrunk is called', function () {
    this.controller.saveSipTrunk();
    expect(this.MediaClusterServiceV2.setProperties).toHaveBeenCalled();
    expect(this.controller.sipurlconfiguration).toBe('sipurl');
  });

  it('check if saveTrustedSip is called', function () {
    this.controller.saveTrustedSip();
    expect(this.MediaClusterServiceV2.setProperties).toHaveBeenCalled();
  });
});
