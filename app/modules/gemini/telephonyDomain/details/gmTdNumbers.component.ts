import { IToolkitModalService } from 'modules/core/modal';
import { Notification } from 'modules/core/notifications';
import { TelephonyDomainService } from '../telephonyDomain.service';

export interface IGridApiScope extends ng.IScope {
  gridApi?: uiGrid.IGridApi;
}

const DATA_TYPE: any = { MANUAL_ADD : 0, IMPORT_TD : 1, IMPORT_CSV : 2, SUBMITTED : 3 };
const DNIS_TYPE: any = { NEW: 0, EXISTED: 1, NON_CCA: 2 };
const DNIS_CHANGE_TYPE: any = { INPUT_DNIS: 0, CHANGE_TOLLTYPE: 1, CHANGE_CALLTYPE: 2 };
const MAX_PHONE_LENGTH: number = 11 * 1024;
const MAX_PHONE_NUMBERS: number = 300;
const CELL_TEMPLATE_URL: string = 'modules/gemini/telephonyDomain/details/cellTemplate/';

class GmTdNumbersCtrl implements ng.IComponentController {

  public isEdit: boolean = false;
  public loading: boolean = false;
  public submitLoading: boolean = false;
  public exportLoading: boolean = false;
  public downloadUrl: string;
  public customerId: string;
  public ccaDomainId: string;
  public domainName: string;
  public telephonyDomainId: string;
  private curDefTollRow: any;
  private curDefTollFreeRow: any;
  private gridData: any = [];
  private gridOptions: any = {};
  private currentTD: any = {};
  private countryId2NameMapping: any = {};
  private countryName2IdMapping: any = {};
  private accessNumber2EntityMapping: any = {};
  private accessNumber2RowsMapping: any = {};
  private phoneEntity2RowsMapping: any = {};
  private dnisNumber2AttrsMapping: any = {};
  private defaultNumber2RowsMapping: any = {};
  private globalDisplay2RowsMapping: any = {};
  private phoneNumber2RowsMapping: any = {};
  private dnisId2SubmittedNumberMapping: any = {};
  private dnisId2ImportedNumberMapping: any = {};
  private deleteTelephonyNumberData: any = [];
  private submitTelephonyAllData: any = [];
  private phoneAndLabelLength: number = 0;
  private tollTypeOptions: any = [];
  private callTypeOptions: any = [];
  private defaultNumberOptions: any = [];
  private globalDisplayOptions: any = [];
  private countryOptions: any = [];
  private _countryOptions: any = [];
  private isHiddenOptions: any = [];
  private phoneNumberPattern = /^[\+\-\d+\(\)\.\s]*$/;
  private accessNumberPattern = /^\+{0,1}\d{7,30}$/;
  private initSubmittedRowsInterval: any;
  private constObject: any = {};

  /* @ngInject */
  public constructor(
    private $state,
    private $scope,
    private gemService,
    private PreviousState,
    private uiGridConstants,
    private $window: ng.IWindowService,
    private $modal: IToolkitModalService,
    private Notification: Notification,
    private $timeout: ng.ITimeoutService,
    private $interval: ng.IIntervalService,
    private $element: ng.IRootElementService,
    private $templateCache: ng.ITemplateCacheService,
    private $translate: ng.translate.ITranslateService,
    private TelephonyDomainService: TelephonyDomainService,
  ) {
    this.currentTD = this.gemService.getStorage('currentTelephonyDomain');
    if (this.currentTD) {
      this.customerId = this.currentTD.customerId || '';
      this.ccaDomainId = this.currentTD.ccaDomainId || '';
      this.domainName = this.currentTD.domainName || '';
      this.telephonyDomainId = this.currentTD.telephonyDomainId || '';
      this.isEdit = this.currentTD.isEdit || false;
    }
  }

  public $onInit(): void {
    this.initConstObject();
    this.initDropdownOptions();
    this.listenRegionUpdated();

    this.initCountries();
    this.setGridOptions();
    this.$scope.$emit('detailWatch', { isEdit: this.isEdit });
    this.$state.current.data.displayName = this.$translate.instant('gemini.tds.phoneNumbers');
  }

  public $onDestroy(): void {
    if (this.initSubmittedRowsInterval) {
      this.$interval.cancel(this.initSubmittedRowsInterval);
    }
  }

  private initConstObject() {
    this.constObject.SELECT_TYPE = this.$translate.instant('gemini.tds.numbers.field.labels.selectType');
    this.constObject.SELECT_COUNTRY = this.$translate.instant('gemini.tds.numbers.field.labels.selectCountry');
    this.constObject.CCA_TOLL = this.$translate.instant('gemini.tds.numbers.field.labels.ccaToll');
    this.constObject.CCA_TOLL_FREE = this.$translate.instant('gemini.tds.numbers.field.labels.ccaTollFree');
    this.constObject.INTERNATIONAL = this.$translate.instant('gemini.tds.numbers.field.labels.international');
    this.constObject.DOMESTIC = this.$translate.instant('gemini.tds.numbers.field.labels.domestic');
    this.constObject.DEFAULT_TOLL = this.$translate.instant('gemini.tds.defaultToll');
    this.constObject.DEFAULT_TOLL_FREE = this.$translate.instant('gemini.tds.defaultTollFree');
    this.constObject.DISPLAY = this.$translate.instant('gemini.tds.numbers.field.labels.display');
    this.constObject.HIDDEN = this.$translate.instant('gemini.tds.numbers.field.labels.hidden');
    this.constObject.NO = this.$translate.instant('gemini.tds.numbers.field.labels.no');

    this.constObject.DATA_STATUS = this.gemService.getNumberStatus();
  }

  private initDropdownOptions(): void  {
    const SELECT_TYPE = this.constObject.SELECT_TYPE;
    const SELECT_COUNTRY = this.constObject.SELECT_COUNTRY;
    const CCA_TOLL = this.constObject.CCA_TOLL;
    const CCA_TOLL_FREE = this.constObject.CCA_TOLL_FREE;
    const INTERNATIONAL = this.constObject.INTERNATIONAL;
    const DOMESTIC = this.constObject.DOMESTIC;
    const DISPLAY = this.constObject.DISPLAY;
    const HIDDEN = this.constObject.HIDDEN;
    const NO = this.constObject.NO;

    this.tollTypeOptions = [{ label: SELECT_TYPE, value: '' }, { label: CCA_TOLL, value: CCA_TOLL }, { label: CCA_TOLL_FREE, value: CCA_TOLL_FREE }];
    this.callTypeOptions = [{ label: SELECT_TYPE, value: '' }, { label: INTERNATIONAL, value: INTERNATIONAL }, { label: DOMESTIC, value: DOMESTIC }];
    this.defaultNumberOptions = [{ label: '', value: '0' }];
    this.globalDisplayOptions = [{ label: DISPLAY, value: '1' }, { label: NO, value: '0' }];
    this._countryOptions = [{ label: SELECT_COUNTRY, value: '' }];
    this.isHiddenOptions = [{ label: DISPLAY, value: 'false' }, { label: HIDDEN, value: 'true' }];
  }

