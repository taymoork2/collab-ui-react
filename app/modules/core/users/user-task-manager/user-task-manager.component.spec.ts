import userTaskManagerModalModule from './index';
import { ITask, ModalView } from './user-task-manager.component';
const taskList: ITask[] = require('./test-tasks.json');

describe('Component: userTaskManagerModalModule', () => {

  const MODAL_TITLE = '.modal-header';
  const MODAL_BODY = '.modal-body';
  const MODAL_CONTAINER = '.modal-container .tm-container';
  const MODAL_PANEL_LEFT = '.tm-panel-left';
  const MODAL_PANEL_RIGHT = '.tm-panel-right';
  const LEFT_PANEL_HEADER = '.tm-panel-header';
  const BUTTONS = 'button.btn.btn--white';
  const NAV_ACTIVE = 'active';
  const TASKS = '.tm-panel-left .tm-panel-body .row.collapse';

  beforeEach(function() {
    this.initModules(userTaskManagerModalModule);
    this.injectDependencies(
      '$scope',
      '$q',
      'UserTaskManagerService',
    );

    this.$scope.dismiss = jasmine.createSpy('dismiss');
    spyOn(this.UserTaskManagerService, 'getTasks').and.returnValue(this.$q.resolve(taskList));

    this.compileComponent('userTaskManagerModal', {
      dismiss: 'dismiss()',
    });
  });

  describe('UserTaskManagerModal at init', () => {
    it('should have modal title, body, left panel, right panel and options', function() {
      expect(this.view.find(MODAL_TITLE)).toExist();
      expect(this.view.find(MODAL_BODY)).toExist();
      expect(this.view.find(MODAL_CONTAINER)).toExist();
      expect(this.view.find(MODAL_CONTAINER).find(MODAL_PANEL_LEFT)).toExist();
      expect(this.view.find(LEFT_PANEL_HEADER).find(BUTTONS).get(0)).toExist();
      expect(this.view.find(LEFT_PANEL_HEADER).find(BUTTONS).get(1)).toExist();
      expect(this.view.find(MODAL_CONTAINER).find(MODAL_PANEL_RIGHT)).toExist();
      expect(this.UserTaskManagerService.getTasks).toHaveBeenCalled();
      expect(this.controller.allTaskList).toHaveLength(3);
      expect(this.controller.inProcessTaskList).toHaveLength(1);
      expect(this.controller.activeTask.jobInstanceId).toEqual('CSV Import 1');
      expect(this.view.find(TASKS)).toHaveLength(4);
    });
  });

  describe('UserTaskManagerModal task type', () => {
    it('when all-task selected', function() {
      spyOn(this.controller, 'setModal').and.callThrough();
      spyOn(this.controller, 'setActiveTask').and.callThrough();
      const allButton = this.view.find(BUTTONS).get(0);
      allButton.click();
      this.$scope.$apply();
      expect(this.view.find(BUTTONS).get(0)).toHaveClass(NAV_ACTIVE);
      expect(this.view.find(BUTTONS).get(1)).not.toHaveClass(NAV_ACTIVE);
      expect(this.controller.setModal).toHaveBeenCalledWith(ModalView.ALL);
      expect(this.controller.setActiveTask).toHaveBeenCalledWith(taskList[0]);
      expect(this.controller.activeTask).toBe(taskList[0]);
      expect(this.controller.activeTask.jobInstanceId).toEqual('CSV Import 1');
    });
    it('when active-task selected', function() {
      spyOn(this.controller, 'setModal').and.callThrough();
      spyOn(this.controller, 'setActiveTask').and.callThrough();
      const activeButton = this.view.find(BUTTONS).get(1);
      activeButton.click();
      this.$scope.$apply();
      expect(this.view.find(BUTTONS).get(0)).not.toHaveClass(NAV_ACTIVE);
      expect(this.view.find(BUTTONS).get(1)).toHaveClass(NAV_ACTIVE);
      expect(this.controller.setModal).toHaveBeenCalledWith(ModalView.ACTIVE);
      expect(this.controller.setActiveTask).toHaveBeenCalledWith(taskList[1]);
      expect(this.controller.activeTask).toBe(taskList[1]);
      expect(this.controller.activeTask.jobInstanceId).toEqual('CSV Import 2');
    });
  });

  describe('UserTaskManagerModal picks a new task', () => {
    it('when select 2nd task', function() {
      spyOn(this.controller, 'setActiveTask').and.callThrough();
      const secondTask = this.view.find(TASKS).get(1);
      secondTask.click();
      expect(this.controller.setActiveTask).toHaveBeenCalledWith(taskList[1]);
      expect(this.view.find(TASKS).get(0)).not.toHaveClass(NAV_ACTIVE);
      expect(this.view.find(TASKS).get(1)).toHaveClass(NAV_ACTIVE);
      expect(this.controller.activeTask.jobInstanceId).toEqual('CSV Import 2');
    });
  });
});
