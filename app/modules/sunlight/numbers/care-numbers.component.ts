import { PrivateTrunkService } from 'modules/hercules/private-trunk/private-trunk-services';
import { ServiceDescriptorService } from 'modules/hercules/services/service-descriptor.service';
import { Config } from 'modules/core/config/config';
import { IGridApi } from 'ui-grid';
import { Notification } from 'modules/core/notifications/notification.service';

class CareNumbersCtrl implements ng.IComponentController {
  public trunks: boolean = false;
  public eptStatus: boolean = false;
  public hasCall: boolean = false;
  public loading: boolean = false;
  public loadData: boolean = true;
  public activeFilter: string = 'all';
  public gridRefresh: boolean = true;
  public currentDataPosition: number = 0;
  public searchStr: string = '';
  public ishI1484: boolean = false;
  public gridApi: uiGrid.IGridApi;
  public timeoutVal: number = 1000;
  public timer: any = undefined;
  public hPstn: boolean = false;
  public columnDefs = [{
    field: 'siteToSiteNumber',
    displayName: this.$translate.instant('linesPage.internalNumberHeader'),
    width: '20%',
    cellClass: 'internalNumberColumn',
    headerCellClass: 'internalNumberHeader',
    cellTemplate: '<cs-grid-cell row="row" grid="grid" cell-click-function="grid.appScope.clearRows()" cell-value="row.entity.siteToSiteNumber"></cs-grid-cell>',
  }, {
    field: 'internalNumber',
    displayName: this.$translate.instant('linesPage.internalNumberHeader'),
    width: '20%',
    cellClass: 'internalNumberColumn',
    headerCellClass: 'internalNumberHeader',
    cellTemplate: '<cs-grid-cell row="row" grid="grid" cell-click-function="grid.appScope.clearRows()" cell-value="row.entity.internalNumber"></cs-grid-cell>',
  }, {
    field: 'externalNumber',
    displayName: this.$translate.instant('linesPage.phoneNumbers'),
    cellClass: 'externalNumberColumn',
    headerCellClass: 'externalNumberHeader',
    width: '20%',
    cellTemplate: '<cs-grid-cell row="row" grid="grid" cell-click-function="grid.appScope.clearRows()" cell-value="row.entity.externalNumber"></cs-grid-cell>',
  }, {
    field: 'locationName',
    displayName: this.$translate.instant('usersPreview.location'),
    cellClass: 'anyColumn',
    headerCellClass: 'anyHeader',
    width: '*',
    cellTemplate: '<cs-grid-cell row="row" grid="grid" cell-click-function="grid.appScope.clearRows()" cell-value="row.entity.locationName"></cs-grid-cell>',
  }, {
    field: 'displayField()',
    displayName: this.$translate.instant('linesPage.assignedTo'),
    cellTemplate: require('./templates/_tooltipTpl.html'),
    sort: {
      direction: 'asc',
      priority: 0,
    },
    sortCellFiltered: true,
    cellClass: 'assignedToColumn',
    headerCellClass: 'assignedToHeader',
  }, {
    field: 'actions',
    displayName: this.$translate.instant('linesPage.actionHeader'),
    cellTemplate: require('./templates/_actionsTpl.html'),
    enableSorting: false,
    width: '20%',
    cellClass: 'actionsColumn',
    headerCellClass: 'actionsHeader',
  }];
  public placeholder;
  public filters;
  public sort;
  public currentCustomer;
  public currentLine;
  public vendor;
  public gridOptions;

  /* @ngInject */
  constructor(
    private $modal,
    private $q: ng.IQService,
    private $scope,
    private $state: ng.ui.IStateService,
    private $timeout: ng.ITimeoutService,
    private $translate: ng.translate.ITranslateService,
    private Authinfo,
    private Config: Config,
    private FeatureToggleService,
    private LineListService,
    private Notification: Notification,
    private PrivateTrunkService: PrivateTrunkService,
    private ServiceDescriptorService: ServiceDescriptorService,
  ) {}

  public $onInit() {
    this.setGridOptions();

    // this.hasCall = this.Authinfo.hasCallLicense();
    this.hasCall = this.Authinfo.isSquaredUC();

    this.loading = true;

    this.$q.all({
      pt: this.PrivateTrunkService.getPrivateTrunk(),
      ept: this.ServiceDescriptorService.getServiceStatus('ept'),
      ft: this.FeatureToggleService.supports(this.FeatureToggleService.features.hI1484),
      ft2: this.FeatureToggleService.supports(this.FeatureToggleService.features.huronPstn),
    }).then((response) => {
      this.trunks = response.pt.resources.length !== 0;
      this.eptStatus = response.ept.state !== 'unknown';
      this.ishI1484 = response.ft;
      this.hPstn = response.ft2;

      if (!this.ishI1484) {
        this.columnDefs.splice(0, 1);
        this.columnDefs.splice(2, 1);
      } else {
        this.columnDefs.splice(1, 1);
      }

      if (this.hasCall) {
        this.getLineList();
      }
    }).finally(() => this.loading = false);

    this.placeholder = {
      name: this.$translate.instant('linesPage.allLines'),
      filterValue: 'all',
    };

    this.filters = [{
      name: this.$translate.instant('linesPage.unassignedLines'),
      filterValue: 'unassignedLines',
    }, {
      name: this.$translate.instant('linesPage.assignedLines'),
      filterValue: 'assignedLines',
    }, {
      name: this.$translate.instant('linesPage.pending'),
      filterValue: 'pending',
    }];

    this.sort = {
      by: 'userid',
      order: '-asc',
    };

    this.currentCustomer = {
      customerOrgId: this.Authinfo.getOrgId(),
    };
  }

