import userTaskManagerModuleName, {
  UserTaskManagerService,
} from './index';
import { UserTaskStatusCtrl } from './user-task-status.component';

type Test = atlas.test.IComponentTest<UserTaskStatusCtrl, {
  FeatureToggleService;
  UserTaskManagerService: UserTaskManagerService;
}>;

describe('Component: userTaskStatus', () => {

  const RUNNING_TASK_STATUS = 'running-task-status';

  beforeEach(function (this: Test) {
    this.initModules(userTaskManagerModuleName);
    this.injectDependencies(
      'FeatureToggleService',
      'UserTaskManagerService',
    );
    this.taskList = getJSONFixture('core/json/users/user-task-manager/test-tasks.json').taskStatusTasks;

    spyOn(this.FeatureToggleService, 'atlasCsvImportTaskManagerGetStatus').and.returnValue(this.$q.resolve(true));
    this.getInProcessTasksSpy = spyOn(this.UserTaskManagerService, 'getInProcessTasks');
  });

  describe('with running tasks', () => {
    beforeEach(function (this: Test) {
      this.getInProcessTasksSpy.and.returnValue(this.$q.resolve(this.taskList));
      this.compileComponent('userTaskStatus', {});
    });

    it('should initialize and show the running-task-status tag', function (this: Test) {
      expect(this.view.find(RUNNING_TASK_STATUS)).toExist();
    });

    it('should load the in-process data', function (this: Test) {
      expect(this.controller.hasInProcessTask).toBe(true);
    });
  });

  describe('without running tasks', () => {
    beforeEach(function (this: Test) {
      this.getInProcessTasksSpy.and.returnValue(this.$q.resolve([]));
      this.compileComponent('userTaskStatus', {});
    });

    it('should initialize and show the running-task-status tag', function (this: Test) {
      expect(this.view.find(RUNNING_TASK_STATUS)).toExist();
    });

    it('should load the in-process data', function (this: Test) {
      expect(this.controller.hasInProcessTask).toBe(false);
    });
  });
});
