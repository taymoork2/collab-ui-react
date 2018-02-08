import { Notification } from 'modules/core/notifications';

const phoneNumberPattern = /^[\+\-\d+\(\)\.\s]*$/;
const accessNumberPattern = /^\+{0,1}\d{7,30}$/;
const MAX_PHONE_LENGTH: number = 11 * 1024;
const MAX_PHONE_NUMBERS: number = 300;
const DATA_TYPE: any = { MANUAL_ADD : 0, IMPORT_TD : 1, IMPORT_CSV : 2, SUBMITTED : 3 };

export class TelephonyNumberValidateService {

  private constObject: any = {};

  /* @ngInject */
  constructor(
    private gemService,
    private Notification: Notification,
    private $translate: ng.translate.ITranslateService,
  ) { }

  public validatePhone(row) {
    let invalid, message, ariaLabel = '';

    const phone = _.trim(row.entity.phone);
    if (!phone.length) {
      invalid = true;
      message = this.getValidationMessage('fieldRequired', { field: 'Phone Number' });
      ariaLabel = this.getValidationAriaLabel('fieldRequired', { field: 'Phone Number' });
    } else if (!phoneNumberPattern.test(phone)) {
      invalid = true;
      message = this.getValidationMessage('PhoneNumberInvalidFormat');
      ariaLabel = this.getValidationAriaLabel('PhoneNumberInvalidFormat');
    } else if (!_.inRange(_.replace(phone, /[^0-9]/ig, '').length, 7, 33)) {
      invalid = true;
      message = this.getValidationMessage('PhoneNumberLengthRange');
      ariaLabel = this.getValidationAriaLabel('PhoneNumberLengthRange');
    }

    this.setFieldInvalid(row, 'phone', invalid, message, ariaLabel);
    return !invalid;
  }

  public validateLabel(row) {
    let invalid, message, ariaLabel = '';

    const label = _.trim(row.entity.label);
    if (!label.length) {
      invalid = true;
      message = this.getValidationMessage('fieldRequired', { field: 'Phone Label' });
      ariaLabel = this.getValidationAriaLabel('fieldRequired', { field: 'Phone Label' });
    } else if (_.gt(this.gemService.getByteLength(label), 85)) {
      invalid = true;
      message = this.getValidationMessage('PhoneLabelInvalidFormat');
      ariaLabel = this.getValidationAriaLabel('PhoneLabelInvalidFormat');
    }

    this.setFieldInvalid(row, 'label', invalid, message, ariaLabel);
    return !invalid;
  }

  public validateAccessNumber(row) {
    let invalid, message, ariaLabel = '';

    const accessNumber = _.trim(row.entity.dnisNumberFormat);
    if (!accessNumber.length) {
      invalid = true;
      message = this.getValidationMessage('fieldRequired', { field: 'Access Number' });
      ariaLabel = this.getValidationAriaLabel('fieldRequired', { field: 'Access Number' });
    } else if (!accessNumberPattern.test(accessNumber)) {
      invalid = true;
      message = this.getValidationMessage('AccessNumberInvalidFormat');
      ariaLabel = this.getValidationAriaLabel('AccessNumberInvalidFormat');
    }

    this.setFieldInvalid(row, 'dnisNumberFormat', invalid, message, ariaLabel);
    return !invalid;
  }

  public validateTollType(row) {
    let invalid, message, ariaLabel = '';

    if (!row.entity.tollType.value.length) {
      invalid = true;
      message = this.getValidationMessage('fieldRequired', { field: 'Toll Type' });
      ariaLabel = this.getValidationAriaLabel('fieldRequired', { field: 'Toll Type' });
    }

    this.setFieldInvalid(row, 'tollType', invalid, message, ariaLabel);
    return !invalid;
  }

  public validateCallType(row) {
    let invalid, message, ariaLabel = '';

    if (!row.entity.callType.value.length) {
      invalid = true;
      message = this.getValidationMessage('fieldRequired', { field: 'Call Type' });
      ariaLabel = this.getValidationAriaLabel('fieldRequired', { field: 'Call Type' });
    }

    this.setFieldInvalid(row, 'callType', invalid, message, ariaLabel);
    return !invalid;
  }

