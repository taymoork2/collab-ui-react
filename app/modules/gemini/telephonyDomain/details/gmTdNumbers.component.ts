import { IToolkitModalService } from 'modules/core/modal';
import { Notification } from 'modules/core/notifications';
import { TelephonyDomainService } from '../telephonyDomain.service';
import { TelephonyNumberDataService } from './telephonyNumberData.service';
import { TelephonyNumberValidateService } from './telephonyNumberValidate.service';

const MAX_PHONE_NUMBERS: number = 300;
const DATA_TYPE: any = { MANUAL_ADD : 0, IMPORT_TD : 1, IMPORT_CSV : 2, SUBMITTED : 3 };
const DNIS_TYPE: any = { NEW: 0, EXISTED: 1, NON_CCA: 2 };
const DNIS_CHANGE_TYPE: any = { INPUT_DNIS: 0, CHANGE_TOLLTYPE: 1, CHANGE_CALLTYPE: 2 };

const SUBMIT_CONFIRM_TEMPLATE = require('./gmTdSubmitConfirm.tpl.html');
const SUBMIT_MUTIDISPLAY_TEMPLATE = require('./gmTdSubmitMultipleDisplayConfirm.tpl.html');

class GmTdNumbersCtrl implements ng.IComponentController {

  public isEdit: boolean = false;
  public downloadUrl: string;
  public customerId: string;
  public ccaDomainId: string;
  public domainName: string;
  public telephonyDomainId: string;
  private curDefTollRow: any;
  private curDefTollFreeRow: any;
  private currentTD: any = {};
  private constObject: any = {};
  public loading: boolean = false;
  public submitLoading: boolean = false;
  public exportLoading: boolean = false;
  private accessNumber2EntityMapping: any = {};
  private accessNumber2RowsMapping: any = {};
  private phoneEntity2RowsMapping: any = {};
  private dnisNumber2AttrsMapping: any = {};
  private defaultNumber2RowsMapping: any = {};
  private globalDisplay2RowsMapping: any = {};
  private phoneNumber2RowsMapping: any = {};
  private dnisId2SubmittedNumberMapping: any = {};
  private dnisId2ImportedNumberMapping: any = {};
  private gridData: any[] = [];
  private deleteTelephonyNumberData: any[] = [];
  private submitTelephonyAllData: any[] = [];
  private tollTypeOptions: any[] = [];
  private callTypeOptions: any[] = [];
  private defaultNumberOptions: any[] = [];
  private globalDisplayOptions: any[] = [];
  private _countryOptions: any[] = [];
  private countryOptions: any[] = [];
  private isHiddenOptions: any[] = [];
  private phoneAndLabelLength: number = 0;

  /* @ngInject */
  public constructor(
    private $state,
    private $scope,
    private gemService,
    private PreviousState,
    private WindowLocation,
    private $modal: IToolkitModalService,
    private Notification: Notification,
    private $timeout: ng.ITimeoutService,
    private $element: ng.IRootElementService,
    private $translate: ng.translate.ITranslateService,
    private TelephonyDomainService: TelephonyDomainService,
    private TelephonyNumberDataService: TelephonyNumberDataService,
    private TelephonyNumberValidateService: TelephonyNumberValidateService,
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

    this.initGridOptions();
    this.$scope.$emit('detailWatch', { isEdit: this.isEdit });
    this.$state.current.data.displayName = this.$translate.instant('gemini.tds.phoneNumbers');
  }

  private initConstObject() {
    this.constObject = this.TelephonyNumberDataService.initConstObject();
  }

  private initDropdownOptions(): void  {
    const allOptions = this.TelephonyNumberDataService.initDropdownOptions();

    this.tollTypeOptions = allOptions.tollTypeOptions;
    this.callTypeOptions = allOptions.callTypeOptions;
    this._countryOptions = allOptions._countryOptions;
    this.countryOptions = allOptions.countryOptions;
    this.isHiddenOptions = allOptions.isHiddenOptions;
    this.defaultNumberOptions = allOptions.defaultNumberOptions;
    this.globalDisplayOptions = allOptions.globalDisplayOptions;
  }

