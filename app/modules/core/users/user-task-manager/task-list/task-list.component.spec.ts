import userTaskManagerModuleName from '../index';

describe('Component: userTaskList', () => {

  const TASK_ITEMS = 'user-task-list-item';

  beforeEach(function() {
    this.initModules(userTaskManagerModuleName);
    this.injectDependencies(
      '$scope',
    );
    const taskList = [{
      jobInstanceId: '123',
      started: 'Jan 1',
      status: 'STARTED',
      stopped: 'Jan 2',
    }, {
      jobInstanceId: '456',
      started: 'Jan 1',
      status: 'STARTED',
      stopped: 'Jan 2',
    }, {
      jobInstanceId: '789',
      started: 'Jan 1',
      status: 'STARTED',
      stopped: 'Jan 2',
    }];
    this.$scope.onActiveTaskChange = jasmine.createSpy('onActiveTaskChange');
    this.compileComponent('userTaskList', {
      taskList,
      task: taskList[1],
      onActiveTaskChange: 'onActiveTaskChange(task)',
    });
  });

  it('should render task list', function () {
    expect(this.view.find(TASK_ITEMS).length).toBe(3);
  });

  it('should initialize with an active task', function () {
    expect(this.controller.isActiveTask(this.$scope.taskList[0])).toBe(false);
    expect(this.controller.isActiveTask(this.$scope.taskList[1])).toBe(true);
    expect(this.controller.isActiveTask(this.$scope.taskList[2])).toBe(false);
  });

  it('should trigger onActiveTaskChange', function () {
    expect(this.controller.isActiveTask(this.$scope.taskList[2])).toBe(false);
    this.view.find(TASK_ITEMS).get(2).click();
    expect(this.$scope.onActiveTaskChange).toHaveBeenCalledWith(this.$scope.taskList[2]);
    expect(this.controller.isActiveTask(this.$scope.taskList[2])).toBe(true);
  });
});