  public validateCountry(row) {
    let invalid, message, ariaLabel = '';

    if (!row.entity.country.value) {
      invalid = true;
      message = this.getValidationMessage('fieldRequired', { field: 'Country' });
      ariaLabel = this.getValidationAriaLabel('fieldRequired', { field: 'Country' });
    }

    this.setFieldInvalid(row, 'country', invalid, message, ariaLabel);
    return !invalid;
  }

  public validateFormOnSubmit(mappings, allRows, constObject) {
    this.constObject = constObject;

    let result = 0;
    let flag = true;

    _.forEach(allRows, (row) => {
      flag = this.validateRow(row);
      if (flag) {
        this.setDefaultNumberCountMapping(mappings, row);
        this.setGlobalDisplayCountMapping(mappings, row);
        this.setDuplicatePhnNumberMapping(mappings, row);
        this.setConflictDnisNumberMapping(mappings, row);
        this.setPhoneNumberDisplayMapping(mappings, row);
        this.setPhoneNumberAndLabelLength(mappings, row);
      }

      return flag;
    });

    if (flag) {
      flag = this.validateNumbersCount(allRows) && this.validateDefaultNumber(allRows, mappings)
        && this.validateGlobalDisplay(mappings) && this.validateDuplicatedPhnNumber(mappings)
        && this.validateConflictDnisNumber(mappings) && this.validatePhoneNumberAndLabelLength(mappings);
    }

    if (flag) {
      result = this.validatePhoneNumberDisplay(mappings);
    }

    return result;
  }

  private validateRow(row) {
    let flag = true;

    _.forEach(row.entity.validation, (v: any, k: any) => {
      if (!_.isUndefined(v.invalid) && !v.invalid) {
        return false;
      }

      flag = v.validateFunc.apply(this, [row]);
      if (!flag) {
        const elem = angular.element('#' + row.uid + '-' + k);
        (k === 'phone' || k === 'label' || k === 'dnisNumberFormat') ? elem.focus() : elem.find('.select-toggle').focus();
      }

      return flag;
    });

    return flag;
  }

  private setDefaultNumberCountMapping(mappings, row): void {
    if (row.entity.tollType.value === '') {
      return;
    }

    const key = row.entity.tollType.value + '_' + row.entity.defaultNumber.value;
    const defaultNumber2RowsMapping = mappings.defaultNumber2RowsMapping;
    if (!defaultNumber2RowsMapping[key]) {
      defaultNumber2RowsMapping[key] = [];
    }
    defaultNumber2RowsMapping[key].push(row);
  }

  private setGlobalDisplayCountMapping(mappings, row) {
    if (row.entity.tollType.value !== this.constObject.CCA_TOLL) {
      return;
    }

    const key = row.entity.tollType.value + '_' + row.entity.globalListDisplay.value;
    const globalDisplay2RowsMapping = mappings.globalDisplay2RowsMapping;
    if (!globalDisplay2RowsMapping[key]) {
      globalDisplay2RowsMapping[key] = [];
    }
    globalDisplay2RowsMapping[key].push(row);
  }

  private setDuplicatePhnNumberMapping(mappings, row) {
    const key = row.entity.phone + '_' + row.entity.label + '_' + row.entity.dnisNumber;
    const phoneEntity2RowsMapping = mappings.phoneEntity2RowsMapping;
    if (!phoneEntity2RowsMapping[key]) {
      phoneEntity2RowsMapping[key] = [];
    }
    phoneEntity2RowsMapping[key].push(row);
  }

  private setConflictDnisNumberMapping(mappings, row) {
    const dnisNumber2AttrsMapping = mappings.dnisNumber2AttrsMapping;
    let dnisAttrEntity = dnisNumber2AttrsMapping[row.entity.dnisNumber];
    !dnisAttrEntity ? dnisAttrEntity = [row] : dnisAttrEntity.push(row);
    dnisNumber2AttrsMapping[row.entity.dnisNumber] = dnisAttrEntity;
  }

