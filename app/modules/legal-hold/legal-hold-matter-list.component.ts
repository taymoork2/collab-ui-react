import { Authinfo } from 'modules/core/scripts/services/authinfo';
import { UserService } from 'modules/core/scripts/services/user.service.js';
import { LegalHoldService } from './legal-hold.service';
import { Notification } from 'modules/core/notifications';
import { MatterState, Events } from './legal-hold.enums';
import { IMatterJsonDataForDisplay } from './legal-hold.interfaces';

export interface IGridApiScope extends ng.IScope {
  gridApi?: uiGrid.IGridApi;
}

export interface IFilter {
  filterValue: number;
  name: string;
  count: number;
  filterFunction: Function;
}

export enum FilterValue {
  ALL = 0,
  MINE = 1,
  ACTIVE = 2,
  RELEASED = 3,
}

export interface IHash {
  [id: string]: string;
}

export class LegalHoldMatterListController implements ng.IComponentController {

  public static readonly userChunkSize = 10;
  public filters: IFilter[];

  public currentFilter: IFilter;
  public gridData_: IMatterJsonDataForDisplay[] = []; // the data source for search
  public gridRefresh = true;

  public gridOptions: uiGrid.IGridOptions;
  public gridApi: uiGrid.IGridApi;
  public loadingMore = false;
  public loadingMoreSpinner = false;
  private changeEventListener: Function;

  /* @ngInject */
  constructor(
    private $q: ng.IQService,
    private $rootScope: ng.IRootScopeService,
    private $state: ng.ui.IStateService,
    private $translate: ng.translate.ITranslateService,
    private Notification: Notification,
    private Authinfo: Authinfo,
    private LegalHoldService: LegalHoldService,
    private Userservice: UserService,
  ) {
    this.filters = [
      {
        filterValue: FilterValue.ALL,
        name: this.$translate.instant('legalHold.matterList.filter.all'),
        count: 0,
        filterFunction: () => true,
      },
      {
        filterValue: FilterValue.MINE,
        name: this.$translate.instant('legalHold.matterList.filter.mine'),
        count: 0,
        filterFunction: (row) => row.createdBy === this.Authinfo.getUserId(),
      },
      {
        filterValue: FilterValue.ACTIVE,
        name: this.$translate.instant('legalHold.matterList.filter.active'),
        count: 0,
        filterFunction: (row) => row.matterState !== MatterState.RELEASED,
      },
      {
        filterValue: FilterValue.RELEASED,
        name: this.$translate.instant('legalHold.matterList.filter.released'),
        count: 0,
        filterFunction: (row) => row.matterState === MatterState.RELEASED,
      }];
  }

  public $onInit(): void {
    this.setGridOptions();
    this.setGridData();
    this.changeEventListener = this.$rootScope.$on(Events.CHANGED, () => {
      this.setGridData();
    });
  }


  public $onDestroy() {
    this.changeEventListener();
  }

  private setGridOptions(): void {
    const columnDefs = [{
      width: '20%',
      sortable: true,
      cellTooltip: true,
      field: 'matterName',
      displayName: this.$translate.instant('legalHold.matterName'),
    }, {
      width: '11%',
      sortable: true,
      field: 'creationDate',
      type: 'date',
      cellFilter: 'date:\'MM/dd/yyyy\'',
      displayName: this.$translate.instant('legalHold.matterList.dateCreated'),
    }, {
      width: '25%',
      sortable: true,
      field: 'matterDescription',
      displayName: this.$translate.instant('common.description'),
    }, {
      width: '15%',
      sortable: true,
      field: 'createdBy',
      displayName: this.$translate.instant('legalHold.matterList.createdBy'),
      cellTemplate: require('./cell-template-createdBy.tpl.html'),
    }, {
      width: '10%',
      cellTooltip: true,
      field: 'numberOfCustodians',
      displayName: this.$translate.instant('legalHold.matterList.custodians'),
    }, {
      cellTooltip: true,
      field: 'dateReleased',
      type: 'date',
      cellFilter: 'date:\'MM/dd/yyyy\'',
      displayName: this.$translate.instant('legalHold.matterList.dateReleased'),
    },
    ];

    this.gridOptions = {
      rowHeight: 44,
      multiSelect: false,
      columnDefs: columnDefs,
      enableColumnMenus: false,
      enableColumnResizing: true,
      enableRowSelection: true,
      enableRowHeaderSelection: false,
    };
    this.gridOptions.appScopeProvider = this;
    this.gridOptions.onRegisterApi = (gridApi) => {
      this.gridApi = gridApi;
      gridApi.selection.on.rowSelectionChanged.call(this, null, (row) => {
        this.showDetail(row.entity);
      });
    };
  }

