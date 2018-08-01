import { Analytics } from 'modules/core/analytics';
import { AutoAssignTemplateModel } from 'modules/core/users/shared/auto-assign-template/auto-assign-template.model';
import { AutoAssignTemplateService } from 'modules/core/users/shared/auto-assign-template/auto-assign-template.service';
import { DirSyncService } from 'modules/core/featureToggle/dirSync.service';
import { FeatureToggleService } from 'modules/core/featureToggle';
import { IOnboardScopeForUsersConvert, OnboardCtrlBoundUIStates } from 'modules/core/users/shared/onboard/onboard.store';
import { GridService } from 'modules/core/csgrid';
import OnboardStore from 'modules/core/users/shared/onboard/onboard.store';
import * as moment from 'moment';

interface IConversionStatus {
  type: string;
  key: string;
  cellVal: string | Function;
}

interface ICsvRow {
  name: string;
  email: string;
  status: string;
}

const DELAY_100_MS = 100;
const DELAY_200_MS = 200;

export class CrConvertUsersModalController implements ng.IComponentController {
  public convertGridOptions: uiGrid.IGridOptions;
  public dismiss: Function;
  public gridApi: uiGrid.IGridApi;
  public pendingGridApi: uiGrid.IGridApi;
  public isDirSyncEnabled: boolean;
  public readOnly: boolean;
  public showSearch: boolean;
  public timer: ng.IPromise<void> | undefined;
  public unlicensed: number;
  public scopeData: IOnboardScopeForUsersConvert;
  public showAutoAssignBanner = true;

  public ftF7208: boolean;
  public readonly POTENTIAL = 'potential';
  public readonly PENDING = 'pending';
  public conversionStatusMap: IConversionStatus[];
  public daysToConvert = 14;  // How many days does a user have to convert their account?

  private selectedTab = this.POTENTIAL;
  private gridPotentialUsers: uiGrid.IGridOptions;
  public gridPendingUsers: uiGrid.IGridOptions;

  /* @ngInject */
  constructor(
    // notes:
    // - as of 2018-03-31, we inject '$scope' here ONLY for ui-grid's internal API use (see: 'gridApi.saveState.restore()')
    // - do not use '$scope' for any other purpose
    // - use 'scopeData' if needing to share properties with other UI states that share 'OnboardCtrl'
    public AutoAssignTemplateModel: AutoAssignTemplateModel,

    private $q: ng.IQService,
    private $scope: ng.IScope,
    private $state: ng.ui.IStateService,
    private $timeout: ng.ITimeoutService,
    private $translate: ng.translate.ITranslateService,
    private Analytics: Analytics,
    private Authinfo,
    private AutoAssignTemplateService: AutoAssignTemplateService,
    private DirSyncService: DirSyncService,
    private FeatureToggleService: FeatureToggleService,
    private GridService: GridService,
    private OnboardStore: OnboardStore,
    private Orgservice,
    private uiGridConstants: uiGrid.IUiGridConstants,
  ) { }