  private setPhoneNumberDisplayMapping(mappings, row) {
    const key = row.entity.phone;
    const phoneNumber2RowsMapping = mappings.phoneNumber2RowsMapping;
    if (!phoneNumber2RowsMapping[key]) {
      phoneNumber2RowsMapping[key] = [];
    }
    phoneNumber2RowsMapping[key].push(row);
  }

  private setPhoneNumberAndLabelLength(mappings, row) {
    mappings.phoneAndLabelLength += this.gemService.getByteLength(row.entity.phone + '@%' + row.entity.label);
  }

  private validateNumbersCount(allRows) {
    if (allRows.length > MAX_PHONE_NUMBERS) {
      this.Notification.error(this.getValidationKey('exceedNumberCount'));
      return false;
    }
    return true;
  }

  private validateDefaultNumber(allRows, mappings) {
    const CCA_TOLL = this.constObject.CCA_TOLL;
    const CCA_TOLL_FREE = this.constObject.CCA_TOLL_FREE;

    const defaultNumber2RowsMapping = mappings.defaultNumber2RowsMapping;
    const defaultTollCount = defaultNumber2RowsMapping[CCA_TOLL + '_1'] ? defaultNumber2RowsMapping[CCA_TOLL + '_1'].length : 0;
    const defaultTollFreeCount = defaultNumber2RowsMapping[CCA_TOLL_FREE + '_1'] ? defaultNumber2RowsMapping[CCA_TOLL_FREE + '_1'].length : 0;

    let row, message = '';
    if (defaultTollCount === 0) {
      row = (allRows.length === 1 || !defaultNumber2RowsMapping[CCA_TOLL + '_0']) ? allRows[0] : defaultNumber2RowsMapping[CCA_TOLL + '_0'][0];
      message = this.getValidationMessage('oneDefaultTollRequired');
    } else if (defaultTollCount > 1) {
      row = defaultNumber2RowsMapping[CCA_TOLL + '_1'][1];
      message = this.getValidationMessage('oneDefaultTollMost');
    } else if (defaultTollFreeCount > 1) {
      row = defaultNumber2RowsMapping[CCA_TOLL_FREE + '_1'][1];
      message = this.getValidationMessage('oneDefaultTollFreeMost');
    }

    if (!_.isEmpty(row) && !_.isEmpty(message)) {
      row.entity.defaultNumberValidation = { invalid: true, message: message, show: true };
      angular.element('#' + row.uid + '-defaultNumber').find('.select-toggle').focus();
      return false;
    }

    return true;
  }

  private validateGlobalDisplay(mappings) {
    const CCA_TOLL = this.constObject.CCA_TOLL;

    const globalDisplay2RowsMapping = mappings.globalDisplay2RowsMapping;
    const displayCount = globalDisplay2RowsMapping[CCA_TOLL + '_1'] ? globalDisplay2RowsMapping[CCA_TOLL + '_1'].length : 0;

    let row, message = '';
    if (displayCount === 0) {
      message = this.getValidationMessage('oneGlobalDisplayLeast');
      row = globalDisplay2RowsMapping[CCA_TOLL + '_0'][0];
    }

    if (!_.isEmpty(row) && !_.isEmpty(message)) {
      row.entity.globalDisplayValidation = { invalid: true, message: message, show: true };
      angular.element('#' + row.uid + '-globalListDisplay').find('.select-toggle').focus();
      return false;
    }

    return true;
  }

  private validateDuplicatedPhnNumber(mappings) {
    let flag = true;

    _.forEach(mappings.phoneEntity2RowsMapping, (rowArray) => {
      if (rowArray.length <= 1) {
        return true;
      }

      _.map(rowArray, (row: any) => {
        row.entity.duplicatedRowValidation.invalid = true;
      });
      angular.element('#' + rowArray[0].uid + '-phone').focus();

      flag = false;
      return flag;
    });

    if (!flag) {
      this.Notification.error(this.getValidationKey('duplicatedPhoneNumbers'), {}, this.getValidationKey('duplicatedErrorTitle'));
    }

    return flag;
  }

