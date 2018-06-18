
import { IntegrationsManagementFakeService } from './integrations-management.fake-service';
import { IApplicationUsage, SortOrder, IListOptions, PolicyAction } from './integrations-management.types';
import { Notification } from 'modules/core/notifications/notification.service';
import { IGridApi, IUiGridConstants } from 'ui-grid';
export interface IGridApiScope extends ng.IScope {
  gridApi?: uiGrid.IGridApi;
}

export enum StatusEnum {
  SUCCESS = 'success',
  DANGER = 'danger',
}

export class IntegrationsManagementListController implements ng.IComponentController {
  public gridOptions: uiGrid.IGridOptions = {};
  public gridApi: uiGrid.IGridApi;

  public gridData: IApplicationUsage[] = [];
  public gridRefresh = true;
  private accessStatusCellTemplate: string;
  private loadData = true;
  public listOptions: IListOptions = {
    start: 0,
    count: 20,
  };
  public timeoutVal: number = 500;
  private timer: ng.IPromise<void> | undefined = undefined;

  public dateFormat = 'LLLL';
  private lastUpdate = moment(); //algendel TODO: where do we get this data??
  public PolicyActionEnum = PolicyAction;
  public globalAccessPolicy = true;

  /* @ngInject */
  public constructor(
    private uiGridConstants: IUiGridConstants,
    private $state: ng.ui.IStateService,
    private $translate: ng.translate.ITranslateService,
    private IntegrationsManagementFakeService: IntegrationsManagementFakeService,
    private $timeout: ng.ITimeoutService,
    private Notification: Notification,
  ) {
    this.accessStatusCellTemplate = require('./access-status-cell-template.html');
  }

  public $onInit() {
    this.setGridOptions();
    this.getGridData();
    this.IntegrationsManagementFakeService.getGlobalAccessPolicy()
      // algendelTODO: this is likely incorrect? how do we populate it?
      .then(result => this.globalAccessPolicy = !_.isUndefined(result));
  }

  public onGlobalAccessChange(value): void {
    this.globalAccessPolicy = value;
    //algendel TODO: there needs to be a service call here.
  }

  public get lastUpdateDate(): string {
    //algendel TODO: which service call gets this value?
    return moment(this.lastUpdate).format(this.dateFormat);
  }

  public get l10nGlobalAccessPolicyString(): string {
    return this.globalAccessPolicy ? 'integrations.globalAccessOn' : 'integrations.globalAccessOff';
  }

  public filterList(str) {
    if (this.timer) {
      this.$timeout.cancel(this.timer);
      this.timer = undefined;
    }
    this.timer = this.$timeout(() => {
      if (str.length >= 3 || str === '') {
        this.listOptions.searchStr = str;
        this.listOptions.start = 0;
        this.getGridData();
      }
    }, this.timeoutVal);
  }

  private getGridData(): IPromise<boolean> {
    return this.IntegrationsManagementFakeService.listIntegrations(this.listOptions)
      .then(result => {
        if (this.listOptions.start === 0) {
          this.gridData = _.clone(result);
        } else {
          this.gridData = _.concat(this.gridData, result);
        }
        this.gridOptions.data = this.gridData;
        this.loadData = true;
        return !_.isEmpty(result);
      })
      .catch(response => {
        this.Notification.errorResponse(response, 'integrations.getIntegrationListError');
        return false;
      })
      .finally(() => {
        this.gridRefresh = false;
      });
  }

  public getPolicyAction(action: PolicyAction): string {
    if (action === PolicyAction.ALLOW) {
      return StatusEnum.SUCCESS;
    } else {
      return StatusEnum.DANGER;
    }
  }

  private setGridOptions(): void {
    const columnDefs: uiGrid.IColumnDef[] = [{
      width: '34%',
      cellTooltip: true,
      field: 'appName',
      displayName: this.$translate.instant('integrations.integrationName'),
    }, {
      width: '33%',
      field: 'policyAction',
      cellTemplate: this.accessStatusCellTemplate,
      displayName: this.$translate.instant('integrations.accessStatus'),
    }, {
      field: 'appUserAdoption',
      displayName: this.$translate.instant('integrations.userAdoption'),
    }];

    this.gridOptions = {
      rowHeight: 44,
      multiSelect: false,
      columnDefs: columnDefs,
      enableColumnMenus: false,
      enableColumnResizing: true,
      enableRowSelection: true,
      enableRowHeaderSelection: false,
      useExternalSorting: true,
    };
    this.gridOptions.appScopeProvider = this;
    this.gridOptions.onRegisterApi = (gridApi: IGridApi) => {
      this.gridApi = gridApi;
      gridApi.selection.on.rowSelectionChanged.call(this, null, (row: uiGrid.IGridRow) => {
        this.showDetail(row.entity);
      });
      gridApi.infiniteScroll.on.needLoadMoreData(null, () => {
        this.gridApi.infiniteScroll.saveScrollPercentage();
        this.loadMoreData();
      });
      gridApi.core.on.sortChanged.call(this, null, (_, sortColumns) => {
        this.sortColumn(sortColumns);
      });
    };
  }

  public loadMoreData() {
    if (this.loadData) {
      this.listOptions.start = (this.listOptions.start || 0) + (this.listOptions.count || 0);
      this.loadData = false;
      this.getGridData()
        .then((hasMore) => {
          this.gridApi.infiniteScroll.dataLoaded(false, hasMore);
        });
    }
  }

  public sortColumn(sortColumns) {
    if (_.isUndefined(_.get(sortColumns, '[0]'))) {
      return;
    }
    this.listOptions.sortOrder = this.getSortDirection(sortColumns[0].sort.direction);
    this.listOptions.sortBy = sortColumns[0].field;
    this.listOptions.start = 0;
    this.loadData = false;
    this.getGridData();
  }

  private getSortDirection(direction: string): SortOrder {
    return (direction === this.uiGridConstants.DESC) ? SortOrder.DESC : SortOrder.ASC;
  }

  private showDetail(entity: IApplicationUsage) {
    this.$state.go('integrations-management.overview', { appId: entity.appId });
  }
}

export class IntegrationsManagementListComponent implements ng.IComponentOptions {
  public controller = IntegrationsManagementListController;
  public template = require('./integrations-management-list.html');
  public bindings = {};
}
