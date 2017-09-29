import { Notification } from 'modules/core/notifications';
import { TelephonyDomainService } from '../telephonyDomain.service';

export interface IGridApiScope extends ng.IScope {
  gridApi?: uiGrid.IGridApi;
}

class GmImportTdCtrl implements ng.IComponentController {

  public gridData;
  public data: any = {};
  public gridOptions = {};
  public selectPlaceholder: string;
  public options: Object[] = [];
  public loadingNumbers: boolean = true;
  public loadingContent: boolean = true;
  public isShowNumbers: boolean = false;
  public isHiddenOptions: Object[];
  public selectedGridLinesLength: number = 0;
  public selected = { label: '', value: '' };

  private close;
  private currentTD: any;
  private countryId2NameMapping = {};
  private selectedGridLines: Object = {};

  /* @ngInject */
  public constructor(
    private gemService,
    private $scope: IGridApiScope,
    private Notification: Notification,
    private $translate: ng.translate.ITranslateService,
    private TelephonyDomainService: TelephonyDomainService,
  ) {
    this.gridData = [];
    this.isHiddenOptions = [
      { value: true, label: this.$translate.instant('gemini.hidden') },
      { value: false, label: this.$translate.instant('gemini.display') },
    ];
    this.currentTD = this.gemService.getStorage('currentTelephonyDomain');
    this.selectPlaceholder = this.$translate.instant('gemini.tds.selectTdPlaceholder');
  }

  public $onInit() {
    this.getTelephonyDomainByRegion();
  }

  public onSelectChange() {
    this.isShowNumbers = true;
    this.loadingNumbers = true;
    this.getCountries();
    this.setGridData();

    const data = this.gemService.getStorage('currentTelephonyDomain');
    data.importTDNumbers = [];
  }

  public onImport() {
    const data = this.gemService.getStorage('currentTelephonyDomain');
    data.importTDNumbers = _.values(this.selectedGridLines);

    this.gemService.setStorage('currentTelephonyDomain', data);
    this.close();
  }

  public getGridLinesNumber(): number {
    this.selectedGridLinesLength = _.values(this.selectedGridLines).length;
    return this.selectedGridLinesLength;
  }

  private getTelephonyDomainByRegion() {
    const data = {
      customerId: this.currentTD.customerId,
      regionId: this.currentTD.region,
      ccaDomainId: this.currentTD.ccaDomainId ? this.currentTD.ccaDomainId : '',
    };

    this.TelephonyDomainService.getRegionDomains(data)
      .then((res: any[]) => {
        this.loadingContent = !this.loadingContent;

        this.options = _.map(res, (item: any) => {
          return item.telephonyDomainId && { value: item.ccaDomainId, label: item.domainName };
        });
      })
      .catch((res) => {
        this.Notification.errorResponse(res, 'gemini.errorCode.genericError');
      });
  }

  private setGridOption() {
    const columnDefs = [{
      cellTooltip: true,
      field: 'phone',
      displayName: this.$translate.instant('gemini.tds.numbers.field.phoneNumber'),
    }, {
      field: 'label',
      displayName: this.$translate.instant('gemini.tds.numbers.field.phoneLabel'),
    }, {
      cellTooltip: true,
      field: 'dnisNumberFormat',
      displayName: this.$translate.instant('gemini.tds.numbers.field.accessNumber'),
    }, {
      cellTooltip: true,
      field: 'tollType',
      displayName: this.$translate.instant('gemini.tds.numbers.field.tollType'),
    }, {
      cellTooltip: true,
      field: 'callType',
      displayName: this.$translate.instant('gemini.tds.numbers.field.callType'),
    }, {
      field: 'country',
      cellTooltip: true,
      displayName: this.$translate.instant('gemini.tds.numbers.field.country'),
    }, {
      field: '_isHidden',
      cellTooltip: true,
      displayName: this.$translate.instant('gemini.tds.numbers.field.hiddenOnClient'),
    }];

    this.gridOptions = {
      rowHeight: 44,
      multiSelect: true,
      enableSorting: false,
      enableSelectAll: true,
      headerCellClass: 'h6',
      data: '$ctrl.gridData',
      appScopeProvider: this,
      columnDefs: columnDefs,
      enableRowSelection: true,
      enableColumnMenus: false,
      enableVerticalScrollbar: false,
      enableHorizontalScrollbar: false,
      onRegisterApi: (gridApi) => {
        const api = gridApi;
        api.selection.on.rowSelectionChanged(this.$scope, (row) => { this.addOrDelRow(row); });

        api.selection.on.rowSelectionChangedBatch(this.$scope, (rows) => {
          _.forEach(rows, (row) => { this.addOrDelRow(row); });
        });
      },
    };
  }

  private addOrDelRow(row) {
    if (!row.isSelected) {
      delete this.selectedGridLines[row.entity.dnisId];
      return;
    }
    row.entity.isHidden = _.isEqual(row.entity._isHidden, 'Hidden');
    this.selectedGridLines[row.entity.dnisId] = row.entity;
  }

  private setGridData() {
    const ccaDomainId = this.selected.value;
    const DATA_STATUS = this.gemService.getNumberStatus();
    this.TelephonyDomainService.getNumbers(this.currentTD.customerId, ccaDomainId)
      .then((res: any[]) => {
        this.loadingNumbers = false;
        const newData = _.filter(res, (item: any) => { return _.toNumber(item.compareToSuperadminPhoneNumberStatus) === DATA_STATUS.NO_CHANGE; });
        this.gridData = _.map(newData, (item: any) => {
          return _.assignIn({}, item, {
            country: this.countryId2NameMapping[item.countryId],
            callType: item.phoneType,
            _isHidden: item.isHidden ? 'Hidden' : 'Display',
          });
        });

        if (res.length - newData.length > 0) {
          this.Notification.warning('gemini.tds.numbers.import.resultMsg.importTD', { number: res.length - newData.length }, 'gemini.tds.numbers.import.resultTitle.importComplete');
        }
        this.setGridOption();
      });
  }

  private getCountries() {
    const gmCountry = this.gemService.getStorage('gmCountry');
    if (gmCountry) {
      this.countryId2NameMapping = gmCountry.countryId2NameMapping;
    }
  }
}
export class GmImportTdComponent implements ng.IComponentOptions {
  public controller = GmImportTdCtrl;
  public bindings = { dismiss: '&', close: '&' };
  public template = require('modules/gemini/telephonyDomain/details/gmImportTd.html');
}