  private listenRegionUpdated(): void  {
    const deregister = this.$scope.$on('regionUpdated', () => {
      this.changeRegion();
    });
    this.$scope.$on('$destroy', deregister);
  }

  private initGridOptions() {
    this.TelephonyNumberDataService.initGridOptions(this, this.isEdit);
    this.$timeout(() => {
      this.$scope.gridApi = this.TelephonyNumberDataService.gridApi;
      this.gridData = this.TelephonyNumberDataService.gridOptions.data;
      this.initSubmittedNumber();
    });
  }

  private initSubmittedNumber(): void {
    if (!this.ccaDomainId) {
      return;
    }

    this.loading = true;
    this.TelephonyDomainService.getNumbers(this.customerId, this.ccaDomainId).then((res) => {
      _.forEach(res, (item: any) => {
        if (_.toNumber(item.compareToSuperadminPhoneNumberStatus) === this.constObject.DATA_STATUS.DELETED) {
          return true;
        }

        item.dataType = DATA_TYPE.SUBMITTED;
        this.TelephonyNumberDataService.initNumber(item, this.telephonyDomainId);
      });

      this.loading = false;
    }).catch((err) => {
      this.Notification.errorResponse(err, 'errors.statusError', { status: err.status });
    });
  }

  public addNumber() {
    this.TelephonyNumberDataService.addNumber(null);
  }

  public changePhone(row, oldValue) {
    this.TelephonyNumberValidateService.validatePhone(row);

    if (oldValue) {
      this.resetDuplicateRowValidation(row, oldValue, row.entity.label, row.entity.dnisNumber);
    }
  }

  public changeLabel(row, oldValue) {
    this.TelephonyNumberValidateService.validateLabel(row);

    if (oldValue) {
      this.resetDuplicateRowValidation(row, row.entity.phone, oldValue, row.entity.dnisNumber);
    }
  }

  public changeDnisNumber(row, oldValue) {
    this.TelephonyNumberValidateService.validateAccessNumber(row);

    if (oldValue) {
      this.resetDuplicateRowValidation(row, row.entity.phone, row.entity.label, oldValue);
    }
  }

