import hcsTaasResources from './index';
import { State } from 'modules/hcs/test-manager/taskManager.const';

describe('Component: TaasResourceViewComponent',  () => {

  beforeEach(function() {
    this.initModules(hcsTaasResources);
    this.injectDependencies(
      'HcsTestManagerService',
      'CardUtils',
      '$state',
      '$modal',
      '$q',
    );
    spyOn(this.HcsTestManagerService, 'getResources').and.returnValue(this.$q.reject());
    spyOn(this.$state, 'go');
    this.compileComponent('taasResourceView', {});
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

describe('Component: TaasResourceViewComponent',  () => {

  beforeEach(function() {
    this.initModules(hcsTaasResources);
    this.injectDependencies(
      'HcsTestManagerService',
      'CardUtils',
      '$state',
      '$modal',
      '$q',
    );
    spyOn(this.HcsTestManagerService, 'getResources');
    this.HcsTestManagerService.getResources.and.returnValue(this.$q.resolve([]));
    this.compileComponent('taasResourceView', {});
  });

  it('should have pageState equal NEW', function() {
    this.controller.$onInit();
    expect(this.controller.pageState).toBe(State.New);
  });
});

describe('Component: TaasResourceViewComponent',  () => {
  const SUCCESS_DATA = [{
  }];

  beforeEach(function() {
    this.initModules(hcsTaasResources);
    this.injectDependencies(
      'HcsTestManagerService',
      'CardUtils',
      '$state',
      '$modal',
      '$q',
    );
    spyOn(this.HcsTestManagerService, 'getResources');
    this.HcsTestManagerService.getResources.and.returnValue(this.$q.resolve(SUCCESS_DATA));
    this.compileComponent('taasResourceView', {});
  });

  it('should have pageState equal SHOW', function() {
    this.controller.$onInit();
    expect(this.controller.pageState).toBe(State.Show);
  });
});