  private validateConflictDnisNumber(mappings) {
    let flag = true;
    let telephonyDomainId = '';

    const currentTD = this.gemService.getStorage('currentTelephonyDomain');
    if (currentTD) {
      telephonyDomainId = currentTD.telephonyDomainId || '';
    }

    _.forEach(mappings.dnisNumber2AttrsMapping, (attrArray) => {
      if (attrArray.length <= 1) {
        return true;
      }

      const base_rows = _.filter(attrArray, (row: any) => {
        return row.entity.dataType === DATA_TYPE.IMPORT_TD || (telephonyDomainId !== '' && row.entity.dataType === DATA_TYPE.SUBMITTED);
      });

      const base_row = (base_rows && base_rows.length) ? base_rows[0] : attrArray[0];
      const conflict_rows = _.filter(attrArray, (row: any) => {
        return !_.isEqual(row.entity.tollType, base_row.entity.tollType) || !_.isEqual(row.entity.callType, base_row.entity.callType);
      });

      if (!conflict_rows.length) {
        return true;
      }

      const conflict_row = conflict_rows[0];
      const key = !_.isEqual(conflict_row.entity.tollType, base_row.entity.tollType) ? 'tollType' : 'callType';

      conflict_row.entity.validation[key].invalid = true;
      conflict_row.entity.validation[key].message = this.getValidationMessage('conflict' + _.upperFirst(key));
      conflict_row.entity.validation[key].show = true;
      angular.element('#' + conflict_row.uid + '-' + key).find('.select-toggle').focus();

      flag = false;
      return flag;
    });

    if (!flag) {
      this.Notification.error(this.getValidationKey('conflictAccessNumbers'), {}, this.getValidationKey('conflictErrorTitle'));
    }

    return flag;
  }

  private validatePhoneNumberAndLabelLength(mappings) { //11kb validation
    let flag = true;

    if (mappings.phoneAndLabelLength > MAX_PHONE_LENGTH) {
      this.Notification.error(this.getValidationKey('exceedPhoneLength'), {}, this.getValidationKey('exceedPhoneLengthTitle'));
      flag = false;
    }

    return flag;
  }

  private validatePhoneNumberDisplay(mappings) {
    let result = 1, message = '', uid = '';

    _.forEach(mappings.phoneNumber2RowsMapping, (rowArray) => {
      const displayRows = _.filter(rowArray, (row: any) => {
        return !row.entity.isHidden.value;
      });

      if (displayRows.length === 0) {
        rowArray[0].entity.phnNumDisplayValidation.invalid = true;

        uid = rowArray[0].uid;
        message = this.getValidationKey('noDisplayNumber');

        result = 0;
        return false;
      } else if (displayRows.length > 1) {
        _.map(displayRows, (row) => {
          if (row.entity.defaultNumber.value === '0') {
            row.entity.phnNumDisplayValidation.invalid = true;
            _.isEmpty(uid) ? uid = row.uid : uid = uid;
          }
        });

        result = 2;
      }
    });

    if (!result) {
      angular.element('#' + uid + '-isHidden').find('.select-toggle').focus();
      this.Notification.error(message);
    }

    return result;
  }

  private setFieldInvalid(row, field, invalid, message, ariaLabel) {
    row.entity.validation[field].invalid = invalid;
    row.entity.validation[field].message = message;
    row.entity.validation[field].ariaLabel = ariaLabel;
    row.entity.validation[field].show = invalid && message;
  }

  private getValidationKey(key: string) {
    return 'gemini.tds.submit.validation.' + key;
  }

  public getValidationMessage(key: string, params: any = undefined) {
    return '<div class="tn-error-msg">' + this.getValidationAriaLabel(key, params) + '</div>';
  }

  public getValidationAriaLabel(key: string, params: any = undefined): string {
    return this.$translate.instant(this.getValidationKey(key), params);
  }
}
