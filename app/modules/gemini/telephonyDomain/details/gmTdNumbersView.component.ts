import { Notification } from 'modules/core/notifications';
import { TelephonyDomainService } from '../telephonyDomain.service';

const GRID_HEIGHT: number = 8 * 44 + 68;

class GmTdNumbersViewCtrl implements ng.IComponentController {
  public gridData = [];
  public gridOptions = {};
  public gridHeight: number;
  public customerId: string;
  public domainName: string;
  public ccaDomainId: string;
  public exportFileName: string;
  public loading: boolean = false;
  public exportLoading: boolean = false;

  private windowResizeInterval;
  private countries: Object = {};

  /* @ngInject */
  public constructor (
    private gemService,
    private PreviousState,
    private Notification: Notification,
    private $state: ng.ui.IStateService,
    private $timeout: ng.ITimeoutService,
    private $interval: ng.IIntervalService,
    private $translate: ng.translate.ITranslateService,
    private TelephonyDomainService: TelephonyDomainService,
  ) {
    this.gridHeight = GRID_HEIGHT;
    let currentTD = this.gemService.getStorage('currentTelephonyDomain');
    if (currentTD) {
      this.domainName = currentTD.domainName;
      this.customerId = currentTD.customerId;
      this.ccaDomainId = currentTD.ccaDomainId;
    }
    this.exportFileName = this.$translate.instant('gemini.tds.numbers.export.csvFilename');
  }

  public $onInit() {
    this.getCountries();
    this.setGridOptions();
    this.$state.current.data.displayName = this.$translate.instant('gemini.tds.phoneNumbers');
  }

  public $onDestroy() {
    this.$interval.cancel(this.windowResizeInterval);
  }

  public onCancel(): void {
    this.PreviousState.go();
  }

  public exportToCSV() {
    this.exportLoading = true;
    return this.exportNumbersToCSV(this.customerId, this.ccaDomainId).then((res) => {
      this.Notification.success('gemini.tds.numbers.export.result.success');
      return res;
    }).catch((res) => {
      this.Notification.errorResponse(res, 'gemini.tds.numbers.export.result.failed');
    }).finally(() => {
      this.$timeout(() => {
        this.exportLoading = false;
      }, 1500);
    });
  }


  private getCountries() {
    this.gemService.getCountries()
      .then((res) => {
        let countries = _.get(res, 'content.data');
        _.forEach(countries, (item) => {
          this.countries[item.countryId] = item;
        });
        this.setGridData();
      });
  }

  private setGridData(): void {
    this.loading = true;

    this.TelephonyDomainService.getNumbers(this.customerId, this.ccaDomainId).then((res) => {
      this.loading = false;
      let resJson: any = _.get(res, 'content.data');
      if (resJson.returnCode) {
        this.Notification.notify(this.gemService.showError(resJson.returnCode));
        return;
      }

      let data = resJson.body;
      _.forEach(data, (item) => {
        this.formatGridData(item);
      });
      this.gridData = data;

      this.gridHeight = this.gridData.length <= 8 ? this.gridHeight = this.gridData.length * 44 + 68 : this.gridHeight;
    });
  }

  private exportNumbersToCSV(customerId: string, ccaDomainId: string) {
    return this.TelephonyDomainService.getNumbers(customerId, ccaDomainId).then((response) => {
      let lines: any = _.get(response, 'content.data');
      let exportedLines: any[] = [];
      let headerLine = {
        phoneNumber: this.$translate.instant('gemini.tds.numbers.field.phoneNumber').toUpperCase(),
        phoneLabel: this.$translate.instant('gemini.tds.numbers.field.phoneLabel').toUpperCase(),
        accessNumber: this.$translate.instant('gemini.tds.numbers.field.accessNumber').toUpperCase(),
        tollType: this.$translate.instant('gemini.tds.numbers.field.tollType').toUpperCase(),
        callType: this.$translate.instant('gemini.tds.numbers.field.callType').toUpperCase(),
        country: this.$translate.instant('gemini.tds.numbers.field.country').toUpperCase(),
        hiddenOnClient: this.$translate.instant('gemini.tds.numbers.field.hiddenOnClient').toUpperCase(),
      };
      exportedLines.push(headerLine);

      if (!lines.body.length) {
        return exportedLines;
      }
      _.forEach(lines.body, (line) => {
        this.formatGridData(line);
        exportedLines = exportedLines.concat(this.formatNumbersData(line));
      });
      return exportedLines;
    });
  }

