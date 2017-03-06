import { IOption } from './../dialing/dialing.service';
import { HuronCustomerService } from 'modules/huron/customer/customer.service';

const callerIdInputs = ['external'];

class CallerId implements ng.IComponentController {
  private onChangeFn: Function;
  private customCallerIdName: string | null;
  private customCallerIdNumber: string | null;
  private callerIdSelected: IOption;
  private callerIdOptions: IOption[];
  private options: CallerIdOption[];
  private companyNumberOption: CallerIdOption;
  private companyCallerIdOption: CallerIdOption;
  private customOption: CallerIdOption;
  private directLineOption: CallerIdOption;
  private blockOption: CallerIdOption;
  private companyIdPattern: string;
  private companyNumberPattern: string;
  private listApiSuccess: boolean = false;
  private firstTime: boolean = true;
  private customCallDest: any | null;
  private callerIdInputs: string[];
  private static readonly BLOCK_CALLERID_TYPE = {
    name: 'Blocked Outbound Caller ID',
    key: 'EXT_CALLER_ID_BLOCKED_CALLER_ID',
  };
  private static readonly DIRECT_LINE_TYPE = {
    name: 'Direct Line',
    key: 'EXT_CALLER_ID_DIRECT_LINE',
  };
  private static readonly COMPANY_CALLERID_TYPE = {
    name: 'Company Caller ID',
    key: 'EXT_CALLER_ID_COMPANY_CALLER_ID',
  };
  private static readonly COMPANY_NUMBER_TYPE = {
    name: 'Company Number',
    key: 'EXT_CALLER_ID_COMPANY_NUMBER',
  };
  private static readonly CUSTOM_COMPANY_TYPE = {
    name: 'Custom',
    key: 'EXT_CALLER_ID_CUSTOM',
  };
  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
    private HuronCustomerService: HuronCustomerService,
    private TelephoneNumberService ) {

    this.initCallerId();

  }

  public $onInit(): void {

  }

  public $onChanges(changes) {
    if (changes.directLine && changes.directLine.previousValue === undefined) {
      if (changes.directLine.currentValue) {
        this.directLineOption = new CallerIdOption(CallerId.DIRECT_LINE_TYPE.name, new CallerIdConfig('', CallerId.DIRECT_LINE_TYPE.name, changes.directLine.currentValue, CallerId.DIRECT_LINE_TYPE.key));
        this.options.push(this.directLineOption);
      }
    }
    if (changes.companyNumbers && _.isArray(changes.companyNumbers.currentValue)) {
      if (!this.listApiSuccess) {
        this.updateCompanyNumberOptions(changes.companyNumbers.currentValue);
      }
    }
    if (changes.callerIdSelected && !changes.callerIdSelected.currentValue) {
      this.callerIdSelected = this.selectType(CallerId.BLOCK_CALLERID_TYPE.key);
    }
    if (changes.callerIdSelected && _.isString(changes.callerIdSelected.currentValue)) {
      while (this.listApiSuccess && this.firstTime) {
        this.callerIdOptions = this.getOptions();
        this.firstTime = false;
        this.callerIdSelected = this.selectType(changes.callerIdSelected.currentValue);
      }
      if (this.listApiSuccess) {
        this.callerIdSelected = this.selectType(changes.callerIdSelected.currentValue);
      }
    }
    if (changes.directLine && (typeof changes.directLine.previousValue !== 'object' || changes.directLine.previousValue === null)) {
      let data = this.changeDirectLine(<string>_.get(changes, 'directLine.currentValue'), this.callerIdSelected);
      this.callerIdOptions = data.options;
      this.callerIdSelected = data.selected;
      this.onChange();
    }
    if (changes.customCallerIdNumber && changes.customCallerIdNumber.previousValue === undefined) {
      this.customCallDest = this.TelephoneNumberService.getDestinationObject(this.customCallerIdNumber);
    }
  }

  public onChange(): void {
    this.onChangeFn({
      callerIdSelected: this.callerIdSelected,
      customCallerIdName: this.customCallerIdName,
      customCallerIdNumber: this.customCallerIdNumber,
      companyNumber: this.callerIdSelected ? this.callerIdSelected.label === CallerId.COMPANY_NUMBER_TYPE.name ? this.companyNumberPattern :
        this.callerIdSelected.label === CallerId.COMPANY_CALLERID_TYPE.name ? this.companyIdPattern : null : null,
    });
  }

  public showCustom(): boolean {
    return this.callerIdSelected && this.callerIdSelected.label === CallerId.CUSTOM_COMPANY_TYPE.name;
  }

  public getSelected(selected: string): CallerIdConfig | any {
    let selectedArray = this.options.filter(option => {
      return selected === option.value.externalCallerIdType;
    });
    if (selectedArray.length) {
      return selectedArray[0].value;
    }
  }

  public initCallerId(): void {
    this.options = [];
    // Custom
    this.customOption = new CallerIdOption(CallerId.CUSTOM_COMPANY_TYPE.name, new CallerIdConfig('', '',  '', CallerId.CUSTOM_COMPANY_TYPE.key));
    this.options.push(this.customOption);
    // Block Caller ID
    this.blockOption = new CallerIdOption(CallerId.BLOCK_CALLERID_TYPE.name, new CallerIdConfig('', this.$translate.instant('callerIdPanel.blockedCallerIdDescription'), '', CallerId.BLOCK_CALLERID_TYPE.key));
    this.options.push(this.blockOption);
    this.callerIdInputs = callerIdInputs;
  }

  private updateCompanyNumberOptions(companyNumbers) {
    this.listApiSuccess = true;
    // Company Number
    companyNumbers.filter((companyNumber) => {
      return companyNumber.externalCallerIdType === CallerId.COMPANY_NUMBER_TYPE.name;
    }).map((companyNumber) => {
      this.companyNumberPattern = companyNumber.uuid;
      this.companyNumberOption = new CallerIdOption(CallerId.COMPANY_NUMBER_TYPE.name, new CallerIdConfig(companyNumber.uuid, companyNumber.name, companyNumber.pattern, CallerId.COMPANY_NUMBER_TYPE.key));
      this.options.push(this.companyNumberOption);
    });
    // Company Caller ID
    companyNumbers.filter((companyNumber) => {
      return companyNumber.externalCallerIdType === CallerId.COMPANY_CALLERID_TYPE.name;
    }).map((companyNumber) => {
      this.companyIdPattern = companyNumber.uuid;
      this.companyCallerIdOption = new CallerIdOption(CallerId.COMPANY_CALLERID_TYPE.name, new CallerIdConfig(companyNumber.uuid, companyNumber.name, companyNumber.pattern, CallerId.COMPANY_CALLERID_TYPE.key));
      this.options.push(this.companyCallerIdOption);
    });
  }
  private hasOption(name) {
    return function(option) {
      return option.label === name;
    };
  }
  public changeDirectLine(directLine: string, selected: CallerIdOption | any): {options: IOption[], selected: IOption} {
    let directLineArray = _.filter(this.options, this.hasOption(CallerId.DIRECT_LINE_TYPE.name));
    if (directLineArray.length) {
      this.options.splice(this.options.indexOf(directLineArray[0]), 1);
    }
    if (directLine) {
      this.directLineOption = new CallerIdOption(CallerId.DIRECT_LINE_TYPE.name, new CallerIdConfig('', CallerId.DIRECT_LINE_TYPE.name, directLine, CallerId.DIRECT_LINE_TYPE.key));
      this.options.push(this.directLineOption);
      if (_.get(selected, 'label') === CallerId.DIRECT_LINE_TYPE.name) {
        selected = this.directLineOption;
      }
    } else if (_.get(selected, 'label') === CallerId.DIRECT_LINE_TYPE.name) {
      selected = this.blockOption;
    }
    let _selected = _.cloneDeep(selected);
    if (_.get(selected, 'value.externalCallerIdType')) {
      _selected.value = selected.value.externalCallerIdType;
    }
    return {
      options: this.getOptions(),
      selected: _selected,
    };
  }

  public getOptions(): IOption[] {
    let options: IOption[] = [];
    if (this.options) {
      let _callerIdOptions = _.cloneDeep(this.options);
      options = <IOption[]>_callerIdOptions.map((option) => {
        return {
          label: option.label,
          value: option.value.externalCallerIdType,
        };
      });
      return options;
    } else {
      return options;
    }
  }

  public selectType(type: string): IOption {
    let selected;
    switch (type) {
      case CallerId.COMPANY_NUMBER_TYPE.key:
        selected = this.companyNumberOption;
        break;
      case CallerId.COMPANY_CALLERID_TYPE.key:
        selected = this.companyCallerIdOption;
        break;
      case CallerId.DIRECT_LINE_TYPE.key:
        selected = this.directLineOption;
        break;
      case CallerId.CUSTOM_COMPANY_TYPE.key:
        selected = this.customOption;
        break;
      case CallerId.BLOCK_CALLERID_TYPE.key:
      default:
        selected = this.blockOption;
        break;
    }
    let _selected = {
      value: selected.value.externalCallerIdType,
      label: selected.label,
    };
    return _selected;
  }

  public getRegionCode() {
    if (this.showCustom()) {
      return this.HuronCustomerService.getVoiceCustomer();
    }
  }

  public setCallerIdNumber(callDest: any) {
    this.customCallerIdNumber = (callDest && callDest.phoneNumber) ? this.validate(callDest.phoneNumber) : null;
    this.onChange();
  }

  public validate(number: any) {
    let newNumber = number;
    if (number && this.TelephoneNumberService.validateDID(number)) {
      newNumber = this.TelephoneNumberService.getDIDValue(number);
    } else if (number.indexOf('@') === -1) {
      newNumber = _.replace(number, /-/g, '');
    }
    return newNumber.replace(/ /g, '');
  }
}

export class CallerIdConfig {
  public uuid: string;
  public name: string;
  public pattern: string | null | undefined;
  public externalCallerIdType: string;

  constructor(uuid: string, name: string, pattern: string | null | undefined, externalCallerIdType: string) {
    this.uuid = uuid;
    this.name = name;
    this.pattern = pattern;
    this.externalCallerIdType = externalCallerIdType;
  }
}

export class CallerIdOption {
  public label: string;
  public value: CallerIdConfig;

  constructor(label: string, callerIdConfig: CallerIdConfig) {
    this.label = label;
    this.value = callerIdConfig;
  }
}

export class CallerIdComponent implements ng.IComponentOptions {
  public controller = CallerId;
  public templateUrl = 'modules/huron/callerId/callerId.html';
  public bindings = <{ [binding: string]: string }>{
    callerIdOptions: '<',
    callerIdSelected: '<',
    customCallerIdName: '<',
    customCallerIdNumber: '<',
    directLine: '<',
    companyNumbers: '<',
    onChangeFn: '&',
  };
}
