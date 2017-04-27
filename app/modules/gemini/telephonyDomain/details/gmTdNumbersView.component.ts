import { Notification } from 'modules/core/notifications';
import { IToolkitModalService } from 'modules/core/modal';
import { TelephonyDomainService } from '../telephonyDomain.service';

class GmTdNumbersViewCtrl implements ng.IComponentController {
  public currentTD;
  public gridData = [];
  public gridOptions = {};
  public domainName: string;
  public customerId: string;
  public ccaDomainId: string;
  public exportFileName: string;
  public loading: boolean = false;
  public countryId2NameMapping = {};
  public exportLoading: boolean = false;

  /* @ngInject */
  public constructor (
    private $state,
    private gemService,
    private Notification: Notification,
    private $window: ng.IWindowService,
    private $modal: IToolkitModalService,
    private $timeout: ng.ITimeoutService,
    private $translate: ng.translate.ITranslateService,
    private TelephonyDomainService: TelephonyDomainService,
  ) {
    this.currentTD = this.gemService.getStorage('currentTelephonyDomain');
    if (this.currentTD) {
      this.customerId = this.currentTD.customerId;
      this.ccaDomainId = this.currentTD.ccaDomainId;
      this.domainName = this.currentTD.domainName;
    }
    this.exportFileName = this.$translate.instant('gemini.tds.numbers.export.csvFilename');
  }

  public $onInit() {
    this.getCountries();
    this.setGridOptions();
    this.initData();
    this.$state.current.data.displayName = this.$translate.instant('gemini.tds.phoneNumbers');
  }

  private getCountries(): void {
    this.countryId2NameMapping = this.gemService.getStorage('countryId2NameMapping');
  }

  public onCancel(): void {
    this.$state.sidepanel.dismiss();
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

  public onDownloadTemplate() {
    this.$modal.open({
      type: 'dialog',
      templateUrl: 'modules/gemini/telephonyDomain/details/downloadConfirm.html',
    }).result.then(() => {
      this.$window.open(this.TelephonyDomainService.getDownloadUrl());
    });
  }

  private initData(): void {
    this.loading = true;

    this.TelephonyDomainService.getNumbers(this.customerId, this.ccaDomainId).then((res) => {
      this.loading = false;
      const resJson: any = _.get(res, 'content.data');
      if (resJson.returnCode) {
        this.Notification.notify(this.gemService.showError(resJson.returnCode));
        return;
      }

      const data = resJson.body;
      _.forEach(data, (item) => {
        this.makeNumberItemReadable(item);
      });
      this.gridData = data;
    });
  }

  private exportNumbersToCSV(customerId: string, ccaDomainId: string) {
    return this.TelephonyDomainService.getNumbers(customerId, ccaDomainId).then((response) => {
      let lines: any = _.get(response, 'content.data');
      let exportedLines: any[] = [];
      const headerLine = {
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
        this.makeNumberItemReadable(line);
        exportedLines = exportedLines.concat(this.formatNumbersData(line));
      });
      return exportedLines;
    });
  }

  private formatNumbersData(data: any) {
    let oneLine = {
      phoneNumber: this.formatAsCsvString(data.phone),
      phoneLabel: this.formatAsCsvString(data.label),
      accessNumber: this.formatAsCsvString(data.dnisNumber),
      tollType: this.formatAsCsvString(data.tollType),
      callType: this.formatAsCsvString(data.phoneType),
      country: this.formatAsCsvString(data.countryName),
      hiddenOnClient: this.formatAsCsvString(data.isHidden),
    };

    return oneLine;
  }

  private formatAsCsvString(data: any) {
    if (data === null) {
      data = '';
    }
    return '="' + data + '"';
  }

  private makeNumberItemReadable(item): void {
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

    item.countryName = this.countryId2NameMapping[item.countryId];
  }

  private setGridOptions(): void {
    const columnDefs = [{
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
      displayName: this.$translate.instant('gemini.tds.numbers.field.hiddenOnClient'),
    }];

    this.gridOptions = {
      rowHeight: 42,
      data: '$ctrl.gridData',
      columnDefs: columnDefs,
      enableColumnMenus: false,
      enableVerticalScrollbar: 0,
      virtualizationThreshold: 500,
    };
  }
}

export class GmTdNumbersViewComponent implements  ng.IComponentOptions {
  public controller = GmTdNumbersViewCtrl;
  public templateUrl = 'modules/gemini/telephonyDomain/details/gmTdNumbersView.tpl.html';
}