  private initCountries(): void {
    this.countryOptions = this.gemService.getStorage('countryOptions');
    this.countryId2NameMapping = this.gemService.getStorage('countryId2NameMapping');
    this.countryName2IdMapping = this.gemService.getStorage('countryName2IdMapping');
  }

  private listenRegionUpdated(): void  {
    const deregister = this.$scope.$on('regionUpdated', () => {
      this.changeRegion();
    });
    this.$scope.$on('$destroy', deregister);
  }

  private initSubmittedNumber(): void {
    if (!this.ccaDomainId) {
      return;
    }

    this.loading = true;
    this.TelephonyDomainService.getNumbers(this.customerId, this.ccaDomainId).then((res) => {
      let resJson: any = _.get(res, 'content.data');
      if (resJson.returnCode) {
        this.Notification.notify(this.gemService.showError(resJson.returnCode));
        return;
      }

      let data = resJson.body;
      _.forEach(data, (item: any) => {
        if (_.toNumber(item.compareToSuperadminPhoneNumberStatus) === this.constObject.DATA_STATUS.DELETED) {
          return true;
        }

        item.dataType = DATA_TYPE.SUBMITTED;
        this.initDropdownList(item);
        this.addNumber(item);
      });

      if (this.isEdit) {
        this.initSubmittedRowsInterval = this.$interval(() => {
          this.initAccessNumber2RowsMapping();
        }, 10);
      }

      this.loading = false;
    });
  }

  private initAccessNumber2RowsMapping() {
    let allRows = this.$scope.gridApi.core.getVisibleRows(this.$scope.gridApi.grid);
    if (allRows.length === this.gridData.length && this.gridData.length > 0) {
      this.$interval.cancel(this.initSubmittedRowsInterval);

      _.forEach(allRows, (row) => {
        if (row.entity.dataType === DATA_TYPE.SUBMITTED) {
          this.dnisId2SubmittedNumberMapping[row.entity.dnisId] = _.cloneDeep(row.entity);
          this.curDefTollRow = row.entity.defaultNumber.label === this.constObject.DEFAULT_TOLL ? this.curDefTollRow = row : this.curDefTollRow;
          this.curDefTollFreeRow = row.entity.defaultNumber.label === this.constObject.DEFAULT_TOLL_FREE ? this.curDefTollFreeRow = row : this.curDefTollFreeRow;
        }

        if (!this.accessNumber2RowsMapping[row.entity.dnisNumber]) {
          this.accessNumber2RowsMapping[row.entity.dnisNumber] = [];
        }
        this.accessNumber2RowsMapping[row.entity.dnisNumber].push(row);
      });
    }
  }

  private setGridOptions(): void {
    let columnDefs: any = [{
      field: 'phone',
      type: 'number',
      cellTooltip: true,
      displayName: this.$translate.instant('gemini.tds.numbers.field.phoneNumber'),
      cellClass: this.isEdit ? 'cell-border-none' : '',
      cellTemplate: this.$templateCache.get(CELL_TEMPLATE_URL + 'phoneNumberCellTemplate.tpl.html'),
    }, {
      width: '11%',
      field: 'label',
      displayName: this.$translate.instant('gemini.tds.numbers.field.phoneLabel'),
      cellClass: this.isEdit ? 'cell-border-none' : '',
      cellTemplate: this.$templateCache.get(CELL_TEMPLATE_URL + 'phoneLabelCellTemplate.tpl.html'),
    }, {
      width: '12%',
      field: 'dnisNumberFormat',
      type: 'number',
      cellTooltip: true,
      displayName: this.$translate.instant('gemini.tds.numbers.field.accessNumber'),
      cellClass: this.isEdit ? 'cell-border-none' : '',
      cellTemplate: this.$templateCache.get(CELL_TEMPLATE_URL + 'accessNumberCellTemplate.tpl.html'),
    }, {
      width: '9%',
      field: 'tollType',
      sortingAlgorithm: this.sortDropdownList,
      cellTooltip: true,
      displayName: this.$translate.instant('gemini.tds.numbers.field.tollType'),
      cellClass: this.isEdit ? 'cell-border-none' : '',
      cellTemplate: this.$templateCache.get(CELL_TEMPLATE_URL + 'tollTypeCellTemplate.tpl.html'),
    }, {
      width: '8%',
      field: 'callType',
      sortingAlgorithm: this.sortDropdownList,
      cellTooltip: true,
      displayName: this.$translate.instant('gemini.tds.numbers.field.callType'),
      cellClass: this.isEdit ? 'cell-border-none' : '',
      cellTemplate: this.$templateCache.get(CELL_TEMPLATE_URL + 'callTypeCellTemplate.tpl.html'),
    }, {
      width: '12%',
      field: 'defaultNumber',
      sortingAlgorithm: this.sortDropdownList,
      cellTooltip: true,
      displayName: this.$translate.instant('gemini.tds.numbers.field.defaultNumber'),
      cellClass: this.isEdit ? 'cell-border-none' : '',
      cellTemplate: this.$templateCache.get(CELL_TEMPLATE_URL + 'defaultNumberCellTemplate.tpl.html'),
    }, {
      width: '11%',
      field: 'globalListDisplay',
      sortingAlgorithm: this.sortDropdownList,
      cellTooltip: true,
      displayName: this.$translate.instant('gemini.tds.numbers.field.globalDisplay'),
      cellClass: this.isEdit ? 'cell-border-none' : '',
      cellTemplate: this.$templateCache.get(CELL_TEMPLATE_URL + 'globalListDisplayCellTemplate.tpl.html'),
    }, {
      width: '9%',
      field: 'country',
      sortingAlgorithm: this.sortDropdownList,
      cellTooltip: true,
      displayName: this.$translate.instant('gemini.tds.numbers.field.country'),
      cellClass: this.isEdit ? 'cell-border-none' : '',
      cellTemplate: this.$templateCache.get(CELL_TEMPLATE_URL + 'countryCellTemplate.tpl.html'),
    }, {
      width: '13%',
      field: 'isHidden',
      sortingAlgorithm: this.sortDropdownList,
      cellTooltip: true,
      displayName: this.$translate.instant('gemini.tds.numbers.field.hiddenOnClient'),
      cellClass: this.isEdit ? 'cell-border-none' : '',
      cellTemplate: this.$templateCache.get(CELL_TEMPLATE_URL + 'isHiddenCellTemplate.tpl.html'),
    }];

    if (this.isEdit) {
      let actionColumn = {
        field: 'index',
        width: '5%',
        enableSorting: false,
        displayName: this.$translate.instant('gemini.tds.numbers.field.action'),
        cellClass: 'cell-border-none',
        cellTemplate: '<div class="ui-grid-cell-contents text-center"><button class="btn--none" ng-click="grid.appScope.deleteNumber(row)"><i class="icon icon-trash"></i></button></div>',
      };

      columnDefs.push(actionColumn);
    }

    this.gridOptions = {
      rowHeight: 42,
      data: '$ctrl.gridData',
      multiSelect: false,
      columnDefs: columnDefs,
      enableColumnMenus: false,
      enableColumnResizing: true,
      appScopeProvider: this,
      enableVerticalScrollbar: this.uiGridConstants.scrollbars.NEVER,
      enableHorizontalScrollbar: this.uiGridConstants.scrollbars.NEVER,
      virtualizationThreshold: 500,
      onRegisterApi: (gridApi) => {
        this.$scope.gridApi = gridApi;
        this.$timeout(() => {
          this.initSubmittedNumber();
        }, 500);
      },
    };
  }

