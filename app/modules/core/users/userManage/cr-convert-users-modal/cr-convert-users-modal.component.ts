import { Analytics } from 'modules/core/analytics';
import { AutoAssignTemplateModel } from 'modules/core/users/shared/auto-assign-template/auto-assign-template.model';
import { DirSyncService } from 'modules/core/featureToggle/dirSync.service';
import { FeatureToggleService } from 'modules/core/featureToggle';
import { IOnboardScopeForUsersConvert, OnboardCtrlBoundUIStates } from 'modules/core/users/shared/onboard/onboard.store';
import OnboardStore from 'modules/core/users/shared/onboard/onboard.store';

interface IConversionStatus {
  type: string;
  jsonKey: string;
  cellVal: string | Function;
}

export class CrConvertUsersModalController implements ng.IComponentController {
  public convertGridOptions: uiGrid.IGridOptions;
  public dismiss: Function;
  public gridApi: uiGrid.IGridApi;
  public isDirSyncEnabled: boolean;
  public readOnly: boolean;
  public showSearch: boolean;
  public timer: ng.IPromise<void> | undefined;
  public unlicensed: number;
  public scopeData: IOnboardScopeForUsersConvert;

  public ftF7208: boolean;
  public POTENTIAL: string = 'potential';
  public PENDING: string = 'pending';
  public conversionStatus: IConversionStatus[];
  public daysToConvert: number = 14;  // How many days does a user have to convert their account?b
  public exportCSV: Function;
  public getPendingUsersList: Function;
  public getPotentialUsersList: Function;
  public getSelectedTab: Function;
  public getSelectedList: Function;
  public getSelectedListCount: Function;
  public getStatusText: Function;
  public isPotentialTabSelected: Function;
  public isPendingTabSelected: Function;
  public selectTab: Function;