  public $onInit(): void {
    // TODO: rm use of 'OnboardStore' once shared references in '$scope' in 'OnboardCtrl' are removed
    this.OnboardStore.resetStatesAsNeeded(OnboardCtrlBoundUIStates.USERS_CONVERT);
    this.scopeData = this.OnboardStore[OnboardCtrlBoundUIStates.USERS_CONVERT];

    this.isDirSyncEnabled = this.DirSyncService.isDirSyncEnabled();
    this.convertGridOptions = {
      data: undefined,
      appScopeProvider: this,
      rowHeight: 45,
      multiSelect: !this.convertUsersReadOnly,
      enableFullRowSelection: !this.convertUsersReadOnly,
      enableRowSelection: !this.convertUsersReadOnly,
      useExternalSorting: false,
      saveSelection: true,
      onRegisterApi: (gridApi: uiGrid.IGridApi) => {
        this.gridApi = gridApi;
        this.restoreConvertList();
      },
      columnDefs: this.getColumnDefs(),
      saveRowIdentity: (rowEntity => rowEntity.userName) as any,
    };

    // F7208 - convert users Modal work...
    this.conversionStatusMap = [
      { type: this.POTENTIAL,
        key: 'IMMEDIATE',
        cellVal: this.$translate.instant('convertUsersModal.status.immediate'),
      }, {
        type: this.POTENTIAL,
        key: 'DELAYED',
        cellVal: this.$translate.instant('convertUsersModal.status.delayed'),
      }, {
        type: this.PENDING,
        key: 'TRANSIENT',
        cellVal: user => {
          const convertDate = new Date(_.get(user, 'meta.accountStatusSetTime.transient'));
          if (_.isUndefined(convertDate)) {
            // error condition, no transient property present
            return this.$translate.instant('convertUsersModal.status.unknown');
          }
          const remainingDays = Math.max(this.daysToConvert - moment().diff(convertDate, 'days'), 0);
          return this.$translate.instant('convertUsersModal.status.autoConvert', { count: remainingDays }, 'messageformat');
        },
      },
    ];

    // grid option data
    this.gridPotentialUsers = {
      data: undefined,
      rowHeight: 45,
      multiSelect: true,
      enableFullRowSelection: true,
      enableRowSelection: true,
      enableColumnMenus: false,
      // piggy back on existing convert user code
      onRegisterApi: gridApi => {
        this.gridApi = gridApi;
        this.restoreConvertList();
      },
      saveRowIdentity: (rowEntity => rowEntity.userName) as any,
    };

    this.gridPendingUsers = {
      data: undefined,
      rowHeight: 45,
      enableHorizontalScrollbar: 0,
      enableRowHeaderSelection: false,
      enableRowSelection: false,
      enableColumnMenus: false,
      onRegisterApi: (gridApi) => {
        this.pendingGridApi = gridApi;
        if (this.scopeData.pendingGridState) {
          this.$timeout(() => {
            this.pendingGridApi.saveState.restore(this.$scope, this.scopeData.pendingGridState);
          }, DELAY_100_MS);
        }
        this.$timeout(this.pendingGridApi.core.handleWindowResize, DELAY_200_MS);
      },
    };

    this.addGridColumns(this.gridPotentialUsers, true);
    this.addGridColumns(this.gridPendingUsers, false);

    this.AutoAssignTemplateService.isEnabledForOrg().then(isActivated => {
      this.showAutoAssignBanner = !isActivated;
    });

    this.FeatureToggleService.supports(this.FeatureToggleService.features.atlasF7208GDPRConvertUser).then(supported => {
      this.ftF7208 = supported;
      this.getUnlicensedUsers();
    });
  }

  // helper function for building grid options
  private addGridColumns(grid: uiGrid.IGridOptions, isPotentialList: boolean): void {
    grid.columnDefs = [];

    // if multiSelect is allowed on the grid, then add the checkbox row
    if (_.get(grid, 'multiSelect', false)) {
      grid.columnDefs.push(this.GridService.getDefaultSelectColumn('{{::row.entity.displayName}} {{::row.entity.userName}} {{::row.entity.statusText}}'));
    }

    grid.columnDefs.push({
      field: 'displayName',
      displayName: this.$translate.instant('convertUsersModal.tableHeader.name'),
    });
    grid.columnDefs.push({
      field: 'userName',
      displayName: this.$translate.instant('convertUsersModal.tableHeader.email'),
      sort: {
        direction: this.uiGridConstants.ASC,
      },
    });
    grid.columnDefs.push({
      field: 'statusText',
      displayName: this.$translate.instant('convertUsersModal.tableHeader.eligible'),
    });

    // Pending uses sort algo for status...
    if (!isPotentialList) {
      const statusCol = _.find(grid.columnDefs, { field: 'statusText' });
      if (!_.isUndefined(statusCol)) {
        statusCol.displayName = this.$translate.instant('convertUsersModal.tableHeader.status');
        statusCol.sortingAlgorithm = (_a, _b, rowA, rowB) => {
          const aTime = _.get(rowA, 'entity.meta.accountStatusSetTime.transient');
          const bTime = _.get(rowB, 'entity.meta.accountStatusSetTime.transient');
          const aUnavailable = !aTime;
          const bUnavailable = !bTime;

          if (aUnavailable && bUnavailable) {
            return 0;
          } else if (aUnavailable) {
            return -1;
          } else if (bUnavailable) {
            return 1;
          }

          const aDate = moment(aTime);
          const bDate = moment(bTime);
          return aDate.diff(bDate);
        };
      }
    }
  }

