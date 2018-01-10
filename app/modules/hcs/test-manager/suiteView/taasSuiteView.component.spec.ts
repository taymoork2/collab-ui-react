import hcsTaasSuiteView from './index';
import { State } from '../shared';

describe('Component: TaasSuiteViewComponent',  () => {

  beforeEach(function() {
    this.initModules(hcsTaasSuiteView);
    this.injectDependencies(
      'HcsTestManagerService',
      'CardUtils',
      '$state',
      '$modal',
      '$q',
    );
    spyOn(this.HcsTestManagerService, 'getTests').and.returnValue(this.$q.reject());
    spyOn(this.$state, 'go');
    this.compileComponent('taasSuiteView', {});
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

describe('Component: TaasSuiteViewComponent',  () => {

  beforeEach(function() {
    this.initModules(hcsTaasSuiteView);
    this.injectDependencies(
      'HcsTestManagerService',
      'CardUtils',
      '$state',
      '$modal',
      '$q',
    );
    spyOn(this.HcsTestManagerService, 'getSuites');
    this.HcsTestManagerService.getSuites.and.returnValue(this.$q.resolve([]));
    this.compileComponent('taasSuiteView', {});
  });

  it('should have pageState equal NEW', function() {
    this.controller.$onInit();
    expect(this.controller.pageState).toBe(State.New);
  });
});

describe('Component: TaasSuiteViewComponent',  () => {
  const SUCCESS_DATA = [{
    customerId: '123',
    id: '456',
    name: 'Testing 123',
  }];

  beforeEach(function() {
    this.initModules(hcsTaasSuiteView);
    this.injectDependencies(
      'HcsTestManagerService',
      'CardUtils',
      '$state',
      '$modal',
      '$q',
    );
    spyOn(this.HcsTestManagerService, 'getSuites');
    spyOn(this.HcsTestManagerService, 'filterSuites');
    this.HcsTestManagerService.getSuites.and.returnValue(this.$q.resolve(SUCCESS_DATA));
    this.compileComponent('taasSuiteView', {});
  });

  it('should have pageState equal SHOW', function() {
    this.controller.$onInit();
    expect(this.controller.pageState).toBe(State.Show);
  });
});
