import { Analytics } from 'modules/core/analytics';
import { AutoAssignTemplateModel } from 'modules/core/users/shared/auto-assign-template/auto-assign-template.model';
import { DirSyncService } from 'modules/core/featureToggle/dirSync.service';
import { IOnboardScopeForUsersConvert, OnboardCtrlBoundUIStates } from 'modules/core/users/shared/onboard/onboard.store';
import OnboardStore from 'modules/core/users/shared/onboard/onboard.store';

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

  /* @ngInject */
  constructor(
    // notes:
    // - as of 2018-03-31, we inject '$scope' here ONLY for ui-grid's internal API use (see: 'gridApi.saveState.restore()')
    // - do not use '$scope' for any other purpose
    // - use 'scopeData' if needing to share properties with other UI states that share 'OnboardCtrl'
    private $scope: ng.IScope,
    private $state: ng.ui.IStateService,
    private $timeout: ng.ITimeoutService,
    private $translate: ng.translate.ITranslateService,
    private Analytics: Analytics,
    private Authinfo,
    public AutoAssignTemplateModel: AutoAssignTemplateModel,
    private DirSyncService: DirSyncService,
    private OnboardStore: OnboardStore,
    private Orgservice,
  ) {
  }

  public $onInit(): void {
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
        const DELAY_100_MS = 100;
        const DELAY_200_MS = 200;
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
    this.getUnlicensedUsers();
  }

  public get convertUsersReadOnly(): boolean {
    return this.readOnly || this.isDirSyncEnabled;
  }

  public getUnlicensedUsers(): void {
    this.showSearch = false;

    // TODO: port 'Orgservice.getUnlicensedUsers()' to use promise-based callbacks
    this.Orgservice.getUnlicensedUsers((data) => {
      this.unlicensed = 0;
      this.showSearch = true;
      if (data.success) {
        if (data.totalResults) {
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
    if (this.AutoAssignTemplateModel.isDefaultAutoAssignTemplateActivated) {
      this.$state.go('users.convert.auto-assign-license-summary');
    } else {
      this.$state.go('users.convert.services', {});
    }
  }

  public convertDisabled(): boolean {
    return this.isDirSyncEnabled || !this.gridApi || _.isEmpty(this.gridApi.selection.getSelectedRows());
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
