import userTaskMgrModule from './index';
import { ITask, ModalView } from './user-task-mgr.component';

describe('Component: userTaskMgrModule', () => {

  const MODAL_TITLE = '.modal-header';
  const MODAL_BODY = '.modal-body';
  const MODAL_CONTAINER = '.modal-container .tm-container';
  const MODAL_PANEL_LEFT = '.tm-panel-left';
  const MODAL_PANEL_RIGHT = '.tm-panel-right';
  const LEFT_PANEL_HEADER = '.tm-panel-header';
  const BUTTONS = 'button.btn.btn--white';
  const NAV_ACTIVE = 'active';
  const TASKS = '.tm-panel-left .tm-panel-body .row.collapse';

  const taskList: ITask[] = [
    { jobInstanceId: 'CSV Import 1', created: '2017-10-06T20:54:22.535Z', started: '20:54', lastModified: '2017-10-06T21:09:09.491Z', stopped: 'Oct 6, 2017', creatorUserId: '010e453a-865b-4d34-b3d9-daf94ab0805e', modifierUserId: '010e453a-865b-4d34-b3d9-daf94ab0805e', status: 'Completed', message: '', filename: '200Users.csv',     fileSize: 487, fileMd5: '', totalUsers: 100, addedUsers: 10, updatedUsers: 10, erroredUsers: 10 },
    { jobInstanceId: 'CSV Import 2', created: '2017-10-06T20:54:22.535Z', started: '22:01', lastModified: '2017-10-06T21:09:09.491Z', stopped: 'Oct 6, 2017', creatorUserId: '010e453a-865b-4d34-b3d9-daf94ab0805e', modifierUserId: '010e453a-865b-4d34-b3d9-daf94ab0805e', status: 'Processing', message: '', filename: 'AllSparkCall.csv', fileSize: 487, fileMd5: '', totalUsers: 100, addedUsers: 20, updatedUsers: 20, erroredUsers: 20 },
    { jobInstanceId: 'CSV Import 3', created: '2017-10-06T20:54:22.535Z', started: '09:13', lastModified: '2017-10-06T21:09:09.491Z', stopped: 'Oct 6, 2017', creatorUserId: '010e453a-865b-4d34-b3d9-daf94ab0805e', modifierUserId: '010e453a-865b-4d34-b3d9-daf94ab0805e', status: 'Completed',  message: '', filename: 'WebEx.csv',        fileSize: 487, fileMd5: '', totalUsers: 100, addedUsers: 30, updatedUsers: 30, erroredUsers: 40 },
  ];

  beforeEach(function() {
    this.initModules(userTaskMgrModule);
    this.injectDependencies(
      '$scope',
      '$q',
      'UserTaskMgrService',
    );

    this.$scope.dismiss = jasmine.createSpy('dismiss');
    spyOn(this.UserTaskMgrService, 'getTasks').and.returnValue(this.$q.resolve(taskList));

    this.compileComponent('userTaskMgr', {
      dismiss: 'dismiss()',
    });
  });

  describe('UserTaskMgr modal at init', () => {
    it('should have modal title, body, left panel, right panel and options', function() {
      expect(this.view.find(MODAL_TITLE)).toExist();
      expect(this.view.find(MODAL_BODY)).toExist();
      expect(this.view.find(MODAL_CONTAINER)).toExist();
      expect(this.view.find(MODAL_CONTAINER).find(MODAL_PANEL_LEFT)).toExist();
      expect(this.view.find(LEFT_PANEL_HEADER).find(BUTTONS).get(0)).toExist();
      expect(this.view.find(LEFT_PANEL_HEADER).find(BUTTONS).get(1)).toExist();
      expect(this.view.find(MODAL_CONTAINER).find(MODAL_PANEL_RIGHT)).toExist();
      expect(this.UserTaskMgrService.getTasks).toHaveBeenCalled();
      expect(this.controller.allTaskList).toHaveLength(3);
      expect(this.controller.inProcessTaskList).toHaveLength(1);
      expect(this.controller.activeTask.jobInstanceId).toEqual('CSV Import 1');
      expect(this.view.find(TASKS)).toHaveLength(4);
    });
  });

  describe('UserTaskMgr modal task type', () => {
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

  describe('UserTaskMgr switch task', () => {
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
