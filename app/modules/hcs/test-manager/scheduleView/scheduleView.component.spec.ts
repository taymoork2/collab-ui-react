import hcsTaasSchedule from './index';
import { State } from 'modules/hcs/test-manager/taskManager.const';

describe('Component: TaasScheduleViewComponent',  () => {

  beforeEach(function() {
    this.initModules(hcsTaasSchedule);
    this.injectDependencies(
      'HcsTestManagerService',
      '$state',
      '$modal',
      '$translate',
      '$q',
    );
    spyOn(this.HcsTestManagerService, 'getSchedules').and.returnValue(this.$q.reject());
    spyOn(this.$state, 'go');
    this.compileComponent('taasScheduleView', {});
  });

  it('should have pageState equal RELOAD', function() {
    this.controller.$onInit();
    expect(this.controller.pageState).toBe(State.Reload);
  });
  it('should reload the page', function() {
    this.controller.reload();
    expect(this.$state.go).toHaveBeenCalled();
  });
});

describe('Component: TaasScheduleViewComponent',  () => {

  beforeEach(function() {
    this.initModules(hcsTaasSchedule);
    this.injectDependencies(
      'HcsTestManagerService',
      '$state',
      '$modal',
      '$translate',
      '$q',
    );
    spyOn(this.HcsTestManagerService, 'getSchedules');
    this.HcsTestManagerService.getSchedules.and.returnValue(this.$q.resolve([]));
    this.compileComponent('taasScheduleView', {});
  });

  it('should have pageState equal NEW', function() {
    this.controller.$onInit();
    expect(this.controller.pageState).toBe(State.New);
  });
});

describe('Component: TaasScheduleViewComponent',  () => {
  const SUCCESS_DATA = [{
    customerId: '123',
    id: '456',
    isImmediate: false,
    name: 'Testing 123',
    schedule: '2 0 * * *',
    suites: '',
  }];

  beforeEach(function() {
    this.initModules(hcsTaasSchedule);
    this.injectDependencies(
      'HcsTestManagerService',
      '$state',
      '$modal',
      '$translate',
      '$q',
    );
    spyOn(this.HcsTestManagerService, 'getSchedules');
    this.HcsTestManagerService.getSchedules.and.returnValue(this.$q.resolve(SUCCESS_DATA));
    this.compileComponent('taasScheduleView', {});
  });

  it('should have pageState equal SHOW', function() {
    this.controller.$onInit();
    expect(this.controller.pageState).toBe(State.Show);
  });
});