  public onChangeFilter(filter: IFilter) {
    if (!_.isFunction(filter.filterFunction)) {
      filter = _.find(this.filters, { filterValue: FilterValue.ALL });
    }
    this.currentFilter = filter;
    this.gridOptions.data = _.filter(this.gridData_, row => {
      return filter.filterFunction(row);
    });
  }

  public search(searchString: string) {
    if (!_.isEmpty(searchString)) {
      searchString = searchString.toLowerCase();
      this.currentFilter = _.find(this.filters, { filterValue: FilterValue.ALL });
      this.gridOptions.data = _.filter(this.gridData_, row => {
        return (_.includes(row.matterDescription.toLowerCase(), searchString) || _.includes(row.matterName.toLowerCase(), searchString));
      });
    } else {
      this.gridOptions.data = this.gridData_;
    }
  }

  private setGridData(): void {
    this.LegalHoldService.listMatters(this.Authinfo.getOrgId())
      .then((res: IMatterJsonDataForDisplay[]) => {
        this.gridOptions.data = this.gridData_ = res;
        //we don't care when this promise returns... it is just populating creators in parallel
        this.populateMatterCreators(res);
        this.setFilterCounts(this.gridData_);
      })
      .catch((err) => {
        this.Notification.errorResponse(err, 'errors.statusError', { status: err.status });
      })
      .finally(() => {
        this.gridRefresh = false;
      });
  }

  private getMappedNamesToUserIds(userIdsChunkedArray: string[][], returnResult: IHash = {}): IPromise<IHash> {
    const getUsersInChunkPromiseArr = _.map(userIdsChunkedArray[0], (userId: string) => {
      return this.Userservice.getUserAsPromise(userId)
        .then((result) => {
          if (_.get(result, 'data.name', null)) {
            returnResult[userId] = `${result.data.name.givenName} ${result.data.name.familyName}`;
          } else {
            returnResult[userId] = result.data.userName;
          }
        })
        .catch(() => {
          returnResult[userId] = this.$translate.instant('legalHold.matterList.userNotFound');
        });
    });
    return this.$q.all(getUsersInChunkPromiseArr).then(() => {
      if (userIdsChunkedArray.length > 1) {
        userIdsChunkedArray.shift();
        return this.getMappedNamesToUserIds(userIdsChunkedArray, returnResult);
      } else {
        return returnResult;
      }
    });
  }

  public populateMatterCreators(allRecords: IMatterJsonDataForDisplay[]): IPromise<void> {
    const creatorsArray: string[] = _.map(allRecords, 'createdBy');
    // find user names corresponding to all unique user ids
    const creatorsChunkedArray = _.chunk(_.uniq(creatorsArray), LegalHoldMatterListController.userChunkSize);
    return this.getMappedNamesToUserIds(creatorsChunkedArray).then((uniqueUsers: IHash) => {
      //add matching name to id;
      _.forEach(allRecords, record => {
        record.createdByName = uniqueUsers[record.createdBy];
      });
    });
  }

  private setFilterCounts(res: IMatterJsonDataForDisplay[]) {
    _.forEach(this.filters, filter => {
      filter.count = _.filter(res, row => {
        return filter.filterFunction(row);
      }).length;
    });
  }

  public showDetail(item: IMatterJsonDataForDisplay) {
    const matter = _.find(this.gridData_, { caseId: item.caseId });
    this.$state.go('legalhold.detail', {
      matter: matter,
      createdByName: item.createdByName,
    });
  }
}

export class LegalHoldMatterListComponent implements ng.IComponentOptions {
  public controller = LegalHoldMatterListController;
  public template = require('./legal-hold-matter-list.tpl.html');
}
