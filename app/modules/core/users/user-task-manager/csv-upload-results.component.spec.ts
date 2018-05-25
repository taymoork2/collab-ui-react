import userTaskManagerModalModuleName, {
  UserTaskManagerService,
} from './index';
import {
  CsvUploadResultsCtrl,
} from './csv-upload-results.component';
import { CrProgressbarComponent } from 'modules/core/shared/cr-progressbar/cr-progressbar.component';
import { CrUsersErrorResultsComponent } from 'modules/core/users/shared/cr-users-error-results/cr-users-error-results.component';
import { CrTotalTileComponent } from '../../shared/cr-total-tile/cr-total-tile.component';

type Test = atlas.test.IComponentTest<CsvUploadResultsCtrl, {
  UserTaskManagerService: UserTaskManagerService;
  UserCsvService;
  ModalService;
}, {
  crProgressbar: atlas.test.IComponentSpy<CrProgressbarComponent>;
  crUsersErrorResults: atlas.test.IComponentSpy<CrUsersErrorResultsComponent>;
  crTotalTile: atlas.test.IComponentSpy<CrTotalTileComponent>;
}>;

describe('Component: csvUploadResults', () => {
  const PANEL_TITLE = 'h4.csv-upload-results__title';
  const PROGRESSBAR = 'cr-progressbar';
  const IMPORT_STATUS = '.csv-upload-results__description';
  const TOTAL_TILE_CONTAINER = 'cr-total-tile-container';
  const ERROR_LINE_BREAK = '.csv-upload-results__line-break';
  const ERROR_TABLE = 'cr-users-error-results';

  beforeEach(function (this: Test) {
    this.crProgressbar = this.spyOnComponent('crProgressbar');
    this.crUsersErrorResults = this.spyOnComponent('crUsersErrorResults');
    this.crTotalTile = this.spyOnComponent('crTotalTile');
    this.initModules(
      userTaskManagerModalModuleName,
      this.crProgressbar,
      this.crUsersErrorResults,
      this.crTotalTile,
    );
    this.injectDependencies(
      'UserTaskManagerService',
      'UserCsvService',
      'ModalService',
    );

    spyOn(this.ModalService, 'open').and.returnValue({
      result: this.$q.resolve(),
    });
    spyOn(this.UserTaskManagerService, 'cancelTask').and.returnValue(this.$q.resolve());
    spyOn(this.UserTaskManagerService, 'getUserDisplayAndEmail').and.returnValue(this.$q.resolve('User Me (user.me@gmail.com)'));
    spyOn(this.UserTaskManagerService, 'getTaskErrors').and.returnValue(this.$q.resolve());

    this.aTask = _.cloneDeep(getJSONFixture('core/json/users/user-task-manager/test-tasks.json').csvUploadResultsTasks);
    this.$scope.activeTask = this.aTask;

    this.compileComponent('csvUploadResults', {
      inputActiveTask: 'activeTask',
    });
  });

  it('should have title', function (this: Test) {
    expect(this.view.find(PANEL_TITLE)).toHaveText('userManage.bulk.import.status');
  });

  it('should have import description', function (this: Test) {
    expect(this.view.find(IMPORT_STATUS)).toExist();
    expect(this.view.find(IMPORT_STATUS).length).toBe(3);
    expect(this.controller.startedBy).toBe('User Me (user.me@gmail.com)');
  });

  describe('crTotalTile', () => {
    it('should bind data from the active task', function (this: Test) {
      expect(this.view.find(TOTAL_TILE_CONTAINER)).toExist();

      expect(this.crTotalTile.bindings[0].totalValue).toBe(5);
      expect(this.crTotalTile.bindings[0].totalColor).toBe('green');
      expect(this.crTotalTile.bindings[0].l10nLabel).toBe('userManage.bulk.newUsers');

      expect(this.crTotalTile.bindings[1].totalValue).toBe(10);
      expect(this.crTotalTile.bindings[1].totalColor).toBe('blue');
      expect(this.crTotalTile.bindings[1].l10nLabel).toBe('userManage.bulk.existingUsers');

      expect(this.crTotalTile.bindings[2].totalValue).toBe(15);
      expect(this.crTotalTile.bindings[2].totalColor).toBe('red');
      expect(this.crTotalTile.bindings[2].l10nLabel).toBe('userManage.bulk.errorUsers');
    });
  });

  describe('crProgressbar', () => {
    it('should conditionally show progress while processing', function (this: Test) {
      expect(this.view.find(PROGRESSBAR)).not.toExist();
      expect(this.crProgressbar.bindings.length).toBe(0);
      this.controller.isProcessing = true;
      this.$scope.$apply();
      expect(this.view.find(PROGRESSBAR)).toExist();
      expect(this.crProgressbar.bindings[0].progressbarValue).toBe(30);
      expect(this.crProgressbar.bindings[0].progressbarFilename).toBe('testFile.csv');
      expect(this.crProgressbar.bindings[0].progressbarIsProcessing).toBe(true);
      expect(this.crProgressbar.bindings[0].progressbarLabel).toBeUndefined();

      this.crProgressbar.bindings[0].progressbarOnCancel();
      this.$scope.$apply(); // resolve modal promise success
      expect(this.UserTaskManagerService.cancelTask).toHaveBeenCalledWith(this.$scope.activeTask.id);
      expect(this.crProgressbar.bindings[0].progressbarLabel).toBe('common.cancelingEllipsis');
    });
  });

  describe('crUsersErrorResults', () => {
    it('should only show if error array contains elements', function (this: Test) {
      expect(this.view.find(ERROR_LINE_BREAK)).not.toExist();
      expect(this.view.find(ERROR_TABLE)).not.toExist();
      this.controller.userErrorArray = [{
        row: 0,
        error: '',
      }];
      this.$scope.$apply();
      expect(this.view.find(ERROR_LINE_BREAK)).toExist();
      expect(this.view.find(ERROR_TABLE)).toExist();
      expect(this.crUsersErrorResults.bindings[0].userErrorArray).toEqual(this.controller.userErrorArray);
    });
  });
});
