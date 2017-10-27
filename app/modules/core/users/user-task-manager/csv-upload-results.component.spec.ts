import userTaskManagerModalModuleName from './index';

describe('Component: csvUploadResults', () => {

  const PANEL_HEADER = '.flex-container.base-margin';
  const PANEL_TITLE = 'h4';
  const PROGRESSBAR = '.progressbar';
  const IMPORT_STATUS = '.flex-item-no-resize.upload-progress.upload-complete';
  const NEW_USER_BLOCK = '.stat.new-users';
  const UPDATED_USER_BLOCK = '.stat.updated-users';
  const ERROR_USER_BLOCK = '.stat.error-users';
  const ERROR_TABLE = '.flex-container.upload-errors';

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
    this.initModules(userTaskManagerModalModuleName);
    this.injectDependencies(
      '$scope',
      '$q',
      'UserTaskManagerService',
      'UserCsvService',
      'ModalService',
    );

    spyOn(this.ModalService, 'open').and.returnValue({
      result: this.$q.resolve(),
    });
    spyOn(this.UserTaskManagerService, 'cancelTask').and.returnValue(this.$q.resolve());

    this.aTask = require('./test-tasks.json').csvUploadResultsTasks;
    this.$scope.activeTask = this.aTask;

    this.compileComponent('csvUploadResults', {
      inputActiveTask: 'activeTask',
    });
  });

  describe('CsvUploadResults panel at init', () => {
    it('should have required tags presented', function () {
      expect(this.view.find(PANEL_HEADER)).toExist();
      expect(this.view.find(PANEL_TITLE).get(0)).toHaveText('userManage.bulk.import.status');
      expect(this.view.find(PROGRESSBAR)).toExist();
      expect(this.view.find(IMPORT_STATUS)).toExist();
      expect(this.view.find(NEW_USER_BLOCK)).toExist();
      expect(this.view.find(UPDATED_USER_BLOCK)).toExist();
      expect(this.view.find(ERROR_USER_BLOCK)).toExist();
      expect(this.view.find(ERROR_TABLE)).not.toExist();
      this.controller.userErrorArray = [{}];
      this.$scope.$apply();
      expect(this.view.find(ERROR_TABLE)).toExist();
    });
  });

  describe('CsvUploadResults panel at init', () => {
    it('should have controller variables set', function () {
      expect(this.controller.numNewUsers).toEqual(10);
      expect(this.controller.numUpdatedUsers).toEqual(10);
      expect(this.controller.numErroredUsers).toEqual(10);
      expect(this.controller.processProgress).toEqual(30);
      expect(this.controller.startedBy).toEqual('User Me (user.me@gmail.com)');
      expect(this.controller.fileName).toEqual('100Users.csv');
    });
  });

  describe('CsvUploadResults cancel a task', () => {
    it('should have called UserTaskManagerService.cancelTask', function () {
      this.controller.onCancelImport();
      this.$scope.$apply();
      expect(this.UserTaskManagerService.cancelTask).toHaveBeenCalledWith(this.$scope.activeTask.jobInstanceId);
    });
  });
});