  public exportCSV(reportType: string): ng.IPromise<ICsvRow[]> {
    return this.$q((resolve) => {
      const csv: ICsvRow[] = [];

      // push column headers
      csv.push({
        name: this.$translate.instant('convertUsersModal.tableHeader.name'),
        email: this.$translate.instant('convertUsersModal.tableHeader.email'),
        status: (reportType === this.POTENTIAL) ?
          this.$translate.instant('convertUsersModal.tableHeader.eligible') :
          this.$translate.instant('convertUsersModal.tableHeader.transient'),
      });

      // push row data
      if (reportType === this.POTENTIAL) {
        const immediateHeader = this.$translate.instant('convertUsersModal.status.immediate');
        const delayedHeader = this.$translate.instant('convertUsersModal.status.delayed');

        _.forEach(this.getPotentialUsersList(), function (o) {
          csv.push({
            name: o.displayName || '',
            email: o.userName || '',
            status: (o.conversionStatus === 'IMMEDIATE') ? immediateHeader : delayedHeader,
          });
        });
      } else {
        _.forEach(this.getPendingUsersList(), function (o) {
          const transientDate = new Date(_.get(o, 'meta.accountStatusSetTime.transient'));
          csv.push({
            name: o.displayName || '',
            email: o.userName || '',
            status: transientDate.toLocaleString(),
          });
        });
      }

      resolve(csv);
    });
  }

  public getPendingUsersList(): any[] {
    return _.get(this, 'gridPendingUsers.data', []);
  }

  public getPotentialUsersList(): any[] {
    return _.get(this, 'gridPotentialUsers.data', []);
  }

  public getSelectedTab(): string {
    return this.selectedTab;
  }

  public getSelectedList(): any[] {
    switch (this.getSelectedTab()) {
      case this.PENDING:
        return this.getPendingUsersList();
      case this.POTENTIAL:
        return this.getPotentialUsersList();
    }
    return [];
  }

  public getSelectedListCount(): number {
    return _.size(this.getSelectedList());
  }

  // getStatusText - map between backend JSON key values and translated text (to be shown in grid cells)
  public getStatusText(user): string {
    const status = _.find(this.conversionStatusMap, { key: user.conversionStatus });
    if (_.isUndefined(status)) {
      return '';
    }

    if (_.isFunction(status.cellVal)) {
      return status.cellVal(user);
    }

    return status.cellVal || '';
  }

  public isPotentialTabSelected(): boolean {
    return this.getSelectedTab() === this.POTENTIAL;
  }

  public isPendingTabSelected(): boolean {
    return this.getSelectedTab() === this.PENDING;
  }

  public selectTab(tab): boolean {
    switch (tab) {
      case this.PENDING:
      case this.POTENTIAL:
        this.saveConvertList();
        break;

      default:
        return false;
    }

    this.selectedTab = tab;
    return true;
  }

  public get convertUsersReadOnly(): boolean {
    return this.readOnly || this.isDirSyncEnabled;
  }

  public getUnlicensedUsers(): void {
    this.showSearch = false;
    this.saveConvertList();

    // TODO: port 'Orgservice.getUnlicensedUsers()' to use promise-based callbacks
    this.Orgservice.getUnlicensedUsers(data => {
      this.unlicensed = 0;
      this.showSearch = true;
      if (data.success) {
        if (this.ftF7208) {
          const pendingList: any[] = [];
          const potentialList: any[] = [];
          _.forEach(data.resources, user => {
            user.statusText = this.getStatusText(user);
            if (_.some(this.conversionStatusMap, { type: this.POTENTIAL, key: user.conversionStatus })) {
              potentialList.push(user);
            } else if (_.some(this.conversionStatusMap, { type: this.PENDING, key: user.conversionStatus })) {
              pendingList.push(user);
            }
          });
          this.gridPendingUsers.data = pendingList;
          this.gridPotentialUsers.data = potentialList;
        } else if (data.totalResults) {
          this.unlicensed = data.totalResults;
          this.convertGridOptions.data = data.resources;
        }
      }
    }, null, this.scopeData.searchStr);
  }