  public sortDropdownList(a, b) {
    if (a.value === '' || b.value === '') {
      return (a.value === '' && b.value === '') ? 0 : (a.value === '' ? -1 : 1);
    }
    return a.label === b.label ? 0 : (a.label.length < b.label.length ? -1 : 1);
  }

  public validatePhone(row, oldVal) {
    let invalid, show = false;
    let message = '';

    let phone = _.trim(row.entity.phone);
    if (!phone.length) {
      invalid = show = true;
      message = this.getValidationMessage('fieldRequired', { field: 'Phone Number' });
    } else if (!this.phoneNumberPattern.test(phone)) {
      invalid = show = true;
      message = this.getValidationMessage('PhoneNumberInvalidFormat');
    } else if (!_.inRange(_.replace(phone, /[^0-9]/ig, '').length, 7, 33)) {
      invalid = show = true;
      message = this.getValidationMessage('PhoneNumberLengthRange');
    }

    row.entity.validation.phone.invalid = invalid;
    row.entity.validation.phone.message = message;
    row.entity.validation.phone.show = show;

    if (oldVal) {
      this.resetDuplicatedRowValidation(row, oldVal, row.entity.label, row.entity.dnisNumber);
    }

    return !invalid;
  }

  public validateLabel(row, oldVal) {
    let invalid, show = false;
    let message = '';

    let label = _.trim(row.entity.label);
    if (!label.length) {
      invalid = show = true;
      message = this.getValidationMessage('fieldRequired', { field: 'Phone Label' });
    } else if (_.gt(this.gemService.getByteLength(label), 85)) {
      invalid = show = true;
      message = this.getValidationMessage('PhoneLabelInvalidFormat');
    }

    row.entity.validation.label.invalid = invalid;
    row.entity.validation.label.message = message;
    row.entity.validation.label.show = show;

    if (oldVal) {
      this.resetDuplicatedRowValidation(row, row.entity.phone, oldVal, row.entity.dnisNumber);
    }

    return !invalid;
  }

  public validateAccessNumber(row, oldVal) {
    let invalid, show = false;
    let message = '';

    let accessNumber = _.trim(row.entity.dnisNumberFormat);
    if (!accessNumber.length) {
      invalid = show = true;
      message = this.getValidationMessage('fieldRequired', { field: 'Access Number' });
    } else if (!this.accessNumberPattern.test(accessNumber)) {
      invalid = show = true;
      message = this.getValidationMessage('AccessNumberInvalidFormat');
    }

    row.entity.validation.dnisNumberFormat.invalid = invalid;
    row.entity.validation.dnisNumberFormat.message = message;
    row.entity.validation.dnisNumberFormat.show = show;

    if (oldVal) {
      this.resetDuplicatedRowValidation(row, row.entity.phone, row.entity.label, oldVal);
    }

    return !invalid;
  }

  private resetDuplicatedRowValidation (row, phone, label, dnisNumber) {
    if (row.entity.duplicatedRowValidation.invalid) {
      row.entity.duplicatedRowValidation.invalid = false;

      let rows = this.phoneEntity2RowsMapping[phone + '_' + label + '_' + dnisNumber];
      _.forEach(rows, (r, k) => {
        if (r.uid === row.uid) {
          rows.splice(k, 1);
          return false;
        }
      });

      if (rows.length === 1) {
        rows[0].entity.duplicatedRowValidation.invalid = false;
      }
    }
  }

  private validateTollType(row) {
    let invalid, show = false;
    let message = '';

    if (!row.entity.tollType.value.length) {
      invalid = show = true;
      message = this.getValidationMessage('fieldRequired', { field: 'Toll Type' });
    }

    row.entity.validation.tollType.invalid = invalid;
    row.entity.validation.tollType.message = message;
    row.entity.validation.tollType.show = show;

    return !invalid;
  }

  private validateCallType(row) {
    let invalid, show = false;
    let message = '';

    if (!row.entity.callType.value.length) {
      invalid = show = true;
      message = this.getValidationMessage('fieldRequired', { field: 'Call Type' });
    }

    row.entity.validation.callType.invalid = invalid;
    row.entity.validation.callType.message = message;
    row.entity.validation.callType.show = show;

    return !invalid;
  }

  public validateCountry(row) {
    let invalid, show = false;
    let message = '';

    if (!_.isNumber(row.entity.country.value)) {
      invalid = show = true;
      message = this.getValidationMessage('fieldRequired', { field: 'Country' });
    }

    row.entity.isEdit = invalid;
    row.entity.validation.country.invalid = invalid;
    row.entity.validation.country.message = message;
    row.entity.validation.country.show = show;

    return !invalid;
  }

  public resetPhnNumDisplayValidation(row) {
    let phone = row.entity.phone;
    let rows = this.phoneNumber2RowsMapping[phone];
    _.forEach(rows, (row) => {
      row.entity.phnNumDisplayValidation = { invalid: false, message: '', show: false };
    });
  }

  public changeAccessNumber(row) {
    let preValue = row.entity.dnisNumber;

    let accessNumber = _.trim(_.replace(row.entity.dnisNumberFormat, '+', ''));
    row.entity.dnisNumber = accessNumber;

    if (!accessNumber.length || row.entity.validation.dnisNumberFormat.invalid) {
      let val = { label: this.constObject.SELECT_TYPE, value: '' };
      this.resetTollType(row, val, true);
      this.resetCallType(row, val, true);
    } else if (preValue !== accessNumber) {
      if (!this.accessNumber2RowsMapping[accessNumber]) {
        this.accessNumber2RowsMapping[accessNumber] = [];
      }
      this.accessNumber2RowsMapping[accessNumber].push(row);

      this.getAccessNumberInfo(row, accessNumber, DNIS_CHANGE_TYPE.INPUT_DNIS);
    }
  }

