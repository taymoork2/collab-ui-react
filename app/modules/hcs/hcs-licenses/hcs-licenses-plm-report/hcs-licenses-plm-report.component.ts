//import { Promise } from 'q';

type ITab = {
  title: string;
  state: string;
};

export interface IPlmGrid {
  id: string;
  plmName: string;
  basicLicense?: string | undefined;
  essentialLicense?: string | undefined;
  foundationLicense?: string | undefined;
  standardLicense?: string | undefined;
  plmStatus: string;
}

export class HcsLicensesPlmReportComponent implements ng.IComponentOptions {
  public controller = HcsLicensesPlmReportCtrl;
  public template = require('./hcs-licenses-plm-report.component.html');
}

export class HcsLicensesPlmReportCtrl implements ng.IComponentController {

  public gridOptions;
  public gridColumns;
  public customerId: string;
  private plmData: IPlmGrid[];
  public showGrid: boolean = false;
  public tabs: ITab[];
  public title: string;
  public placeholder;
  public filters;
  public activeFilter: string = 'all';
  public timeoutVal: number = 1000;
  public timer: any = undefined;
  public searchStr: string = '';
  public statusCompliant: string;
  public statusNoncompliant: string;

  /* @ngInject */
  constructor(
    private $timeout: ng.ITimeoutService,
    private $translate: ng.translate.ITranslateService,
    //private $rootScope: ng.IRootScopeService,
  ) {}

  public $onInit() {
    this.title = this.$translate.instant('hcs.license.title');
    this.statusCompliant = this.$translate.instant('hcs.license.compliant');
    this.statusNoncompliant = this.$translate.instant('hcs.license.nonCompliant');

    this.tabs = [{
      title: this.$translate.instant('hcs.license.plmReport.title'),
      state: 'hcs.plmReport',
    }, {
      title: this.$translate.instant('hcs.license.customerReport'),
      state: 'hcs.subscription',
    }];

    this.placeholder = {
      name: this.$translate.instant('hcs.license.all'),
      filterValue: 'all',
      count: 0,
    };

    this.filters = [{
      name: this.statusCompliant,
      filterValue: 'Compliant',
      count: 0,
    }, {
      name: this.statusNoncompliant,
      filterValue: 'Non-compliant',
      count: 0,
    }];
    //demo temp grid data
    this.plmData = [
      {
        id: '4f73f623-0197-4217-9069-50423a0cfef3',
        plmName: 'PLM-WEST',
        basicLicense: '2250/5000',
        essentialLicense: '1800/2000',
        foundationLicense: '1800/2000',
        standardLicense: '1800/3000',
        plmStatus: 'Compliant',
      },
      {
        id: '4f73f623-0197-4217-9069-50423a0cfef5',
        plmName: 'PLM-SOUTH',
        basicLicense: '1070/1000',
        essentialLicense: '1550/3000',
        foundationLicense: '1550/2000',
        standardLicense: '1550/3000',
        plmStatus: 'Compliant',
      },
      {
        id: '4f73f623-0197-4217-9069-50423a0cfer4',
        plmName: 'PLM-EAST',
        basicLicense: '1000/500',
        essentialLicense: '3800/3000',
        foundationLicense: '400/0',
        standardLicense: '380/400',
        plmStatus: 'Non-compliant',
      },
      {
        id: '4f73f623-0197-4217-9069-50423a0cfem5',
        plmName: 'PLM-NORTH',
        basicLicense: '0/500',
        essentialLicense: '19800/20000',
        foundationLicense: '19800/3330',
        standardLicense: '19800/4000',
        plmStatus: 'Compliant',
      },
      {
        id: '4f73f623-0197-4217-9069-50423a0cfeo7',
        plmName: 'PLM-EUROPE',
        basicLicense: '440/200',
        essentialLicense: '10000/20000',
        foundationLicense: '10000/20000',
        standardLicense: '1000/2000',
        plmStatus: 'Compliant',
      },
    ];
    this.initUIGrid();
    // Below lines Must come in the then fxn after data is retrieved.
    this.gridOptions.data = this.plmData;
    this.placeholder.count = this.plmData.length;
    this.filters[0].count = this.plmData.filter(plm => this.statusCompliant.toLowerCase() === plm.plmStatus.toLowerCase()).length;
    this.filters[1].count = this.placeholder.count - this.filters[0].count;
  }

