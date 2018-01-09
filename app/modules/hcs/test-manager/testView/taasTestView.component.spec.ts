import hcsTaasTestView from './index';
import { State } from '../shared';

describe('Component: TaasTestViewComponent',  () => {

  beforeEach(function() {
    this.initModules(hcsTaasTestView);
    this.injectDependencies(
      'HcsTestManagerService',
      'CardUtils',
      '$stateParams',
      '$state',
      '$modal',
      '$q',
    );

    this.$stateParams.suite = {
      id: '1234',
      name: 'testing4321',
      tests: {
        id: '1a2b',
        index: '1',
        name: 'testing2ba1',
        length: 1,
      },
    };

    spyOn(this.HcsTestManagerService, 'getTest').and.returnValue(this.$q.reject());
    spyOn(this.$state, 'go');
    this.compileComponent('taasTestView', {});
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

describe('Component: TaasTestViewComponent',  () => {

  beforeEach(function() {
    this.initModules(hcsTaasTestView);
    this.injectDependencies(
      'HcsTestManagerService',
      'CardUtils',
      '$stateParams',
      '$state',
      '$modal',
      '$q',
    );

    this.$stateParams.suite = {
      id: '1234',
      name: 'testing4321',
      tests: {
        id: '1a2b',
        index: '1',
        name: 'testing2ba1',
        length: 1,
      },
    };

    spyOn(this.HcsTestManagerService, 'getTests');
    this.HcsTestManagerService.getTests.and.returnValue(this.$q.resolve([]));
    this.compileComponent('taasTestView', {});
  });

  it('should have pageState equal NEW', function() {
    this.controller.$onInit();
    expect(this.controller.pageState).toBe(State.New);
  });
});

describe('Component: TaasTestViewComponent',  () => {
  const SUCCESS_DATA = [{
    customerId: '123',
    id: '456',
    name: 'Testing 123',
    testDefinitionId: '789',
    testSuiteId: '1011',
  }];

  beforeEach(function() {
    this.initModules(hcsTaasTestView);
    this.injectDependencies(
      'HcsTestManagerService',
      'CardUtils',
      '$state',
      '$stateParams',
      '$modal',
      '$q',
    );

    this.$stateParams.suite = {
      id: '1234',
      name: 'testing4321',
      tests: {
        id: '1a2b',
        index: '1',
        name: 'testing2ba1',
        length: 1,
      },
    };

    spyOn(this.HcsTestManagerService, 'getTests');
    spyOn(this.HcsTestManagerService, 'filterTests');
    this.HcsTestManagerService.getTests.and.returnValue(this.$q.resolve(SUCCESS_DATA));
    this.compileComponent('taasTestView', {});
  });

  it('should have pageState equal SHOW', function() {
    this.controller.$onInit();
    expect(this.controller.pageState).toBe(State.Show);
  });
});