  private getAccessNumberInfo(row, accessNumber, type) {
    let accessNumberEntity = this.accessNumber2EntityMapping[accessNumber];
    if (accessNumberEntity) {
      this.resetAccessNumberAttribute(row, accessNumberEntity, type);
      return;
    }

    this.TelephonyDomainService.getAccessNumberInfo(accessNumber).then((res: any) => {
      let returnCode = _.get(res, 'content.data.returnCode');
      if (returnCode) {
        this.Notification.notify(this.gemService.showError(returnCode));
        return;
      }

      accessNumberEntity = _.get(res, 'content.data.body')[0];
      if (_.isNull(accessNumberEntity.tollType) && _.isNull(accessNumberEntity.callType)) { // new access number
        accessNumberEntity = {};
        accessNumberEntity.number = accessNumber;
        accessNumberEntity.status = DNIS_TYPE.NEW;
        accessNumberEntity.tollType = row.entity.tollType;
        accessNumberEntity.callType = row.entity.callType;

        if (this.isEdit && this.ccaDomainId !== '' && this.telephonyDomainId === '') {
          let dnisRows = this.accessNumber2RowsMapping[row.entity.dnisNumber];
          accessNumberEntity.tollType = dnisRows ? dnisRows[0].entity.tollType : row.entity.tollType;
          accessNumberEntity.callType = dnisRows ? dnisRows[0].entity.callType : row.entity.callType;
        }
      } else if ((accessNumberEntity.tollType === this.constObject.CCA_TOLL || accessNumberEntity.tollType === this.constObject.CCA_TOLL_FREE) && !_.isNull(accessNumberEntity.callType)) {
        accessNumberEntity.tollType = { label: accessNumberEntity.tollType, value: accessNumberEntity.tollType };
        accessNumberEntity.callType = { label: accessNumberEntity.callType, value: accessNumberEntity.callType };
        accessNumberEntity.status = DNIS_TYPE.EXISTED;
      } else { // none CCA access number
        accessNumberEntity.tollType = this.tollTypeOptions[0];
        accessNumberEntity.callType = this.callTypeOptions[0];
        accessNumberEntity.status = DNIS_TYPE.NON_CCA;
      }

      this.resetAccessNumberAttribute(row, accessNumberEntity, type);
      this.accessNumber2EntityMapping[accessNumber] = accessNumberEntity;
    });
  }

  private resetAccessNumberAttribute(row, accessNumberEntity, type) {
    let status = accessNumberEntity.status;

    let disabled = status > 0;
    let accessNumber = accessNumberEntity.number;
    let rows = this.accessNumber2RowsMapping[accessNumber];
    if (rows && rows.length > 0) {
      _.forEach(rows, (row) => {
        if (row.entity.dnisNumber === accessNumber) {
          this.resetTollType(row, accessNumberEntity.tollType, disabled);
          this.resetCallType(row, accessNumberEntity.callType, disabled);
        }
      });
    }

    if (!disabled && !type) {
      this.$element.find('#' + row.uid + '-tollType').find('.select-toggle').focus();
    }
    if (status === DNIS_TYPE.NON_CCA) {
      row.entity.validation.dnisNumberFormat.invalid = true;
      row.entity.validation.dnisNumberFormat.message = this.getValidationMessage('dnisNumberNotAvailable');
      row.entity.validation.dnisNumberFormat.show = true;

      this.$element.find('#' + row.uid + '-dnisNumberFormat').focus();
    }
  }

  private resetTollType(row, val, disabled) {
    row.entity.typeDisabled = disabled;
    row.entity.tollType = val;
    this.resetDefaultNumber(row);

    if (!_.isEmpty(val.value)) {
      this.validateTollType(row);
    }
  }

  private resetCallType(row, val, disabled) {
    row.entity.typeDisabled = disabled;
    row.entity.callType = val;

    if (!_.isEmpty(val.value)) {
      this.validateCallType(row);
    }
  }

  public changeTollType(row) {
    let accessNumber = row.entity.dnisNumber;
    let accessNumberEntity = this.accessNumber2EntityMapping[accessNumber];
    if (accessNumberEntity && accessNumberEntity.status === DNIS_TYPE.NEW) {
      accessNumberEntity.tollType = row.entity.tollType;
    }

    this.getAccessNumberInfo(row, accessNumber, DNIS_CHANGE_TYPE.CHANGE_TOLLTYPE);
  }

  public changeCallType(row) {
    let accessNumber = row.entity.dnisNumber;
    let accessNumberEntity = this.accessNumber2EntityMapping[accessNumber];
    if (accessNumberEntity && accessNumberEntity.status === DNIS_TYPE.NEW) {
      accessNumberEntity.callType = row.entity.callType;
    }

    this.getAccessNumberInfo(row, accessNumber, DNIS_CHANGE_TYPE.CHANGE_CALLTYPE);
  }

  public changeDefaultNumber(row) {
    this.resetDefaultNumberValidation(row);
    this.resetGlobalDisplayValidation(row);

    let defaultNumber = row.entity.defaultNumber;
    if (defaultNumber.value === '0') {
      row.entity.isHnDisabled = false; // enable hiddenOnClinet
      row.entity.gldsDisabled = true; // disable globalListDisplay
      row.entity.globalListDisplay = this.globalDisplayOptions[0]; // reset globalListDisplay

      (!_.isUndefined(this.curDefTollRow) && this.curDefTollRow.uid === row.uid) ? this.curDefTollRow = undefined : this.curDefTollRow = this.curDefTollRow;
      (!_.isUndefined(this.curDefTollFreeRow) && this.curDefTollFreeRow.uid === row.uid) ? this.curDefTollFreeRow = undefined : this.curDefTollFreeRow = this.curDefTollFreeRow;
    } else if (defaultNumber.value === '1') {
      row.entity.isHnDisabled = true; // disable hiddenOnClinet
      row.entity.gldsDisabled = false; // enable globalListDisplay
      row.entity.isHidden = this.isHiddenOptions[0]; // reset hiddenOnClinet

      // should only one Default Toll or Default Toll Free
      if (defaultNumber.label === this.constObject.DEFAULT_TOLL) {
        if (!_.isUndefined(this.curDefTollRow) && this.curDefTollRow.uid !== row.uid) {
          this.curDefTollRow.entity.defaultNumber = this.defaultNumberOptions[0];
          this.changeDefaultNumber(this.curDefTollRow);
        }
        this.curDefTollRow = row;
      } else if (defaultNumber.label === this.constObject.DEFAULT_TOLL_FREE) {
        if (!_.isUndefined(this.curDefTollFreeRow) && this.curDefTollFreeRow.uid !== row.uid) {
          this.curDefTollFreeRow.entity.defaultNumber = this.defaultNumberOptions[0];
          this.changeDefaultNumber(this.curDefTollFreeRow);
        }
        this.curDefTollFreeRow = row;
      }
    }
  }

  private resetDefaultNumberValidation(row) {
    row.entity.defaultNumberValidation = { invalid: false, message: '', show: false };

    let rows_0 = this.defaultNumber2RowsMapping[row.entity.tollType.value + '_0'] || [];
    let rows_1 = this.defaultNumber2RowsMapping[row.entity.tollType.value + '_1'] || [];
    let rows = _.concat(rows_0, rows_1);
    _.forEach(rows, (row) => {
      row.entity.defaultNumberValidation = { invalid: false, message: '', show: false };
    });
  }

