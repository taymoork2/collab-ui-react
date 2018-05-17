import TaskView from './index';
import { State } from '../shared';

describe('Component: TaskViewComponent',  () => {

  beforeEach(function() {
    this.initModules(TaskView);
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

    spyOn(this.HcsTestManagerService, 'getSchedules').and.returnValue(this.$q.resolve({ status: 200 }));
    spyOn(this.HcsTestManagerService, 'getBlocks').and.returnValue(this.$q.resolve({ status: 200 }));
    spyOn(this.$state, 'go');
  });

  describe('getTest reject', function () {
    beforeEach(function () {
      spyOn(this.HcsTestManagerService, 'getTest').and.callFake(() => {
        return this.$q.reject();
      });
      this.compileComponent('taasTaskView', {});
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

  describe('getTest resolve', function () {
    beforeEach(function () {
      spyOn(this.HcsTestManagerService, 'getTest');
      spyOn(this.HcsTestManagerService, 'getTests').and.returnValue(this.$q.resolve([]));
      this.compileComponent('taasTaskView', {});
    });

    it('should have pageState equal NEW', function() {
      this.controller.$onInit();
      expect(this.controller.pageState).toBe(State.New);
    });
  });

  describe('getTests SUCCESS',  () => {
    const SUCCESS_DATA = [{
      customerId: '123',
      id: '456',
      name: 'Testing 123',
      testDefinitionId: '789',
      testSuiteId: '1011',
    }];

    beforeEach(function () {
      spyOn(this.HcsTestManagerService, 'getTest');
      spyOn(this.HcsTestManagerService, 'getTests').and.returnValue(this.$q.resolve(SUCCESS_DATA));
      spyOn(this.HcsTestManagerService, 'filterTests');
      this.compileComponent('taasTaskView', {});
    });

    it('should have pageState equal SHOW', function() {
      this.controller.$onInit();
      expect(this.controller.pageState).toBe(State.Show);
    });
  });
});
