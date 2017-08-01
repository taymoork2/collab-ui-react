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
    };

    spyOn(this.HybridServicesClusterService, 'getAll').and.returnValue(this.$q.resolve());
    spyOn(this.MediaClusterServiceV2, 'getProperties')
      .and.returnValue(this.$q.resolve(this.properties));
    spyOn(this.MediaClusterServiceV2, 'setProperties').and.returnValue(this.$q.resolve());

    this.initController('MediafusionClusterSettingsController', {
      controllerLocals: {
        hasMFFeatureToggle: true,
      },
    });
  });

  it('check if saveSipTrunk is called', function () {
    this.controller.saveSipTrunk();
    expect(this.MediaClusterServiceV2.setProperties).toHaveBeenCalled();
  });
});