  private resetDefaultNumber(row) {
    let oldOptions = row.entity.defaultNumberOptions;
    let newOptions = [{ label: '', value: '0' }];

    let tollType = row.entity.tollType.value;
    let label = (tollType === this.constObject.CCA_TOLL ? this.constObject.DEFAULT_TOLL : (tollType === this.constObject.CCA_TOLL_FREE ? this.constObject.DEFAULT_TOLL_FREE : ''));
    if (!_.isEmpty(label)) {
      newOptions.push({ label: label, value: '1' });
    }

    if (!_.isEqual(oldOptions, newOptions)) {
      row.entity.defaultNumberOptions = newOptions;
      row.entity.denbDisabled = !(newOptions.length > 1);
      row.entity.defaultNumber = this.defaultNumberOptions[0];
      this.changeDefaultNumber(row);
    }
  }

  public changeGlobalDisplay(row) {
    this.resetGlobalDisplayValidation(row);
  }

  private resetGlobalDisplayValidation(row) {
    row.entity.globalDisplayValidation = { invalid: false, message: '', show: false };

    const rows_0 = this.globalDisplay2RowsMapping[row.entity.tollType.value + '_0'] || [];
    const rows_1 = this.globalDisplay2RowsMapping[row.entity.tollType.value + '_1'] || [];
    const rows = _.concat(rows_0, rows_1);
    _.forEach(rows, (row) => {
      row.entity.globalDisplayValidation = { invalid: false, message: '', show: false };
    });
  }

  public deleteNumber(row) {
    if (this.submitLoading) {
      return;
    }

    this.gridData.splice(this.gridData.indexOf(row.entity), 1);

    if (row.entity.dataType === DATA_TYPE.SUBMITTED) {
      this.deleteTelephonyNumberData.push(row);
    } else if (row.entity.dataType === DATA_TYPE.IMPORT_TD) {
      delete this.dnisId2ImportedNumberMapping[row.entity.dnisId];
    }
  }

  private initDropdownList(data) {
    data.tollType = (data.tollType === this.constObject.CCA_TOLL || data.tollType === this.constObject.CCA_TOLL_FREE) ? { label: data.tollType, value: data.tollType } : this.tollTypeOptions[0];
    data.callType = (data.phoneType === this.constObject.INTERNATIONAL || data.phoneType === this.constObject.DOMESTIC) ? { label: data.phoneType, value: data.phoneType } : this.callTypeOptions[0];

    if (data.dataType === DATA_TYPE.SUBMITTED) {
      data.typeDisabled = !(_.isEmpty(this.telephonyDomainId) || _.toNumber(data.compareToSuperadminPhoneNumberStatus) === this.constObject.DATA_STATUS.NEW);
    }

    let defaultNumberOptions = [{ label: '', value: '0' }];
    if (data.tollType.value === this.constObject.CCA_TOLL || data.tollType.value === this.constObject.CCA_TOLL_FREE) {
      const label = _.replace(data.tollType.label, 'CCA', 'Default');
      data.defaultNumber = data.defaultNumber === '1' ? { label: label, value: '1' } : this.defaultNumberOptions[0];
      defaultNumberOptions.push({ label: label, value: '1' });
    } else {
      data.defaultNumber = this.defaultNumberOptions[0];
    }

    data.defaultNumberOptions = defaultNumberOptions;
    data.globalListDisplay = data.globalListDisplay === '0' ? this.globalDisplayOptions[1] : this.globalDisplayOptions[0];

    if (data.countryId && this.countryId2NameMapping[data.countryId]) {
      data.country = { label: this.countryId2NameMapping[data.countryId], value: data.countryId };
    } else if (data.country && this.countryName2IdMapping[data.country]) {
      data.country = { label: data.country, value: this.countryName2IdMapping[data.country] };
    } else {
      data.country = this._countryOptions[0];
    }

    data.isHidden = data.isHidden === 'false' ? this.isHiddenOptions[0] : this.isHiddenOptions[1];
  }

  public downloadTemplate() {
    this.$modal.open({
      type: 'dialog',
      templateUrl: 'modules/gemini/telephonyDomain/details/downloadConfirm.html',
    }).result.then(() => {
      this.$window.open(this.TelephonyDomainService.getDownloadUrl());
    });
  }

  public importTD() {
    this.$modal.open({
      type: 'default',
      template: '<gm-import-td dismiss="$dismiss()" close="$close()" class="new-field-modal"></gm-import-td>',
    }).result.then(() => {
      let data = this.gemService.getStorage('currentTelephonyDomain');

      let importedNum = 0;
      let numbers = _.get(data, 'importTDNumbers', []);
      _.map(numbers, (item: any) => {
        if (!this.dnisId2ImportedNumberMapping[item.dnisId]) {
          delete item.defaultNumber;
          delete item.globalListDisplay;

          item.dataType = DATA_TYPE.IMPORT_TD;
          item.typeDisabled = true;
          this.initDropdownList(item);
          this.addNumber(item);

          importedNum++;
        }

        this.dnisId2ImportedNumberMapping[item.dnisId] = item;
      });

      if (importedNum) {
        this.initSubmittedRowsInterval = this.$interval(() => {
          this.initAccessNumber2RowsMapping();
        }, 10);
      }
    });
  }

  public importNumberCSV(numbers: any[]): void {
    let imported: number = 0;
    this.loading = true;

    this.$timeout(() => {
      _.forEach(numbers, (item) => {
        let formattedItem = _.assignIn({}, item, {
          dataType: DATA_TYPE.IMPORT_CSV,
          typeDisabled: false,
        });
        this.initDropdownList(formattedItem);
        this.addNumber(formattedItem);
        imported++;
      });

      if (imported) {
        this.Notification.success('gemini.tds.numbers.import.resultMsg.success', { importedNumbersCount: imported });
        this.initSubmittedRowsInterval = this.$interval(() => {
          this.initAccessNumber2RowsMapping();
        }, 10);
      }

      this.loading = false;
    }, 10);
  }

