import userTaskManagerModalModule from './index';
import { TaskListFilterType } from './user-task-manager.constants';

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

  beforeEach(angular.mock.module(mockDependencies));

  function mockDependencies($provide) {
    const Userservice = {
      getUserAsPromise: () => {
        return {
          then: (success) => {
            return success({
              data: {
                displayName: 'User Me',
                userName: 'user.me@gmail.com',
              },
            });
          },
        };
      },
    };
    $provide.value('Userservice', Userservice);
  }

  beforeEach(function() {
    this.initModules(userTaskManagerModalModule);
    this.injectDependencies(
      '$scope',
      '$stateParams',
      '$q',
      'UserTaskManagerService',
    );
    this.taskList = require('./test-tasks.json').taskManagerTasks;

    spyOn(this.UserTaskManagerService, 'getTasks').and.returnValue(this.$q.resolve(this.taskList));
    spyOn(this.UserTaskManagerService, 'submitCsvImportTask').and.returnValue(this.$q.resolve(this.taskList[1]));
  });

  function initComponent() {
    this.compileComponent('userTaskManagerModal', {});
    spyOn(this.controller, 'setActiveFilter').and.callThrough();
    spyOn(this.controller, 'setActiveTask').and.callThrough();
  }

  describe('UserTaskManagerModal at init', () => {
    beforeEach(initComponent);
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
      expect(this.controller.activeTask.jobTypeTranslate).toEqual('userTaskManagerModal.csvImport');
      expect(this.controller.activeTask.statusTranslate).toEqual('userTaskManagerModal.taskStatus.completed');
      expect(this.controller.activeTask.jobInstanceId).toEqual('CSV Import 1');
      expect(this.controller.activeTask.createdDate).toEqual('Oct 6, 2017');
      expect(this.controller.activeTask.createdTime).toEqual('3:54 PM');
    });
  });

  describe('UserTaskManagerModal filter type', () => {
    beforeEach(initComponent);
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
    beforeEach(initComponent);
    it('when select 2nd task', function() {
      const secondTask = this.view.find(TASK_LIST_ITEM).get(1);
      secondTask.click();
      expect(this.controller.setActiveTask).toHaveBeenCalledWith(this.taskList[1]);
      expect(this.view.find(TASK_LIST_ITEM).eq(0).find(TASK)).not.toHaveClass(ACTIVE_TASK);
      expect(this.view.find(TASK_LIST_ITEM).eq(1).find(TASK)).toHaveClass(ACTIVE_TASK);
      expect(this.controller.activeTask.jobInstanceId).toEqual('CSV Import 2');
    });
  });

  describe('UserTaskManagerModal display a specific task', () => {
    beforeEach(function () {
      this.$stateParams.task = this.taskList[1];
    });
    beforeEach(initComponent);
    it('when specify 2nd task', function() {
      expect(this.controller.activeTask).toBe(this.taskList[1]);
      expect(this.controller.activeFilter).toBe(TaskListFilterType.ACTIVE);
      expect(this.controller.setActiveTask).not.toHaveBeenCalled();
      expect(this.controller.activeTask.jobInstanceId).toEqual('CSV Import 2');
    });
  });

  describe('UserTaskManagerModal submit a new task', () => {
    beforeEach(function () {
      this.$stateParams.job = {
        fileName: 'AllSparkCall.csv',
        fileData: 'CSV content',
        exactMatchCsv: true,
      };
    });
    beforeEach(initComponent);
    it('the task should be added and set as active', function() {
      expect(this.UserTaskManagerService.submitCsvImportTask)
        .toHaveBeenCalledWith('AllSparkCall.csv', 'CSV content', true);
      expect(this.controller.setActiveTask).not.toHaveBeenCalled();
      expect(this.controller.activeTask).toBe(this.taskList[1]);
      expect(this.controller.activeFilter).toBe(TaskListFilterType.ACTIVE);
      expect(this.controller.activeTask.jobInstanceId).toEqual('CSV Import 2');
    });
  });
});
