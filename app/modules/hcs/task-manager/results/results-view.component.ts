import { IToolkitModalService } from 'modules/core/modal';
import { HtmResults, TaskManagerService, State } from '../shared';

export class ResultsViewComponent implements ng.IComponentOptions {
  public controller = ResultsViewCtrl;
  public template = require('./results-view.component.html');
}

export class ResultsViewCtrl implements ng.IComponentController {
  public readonly STATE_NEW = State.New; // Used for HTML only
  public readonly STATE_LOADING = State.Loading; // Used for HTML only
  public readonly STATE_RELOAD = State.Reload; // Used for HTML only
  public readonly STATE_SHOW = State.Show; // Used for HTML only
  public gridOptions;
  public gridColumns;
  public pageState: State = State.Loading;
  public backState = 'taasSuites';
  public results: HtmResults[] = [];

  private resultsListData;

  /* @ngInject */
  constructor(
    private HcsTestManagerService: TaskManagerService,
    private $state: ng.ui.IStateService,

    public $modal: IToolkitModalService,
    public $translate: ng.translate.ITranslateService,
    public $q: ng.IQService,
    ) {}

  public $onInit(): void {
    this.resultsListData = [];
    this.initUIGrid();
    this.HcsTestManagerService.getResults()
    .then(results => {
      if (results.length === 0) {
        this.pageState = State.New;
      } else {
        this.pageState = State.Show;
        this.resultsListData = results;
        this.gridOptions.data = results;
      }
    });
  }

  public initUIGrid() {
    const columnDefs = [
      {
        field: 'suiteName',
        displayName: 'suiteName',
        width: '15%',
        sort: {
          direction: 'asc',
        },
      }, {
        field: 'taskName',
        displayName: 'taskName',
        width: '25%',
      }, {
        field: 'startTime',
        displayName: 'startTime',
        width: '20%',
      }, {
        field: 'pass',
        displayName: 'pass',
        width: '10%',
      }, {
        field: 'fail',
        displayName: 'fail',
        width: '10%',
      }, {
        field: 'skip',
        displayName: 'skip',
        width: '10%',
      }, {
        field: 'error',
        displayName: 'error',
        width: '10%',
      },
    ];
    _.forEach(columnDefs, (o) => {
      o.displayName = this.$translate.instant('hcs.taas.resultView.' + o.displayName);
    });

    this.gridOptions = {
      //gridOptions.data is populated directly by the functions supplying the data.
      appScopeProvider: this,
      rowHeight: 56,
      onRegisterApi: function (gridApi) {
        this.gridApi = gridApi;
      },
      multiFields: {
      },
      columnDefs: this.gridColumns,
    };

    this.gridColumns = columnDefs;
    this.gridOptions.columnDefs = columnDefs;
    this.gridOptions.data = this.resultsListData;
  }


  public handleFailures(): void {
    this.showReloadPageIfNeeded();
  }

  public showReloadPageIfNeeded(): void {
    if (this.pageState === State.Loading) {
      this.pageState = State.Reload;
    }
  }

  public reload(): void {
    this.$state.go(this.$state.current, {}, {
      reload: true,
    });
  }
}