  public addNumber(data: any) {
    let newData = {
      isEdit: !data || data.dataType === DATA_TYPE.IMPORT_TD,
      dataType: (data && data.dataType) ? data.dataType : DATA_TYPE.MANUAL_ADD,
      dnisId: (data && data.dnisId) ? data.dnisId : '',
      phone: (data && data.phone) ? data.phone : '',
      label: (data && data.label) ? data.label : '',
      dnisNumberFormat: (data && data.dnisNumberFormat) ? data.dnisNumberFormat : '',
      dnisNumber: (data && data.dnisNumber) ? data.dnisNumber : '',
      tollType: (data && data.tollType) ? data.tollType : this.tollTypeOptions[0],
      callType: (data && data.callType) ? data.callType : this.callTypeOptions[0],
      defaultNumber: (data && data.defaultNumber) ? data.defaultNumber : this.defaultNumberOptions[0],
      globalListDisplay: (data && data.globalListDisplay) ? data.globalListDisplay : this.globalDisplayOptions[0],
      country: (data && data.country) ? data.country : this._countryOptions[0],
      isHidden: (data && data.isHidden) ? data.isHidden : this.isHiddenOptions[0],
      defaultNumberOptions: (data && data.defaultNumberOptions) ? data.defaultNumberOptions : this.defaultNumberOptions,
      typeDisabled: !data ? true : data.typeDisabled,
      denbDisabled: !data || data.tollType.value === '',
      gldsDisabled: !data || data.defaultNumber.value === '0',
      isHnDisabled: data && data.defaultNumber.value === '1',
      validation: {
        phone: { validateFunc: this.validatePhone },
        label: { validateFunc: this.validateLabel },
        dnisNumberFormat: { validateFunc: this.validateAccessNumber },
        tollType: { validateFunc: this.validateTollType },
        callType: { validateFunc: this.validateCallType },
        country: { validateFunc: this.validateCountry },
      },
      defaultNumberValidation: { invalid: false, message: '', show: false },
      globalDisplayValidation: { invalid: false, message: '', show: false },
      duplicatedRowValidation: { invalid: false, message: '', show: false },
      phnNumDisplayValidation: { invalid: false, message: '', show: false },
    };
    this.gridData.push(newData);

    // focus the last row when click add number button
    if (!data) {
      this.$timeout(() => {
        let row = this.$scope.gridApi.core.getVisibleRows(this.$scope.gridApi.grid)[this.gridData.length - 1];
        this.$element.find('#' + row.uid + '-phone').focus();
      });
    }
  }

  public onCancel(): void {
    this.PreviousState.go();
  }

  public submitTD() {
    let flag = true;

    flag = this.validateForm();

    if (flag) {
      flag = this.validateNumbersCount() && this.validateDefaultNumber() && this.validateGlobalDisplay()
        && this.validateDuplicatedPhnNumber() && this.validateConflictDnisNumber()
        && this.validatePhoneNumberAndLabelLength() && this.validatePhoneNumberDisplay();
    }

    if (flag) {
      this.postAll();
    }
  }

  private validateForm() {
    let flag = true;

    this.phoneAndLabelLength = 0;
    this.defaultNumber2RowsMapping = {};
    this.globalDisplay2RowsMapping = {};
    this.phoneEntity2RowsMapping = {};
    this.dnisNumber2AttrsMapping = {};
    this.phoneNumber2RowsMapping = {};
    this.submitTelephonyAllData = [];

    let rows = this.$scope.gridApi.core.getVisibleRows(this.$scope.gridApi.grid);
    _.forEach(rows, (row) => {
      flag = this.validateRow(row);
      if (flag) {
        this.setDefaultNumberCountMapping(row);
        this.setGlobalDisplayCountMapping(row);
        this.setDuplicatePhnNumberMapping(row);
        this.setConflictDnisNumberMapping(row);
        this.setPhoneNumberDisplayMapping(row);
        this.setPhoneNumberAndLabelLength(row);
        this.setNewAddTelephonyNumberData(row);
        this.setUpdateAndRemainNumberData(row);
      }

      return flag;
    });

    return flag;
  }

  private validateRow(row) {
    let flag = true;

    _.forEach(row.entity.validation, (v: any, k: any) => {
      if (!_.isUndefined(v.invalid) && !v.invalid) {
        return false;
      }

      flag = v.validateFunc.apply(this, [row]);
      if (!flag) {
        let elem = this.$element.find('#' + row.uid + '-' + k);
        (k === 'phone' || k === 'label' || k === 'dnisNumberFormat') ? elem.focus() : elem.find('.select-toggle').focus();
      }

      return flag;
    });

    return flag;
  }

  private setDefaultNumberCountMapping(row) {
    if (row.entity.tollType.value === '') {
      return;
    }

    let key = row.entity.tollType.value + '_' + row.entity.defaultNumber.value;
    if (!this.defaultNumber2RowsMapping[key]) {
      this.defaultNumber2RowsMapping[key] = [];
    }
    this.defaultNumber2RowsMapping[key].push(row);
  }

  private setGlobalDisplayCountMapping(row) {
    if (row.entity.tollType.value !== this.constObject.CCA_TOLL) {
      return;
    }

    let key = row.entity.tollType.value + '_' + row.entity.globalListDisplay.value;
    if (!this.globalDisplay2RowsMapping[key]) {
      this.globalDisplay2RowsMapping[key] = [];
    }
    this.globalDisplay2RowsMapping[key].push(row);
  }

  private setDuplicatePhnNumberMapping(row) {
    let key = row.entity.phone + '_' + row.entity.label + '_' + row.entity.dnisNumber;
    if (!this.phoneEntity2RowsMapping[key]) {
      this.phoneEntity2RowsMapping[key] = [];
    }
    this.phoneEntity2RowsMapping[key].push(row);
  }

  private setConflictDnisNumberMapping(row) {
    let dnisAttrEntity = this.dnisNumber2AttrsMapping[row.entity.dnisNumber];
    !dnisAttrEntity ? dnisAttrEntity = [row] : dnisAttrEntity.push(row);
    this.dnisNumber2AttrsMapping[row.entity.dnisNumber] = dnisAttrEntity;
  }

  private setPhoneNumberDisplayMapping(row) {
    let key = row.entity.phone;
    if (!this.phoneNumber2RowsMapping[key]) {
      this.phoneNumber2RowsMapping[key] = [];
    }
    this.phoneNumber2RowsMapping[key].push(row);
  }

  private setPhoneNumberAndLabelLength(row) {
    this.phoneAndLabelLength += this.gemService.getByteLength(row.entity.phone + '@%' + row.entity.label);
  }

  private setSubmitTelephonyDomainData() {
    let telephonyDomain = {
      step : _.isEmpty(this.ccaDomainId) ? 'addTelephonyDomainStep' : 'updateTelephonyDomainStep',
      resource: 'TelephonyDomainResource.' + (_.isEmpty(this.ccaDomainId) ? 'addTelephonyDomain' : 'updateTelephonyDomain'),
      params : {
        spCustomerId : this.customerId,
      },
      body: {
        ccaDomainId: this.ccaDomainId,
        telephonyDomainId: this.telephonyDomainId,
        customerId: this.customerId,
        domainName: _.trim(this.currentTD.domainName),
        customerAttribute: _.trim(this.currentTD.customerAttribute) || '',
        noteToCiscoTeam: _.trim(this.currentTD.noteToCiscoTeam) || '',
        regionId: this.currentTD.region,
        primaryBridgeId: 0,
        primaryBridgeName: '',
        backupBridgeId: 0,
        backupBridgeName: '',
        telephonyDomainSites: [],
        telephonyNumberList: [],
      },
    };
    this.submitTelephonyAllData.unshift(telephonyDomain);
  }

