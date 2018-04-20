import { TelephonyNumberValidateService } from './telephonyNumberValidate.service';

const DATA_TYPE: any = { MANUAL_ADD : 0, IMPORT_TD : 1, IMPORT_CSV : 2, SUBMITTED : 3 };

export class TelephonyNumberDataService {

  private rowId: number = 0;
  private constObject: any = {};
  private tollTypeOptions: any[] = [];
  private callTypeOptions: any[] = [];
  private defaultNumberOptions: any[] = [];
  private globalDisplayOptions: any[] = [];
  private _countryOptions: any[] = [];
  private isHiddenOptions: any[] = [];
  private countryOptions: any[] = [];
  private countryId2NameMapping: any = {};
  private countryName2IdMapping: any = {};

  public gridApi: any;
  public gridOptions: any = {};

  /* @ngInject */
  constructor(
    private gemService,
    private uiGridConstants,
    private $timeout: ng.ITimeoutService,
    private $translate: ng.translate.ITranslateService,
    private TelephonyNumberValidateService: TelephonyNumberValidateService,
  ) {
    this.onInit();
  }

  private onInit() {
    this.initCountries();
  }

  private initCountries(): void {
    const gmCountry = this.gemService.getStorage('gmCountry');
    if (gmCountry) {
      this.countryOptions = gmCountry.countryOptions;
      this.countryId2NameMapping = gmCountry.countryId2NameMapping;
      this.countryName2IdMapping = gmCountry.countryName2IdMapping;
    }
  }

  public initConstObject() {
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

    return this.constObject;
  }

  public initDropdownOptions() {
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
    this._countryOptions = [{ label: SELECT_COUNTRY, value: '' }];
    this.isHiddenOptions = [{ label: DISPLAY, value: false }, { label: HIDDEN, value: true }];
    this.defaultNumberOptions = [{ label: '', value: '0' }];
    this.globalDisplayOptions = [{ label: DISPLAY, value: '1' }, { label: NO, value: '0' }];

    return {
      tollTypeOptions: this.tollTypeOptions,
      callTypeOptions: this.callTypeOptions,
      _countryOptions: this._countryOptions,
      countryOptions: this.countryOptions,
      isHiddenOptions: this.isHiddenOptions,
      defaultNumberOptions: this.defaultNumberOptions,
      globalDisplayOptions: this.globalDisplayOptions,
    };
  }

  public initGridOptions($this, isEdit) {
    const columnDefs: any = [{
      field: 'phone',
      type: 'number',
      cellTooltip: true,
      displayName: this.$translate.instant('gemini.tds.numbers.field.phoneNumber'),
      cellClass: isEdit ? 'cell-border-none' : '',
      cellTemplate: require('./cellTemplate/phoneNumberCellTemplate.tpl.html'),
    }, {
      width: '11%',
      field: 'label',
      displayName: this.$translate.instant('gemini.tds.numbers.field.phoneLabel'),
      cellClass: isEdit ? 'cell-border-none' : '',
      cellTemplate: require('./cellTemplate/phoneLabelCellTemplate.tpl.html'),
    }, {
      width: '12%',
      field: 'dnisNumberFormat',
      type: 'number',
      cellTooltip: true,
      displayName: this.$translate.instant('gemini.tds.numbers.field.accessNumber'),
      cellClass: isEdit ? 'cell-border-none' : '',
      cellTemplate: require('./cellTemplate/accessNumberCellTemplate.tpl.html'),
    }, {
      width: '9%',
      field: 'tollType',
      sortingAlgorithm: this.sortDropdownList,
      cellTooltip: true,
      displayName: this.$translate.instant('gemini.tds.numbers.field.tollType'),
      cellClass: isEdit ? 'cell-border-none' : '',
      cellTemplate: require('./cellTemplate/tollTypeCellTemplate.tpl.html'),
    }, {
      width: '8%',
      field: 'callType',
      sortingAlgorithm: this.sortDropdownList,
      cellTooltip: true,
      displayName: this.$translate.instant('gemini.tds.numbers.field.callType'),
      cellClass: isEdit ? 'cell-border-none' : '',
      cellTemplate: require('./cellTemplate/callTypeCellTemplate.tpl.html'),
    }, {
      width: '12%',
      field: 'defaultNumber',
      sortingAlgorithm: this.sortDropdownList,
      cellTooltip: true,
      displayName: this.$translate.instant('gemini.tds.numbers.field.defaultNumber'),
      cellClass: isEdit ? 'cell-border-none' : '',
      cellTemplate: require('./cellTemplate/defaultNumberCellTemplate.tpl.html'),
    }, {
      width: '11%',
      field: 'globalListDisplay',
      sortingAlgorithm: this.sortDropdownList,
      cellTooltip: true,
      displayName: this.$translate.instant('gemini.tds.numbers.field.globalDisplay'),
      cellClass: isEdit ? 'cell-border-none' : '',
      cellTemplate: require('./cellTemplate/globalListDisplayCellTemplate.tpl.html'),
    }, {
      width: '9%',
      field: 'country',
      sortingAlgorithm: this.sortDropdownList,
      cellTooltip: true,
      displayName: this.$translate.instant('gemini.tds.numbers.field.country'),
      cellClass: isEdit ? 'cell-border-none' : '',
      cellTemplate: require('./cellTemplate/countryCellTemplate.tpl.html'),
    }, {
      width: '13%',
      field: 'isHidden',
      sortingAlgorithm: this.sortDropdownList,
      cellTooltip: true,
      displayName: this.$translate.instant('gemini.tds.numbers.field.hiddenOnClient'),
      cellClass: isEdit ? 'cell-border-none' : '',
      cellTemplate: require('./cellTemplate/isHiddenCellTemplate.tpl.html'),
    }];

    if (isEdit) {
      const actionColumn = {
        field: 'index',
        width: '5%',
        enableSorting: false,
        displayName: this.$translate.instant('gemini.tds.numbers.field.action'),
        cellClass: 'cell-border-none',
        cellTemplate: `
          <div class="ui-grid-cell-contents text-center">
            <button class="btn--none" ng-click="grid.appScope.deleteNumber(row)" aria-label="${this.$translate.instant('common.delete')}">
              <i class="icon icon-trash"></i>
            </button>
          </div>
        `,
      };

      columnDefs.push(actionColumn);
    }

    this.gridOptions = {
      rowHeight: 42,
      data: '',
      multiSelect: false,
      columnDefs: columnDefs,
      enableColumnMenus: false,
      enableColumnResizing: true,
      appScopeProvider: $this,
      enableVerticalScrollbar: this.uiGridConstants.scrollbars.NEVER,
      enableHorizontalScrollbar: this.uiGridConstants.scrollbars.NEVER,
      virtualizationThreshold: 500,
      onRegisterApi: (gridApi) => {
        this.gridApi = gridApi;
        gridApi.core.on.rowsRendered($this.$scope, (grid) => {
          const gridLength = this.gemService.getStorage('grid_' + grid.grid.id + '_length') || 0;

          const allRows = grid.grid.rows;
          this.gemService.setStorage('grid_' + grid.grid.id + '_length', allRows.length);
          if (!$this.isEdit || (allRows.length && _.get(_.last(grid.grid.rows), 'entity.dataType') === DATA_TYPE.MANUAL_ADD) || allRows.length <= gridLength) {
            return;
          }

          _.map(allRows, (row: any) => {
            if (row.entity.dataType === DATA_TYPE.SUBMITTED) {
              $this.dnisId2SubmittedNumberMapping[row.entity.dnisId] = _.cloneDeep(row.entity);
              $this.curDefTollRow = row.entity.defaultNumber.label === this.constObject.DEFAULT_TOLL ? row : $this.curDefTollRow;
              $this.curDefTollFreeRow = row.entity.defaultNumber.label === this.constObject.DEFAULT_TOLL_FREE ? row : $this.curDefTollFreeRow;
            }

            if (row.entity.dataType !== DATA_TYPE.MANUAL_ADD) {
              if (!$this.accessNumber2RowsMapping[row.entity.dnisNumber]) {
                $this.accessNumber2RowsMapping[row.entity.dnisNumber] = [];
              }
              $this.accessNumber2RowsMapping[row.entity.dnisNumber].push(row);
            }
          });
        });
      },
    };
  }

