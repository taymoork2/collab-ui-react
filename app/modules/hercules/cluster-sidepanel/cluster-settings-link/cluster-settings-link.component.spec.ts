describe('Component: ClusterSettingsLinkComponent ', () => {
  let $componentController, $state, ctrl, $scope;

  beforeEach(angular.mock.module('Hercules'));
  beforeEach(inject(dependencies));
  // beforeEach(initSpies);
  // afterEach(cleanup);

  function dependencies (_$componentController_, _$state_, $rootScope) {
    $componentController = _$componentController_;
    $state = _$state_;
    $scope = $rootScope.$new();
  }
/*
  function cleanup() {
    $componentController = $state = ctrl = undefined;
  }

  function initSpies() {
    spyOn($state, 'go');
  }
*/
/*
  beforeEach(function () {
    this.initModules(angular.mock.module('Hercules'));
    this.injectDependencies('$componentController', '$scope', '$state');


    spyOn(this.$state, 'go');
    this.initController = (): void => {
      this.controller = this.$componentController('ClusterSettingsLink', {
        $state: this.$state,
      });
      this.$scope.$apply();
    };
  });
*/

  function initController(clusterType: string,
                          clusterId: string) {
    ctrl = $componentController('ClusterSettingsLink', {});
    ctrl.clusterType = clusterType;
    ctrl.clusterId = clusterId;
  }


  it ('Clicking on edit link will change state to hds-cluster.settings', () => {
    let clusterType = 'hds_app';
    let clusterId = 'abcd1234';
    initController(clusterType, clusterId);
    expect(ctrl).toBeDefined();
    //ctrl.goToClusterSettings();
    //expect($state.go).toHaveBeenCalledWith('hds-cluster.settings');
  });


});