  private selectedTab: string = 'potential';
  private gridPotentialUsers: uiGrid.IGridOptions;
  private gridPendingUsers: uiGrid.IGridOptions;
  private addGridColumns: Function;

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
    private DirSyncService: DirSyncService,
    private FeatureToggleService: FeatureToggleService,
    private OnboardStore: OnboardStore,
    private Orgservice,
    private uiGridConstants: uiGrid.IUiGridConstants,
  ) {
  }

  public $onInit(): void {
    const DELAY_100_MS = 100;
    const DELAY_200_MS = 200;

    // TODO: rm use of 'OnboardStore' once shared references in '$scope' in 'OnboardCtrl' are removed
    this.scopeData = this.OnboardStore[OnboardCtrlBoundUIStates.USERS_CONVERT];
    this.isDirSyncEnabled = this.DirSyncService.isDirSyncEnabled();
    this.convertGridOptions = {
      data: undefined,
      appScopeProvider: this,
      rowHeight: 45,
      enableHorizontalScrollbar: 0,
      selectionRowHeaderWidth: 50,
      enableRowHeaderSelection: !this.convertUsersReadOnly,
      enableFullRowSelection: !this.convertUsersReadOnly,
      useExternalSorting: false,
      enableColumnMenus: false,
      saveSelection: true,
      onRegisterApi: (gridApi: uiGrid.IGridApi) => {
        this.gridApi = gridApi;
        if (this.scopeData.selectedState) {
          this.$timeout(() => {
            this.gridApi.saveState.restore(this.$scope, this.scopeData.selectedState);
          }, DELAY_100_MS);
        }
        this.$timeout(this.gridApi.core.handleWindowResize, DELAY_200_MS);
      },
      columnDefs: [{
        field: 'displayName',
        displayName: this.$translate.instant('usersPage.displayNameHeader'),
      }, {
        field: 'userName',
        displayName: this.$translate.instant('homePage.emailAddress'),
        sort: {
          direction: 'desc',
          priority: 0,
        },
        sortCellFiltered: true,
      }],
    };

    // F7208 - convert users Modal work...
    this.conversionStatus = [
      { type: this.POTENTIAL, jsonKey: 'IMMEDIATE', cellVal: this.$translate.instant('convertUsersModal.status.immediate') },
      { type: this.POTENTIAL, jsonKey: 'DELAYED', cellVal: this.$translate.instant('convertUsersModal.status.delayed') },
      { type: this.PENDING, jsonKey: 'TRANSIENT', cellVal: user => { return _.get(user, 'meta.created'); } },
    ];
    // grid option data
    this.gridPotentialUsers = {
      data: undefined,
      rowHeight: 45,
      enableHorizontalScrollbar: 0,
      enableFullRowSelection: true,
      selectionRowHeaderWidth: 50,
      enableColumnMenus: false,
      // piggy back on existing convert user code
      onRegisterApi: gridApi => {
        this.gridApi = gridApi;
        if (this.scopeData.selectedState) {
          this.$timeout(() => {
            this.gridApi.saveState.restore(this.$scope, this.scopeData.selectedState);
          }, DELAY_100_MS);
        }
        this.$timeout(gridApi.core.handleWindowResize, 200);
      },
    };
    this.gridPendingUsers = {
      data: undefined,
      rowHeight: 45,
      enableHorizontalScrollbar: 0,
      enableRowHeaderSelection: false,
      enableRowSelection: false,
      enableColumnMenus: false,
      onRegisterApi: gridApi => {
        this.gridApi = gridApi;
      },
    };
    // helper function for building grid options
    this.addGridColumns = grid => {
      grid.columnDefs = [{
        field: 'displayName',
        displayName: this.$translate.instant('convertUsersModal.tableHeader.name'),
        resizable: false,
        sortable: true,
      }, {
        field: 'userName',
        displayName: this.$translate.instant('convertUsersModal.tableHeader.email'),
        resizable: false,
        sort: {
          direction: this.uiGridConstants.ASC,
          priority: 0,
        },
        sortCellFiltered: true,
      }, {
        field: 'statusText',
        displayName: this.$translate.instant('convertUsersModal.tableHeader.status'),
        resizable: false,
        sort: {
          priority: 0,
        },
        sortCellFiltered: true,
      }];
    };
    this.exportCSV = () => {
      return this.$q((resolve) => {
        const csv: object[] = [];

        // push column headers
        const row: object = {};
        _.forEach(['name', 'email', 'status'], (key: string) => {
          row[key] = this.$translate.instant('convertUsersModal.tableHeader.' + key);
        });
        csv.push(row);

        // push row data
        _.forEach(this.getPendingUsersList(), function (o) {
          csv.push({
            name: o.displayName || '',
            email: o.userName || '',
            status: o.statusText || '',
          });
        });

        resolve(csv);
      });
    };
    this.getPendingUsersList = () => {
      return _.get(this, 'gridPendingUsers.data', []);
    };
    this.getPotentialUsersList = () => {
      return _.get(this, 'gridPotentialUsers.data', []);
    };
    this.getSelectedTab = () => {
      return this.selectedTab;
    };
    this.getSelectedList = () => {
      switch (this.getSelectedTab()) {
        case this.PENDING:
          return this.getPendingUsersList();
        case this.POTENTIAL:
          return this.getPotentialUsersList();
      }
      return [];
    };
    this.getSelectedListCount = () => {
      return this.getSelectedList().length;
    };
    // getStatusText - map between backend JSON key values and translated text (to be shown in grid cells)
    this.getStatusText = (user) => {
      const status: any = _.find(this.conversionStatus, { jsonKey: user.conversionStatus });
      if (_.isUndefined(status)) {
        return '';
      }

      if (_.isFunction(status.cellVal)) {
        return status.cellVal(user);
      }

      return status.cellVal || '';
    };
    this.isPotentialTabSelected = () => {
      return this.getSelectedTab() === this.POTENTIAL;
    };
    this.isPendingTabSelected = () => {
      return this.getSelectedTab() === this.PENDING;
    };
    this.selectTab = (tab) => {
      if ([this.PENDING, this.POTENTIAL].indexOf(tab) !== -1) {
        this.saveConvertList();
        this.selectedTab = tab;
        return true;
      }
      return false;
    };

    this.addGridColumns(this.gridPotentialUsers);
    this.addGridColumns(this.gridPendingUsers);

    this.FeatureToggleService.supports(this.FeatureToggleService.features.atlasF7208GDPRConvertUser).then(supported => {
      this.ftF7208 = supported;
      this.getUnlicensedUsers();
    });
  }

  public get convertUsersReadOnly(): boolean {
    return this.readOnly || this.isDirSyncEnabled;
  }

  public getUnlicensedUsers(): void {
    this.showSearch = false;

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
            if (_.findIndex(this.conversionStatus, { type: this.POTENTIAL, jsonKey: user.conversionStatus }) !== -1) {
              potentialList.push(user);
            } else if (_.findIndex(this.conversionStatus, { type: this.PENDING, jsonKey: user.conversionStatus }) !== -1) {
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
    this.$state.go('users.manage.picker');
  }

  public saveConvertList(): void {
    this.scopeData.selectedState = this.gridApi.saveState.save();
    this.scopeData.convertSelectedList = this.gridApi.selection.getSelectedRows();
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
