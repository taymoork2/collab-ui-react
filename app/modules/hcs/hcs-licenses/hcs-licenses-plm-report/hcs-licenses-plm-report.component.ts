//TODO: shravash: implement export csv function.
//import { Promise } from 'q';
import { HcsLicenseService, IHcsPlmLicense, IHcsPlmLicenseInfo } from 'modules/hcs/hcs-shared';

type ITab = {
  title: string;
  state: string;
};

export interface IPlmGrid {
  id: string;
  plmName: string;
  basicLicense?: object | undefined;
  essentialLicense?: object | undefined;
  foundationLicense?: object | undefined;
  standardLicense?: object | undefined;
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
  private plmResponseData: IHcsPlmLicense[];
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
  public back: boolean = true;
  public backState: string = 'partner-services-overview';

  /* @ngInject */
  constructor(
    private $timeout: ng.ITimeoutService,
    private $translate: ng.translate.ITranslateService,
    private HcsLicenseService: HcsLicenseService,
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

    this.plmData = [];
    this.HcsLicenseService.listPlmLicenseReports()
      .then((resp) => {
        this.plmResponseData = resp;
        this.initPlmLicenseReport();
      });

    this.initUIGrid();
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
        cellTemplate: require('./templates/basic.tpl.html'),
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
        cellTemplate: require('./templates/essential.tpl.html'),
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
        cellTemplate: require('./templates/foundation.tpl.html'),
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
        cellTemplate: require('./templates/standard.tpl.html'),
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

  public initPlmLicenseReport() {
    _.forEach(this.plmResponseData, (plm) => {
      const licenses = _.get<IHcsPlmLicenseInfo[]>(plm, 'licenses');
      const licenseCust: IPlmGrid = {
        plmName: _.get(plm, 'plmName'),
        id:  _.get(plm, 'plmId'),
        standardLicense: _.find(licenses, { licenseType: 'HUCM_Standard' }),
        foundationLicense: _.find(licenses, { licenseType: 'HUCM_Foundation' }),
        basicLicense: _.find(licenses, { licenseType: 'HUCM_Basic' }),
        essentialLicense: _.find(licenses, { licenseType: 'HUCM_Essential' }),
        plmStatus: _.isUndefined(plm.violationsCount > 0) ? 'Compliant' : 'Non-Compliant',
      };
      this.plmData.push(licenseCust);
    });
    this.showGrid = true;
    this.gridOptions.data = this.plmData;
    this.placeholder.count = this.plmData.length;
    this.filters[0].count = this.plmData.filter(plm => this.statusCompliant.toLowerCase() === plm.plmStatus.toLowerCase()).length;
    this.filters[1].count = this.placeholder.count - this.filters[0].count;
  }
}