  public filterList(searchStr: string): void {
    const TIMEOUT_1_SEC = 1000;
    if (this.timer) {
      this.$timeout.cancel(this.timer);
      this.timer = undefined;
    }

    this.timer = this.$timeout(() => {
      if (searchStr.length >= 3 || searchStr === '') {
        this.scopeData.searchStr = searchStr;
        this.getUnlicensedUsers();
        this.Analytics.trackUserOnboarding(this.Analytics.sections.USER_ONBOARDING.eventNames.CONVERT_USER, this.$state.current.name, this.Authinfo.getOrgId());
      }
    }, TIMEOUT_1_SEC);
  }

  public goToManageUsers(): void {
    this.$state.go('users.manage.org');
  }

  public restoreConvertList(): void {
    if (_.get(this, 'pendingGridApi.saveState')) {
      this.pendingGridApi.saveState.restore(this.$scope, this.scopeData.pendingGridState);
    }

    if (_.get(this, 'gridApi.saveState')) {
      if (this.scopeData.selectedState) {
        this.$timeout(() => {
          this.gridApi.saveState.restore(this.$scope, this.scopeData.selectedState);
        }, DELAY_100_MS);
      }
      this.GridService.handleResize(this.gridApi, DELAY_200_MS);
    }
  }

  public saveConvertList(): void {
    if (_.get(this, 'pendingGridApi.saveState')) {
      this.scopeData.pendingGridState = this.pendingGridApi.saveState.save();
    }

    if (_.get(this, 'gridApi.saveState')) {
      this.scopeData.selectedState = this.gridApi.saveState.save();
      this.scopeData.convertSelectedList = this.gridApi.selection.getSelectedRows();
    }

    this.scopeData.convertUsersFlow = true;
  }

  public onClickNext(): void {
    this.saveConvertList();
    if (this.AutoAssignTemplateModel.isDefaultAutoAssignTemplateActivated) {
      this.$state.go('users.convert.auto-assign-license-summary');
    } else {
      this.$state.go('users.convert.services', {});
    }
  }

  public convertDisabled(): boolean {
    return this.isDirSyncEnabled || !this.gridApi || !_.isFunction(_.get(this, 'gridApi.selection.getSelectedRows')) || _.isEmpty(this.gridApi.selection.getSelectedRows());
  }

  public dismissModal(): void {
    this.Analytics.trackAddUsers(this.Analytics.eventNames.CANCEL_MODAL);
    this.dismiss();
  }

  public showAutoAssignModal(): void {
    this.AutoAssignTemplateService.showEditAutoAssignTemplateModal();
  }

  private get displayNameColumn() {
    return {
      field: 'displayName',
      displayName: this.$translate.instant('usersPage.displayNameHeader'),
    };
  }

  private get userNameColumn() {
    return {
      field: 'userName',
      displayName: this.$translate.instant('homePage.emailAddress'),
      sort: {
        direction: 'desc',
        priority: 0,
      },
      sortCellFiltered: true,
    };
  }

  private getColumnDefs(): uiGrid.IColumnDef[] {
    if (this.convertUsersReadOnly) {
      return [ this.displayNameColumn, this.userNameColumn ];
    } else {
      return [this.GridService.getDefaultSelectColumn('{{::row.entity.displayName}} {{::row.entity.userName}}'), this.displayNameColumn, this.userNameColumn ];
    }
  }
}

export class CrConvertUsersModalComponent implements ng.IComponentOptions {
  public controller = CrConvertUsersModalController;
  public template = require('./cr-convert-users-modal.html');
  public bindings = {
    dismiss: '&',
    readOnly: '<',
    manageUsers: '<',
  };
}