  private setNewAddTelephonyNumberData(row) {
    if (row.entity.dataType === DATA_TYPE.SUBMITTED) {
      return;
    }

    let body = this.setSubmitTelephonyNumberBody(row);
    let telephonyNumber = {
      step: 'addPhoneNumberStep',
      resource: 'TelephonyDomainResource.addPhoneNumberByTelephonyDomain',
      params: {
        spCustomerId: this.customerId,
        ccaDomainId: this.ccaDomainId ? this.ccaDomainId : '${addTelephonyDomainStep.body.ccaDomainId}',
      },
      body: body,
    };

    this.submitTelephonyAllData.push(telephonyNumber);
  }

  private setDeleteTelephonyNumberData() {
    if (!this.ccaDomainId) {
      return;
    }

    _.forEach(this.deleteTelephonyNumberData, (row) => {
      let body = this.setSubmitTelephonyNumberBody(row);
      let telephonyNumber = {
        step: 'deletePhoneNumberStep' + row.entity.dnisId,
        resource: 'TelephonyDomainResource.deletePhoneNumberByTelephonyDomain',
        params: {
          spCustomerId: this.customerId,
          ccaDomainId: this.ccaDomainId,
          dnisId: row.entity.dnisId,
        },
        body: body,
      };

      this.submitTelephonyAllData.push(telephonyNumber);
    });
  }

  private setUpdateAndRemainNumberData(row) {
    if (!this.ccaDomainId || row.entity.dataType !== DATA_TYPE.SUBMITTED) {
      return;
    }

    if (this.dnisId2SubmittedNumberMapping[row.entity.dnisId]) {
      let step = '', resource = '', params = {};
      if (!this.isSamePhoneNumber(row)) {
        step = 'updatePhoneNumberStep' + row.entity.dnisId;
        resource = 'TelephonyDomainResource.updatePhoneNumberByTelephonyDomain';
        params = { spCustomerId: this.customerId, ccaDomainId: this.ccaDomainId, dnisId: row.entity.dnisId };
      } else {
        step = 'remainPhoneNumberStep' + row.entity.dnisId;
        resource = 'TelephonyDomainResource.remainPhoneNumberByTelephonyDomain';
      }

      let body = this.setSubmitTelephonyNumberBody(row);
      let telephonyNumber = { step: step, resource: resource, params: params, body: body };
      this.submitTelephonyAllData.push(telephonyNumber);
    }
  }

  private setSubmitTelephonyNumberBody(row) {
    let body = {
      dnisId: row.entity.dataType === DATA_TYPE.SUBMITTED ? row.entity.dnisId : '',
      ccaDomainId: this.ccaDomainId,
      spCustomerId: this.customerId,
      phone: _.trim(row.entity.phone),
      label: _.trim(row.entity.label),
      dnisNumberFormat: _.trim(row.entity.dnisNumberFormat),
      dnisNumber: _.trim(row.entity.dnisNumber),
      tollType: row.entity.tollType.value,
      phoneType: row.entity.callType.value,
      defaultNumber: row.entity.defaultNumber.value,
      globalListDisplay: row.entity.globalListDisplay.value,
      countryId: row.entity.country.value,
      isHidden: row.entity.isHidden.value,
    };

    return body;
  }

  private isSamePhoneNumber(row) {
    let result = true;

    let originNumber = this.dnisId2SubmittedNumberMapping[row.entity.dnisId];
    _.forEach(row.entity.validation, (v: any, k: any) => {
      if (v && !_.isEqual(row.entity[k], originNumber[k])) {
        result = false;
        return result;
      }
    });

    if (result && !_.isEqual(row.entity.defaultNumber, originNumber.defaultNumber)
      || !_.isEqual(row.entity.globalListDisplay, originNumber.globalListDisplay)
      || !_.isEqual(row.entity.isHidden, originNumber.isHidden)) {
      result = false;
    }

    return result;
  }

  private validateNumbersCount() {
    if (this.gridData.length > MAX_PHONE_NUMBERS) {
      this.Notification.error(this.getValidationMessage('exceedNumberCount', {}, false));
      return false;
    }

    return true;
  }

  private validateDefaultNumber() {
    const CCA_TOLL = this.constObject.CCA_TOLL;
    const CCA_TOLL_FREE = this.constObject.CCA_TOLL_FREE;

    let defaultTollCount = this.defaultNumber2RowsMapping[CCA_TOLL + '_1'] ? this.defaultNumber2RowsMapping[CCA_TOLL + '_1'].length : 0;
    let defaultTollFreeCount = this.defaultNumber2RowsMapping[CCA_TOLL_FREE + '_1'] ? this.defaultNumber2RowsMapping[CCA_TOLL_FREE + '_1'].length : 0;

    let row, message = '';
    if (defaultTollCount === 0) {
      row = (this.gridData.length === 1 || !this.defaultNumber2RowsMapping[CCA_TOLL + '_0']) ? this.$scope.gridApi.core.getVisibleRows(this.$scope.gridApi.grid)[0] : this.defaultNumber2RowsMapping[CCA_TOLL + '_0'][0];
      message = this.getValidationMessage('oneDefaultTollRequired');
    } else if (defaultTollCount > 1) {
      row = this.defaultNumber2RowsMapping[CCA_TOLL + '_1'][1];
      message = this.getValidationMessage('oneDefaultTollMost');
    } else if (defaultTollFreeCount > 1) {
      row = this.defaultNumber2RowsMapping[CCA_TOLL_FREE + '_1'][1];
      message = this.getValidationMessage('oneDefaultTollFreeMost');
    }

    if (!_.isEmpty(row) && !_.isEmpty(message)) {
      row.entity.isEdit = true;
      row.entity.defaultNumberValidation = { invalid: true, message: message, show: true };
      this.$element.find('#' + row.uid + '-defaultNumber').find('.select-toggle').focus();
      return false;
    }

    return true;
  }

  private validateGlobalDisplay() {
    const CCA_TOLL = this.constObject.CCA_TOLL;
    let displayCount = this.globalDisplay2RowsMapping[CCA_TOLL + '_1'] ? this.globalDisplay2RowsMapping[CCA_TOLL + '_1'].length : 0;

    let row, message = '';
    if (displayCount === 0) {
      message = this.getValidationMessage('oneGlobalDisplayLeast');
      row = this.globalDisplay2RowsMapping[CCA_TOLL + '_0'][0];
    }

    if (!_.isEmpty(row) && !_.isEmpty(message)) {
      row.entity.isEdit = true;
      row.entity.globalDisplayValidation = { invalid: true, message: message, show: true };
      this.$element.find('#' + row.uid + '-globalListDisplay').find('.select-toggle').focus();
      return false;
    }

    return true;
  }

