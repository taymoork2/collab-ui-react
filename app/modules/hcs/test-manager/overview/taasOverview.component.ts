export class TaasOverviewCtrl implements ng.IComponentController {
  private filterPlaceholder: string;
  public gridOptions;
  public gridColumns;
  private timer;
  private timeoutVal: number;
  /* @ngInject */
  constructor (
    private $translate: ng.translate.ITranslateService,
    private $timeout: ng.ITimeoutService,
    private $state: ng.ui.IStateService,
  ) {
    this.timer = 0;
    this.timeoutVal = 1000;
  }

  public $onInit() {
    this.filterPlaceholder = 'Select Cluster';
    this.initUIGrid();
  }

  public initUIGrid() {
    // ColumnDefs for the customer list grid
    const columnDefs = [
      {
        field: 'customerName',
        displayName: 'customerNameHeader',
        width: '30%',
        cellClass: 'ui-grid-add-column-border',
        sort: {
          direction: 'asc',
        },
      }, {
        field: 'testDate',
        displayName: 'testDate',
        width: '30%',
        headerCellClass: 'align-center',
      }, {
        field: 'testResult',
        displayName: 'testResult',
        width: '15%',
        headerCellClass: 'align-center',
        cellTemplate: require('./templates/testStateColumn.tpl.html'),
      }, {
        field: 'totalResources',
        displayName: 'totalResources',
        width: '15%',
        headerCellClass: 'align-center',
      }, {
        field: 'action',
        displayName: 'actionHeader',
        width: '10%',
        cellTemplate: require('./templates/actions.tpl.html'),
        enableSorting: false,
      },
    ];
    // post-processing of columnDefs array
    _.forEach(columnDefs, (o) => {
      o.displayName = this.$translate.instant('hcs.taas.overviewPage.' + o.displayName);
    });

    // temp grid data

    const tempGridData = [
      {
        customerName: 'Umbrella Corporation',
        testDate: 'Fri Nov 11, 2017 06:31am',
        testState: 'failed',
        totalResources: 147,
        id: '4f73f623-0197-4217-9069-50423a0cfeaa',
      },
      {
        customerName: 'Death Star Corp',
        testDate: 'Fri Nov 11, 2017 02:12am',
        testState: 'passed',
        totalResources: 21,
        id: '4f73f623-0197-4217-9069-50423a0cfeab',
      },
      {
        customerName: 'Wonka Factory',
        testDate: 'Now',
        testState: 'running',
        totalResources: 965,
        id: '4f73f623-0197-4217-9069-50423a0cfeac',
      },
    ];

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
    this.gridOptions.data = tempGridData;
  }

  // Action Options
  public editTaasSuite(customer) {
    this.$state.go('taas.suite', { customerId: customer.id });
  }

  public editTaasTest(customer) {
    this.$state.go('taasTest', { customerId: customer.id });
  }

  public deleteTaasSuite() {
    alert('All Suites have been deleted');
  }

   // On click, filter user list and set active filter
  public filterList(str) {
    if (this.timer) {
      this.$timeout.cancel(this.timer);
      this.timer = 0;
    }

    this.timer = this.$timeout(() => {
      //CI requires search strings to be at least three characters
      if (str.length >= 3 || str === '') {
        // write search function
      }
    }, this.timeoutVal);
  }
}

export class TaasOverviewComponent implements ng.IComponentOptions {
  public controller = TaasOverviewCtrl;
  public template = require('./taasOverview.component.html');
}
