import testModule from './index';

describe('Component: HCS Precheck Modal', () => {
  beforeEach(function () {
    this.initModules(testModule, 'Core');
    this.injectDependencies(
      '$interval',
      '$state',
      'HcsUpgradeService',
    );

    spyOn(this.HcsUpgradeService, 'startTasks').and.returnValue(this.$q.resolve({
      clusterUuid: '123',
      uuid: '456',
    }));
    spyOn(this.$state, 'go');
    this.compileComponent('hcsPrecheckModal', {});
    this.controller.clusterUuid = '123';
    this.controller.groupId = '789';
  });

  it('should get the list of tasks', function () {
    this.controller.spacePrecheck = true;
    this.controller.copPrecheck = false;

    const tasks = this.controller.getTasks();

    expect(tasks).toEqual(['disk_space']);
  });

  it('should run prechecks', function () {
    this.controller.runPrechecks();
    expect(this.HcsUpgradeService.startTasks).toHaveBeenCalled();
  });

  it('should continue after prechecks', function () {
    this.controller.continue();
    expect(this.$state.go).toHaveBeenCalledWith('hcs.upgradeClusterStatus', { clusterId: '123', groupId: '789' });
  });
});
