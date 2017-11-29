import userTaskManagerModalModule from './index';
import { TaskListFilterType } from './user-task-manager.constants';

describe('Component: userTaskManager', () => {
  const LOADING_SPINNER = '.loading-wrapper';
  const TASK_CONTAINER = 'task-container';

  beforeEach(function() {
    this.components = {
      multiStepModal: this.spyOnComponent('multiStepModal'),
      taskContainer: this.spyOnComponent('taskContainer'),
      userTaskListFilter: this.spyOnComponent('userTaskListFilter'),
      userTaskList: this.spyOnComponent('userTaskList'),
      csvUploadResults: this.spyOnComponent('csvUploadResults'),
    };
    this.initModules(
      userTaskManagerModalModule,
      this.components.multiStepModal,
      this.components.taskContainer,
      this.components.userTaskListFilter,
      this.components.userTaskList,
      this.components.csvUploadResults,
    );
    this.injectDependencies(
      '$scope',
      '$stateParams',
      '$q',
      'UserTaskManagerService',
    );
    this.taskList = _.cloneDeep(require('./test-tasks.json').taskManagerTasks);

    spyOn(this.UserTaskManagerService, 'submitCsvImportTask').and.returnValue(this.$q.resolve(this.taskList[1]));
    spyOn(this.UserTaskManagerService, 'initAllTaskListPolling');
  });

  function initComponent() {
    this.compileComponent('userTaskManagerModal', {});
  }

  describe('initial state', () => {
    beforeEach(initComponent);
    it('should have title and dismiss functionality', function () {
      expect(this.components.multiStepModal.bindings[0].l10nTitle).toBe('userTaskManagerModal.title');

      spyOn(this.controller, 'dismiss');
      this.components.multiStepModal.bindings[0].dismiss();
      expect(this.controller.dismiss).toHaveBeenCalled();
    });

    it('should have started polling', function () {
      expect(this.UserTaskManagerService.initAllTaskListPolling).toHaveBeenCalled();
    });

    it('should show loading spinner until the first interval callback', function () {
      expect(this.view.find(LOADING_SPINNER)).toExist();
      expect(this.view.find(TASK_CONTAINER)).not.toExist();

      this.controller.intervalCallback();
      this.$scope.$apply();

      expect(this.view.find(LOADING_SPINNER)).not.toExist();
      expect(this.view.find(TASK_CONTAINER)).toExist();
    });
  });

  describe('component behavior', () => {
    beforeEach(initComponent);
    beforeEach(function () {
      this.controller.intervalCallback(this.taskList);
      this.$scope.$apply();
    });

    it('should initialize filter, task list, and results', function () {
      expect(this.components.userTaskListFilter.bindings[0].filter).toBe(TaskListFilterType.ALL);
      expect(this.components.userTaskList.bindings[0].task).toEqual(this.taskList[0]);
      expect(this.components.userTaskList.bindings[0].taskList).toEqual(this.taskList);

      const activeTask = this.components.csvUploadResults.bindings[0].inputActiveTask;
      expect(activeTask).toEqual(this.taskList[0]);
      expect(activeTask.jobTypeTranslate).toBe('userTaskManagerModal.csvImport');
      expect(activeTask.statusTranslate).toBe('userTaskManagerModal.taskStatus.completed');
      expect(activeTask.jobInstanceId).toBe('CSV Import 1');
      expect(activeTask.createdDate).toBe('Oct 6, 2017');
      expect(activeTask.createdTime).toBe('3:54 PM');
    });

    it('should change result task on task list change', function () {
      this.components.userTaskList.bindings[0].onActiveTaskChange({
        task: this.taskList[2],
      });
      this.$scope.$apply();

      expect(this.components.userTaskList.bindings[0].task).toEqual(this.taskList[2]);
      expect(this.components.csvUploadResults.bindings[0].inputActiveTask).toEqual(this.taskList[2]);
    });

    it('should change active filter and task on filter change', function () {
      this.components.userTaskListFilter.bindings[0].onFilterChange({
        filter: TaskListFilterType.ACTIVE,
      });
      this.$scope.$apply();

      expect(this.components.userTaskListFilter.bindings[0].filter).toBe(TaskListFilterType.ACTIVE);
      expect(this.components.userTaskList.bindings[0].task).toEqual(this.taskList[1]);
      expect(this.components.userTaskList.bindings[0].taskList).toEqual([this.taskList[1]]);
      expect(this.components.csvUploadResults.bindings[0].inputActiveTask).toEqual(this.taskList[1]);
    });

    it('should update the active task status', function () {
      expect(this.components.userTaskList.bindings[0].taskList[0].status).toBe('COMPLETED');

      this.components.csvUploadResults.bindings[0].onStatusUpdate({
        status: 'STARTED',
      });
      this.$scope.$apply();

      expect(this.components.userTaskList.bindings[0].taskList[0].status).toBe('STARTED');
    });
  });

  describe('submit a new task', () => {
    beforeEach(function () {
      this.$stateParams.job = {
        fileName: 'AllSparkCall.csv',
        fileData: 'CSV content',
        exactMatchCsv: true,
      };
    });
    beforeEach(initComponent);
    beforeEach(function () {
      this.controller.intervalCallback(this.taskList);
      this.$scope.$apply();
    });

    it('the task should be added and set as active', function() {
      expect(this.UserTaskManagerService.submitCsvImportTask)
        .toHaveBeenCalledWith('AllSparkCall.csv', 'CSV content', true);

      expect(this.components.userTaskListFilter.bindings[0].filter).toBe(TaskListFilterType.ACTIVE);
      expect(this.components.userTaskList.bindings[0].task).toEqual(this.taskList[1]);
      expect(this.components.userTaskList.bindings[0].taskList).toEqual([this.taskList[1]]);
      expect(this.components.csvUploadResults.bindings[0].inputActiveTask).toEqual(this.taskList[1]);
    });
  });
});