  private formatNumbersData(data: any) {
    let oneLine = {
      phoneNumber: this.TelephonyDomainService.transformCSVNumber(data.phone),
      phoneLabel: this.TelephonyDomainService.transformCSVNumber(data.label),
      accessNumber: this.TelephonyDomainService.transformCSVNumber(data.dnisNumber),
      tollType: this.TelephonyDomainService.transformCSVNumber(data.tollType),
      callType: this.TelephonyDomainService.transformCSVNumber(data.phoneType),
      country: this.TelephonyDomainService.transformCSVNumber(data.countryName),
      hiddenOnClient: this.TelephonyDomainService.transformCSVNumber(data.isHidden),
    };

    return oneLine;
  }

  private formatGridData(item): void {
    if (item.defaultNumber === '1') {
      switch (item.tollType) {
        case 'CCA Toll':
          item.defaultNumber = this.$translate.instant('gemini.tds.defaultToll');
          break;

        case 'CCA Toll Free':
          item.defaultNumber = this.$translate.instant('gemini.tds.defaultTollFree');
          break;
      }
    }

    if (item.defaultNumber === '0') {
      item.defaultNumber = this.$translate.instant('gemini.tds.numbers.field.values.noForDefaultNumber');
    }

    item.globalListDisplay = item.globalListDisplay === '1'
      ? this.$translate.instant('gemini.tds.numbers.field.values.displayForGlobalDisplay')
      : this.$translate.instant('gemini.tds.numbers.field.values.noForGlobalDisplay');

    item.isHidden = item.isHidden === 'true'
      ? this.$translate.instant('gemini.tds.numbers.field.values.hiddenForHiddenOnClient')
      : this.$translate.instant('gemini.tds.numbers.field.values.displayForHiddenOnClient');

    item.countryName = this.countries[item.countryId].countryName;
  }

  private setGridOptions(): void {
    let columnDefs = [{
      width: '13%',
      sortable: true,
      cellTooltip: true,
      field: 'phone',
      sort: { direction: 'asc', priority: 0 },
      displayName: this.$translate.instant('gemini.tds.numbers.field.phoneNumber'),
    }, {
      width: '11%',
      sortable: true,
      field: 'label',
      displayName: this.$translate.instant('gemini.tds.numbers.field.phoneLabel'),
    }, {
      width: '12%',
      cellTooltip: true,
      field: 'dnisNumber',
      displayName: this.$translate.instant('gemini.tds.numbers.field.accessNumber'),
    }, {
      width: '10%',
      cellTooltip: true,
      field: 'tollType',
      displayName: this.$translate.instant('gemini.tds.numbers.field.tollType'),
    }, {
      width: '10%',
      field: 'phoneType',
      displayName: this.$translate.instant('gemini.tds.numbers.field.callType'),
    }, {
      width: '11%',
      field: 'defaultNumber',
      cellTooltip: true,
      displayName: this.$translate.instant('gemini.tds.numbers.field.defaultNumber'),
    }, {
      width: '10%',
      field: 'globalListDisplay',
      cellTooltip: true,
      displayName: this.$translate.instant('gemini.tds.numbers.field.globalDisplay'),
    }, {
      width: '10%',
      field: 'countryName',
      cellTooltip: true,
      displayName: this.$translate.instant('gemini.tds.numbers.field.country'),
    }, {
      field: 'isHidden',
      cellTooltip: true,
      cellClass: 'text-center',
      displayName: this.$translate.instant('gemini.tds.numbers.field.hiddenOnClient'),
    }];

    this.gridOptions = {
      rowHeight: 44,
      data: '$ctrl.gridData',
      multiSelect: false,
      columnDefs: columnDefs,
      enableColumnMenus: false,
      enableColumnResizing: true,
      enableRowHeaderSelection: false,
      onRegisterApi: (gridApi) => {
        let api = gridApi;
        this.windowResizeInterval = this.$interval(() => api.core.handleWindowResize(), 10, 500);
      },
    };
  }
}

export class GmTdNumbersViewComponent implements  ng.IComponentOptions {
  public controller = GmTdNumbersViewCtrl;
  public templateUrl = 'modules/gemini/telephonyDomain/details/gmTdNumbersView.tpl.html';
}
