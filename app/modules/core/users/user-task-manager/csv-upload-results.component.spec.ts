import userTaskManagerModalModuleName from './index';

describe('Component: csvUploadResults', () => {
  const PANEL_TITLE = 'h4.csv-upload-results__title';
  const PROGRESSBAR = 'cr-progressbar';
  const IMPORT_STATUS = '.csv-upload-results__description';
  const USERS_TILE_TOTALS = 'cr-users-tile-totals';
  const ERROR_LINE_BREAK = '.csv-upload-results__line-break';
  const ERROR_TABLE = 'cr-users-error-results';

  beforeEach(function() {
    this.crProgressbar = this.spyOnComponent('crProgressbar');
    this.crUsersErrorResults = this.spyOnComponent('crUsersErrorResults');
    this.crUsersTileTotals = this.spyOnComponent('crUsersTileTotals');
    this.initModules(
      userTaskManagerModalModuleName,
      this.crProgressbar,
      this.crUsersErrorResults,
      this.crUsersTileTotals,
    );
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
    spyOn(this.UserTaskManagerService, 'getUserDisplayAndEmail').and.returnValue(this.$q.resolve('User Me (user.me@gmail.com)'));

    this.aTask = _.cloneDeep(require('./test-tasks.json').csvUploadResultsTasks);
    this.$scope.activeTask = this.aTask;

    this.compileComponent('csvUploadResults', {
      inputActiveTask: 'activeTask',
    });
  });

  it('should have title', function () {
    expect(this.view.find(PANEL_TITLE)).toHaveText('userManage.bulk.import.status');
  });

  it('should have import description', function () {
    expect(this.view.find(IMPORT_STATUS)).toExist();
    expect(this.controller.startedBy).toBe('User Me (user.me@gmail.com)');
  });

  describe('crUsersTileTotals', () => {
    it('should bind data from the active task', function () {
      expect(this.view.find(USERS_TILE_TOTALS)).toExist();
      expect(this.crUsersTileTotals.bindings[0].newTotal).toBe(10);
      expect(this.crUsersTileTotals.bindings[0].updatedTotal).toBe(10);
      expect(this.crUsersTileTotals.bindings[0].errorTotal).toBe(10);
    });
  });

  describe('crProgressbar', () => {
    it('should conditionally show progress while processing', function () {
      expect(this.view.find(PROGRESSBAR)).not.toExist();
      expect(this.crProgressbar.bindings.length).toBe(0);
      this.controller.isProcessing = true;
      this.$scope.$apply();
      expect(this.view.find(PROGRESSBAR)).toExist();
      expect(this.crProgressbar.bindings[0].progressbarValue).toBe(30);
      expect(this.crProgressbar.bindings[0].progressbarFilename).toBe('100Users.csv');
      expect(this.crProgressbar.bindings[0].progressbarIsProcessing).toBe(true);
      expect(this.crProgressbar.bindings[0].progressbarLabel).toBeUndefined();

      this.crProgressbar.bindings[0].progressbarOnCancel();
      this.$scope.$apply(); // resolve modal promise success
      expect(this.UserTaskManagerService.cancelTask).toHaveBeenCalledWith(this.$scope.activeTask.jobInstanceId);
      expect(this.crProgressbar.bindings[0].progressbarLabel).toBe('common.cancelingEllipsis');
    });
  });

  describe('crUsersErrorResults', () => {
    it('should only show if error array contains elements', function () {
      expect(this.view.find(ERROR_LINE_BREAK)).not.toExist();
      expect(this.view.find(ERROR_TABLE)).not.toExist();
      this.controller.userErrorArray = [{}];
      this.$scope.$apply();
      expect(this.view.find(ERROR_LINE_BREAK)).toExist();
      expect(this.view.find(ERROR_TABLE)).toExist();
      expect(this.crUsersErrorResults.bindings[0].userErrorArray).toEqual(this.controller.userErrorArray);
    });
  });
});
