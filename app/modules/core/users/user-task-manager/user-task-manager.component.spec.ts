import userTaskManagerModalModuleName, {
  UserTaskManagerService,
} from './index';
import { UserTaskManagerModalCtrl } from './user-task-manager.component';
import { TaskListFilterType } from './user-task-manager.constants';
import { MultiStepModalComponent } from 'modules/core/shared/multi-step-modal/multi-step-modal.component';
import { TaskContainerComponent } from 'modules/core/shared/task-container/task-container.component';
import { TaskListFilterComponent } from './task-list-filter/task-list-filter.component';
import { TaskListComponent } from './task-list/task-list.component';
import { CsvUploadResultsComponent } from './csv-upload-results.component';

import 'moment';
import 'moment-timezone';

type Test = atlas.test.IComponentTest<UserTaskManagerModalCtrl, {
  $stateParams: ng.ui.IStateParamsService;
  UserTaskManagerService: UserTaskManagerService;
}, {
  components: {
    multiStepModal: atlas.test.IComponentSpy<MultiStepModalComponent>;
    taskContainer: atlas.test.IComponentSpy<TaskContainerComponent>;
    userTaskListFilter: atlas.test.IComponentSpy<TaskListFilterComponent>;
    userTaskList: atlas.test.IComponentSpy<TaskListComponent>;
    csvUploadResults: atlas.test.IComponentSpy<CsvUploadResultsComponent>;
  };
}>;

describe('Component: userTaskManager', () => {
  const LOADING_SPINNER = '.loading-wrapper';
  const TASK_CONTAINER = 'task-container';

  beforeEach(function (this: Test) {
    this.components = {
      multiStepModal: this.spyOnComponent('multiStepModal'),
      taskContainer: this.spyOnComponent('taskContainer'),
      userTaskListFilter: this.spyOnComponent('userTaskListFilter'),
      userTaskList: this.spyOnComponent('userTaskList'),
      csvUploadResults: this.spyOnComponent('csvUploadResults'),
    };

    this.initModules(
      userTaskManagerModalModuleName,
      this.components.multiStepModal,
      this.components.taskContainer,
      this.components.userTaskListFilter,
      this.components.userTaskList,
      this.components.csvUploadResults,
    );
    this.injectDependencies(
      '$stateParams',
      'UserTaskManagerService',
    );
    this.taskList = _.cloneDeep(require('./test-tasks.json').taskManagerTasks);

    spyOn(this.UserTaskManagerService, 'submitCsvImportTask').and.returnValue(this.$q.resolve(this.taskList[1]));
    spyOn(this.UserTaskManagerService, 'initAllTaskListPolling');

    moment.tz.setDefault('America/Los_Angeles');
  });

  function initComponent(this: Test) {
    this.compileComponent('userTaskManagerModal', {});
  }

  describe('initial state', () => {
    beforeEach(initComponent);
    it('should have title and dismiss functionality', function (this: Test) {
      expect(this.components.multiStepModal.bindings[0].l10nTitle).toBe('userTaskManagerModal.title');

      spyOn(this.controller, 'dismiss');
      this.components.multiStepModal.bindings[0].dismiss();
      expect(this.controller.dismiss).toHaveBeenCalled();
    });

    it('should have started polling', function (this: Test) {
      expect(this.UserTaskManagerService.initAllTaskListPolling).toHaveBeenCalled();
    });

    it('should show loading spinner until the first interval callback', function (this: Test) {
      expect(this.view.find(LOADING_SPINNER)).toExist();
      expect(this.view.find(TASK_CONTAINER)).not.toExist();

      this.controller['intervalCallback']();
      this.$scope.$apply();

      expect(this.view.find(LOADING_SPINNER)).not.toExist();
      expect(this.view.find(TASK_CONTAINER)).toExist();
    });
  });

  describe('component behavior', () => {
    beforeEach(initComponent);
    beforeEach(function (this: Test) {
      this.controller['intervalCallback'](this.taskList);
      this.$scope.$apply();
    });

    it('should initialize filter, task list, and results', function (this: Test) {
      expect(this.components.userTaskListFilter.bindings[0].filter).toBe(TaskListFilterType.ALL);
      expect(this.components.userTaskList.bindings[0].task).toEqual(this.taskList[0]);
      expect(this.components.userTaskList.bindings[0].taskList).toEqual(this.taskList);

      const activeTask = this.components.csvUploadResults.bindings[0].inputActiveTask;
      expect(activeTask).toEqual(this.taskList[0]);
      expect(activeTask.jobTypeTranslate).toBe('userTaskManagerModal.csvImport');
      expect(activeTask.statusTranslate).toBe('userTaskManagerModal.taskStatus.completed');
      expect(activeTask.jobInstanceId).toBe('CSV Import 1');
      expect(activeTask.createdDate).toBe('Oct 6, 2017');
      expect(activeTask.createdTime).toBe('1:54 PM');
    });

    it('should change result task on task list change', function (this: Test) {
      this.components.userTaskList.bindings[0].onActiveTaskChange({
        task: this.taskList[2],
      });
      this.$scope.$apply();

      expect(this.components.userTaskList.bindings[0].task).toEqual(this.taskList[2]);
      expect(this.components.csvUploadResults.bindings[0].inputActiveTask).toEqual(this.taskList[2]);
    });

    it('should change active filter and task on filter change', function (this: Test) {
      this.components.userTaskListFilter.bindings[0].onFilterChange({
        filter: TaskListFilterType.ACTIVE,
      });
      this.$scope.$apply();

      expect(this.components.userTaskListFilter.bindings[0].filter).toBe(TaskListFilterType.ACTIVE);
      expect(this.components.userTaskList.bindings[0].task).toEqual(this.taskList[1]);
      expect(this.components.userTaskList.bindings[0].taskList).toEqual([this.taskList[1]]);
      expect(this.components.csvUploadResults.bindings[0].inputActiveTask).toEqual(this.taskList[1]);
    });

    it('should update the active task status', function (this: Test) {
      expect(this.components.userTaskList.bindings[0].taskList[0].status).toBe('COMPLETED');

      this.components.csvUploadResults.bindings[0].onStatusUpdate({
        status: 'STARTED',
      });
      this.$scope.$apply();

      expect(this.components.userTaskList.bindings[0].taskList[0].status).toBe('STARTED');
    });
  });

  describe('submit a new task', () => {
    beforeEach(function (this: Test) {
      this.$stateParams.job = {
        fileName: 'AllSparkCall.csv',
        fileData: 'CSV content',
        exactMatchCsv: true,
      };
    });
    beforeEach(initComponent);
    beforeEach(function (this: Test) {
      this.controller['intervalCallback'](this.taskList);
      this.$scope.$apply();
    });

    it('the task should be added and set as active', function (this: Test) {
      expect(this.UserTaskManagerService.submitCsvImportTask)
        .toHaveBeenCalledWith('AllSparkCall.csv', 'CSV content', true);

      expect(this.components.userTaskListFilter.bindings[0].filter).toBe(TaskListFilterType.ACTIVE);
      expect(this.components.userTaskList.bindings[0].task).toEqual(this.taskList[1]);
      expect(this.components.userTaskList.bindings[0].taskList).toEqual([this.taskList[1]]);
      expect(this.components.csvUploadResults.bindings[0].inputActiveTask).toEqual(this.taskList[1]);
    });
  });
});
