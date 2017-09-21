import userTaskMgrModule from './index';
import { ITask } from './user-task-mgr.component';

describe('Component: userTaskMgrModule', () => {

  const PANEL_HEADER = '.flex-container.base-margin';
  const PANEL_TITLE = 'h4';

  const aTask: ITask = {
    jobInstanceId: 'CSV Import 1', created: '2017-10-06T20:54:22.535Z', started: '20:54', lastModified: '2017-10-06T21:09:09.491Z', stopped: 'Oct 6, 2017', creatorUserId: '010e453a-865b-4d34-b3d9-daf94ab0805e', modifierUserId: '010e453a-865b-4d34-b3d9-daf94ab0805e', status: 'Processing', message: '', filename: '200Users.csv',     fileSize: 487, fileMd5: '', totalUsers: 100, addedUsers: 10, updatedUsers: 10, erroredUsers: 10,
  };

  beforeEach(function() {
    this.initModules(userTaskMgrModule);
    this.injectDependencies(
      '$scope',
      '$q',
    );

    this.$scope.onDoneImport = jasmine.createSpy('onDoneImport');
    this.$scope.onCancelmport = jasmine.createSpy('onCancelImport');
    this.$scope.activeTask = aTask;

    this.compileComponent('csvUploadResults', {
      onDoneImport: 'onDoneImport()',
      onCancelmport: 'onCancelmport()',
      activeTask: 'activeTask',
    });
  });

  describe('CsvUploadResults panel at init', () => {
    it('should have panel header, title and options', function() {
      expect(this.view.find(PANEL_HEADER)).toExist();
      expect(this.view.find(PANEL_TITLE).get(0)).toHaveText('userManage.bulk.import.status');
      expect(this.controller.numNewUsers).toEqual(10);
      expect(this.controller.numUpdatedUsers).toEqual(10);
      expect(this.controller.numErroredUsers).toEqual(10);
      expect(this.controller.processProgress).toEqual(30);
    });
  });
});
