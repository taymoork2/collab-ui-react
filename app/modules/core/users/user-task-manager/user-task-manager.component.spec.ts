import userTaskManagerModalModule from './index';
import { TaskListFilterType } from './task-list-filter/task-list-filter.component';

describe('Component: userTaskManagerModalModule', () => {

  const MODAL_TITLE = '.modal-header';
  const MODAL_BODY = '.modal-body';
  const TASK_CONTAINER = '.task-container';
  const TASK_CONTAINER_PANEL = '.task-container__panel';
  const TASK_CONTAINER_PANEL_HEADER = '.task-container__panel-header';
  const TASK_CONTAINER_DETAILS = '.task-container__details';
  const BUTTONS = 'button.btn.btn--white';
  const TASK_LIST_ITEM = 'user-task-list-item';
  const TASK = '.task';
  const ACTIVE_FILTER = 'task-list-filter--active';
  const ACTIVE_TASK = 'task--active';

  beforeEach(function() {
    this.initModules(userTaskManagerModalModule);
    this.injectDependencies(
      '$scope',
      '$q',
      'UserTaskManagerService',
    );
    this.taskList = require('./test-tasks.json');

    this.$scope.dismiss = jasmine.createSpy('dismiss');
    spyOn(this.UserTaskManagerService, 'getTasks').and.returnValue(this.$q.resolve(this.taskList));

    this.compileComponent('userTaskManagerModal', {
      dismiss: 'dismiss()',
    });

    spyOn(this.controller, 'setActiveFilter').and.callThrough();
    spyOn(this.controller, 'setActiveTask').and.callThrough();
  });

  describe('UserTaskManagerModal at init', () => {
    it('should have modal title, body, left panel, right panel and options', function() {
      expect(this.view.find(MODAL_TITLE)).toExist();
      expect(this.view.find(MODAL_BODY)).toExist();
      expect(this.view.find(TASK_CONTAINER)).toExist();
      expect(this.view.find(TASK_CONTAINER).find(TASK_CONTAINER_PANEL)).toExist();
      expect(this.view.find(TASK_CONTAINER).find(TASK_CONTAINER_DETAILS)).toExist();
      expect(this.view.find(TASK_CONTAINER_PANEL_HEADER).find(BUTTONS).length).toBe(2);
      expect(this.view.find(TASK_CONTAINER_PANEL_HEADER).find(BUTTONS).get(0)).toHaveClass(ACTIVE_FILTER);
      expect(this.view.find(TASK_CONTAINER_PANEL_HEADER).find(BUTTONS).get(1)).not.toHaveClass(ACTIVE_FILTER);
      expect(this.view.find(TASK_LIST_ITEM).length).toBe(3);
      expect(this.UserTaskManagerService.getTasks).toHaveBeenCalled();
      expect(this.controller.allTaskList).toHaveLength(3);
      expect(this.controller.inProcessTaskList).toHaveLength(1);
      expect(this.controller.activeTask.jobInstanceId).toEqual('CSV Import 1');
    });
  });

  describe('UserTaskManagerModal task type', () => {
    it('when all-task selected', function() {
      const allButton = this.view.find(BUTTONS).get(0);
      allButton.click();
      this.$scope.$apply();
      expect(this.view.find(BUTTONS).get(0)).toHaveClass(ACTIVE_FILTER);
      expect(this.view.find(BUTTONS).get(1)).not.toHaveClass(ACTIVE_FILTER);
      expect(this.controller.setActiveFilter).toHaveBeenCalledWith(TaskListFilterType.ALL);
      expect(this.controller.activeTask).toBe(this.taskList[0]);
      expect(this.controller.activeTask.jobInstanceId).toEqual('CSV Import 1');
    });
    it('when active-task selected', function() {
      const activeButton = this.view.find(BUTTONS).get(1);
      activeButton.click();
      this.$scope.$apply();
      expect(this.view.find(BUTTONS).get(0)).not.toHaveClass(ACTIVE_FILTER);
      expect(this.view.find(BUTTONS).get(1)).toHaveClass(ACTIVE_FILTER);
      expect(this.controller.setActiveFilter).toHaveBeenCalledWith(TaskListFilterType.ACTIVE);
      expect(this.controller.activeTask).toBe(this.taskList[1]);
      expect(this.controller.activeTask.jobInstanceId).toEqual('CSV Import 2');
    });
  });

  describe('UserTaskManagerModal picks a new task', () => {
    it('when select 2nd task', function() {
      const secondTask = this.view.find(TASK_LIST_ITEM).get(1);
      secondTask.click();
      expect(this.controller.setActiveTask).toHaveBeenCalledWith(this.taskList[1]);
      expect(this.view.find(TASK_LIST_ITEM).eq(0).find(TASK)).not.toHaveClass(ACTIVE_TASK);
      expect(this.view.find(TASK_LIST_ITEM).eq(1).find(TASK)).toHaveClass(ACTIVE_TASK);
      expect(this.controller.activeTask.jobInstanceId).toEqual('CSV Import 2');
    });
  });
});