  public initNumber(data, telephonyDomainId) {
    this.initDropdownList(data, telephonyDomainId);
    this.addNumber(data);
  }

  private initDropdownList(data, telephonyDomainId) {
    data.tollType = (data.tollType === this.constObject.CCA_TOLL || data.tollType === this.constObject.CCA_TOLL_FREE) ? { label: data.tollType, value: data.tollType } : this.tollTypeOptions[0];
    data.callType = (data.phoneType === this.constObject.INTERNATIONAL || data.phoneType === this.constObject.DOMESTIC) ? { label: data.phoneType, value: data.phoneType } : this.callTypeOptions[0];

    if (data.dataType === DATA_TYPE.SUBMITTED) {
      data.typeDisabled = !(_.isEmpty(telephonyDomainId) || _.toNumber(data.compareToSuperadminPhoneNumberStatus) === this.constObject.DATA_STATUS.NEW);
    }

    const defaultNumberOptions = [{ label: '', value: '0' }];
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
      const countryId = this.countryName2IdMapping[data.country];
      data.country = { label: this.countryId2NameMapping[countryId], value: countryId };
    } else {
      data.country = this._countryOptions[0];
    }

    data.isHidden = !data.isHidden ? this.isHiddenOptions[0] : this.isHiddenOptions[1];
  }

  public addNumber(data: any) {
    const newData = {
      rowId: ++this.rowId,
      isEdit: !data,
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
        phone: { validateFunc: this.TelephonyNumberValidateService.validatePhone },
        label: { validateFunc: this.TelephonyNumberValidateService.validateLabel },
        dnisNumberFormat: { validateFunc: this.TelephonyNumberValidateService.validateAccessNumber },
        tollType: { validateFunc: this.TelephonyNumberValidateService.validateTollType },
        callType: { validateFunc: this.TelephonyNumberValidateService.validateCallType },
        country: { validateFunc: this.TelephonyNumberValidateService.validateCountry },
      },
      defaultNumberValidation: { invalid: false, message: '', show: false },
      globalDisplayValidation: { invalid: false, message: '', show: false },
      duplicatedRowValidation: { invalid: false, message: '', show: false },
      phnNumDisplayValidation: { invalid: false, message: '', show: false },
    };
    this.gridOptions.data.push(newData);

    // focus the last row when click add number button
    if (!data) {
      this.$timeout(() => {
        const row = this.gridApi.core.getVisibleRows(this.gridApi.grid)[this.gridOptions.data.length - 1];
        angular.element('#' + row.uid + '-phone').focus();
      }, 10);
    }
  }

  private sortDropdownList(a, b) {
    if (a.value === '' || b.value === '') {
      return (a.value === '' && b.value === '') ? 0 : (a.value === '' ? -1 : 1);
    }
    return a.label === b.label ? 0 : (a.label.length < b.label.length ? -1 : 1);
  }

}
