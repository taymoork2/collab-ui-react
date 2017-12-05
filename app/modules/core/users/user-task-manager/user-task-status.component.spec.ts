import userTaskManagerModuleName from '../index';

describe('Component: userTaskStatus', () => {

  const RUNNING_TASK_STATUS = 'running-task-status';

  beforeEach(function() {
    this.initModules(userTaskManagerModuleName);
    this.injectDependencies(
      '$scope',
      '$q',
      'FeatureToggleService',
      'UserTaskManagerService',
    );
    this.taskList = require('./test-tasks.json').taskStatusTasks;

    spyOn(this.FeatureToggleService, 'atlasCsvImportTaskManagerGetStatus').and.returnValue(this.$q.resolve(true));
    spyOn(this.UserTaskManagerService, 'getInProcessTasks').and.returnValue(this.$q.resolve(this.taskList));

    this.compileComponent('userTaskStatus', {});
  });

  it('should initialize and show the running-task-status tag', function () {
    expect(this.view.find(RUNNING_TASK_STATUS)).toExist();
  });

  it('should load the in-process data', function () {
    expect(this.controller.inProcessTaskList).toHaveLength(1);
    expect(this.controller.hasInProcessTask).toBeTruthy();
  });
});