  private resetDuplicateRowValidation(row, phone, label, dnisNumber) {
    if (row.entity.duplicatedRowValidation.invalid) {
      row.entity.duplicatedRowValidation.invalid = false;

      const rows = this.phoneEntity2RowsMapping[phone + '_' + label + '_' + dnisNumber];
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

  public changeAccessNumber(row) {
    const preValue = row.entity.dnisNumber;

    const accessNumber = _.trim(_.replace(row.entity.dnisNumberFormat, '+', ''));
    row.entity.dnisNumber = accessNumber;

    if (!accessNumber.length || row.entity.validation.dnisNumberFormat.invalid) {
      const val = { label: this.constObject.SELECT_TYPE, value: '' };
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
      accessNumberEntity = res[0];
      if (_.isNull(accessNumberEntity.tollType) && _.isNull(accessNumberEntity.callType)) { // new access number
        accessNumberEntity = {};
        accessNumberEntity.number = accessNumber;
        accessNumberEntity.status = DNIS_TYPE.NEW;
        accessNumberEntity.tollType = row.entity.tollType;
        accessNumberEntity.callType = row.entity.callType;

        if (this.isEdit && this.ccaDomainId !== '' && this.telephonyDomainId === '') {
          const dnisRows = this.accessNumber2RowsMapping[row.entity.dnisNumber];
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
    }).catch((err) => {
      this.Notification.errorResponse(err, 'errors.statusError', { status: err.status });
    });
  }

  private resetAccessNumberAttribute(row, accessNumberEntity, type) {
    const status = accessNumberEntity.status;

    const disabled = status > 0;
    const accessNumber = accessNumberEntity.number;
    const rows = this.accessNumber2RowsMapping[accessNumber];
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
      const key = 'dnisNumberNotAvailable';

      row.entity.validation.dnisNumberFormat.invalid = true;
      row.entity.validation.dnisNumberFormat.message = this.TelephonyNumberValidateService.getValidationMessage(key);
      row.entity.validation.dnisNumberFormat.ariaLabel = this.TelephonyNumberValidateService.getValidationAriaLabel(key);
      row.entity.validation.dnisNumberFormat.show = true;

      this.$element.find('#' + row.uid + '-dnisNumberFormat').focus();
    }
  }

  private resetTollType(row, val, disabled) {
    row.entity.typeDisabled = disabled;
    row.entity.tollType = val;
    this.resetDefaultNumber(row);

    if (!_.isEmpty(val.value)) {
      this.TelephonyNumberValidateService.validateTollType(row);
    }
  }

  private resetCallType(row, val, disabled) {
    row.entity.typeDisabled = disabled;
    row.entity.callType = val;

    if (!_.isEmpty(val.value)) {
      this.TelephonyNumberValidateService.validateCallType(row);
    }
  }

  public changeTollType(row) {
    const accessNumber = row.entity.dnisNumber;
    const accessNumberEntity = this.accessNumber2EntityMapping[accessNumber];
    if (accessNumberEntity && accessNumberEntity.status === DNIS_TYPE.NEW) {
      accessNumberEntity.tollType = row.entity.tollType;
    }

    this.getAccessNumberInfo(row, accessNumber, DNIS_CHANGE_TYPE.CHANGE_TOLLTYPE);
  }

  public changeCallType(row) {
    const accessNumber = row.entity.dnisNumber;
    const accessNumberEntity = this.accessNumber2EntityMapping[accessNumber];
    if (accessNumberEntity && accessNumberEntity.status === DNIS_TYPE.NEW) {
      accessNumberEntity.callType = row.entity.callType;
    }

    this.getAccessNumberInfo(row, accessNumber, DNIS_CHANGE_TYPE.CHANGE_CALLTYPE);
  }

  public changeDefaultNumber(row) {
    this.resetDefaultNumberValidation(row);
    this.resetGlobalDisplayValidation(row);
    this.resetHiddenOnClientValidation(row);

    const defaultNumber = row.entity.defaultNumber;
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

    const rows_0 = this.defaultNumber2RowsMapping[row.entity.tollType.value + '_0'] || [];
    const rows_1 = this.defaultNumber2RowsMapping[row.entity.tollType.value + '_1'] || [];
    const rows = _.concat(rows_0, rows_1);
    _.forEach(rows, (row) => {
      row.entity.defaultNumberValidation = { invalid: false, message: '', show: false };
    });
  }

  private resetDefaultNumber(row) {
    const oldOptions = row.entity.defaultNumberOptions;
    const newOptions = [{ label: '', value: '0' }];

    const tollType = row.entity.tollType.value;
    const label = (tollType === this.constObject.CCA_TOLL ? this.constObject.DEFAULT_TOLL : (tollType === this.constObject.CCA_TOLL_FREE ? this.constObject.DEFAULT_TOLL_FREE : ''));
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

  public changeHiddenOnClient(row) {
    const phone = row.entity.phone;
    const rows = this.phoneNumber2RowsMapping[phone];
    _.forEach(rows, (row) => {
      this.resetHiddenOnClientValidation(row);
    });
  }

  private resetHiddenOnClientValidation(row) {
    row.entity.phnNumDisplayValidation = { invalid: false, message: '', show: false };
  }

  public deleteNumber(row) {
    if (this.submitLoading) {
      return;
    }

    this.loading = true;

    this.$timeout(() => {
      _.remove(this.gridData, (data: any) => {
        return row.entity.rowId === data.rowId;
      });

      if (row.entity.dataType === DATA_TYPE.SUBMITTED) {
        this.deleteTelephonyNumberData.push(row);
      } else if (row.entity.dataType === DATA_TYPE.IMPORT_TD) {
        _.unset(this.dnisId2ImportedNumberMapping, row.entity.dnisId);
      }

      this.loading = false;
    }, 100);
  }

  public downloadTemplate() {
    this.$modal.open({
      type: 'dialog',
      template: require('modules/gemini/telephonyDomain/details/downloadConfirm.html'),
    }).result.then(() => {
      this.WindowLocation.set(this.TelephonyDomainService.getDownloadUrl());
    });
  }

  public importTD() {
    this.$modal.open({
      type: 'default',
      template: '<gm-import-td dismiss="$dismiss()" close="$close()" class="new-field-modal"></gm-import-td>',
    }).result.then(() => {
      let imported: number = 0;
      const data = this.gemService.getStorage('currentTelephonyDomain');
      const numbers = _.get(data, 'importTDNumbers', []);
      this.loading = true;

      this.$timeout(() => {
        const totalNum = this.gridData.length + numbers.length;
        const _numbers = totalNum > MAX_PHONE_NUMBERS ? _.slice(numbers, 0, MAX_PHONE_NUMBERS - this.gridData.length) : numbers;

        _.forEach(_numbers, (item: any) => {
          if (!this.dnisId2ImportedNumberMapping[item.dnisId]) {
            delete item.defaultNumber;
            delete item.globalListDisplay;

            item.dataType = DATA_TYPE.IMPORT_TD;
            item.isEdit = false;
            item.typeDisabled = true;
            this.TelephonyNumberDataService.initNumber(item, this.telephonyDomainId);
            imported++;
          }

          this.dnisId2ImportedNumberMapping[item.dnisId] = item;
        });

        this.$timeout(() => {
          this.Notification.success('gemini.tds.numbers.import.resultMsg.success', { importedNumbersCount: imported });
        }, 10);

        this.loading = false;
      }, 1000);
    });
  }

  public importNumberCSV(numbers: any[]): void {
    let imported: number = 0;
    this.loading = true;

    this.$timeout(() => {
      const totalNum = this.gridData.length + numbers.length;
      const _numbers = totalNum > MAX_PHONE_NUMBERS ? _.slice(numbers, 0, MAX_PHONE_NUMBERS - this.gridData.length) : numbers;

      _.forEach(_numbers, (item) => {
        const formattedItem = _.assignIn({}, item, {
          dataType: DATA_TYPE.IMPORT_CSV,
          typeDisabled: false,
          country: item.country.replace(/,/g, '#@#'),
        });

        this.TelephonyNumberDataService.initNumber(formattedItem, this.telephonyDomainId);
        imported++;
      });

      this.$timeout(() => {
        this.Notification.success('gemini.tds.numbers.import.resultMsg.success', { importedNumbersCount: imported });
      }, 10);

      this.loading = false;
    }, 100);
  }

  public onCancel(): void {
    this.PreviousState.go();
  }

  public submitTD() {
    let result = 0;

    const allRows = this.$scope.gridApi.core.getVisibleRows(this.$scope.gridApi.grid);
    const mappings = {
      phoneAndLabelLength: this.phoneAndLabelLength = 0,
      defaultNumber2RowsMapping: this.defaultNumber2RowsMapping = {},
      globalDisplay2RowsMapping: this.globalDisplay2RowsMapping = {},
      phoneEntity2RowsMapping: this.phoneEntity2RowsMapping = {},
      dnisNumber2AttrsMapping: this.dnisNumber2AttrsMapping = {},
      phoneNumber2RowsMapping: this.phoneNumber2RowsMapping = {},
    };

    result = this.TelephonyNumberValidateService.validateFormOnSubmit(mappings, allRows, this.constObject);
    if (result) {
      this.postAll(result);
    }
  }

  private setSubmitTelephonyDomainData() {
    const telephonyDomain = {
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
    this.submitTelephonyAllData.push(telephonyDomain);
  }

  private setDeleteTelephonyNumberData() {
    if (!this.ccaDomainId) {
      return;
    }

    _.forEach(this.deleteTelephonyNumberData, (row) => {
      const body = this.setSubmitTelephonyNumberBody(row);
      const telephonyNumber = {
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

  private setNewAddTelephonyNumberData() {
    const allRows = this.$scope.gridApi.core.getVisibleRows(this.$scope.gridApi.grid);
    const newRows: any = _.filter(allRows, (row: any) => {
      return row.entity.dataType !== DATA_TYPE.SUBMITTED;
    });

    _.forEach(newRows, (row) => {
      const body = this.setSubmitTelephonyNumberBody(row);
      /* tslint:disable no-invalid-template-strings */
      const telephonyNumber = {
        step: 'addPhoneNumberStep',
        resource: 'TelephonyDomainResource.addPhoneNumberByTelephonyDomain',
        params: {
          spCustomerId: this.customerId,
          ccaDomainId: this.ccaDomainId ? this.ccaDomainId : '${addTelephonyDomainStep.body.ccaDomainId}',
        },
        body: body,
      };

      this.submitTelephonyAllData.push(telephonyNumber);
    });
  }

  private setUpdateAndRemainNumberData() {
    if (!this.ccaDomainId) {
      return;
    }

    const allRows = this.$scope.gridApi.core.getVisibleRows(this.$scope.gridApi.grid);
    const submittedRows = _.filter(allRows, (row: any) => {
      return row.entity.dataType === DATA_TYPE.SUBMITTED;
    });

    _.forEach(submittedRows, (row) => {
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

        const body = this.setSubmitTelephonyNumberBody(row);
        const telephonyNumber = { step: step, resource: resource, params: params, body: body };
        this.submitTelephonyAllData.push(telephonyNumber);
      }
    });
  }

  private setSubmitTelephonyNumberBody(row) {
    const body = {
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

    const originNumber = this.dnisId2SubmittedNumberMapping[row.entity.dnisId];
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

  private postAll(result) {
    this.$modal.open({
      type: 'dialog',
      template: result === 1 ? SUBMIT_CONFIRM_TEMPLATE : SUBMIT_MUTIDISPLAY_TEMPLATE,
    }).result.then(() => {
      this.confirmPostAll();
    });
  }

  private confirmPostAll() {
    this.submitTelephonyAllData = [];

    this.setSubmitTelephonyDomainData();
    this.setDeleteTelephonyNumberData();
    this.setNewAddTelephonyNumberData();
    this.setUpdateAndRemainNumberData();

    this.$scope.$emit('detailWatch', { isEdit: false });
    this.submitLoading = true;
    this.TelephonyDomainService.postTelephonyDomain(this.customerId, this.submitTelephonyAllData).then((res: any) => {
      const returnCode = _.get(res, 'code');
      const returnMessage = _.get(res, 'message', '');

      if (returnCode === '5000') {
        this.Notification.success('gemini.tds.submit.success');
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

    const region = this.currentTD.region;
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
    const deletedRows = _.remove(this.gridData, (data: any) => {
      return data.dataType === DATA_TYPE.IMPORT_TD;
    });

    _.forEach(deletedRows, (data: any) => {
      _.unset(this.dnisId2ImportedNumberMapping, data.dnisId);
    });
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
      'min-height': 'calc(100vh - 365px)',
    };
  }

}

export class GmTdNumbersComponent implements ng.IComponentOptions {
  public controller = GmTdNumbersCtrl;
  public template = require('modules/gemini/telephonyDomain/details/gmTdNumbers.tpl.html');
}