  public initUIGrid() {
    // ColumnDefs for the customer list grid
    const columnDefs = [
      {
        field: 'plmName',
        displayName: this.$translate.instant('hcs.license.plmReport.plmName'),
        sort: {
          direction: 'desc',
          priority: 0,
        },
        sortCellFiltered: true,
        width: '16.6%',
        cellClass: 'plmNameColumn',
        headerCellClass: 'plmName',
      }, {
        field: 'basicLicense',
        displayName: this.$translate.instant('hcs.license.plmReport.basicLicense'),
        sort: {
          direction: 'desc',
          priority: 0,
        },
        sortCellFiltered: true,
        width: '16.6%',
        cellClass: 'basicLicenseColumn',
        headerCellClass: 'basicLicense',
      }, {
        field: 'essentialLicense',
        displayName: this.$translate.instant('hcs.license.plmReport.essentialLicense'),
        sort: {
          direction: 'desc',
          priority: 0,
        },
        sortCellFiltered: true,
        width: '16.6%',
        cellClass: 'essentialLicenseColumn',
        headerCellClass: 'essentialLicense',
      }, {
        field: 'foundationLicense',
        displayName: this.$translate.instant('hcs.license.plmReport.foundationLicense'),
        sort: {
          direction: 'desc',
          priority: 0,
        },
        sortCellFiltered: true,
        width: '16.6%',
        cellClass: 'foundationLicenseColumn',
        headerCellClass: 'foundationLicense',
      }, {
        field: 'standardLicense',
        displayName: this.$translate.instant('hcs.license.plmReport.standardLicense'),
        sort: {
          direction: 'desc',
          priority: 0,
        },
        sortCellFiltered: true,
        width: '16.6%',
        cellClass: 'standardLicenseColumn',
        headerCellClass: 'standardLicense',
      }, {
        field: 'plmStatus',
        displayName: this.$translate.instant('hcs.license.status'),
        cellTemplate: require('./templates/status.tpl.html'),
        sort: {
          direction: 'desc',
          priority: 0,
        },
        sortCellFiltered: true,
        cellClass: 'plmStatusColumn',
        headerCellClass: 'plmStatus',
      },
    ];

    this.gridOptions = {
      //gridOptions.data is populated directly by the functions supplying the data.
      appScopeProvider: this,
      rowHeight: 44,
      onRegisterApi: function (gridApi) {
        this.gridApi = gridApi;
      },
      columnDefs: this.gridColumns,
    };

    this.gridColumns = columnDefs;
    this.gridOptions.columnDefs = columnDefs;
  }

  public setFilter(filter: string): void {
    if (this.activeFilter !== filter) {
      this.activeFilter = filter;
      //Filter plms
      if (this.activeFilter === 'all') {
        this.gridOptions.data = this.plmData;
      } else {
        this.gridOptions.data = this.plmData.filter(plm => this.activeFilter.toLowerCase() === plm.plmStatus.toLowerCase());
      }
    }
  }

  public filterList(str: string): void {
    if (this.timer) {
      this.$timeout.cancel(this.timer);
      this.timer = 0;
    }
    this.timer = this.$timeout(() => {
      if (str.length > 2 || str === '') {
        this.gridOptions.data = this.plmData.filter(plm => _.includes(plm.plmName.toLowerCase(), str.toLowerCase()));
      }
    }, this.timeoutVal);
  }

  // private exportCsvPromise = Promise((resolve) => {
  //   this.$rootScope.$broadcast('EXPORTING');

  //   const exportedPlms = _.map(this.plmData, plm => {
  //     const exportedPlm: IPlmGrid = {
  //       id: plm.id,
  //       plmName: plm.plmName,
  //       basicLicense: plm.basicLicense,
  //       essentialLicense: plm.essentialLicense,
  //       standardLicense: plm.standardLicense,
  //       foundationLicense: plm.foundationLicense,
  //       plmStatus: plm.plmStatus,
  //     };
  //     // future nodification of data
  //     return exportedPlm;
  //   });

  //   // header line for CSV file
  //   const header: IPlmGrid = {
  //     id:  this.$translate.instant('hcs.license.plmReport.plmId'),
  //     plmName: this.$translate.instant('hcs.license.plmReport.plmName'),
  //     basicLicense: this.$translate.instant('hcs.license.plmReport.basicLicense'),
  //     essentialLicense: this.$translate.instant('hcs.license.plmReport.essentialLicense'),
  //     standardLicense: this.$translate.instant('hcs.license.plmReport.standardLicense'),
  //     foundationLicense: this.$translate.instant('hcs.license.plmReport.foundationLicense'),
  //     plmStatus: this.$translate.instant('hcs.license.status'),
  //   };
  //   exportedPlms.unshift(header);
  //   resolve(exportedPlms);
  // });

  public exportCsv() {
    // To-Do
    // return this.exportCsvPromise.then(res => {
    //   return res;
    // });
  }
}