  public exportCsv() {
    return this.LineListService.exportCSV(this)
      .catch((response) => {
        this.Notification.errorResponse(response, 'linesPage.lineListError');
      });
  }

  public filterList(str) {
    if (this.timer) {
      this.$timeout.cancel(this.timer);
      this.timer = 0;
    }

    this.timer = this.$timeout(() => {
      if (str.length >= 3 || str === '') {
        this.searchStr = str;
        this.getLineList();
        this.currentDataPosition = 0;
      }
    }, this.timeoutVal);
  }

  public setGridOptions() {
    this.gridOptions = {
      data: [],
      appScopeProvider: this,
      showFilter: false,
      rowHeight: 44,
      useExternalSorting: false,
      noUnselect: true,
      onRegisterApi: (gridApi: IGridApi) => {
        this.gridApi = gridApi;
        gridApi.infiniteScroll.on.needLoadMoreData(null, () => {
          if (this.loadData) {
            this.currentDataPosition++;
            this.loadData = false;
            this.getLineList((this.currentDataPosition * this.Config.usersperpage) + 1);
          }
        });
        gridApi.core.on.sortChanged(this.$scope, this.sortColumn);
      },
      columnDefs: this.columnDefs,
    };
  }

  public sortColumn(grid, sortColumns) {
    if (_.isUndefined(_.get(sortColumns, '[0]'))) {
      return;
    }

    const vm = grid.options.appScopeProvider;

    if (vm.loadData) {
      vm.loadData = false;
      const sortBy = sortColumns[0].name === 'displayField()' ? 'userId' : sortColumns[0].name;
      const sortOrder = '-' + sortColumns[0].sort.direction;
      if (vm.sort.by !== sortBy || vm.sort.order !== sortOrder) {
        vm.sort.by = sortBy.toLowerCase();
        vm.sort.order = sortOrder.toLowerCase();
      }
      vm.getLineList();
    }
  }

  public formatUserName(first, last, userId) {
    let userName = userId;
    const firstName = first || '';
    const lastName = last || '';
    if ((firstName.length > 0) || (lastName.length > 0)) {
      userName = _.trim(firstName + ' ' + lastName);
    }
    return userName;
  }

  public deleteExternalNumber($event, number) {
    $event.stopPropagation();

    this.$state.go('externalNumberDelete', {
      numberInfo: {
        orgId: this.Authinfo.getOrgId(),
        externalNumber: number,
        apiImplementation: this.LineListService.getApiImplementation(),
      },
      refreshFn: /*ngInject*/ () => this.getLineList(),
    });
  }

  public canShowActionsMenu(line) {
    return this.canShowExternalNumberDelete(line);
  }

  public canShowExternalNumberDelete(line) {
    return line.externalNumber && (_.startsWith(line.displayField(), this.$translate.instant('linesPage.unassignedLines')));
  }

  public setFilter(filter) {
    if (this.activeFilter !== filter) {
      this.activeFilter = filter;
      this.getLineList();
      this.currentDataPosition = 0;
    }
  }

  public getLineList(startAt?) {
    this.gridRefresh = true;

    // Clear currentLine if a new search begins
    const startIndex = startAt || 0;
    this.currentLine = null;

    // Get "unassigned" internal and external lines
    this.LineListService.getLineList(startIndex, this.Config.usersperpage, this.sort.by, this.sort.order, this.searchStr, this.activeFilter, this.gridOptions.data, this.ishI1484)
      .then((response) => {
        this.$timeout(() => {
          this.loadData = true;
        });

        if (startIndex === 0) {
          this.gridOptions.data = response;
        } else {
          this.gridOptions.data = this.gridOptions.data.concat(response);
        }

        //function for sorting based on which piece of data the row has
        _.forEach(this.gridOptions.data, (row) => {
          row.displayField = () => {
            const displayName = this.formatUserName(row.firstName, row.lastName, row.userId);
            return (!_.isEmpty(displayName) ? displayName : this.$translate.instant('linesPage.unassignedLines')) + (row.status ? ' - ' + row.status : '');
          };
        });
        this.gridRefresh = false;
        this.vendor = this.LineListService.getVendor();
        if (response.length === 0) {
          //stop firing any more infinite scroll events
          this.gridApi.infiniteScroll.dataLoaded(false, false);
        } else {
          this.gridApi.infiniteScroll.dataLoaded(false, true);
        }
      })
      .catch((response) => {
        this.Notification.errorResponse(response, 'linesPage.lineListError');
        this.gridRefresh = false;
      });
  }

  public clearRows() {
    this.gridApi.selection.clearSelectedRows();
  }

  public openNewCareFeatureModal() {
    this.$modal.open({
      template: '<care-add-numbers-modal dismiss="$dismiss()" class="care-modal"></care-add-numbers-modal>',
      type: 'full',
    }).result.finally(() => {
      this.$state.reload();
    });
  }

}

export class CareNumbersComponent implements ng.IComponentOptions {
  public controller = CareNumbersCtrl;
  public template = require('modules/sunlight/numbers/care-numbers.component.html');
  public bindings = {};
}
