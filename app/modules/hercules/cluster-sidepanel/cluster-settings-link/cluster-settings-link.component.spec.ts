import clusterSettingsLink from './index';

describe('Component: ClusterSettingsLinkComponent  ', () => {
  let $componentController, $state, ctrl;

  beforeEach(angular.mock.module('Hercules'));

  beforeEach(function () {
    this.initModules(clusterSettingsLink);
  });

  beforeEach(inject(dependencies));
  beforeEach(initSpies);
  afterEach(cleanup);

  function dependencies (_$componentController_, _$state_) {
    $componentController = _$componentController_;
    $state = _$state_;
  }

  function cleanup() {
    $componentController = $state = ctrl = undefined;
  }

  function initSpies() {
    spyOn($state, 'go');
  }

  function initController(clusterType: string,
                          clusterId: string) {
    ctrl = $componentController('clusterSettingsLink', {}, {
      clusterType: clusterType,
      clusterId: clusterId,
    });
  }

  it ('will change state to hds-cluster.settings when the link is clicked', () => {
    let clusterType = 'hds_app';
    let clusterId = 'abcd1234';
    initController(clusterType, clusterId);
    expect(ctrl).toBeDefined();

    ctrl.goToClusterSettings();
    expect($state.go).toHaveBeenCalledWith('hds-cluster.settings', { id: clusterId });
  });

});