  private validateDuplicatedPhnNumber() {
    let flag = true;

    _.forEach(this.phoneEntity2RowsMapping, (rowArray) => {
      if (rowArray.length <= 1) {
        return true;
      }

      for (let i = 0; i < rowArray.length; i++) {
        rowArray[i].entity.duplicatedRowValidation.invalid = true;
      }
      this.$element.find('#' + rowArray[0].uid + '-phone').focus();

      flag = false;
      return flag;
    });

    if (!flag) {
      this.Notification.error(this.getValidationMessage('duplicatedPhoneNumbers', {}, false), {}, this.getValidationMessage('duplicatedErrorTitle', {}, false));
    }

    return flag;
  }

  private validateConflictDnisNumber() {
    let flag = true;

    _.forEach(this.dnisNumber2AttrsMapping, (attrArray) => {
      if (attrArray.length <= 1) {
        return true;
      }

      let base_rows = _.filter(attrArray, (row: any) => {
        return row.entity.dataType === DATA_TYPE.IMPORT_TD || (this.telephonyDomainId !== '' && row.entity.dataType === DATA_TYPE.SUBMITTED);
      });

      let base_row = (base_rows && base_rows.length) ? base_rows[0] : attrArray[0];
      let conflict_rows = _.filter(attrArray, (row: any) => {
        return !_.isEqual(row.entity.tollType, base_row.entity.tollType) || !_.isEqual(row.entity.callType, base_row.entity.callType);
      });

      if (!conflict_rows.length) {
        return true;
      }

      let conflict_row = conflict_rows[0];
      let key = !_.isEqual(conflict_row.entity.tollType, base_row.entity.tollType) ? 'tollType' : 'callType';

      conflict_row.entity.validation[key].invalid = true;
      conflict_row.entity.validation[key].message = this.getValidationMessage('conflict' + _.upperFirst(key));
      conflict_row.entity.validation[key].show = true;
      this.$element.find('#' + conflict_row.uid + '-' + key).find('.select-toggle').focus();

      flag = false;
      return flag;
    });

    if (!flag) {
      this.Notification.error(this.getValidationMessage('conflictAccessNumbers', {}, false), {}, this.getValidationMessage('conflictErrorTitle', {}, false));
    }

    return flag;
  }

  private validatePhoneNumberAndLabelLength() { //11kb validation
    let flag = true;

    if (this.phoneAndLabelLength > MAX_PHONE_LENGTH) {
      this.Notification.error(this.getValidationMessage('exceedPhoneLength', {}, false), {}, this.getValidationMessage('exceedPhoneLengthTitle', {}, false));
      flag = false;
    }

    return flag;
  }

  private validatePhoneNumberDisplay() {
    let flag = true, message = '', uid = '';

    _.forEach(this.phoneNumber2RowsMapping, (rowArray) => {
      let displayRows: any = [];
      for (let i = 0; i < rowArray.length; i++) {
        if (rowArray[i].entity.isHidden.value === 'false') {
          displayRows.push(rowArray[i]);
        }
      }

      if (displayRows.length === 0) {
        rowArray[0].entity.isEdit = true;
        rowArray[0].entity.phnNumDisplayValidation.invalid = true;

        uid = rowArray[0].uid;
        message = this.getValidationMessage('noDisplayNumber', {}, false);
        flag = false;
      } else if (displayRows.length > 1) {
        _.forEach(displayRows, (row) => {
          if (row.entity.defaultNumber.value === '0') {
            row.entity.isEdit = true;
            row.entity.phnNumDisplayValidation.invalid = true;
            _.isEmpty(uid) ? uid = row.uid : uid = uid;
          }
        });

        this.$modal.open({
          type: 'dialog',
          templateUrl: 'modules/gemini/telephonyDomain/details/gmTdSubmitMultipleDisplayConfirm.tpl.html',
        }).result.then(() => {
          this.confirmPostAll();
        });

        flag = false;
      }

      return flag;
    });

    if (!flag) {
      this.$element.find('#' + uid + '-isHidden').find('.select-toggle').focus();
      this.Notification.error(message);
    }

    return flag;
  }

  private postAll() {
    this.$modal.open({
      type: 'dialog',
      templateUrl: 'modules/gemini/telephonyDomain/details/gmTdSubmitConfirm.tpl.html',
    }).result.then(() => {
      this.confirmPostAll();
    });
  }

  private confirmPostAll() {
    this.setSubmitTelephonyDomainData();
    this.setDeleteTelephonyNumberData();

    this.$scope.$emit('detailWatch', { isEdit: false });
    this.submitLoading = true;
    this.TelephonyDomainService.postTelephonyDomain(this.customerId, this.submitTelephonyAllData).then((res: any) => {
      let returnCode = _.get(res, 'content.data.code');
      let returnMessage = _.get(res, 'content.data.message', '');

      if (returnCode <= 5001) {
        this.Notification.success('gemini.tds.submit.returnCode.' + returnCode);
        this.$state.sidepanel.dismiss();
        this.$scope.$emit('tdUpdated');
      } else {
        this.Notification.error(returnMessage);
      }
    }).catch((err) => {
      this.Notification.errorResponse(err, 'errors.statusError', { status: err.status });
    }).finally(() => {
      this.$scope.$emit('detailWatch', { isEdit: true });
      this.submitLoading = false;
    });
  }

  public onEditTD() {
    if (this.submitLoading) {
      return;
    }

    let region = this.currentTD.region;
    this.$modal.open({
      type: 'full',
      template: '<gm-td-modal-request dismiss="$dismiss()" close="$close()" class="new-field-modal"></gm-td-modal-request>',
    }).result.then(() => {
      this.currentTD = this.gemService.getStorage('currentTelephonyDomain');
      this.domainName = this.currentTD.domainName || '';

      if (!_.isEqual(region, this.currentTD.region)) {
        this.changeRegion();
      }
    });
  }

  private changeRegion() {
    let allRows = this.$scope.gridApi.core.getVisibleRows(this.$scope.gridApi.grid);
    _.forEach(allRows, (row) => {
      if (row.entity.dataType === DATA_TYPE.IMPORT_TD) {
        this.gridData.splice(this.gridData.indexOf(row.entity), 1);
        delete this.dnisId2ImportedNumberMapping[row.entity.dnisId];
      }
    });
  }

  private getValidationMessage(key: string, params: any = undefined, hasErrorIcon: boolean = true) {
    let body = this.$translate.instant('gemini.tds.submit.validation.' + key, params);
    body = hasErrorIcon ? '<div class="tn-error-msg">' + body + '</div>' : body;
    return body;
  }

  public exportToCSV() {
    if (!this.ccaDomainId) {
      return;
    }

    this.exportLoading = true;
    return this.TelephonyDomainService.exportNumbersToCSV(this.customerId, this.ccaDomainId).then((res) => {
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

  public getGridHeight() {
    return {
      height: (this.gridData.length * 43 + 48) + 'px',
      'min-height': 'calc(100vh - 405px)',
    };
  }

}

export class GmTdNumbersComponent implements ng.IComponentOptions {
  public controller = GmTdNumbersCtrl;
  public templateUrl = 'modules/gemini/telephonyDomain/details/gmTdNumbers.tpl.html';
}
