import { IOption } from './../dialing/dialing.service';
import { CallDestinationTranslateService, ICallDestinationTranslate } from 'modules/call/shared/call-destination-translate';
import { LocationsService } from 'modules/call/locations/shared';

const callerIdInputs = ['external'];

class CallerId implements ng.IComponentController {
  private onChangeFn: Function;
  private customCallerIdName: string | null;
  private customCallerIdNumber: string | null;
  private callerIdSelected: IOption;
  public callerIdOptions: IOption[];
  private options: CallerIdOption[];
  private companyNumberOption: CallerIdOption;
  private companyCallerIdOption: CallerIdOption;
  private customOption: CallerIdOption;
  private directLineOption: CallerIdOption;
  private blockOption: CallerIdOption;
  private locationOption: CallerIdOption;
  public inputTranslations: ICallDestinationTranslate;
  private companyIdPattern: string;
  private companyNumberPattern: string;
  private listApiSuccess: boolean = false;
  private firstTime: boolean = true;
  public callerIdInputs: string[];
  public errorMessage: { pattern: string };
  public validator: { pattern: Function };
  public locationPromise: ng.IPromise<any>;
  public ownerId: string;
  public ownerType: string;
  public locationCallerIdUuid: string;

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
  private static readonly LOCATION_TYPE = {
    name: '',
    key: 'EXT_CALLER_ID_LOCATION_NUMBER',
  };
  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
    private CallDestinationTranslateService: CallDestinationTranslateService,
    private FeatureToggleService,
    private LocationsService: LocationsService,
  ) {
    this.locationPromise = this.FeatureToggleService.supports(this.FeatureToggleService.features.hI1484);
    this.initCallerId();
    this.inputTranslations = this.CallDestinationTranslateService.getCallDestinationTranslate();
    CallerId.LOCATION_TYPE.name = this.$translate.instant('callerIdPanel.locationCallerId');
  }

  public $onChanges(changes: { [bindings: string]: ng.IChangesObject<any> }) {
    const {
      directLine,
      companyNumbers,
      callerIdSelected,
    } = changes;
    if (directLine && directLine.previousValue === undefined) {
      if (changes.directLine.currentValue) {
        this.directLineOption = new CallerIdOption(CallerId.DIRECT_LINE_TYPE.name, new CallerIdConfig('', CallerId.DIRECT_LINE_TYPE.name, changes.directLine.currentValue, CallerId.DIRECT_LINE_TYPE.key));
        this.options.push(this.directLineOption);
      }
    }
    if (companyNumbers && _.isArray(companyNumbers.currentValue)) {
      if (!this.listApiSuccess) {
        this.updateCompanyNumberOptions(companyNumbers.currentValue);
      }
    }
    if (callerIdSelected && !callerIdSelected.currentValue) {
      this.callerIdSelected = this.selectType(CallerId.BLOCK_CALLERID_TYPE.key);
    }
    if (callerIdSelected && _.isString(callerIdSelected.currentValue)) {
      while (this.listApiSuccess && this.firstTime) {
        this.callerIdOptions = this.getOptions();
        this.firstTime = false;
        this.callerIdSelected = this.selectType(changes.callerIdSelected.currentValue);
      }
      if (this.listApiSuccess) {
        this.callerIdSelected = this.selectType(changes.callerIdSelected.currentValue);
      }
    }
    if (directLine && (typeof changes.directLine.previousValue !== 'object' || changes.directLine.previousValue === null)) {
      const data = this.changeDirectLine(<string>_.get(changes, 'directLine.currentValue'), this.callerIdSelected);
      this.callerIdOptions = data.options;
      this.callerIdSelected = data.selected;
      this.onChange();
    }
  }

  public onChange(): void {
    this.onChangeFn({
      callerIdSelected: this.callerIdSelected,
      customCallerIdName: this.customCallerIdName,
      customCallerIdNumber: this.customCallerIdNumber,
      companyNumber: this.getCompanyNumber(),
    });
  }

  public getCompanyNumber() {
    if (this.callerIdSelected) {
      if (this.callerIdSelected.label === CallerId.COMPANY_NUMBER_TYPE.name) {
        return this.companyNumberPattern;
      } else if (this.callerIdSelected.label === CallerId.COMPANY_CALLERID_TYPE.name) {
        return this.companyIdPattern;
      } else if (this.callerIdSelected.label === CallerId.LOCATION_TYPE.name) {
        return this.locationCallerIdUuid;
      } else {
        return null;
      }
    } else {
      return null;
    }
  }

  public showCustom(): boolean {
    return this.callerIdSelected && this.callerIdSelected.label === CallerId.CUSTOM_COMPANY_TYPE.name;
  }

  public getSelected(selected: string): CallerIdConfig | any {
    const selectedArray = this.options.filter(option => {
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
    // Location Caller ID
    this.locationPromise.then(supports => {
      if (supports) {
        this.LocationsService.getUserOrPlaceLocation(this.ownerId, this.ownerType)
          .then(userLocation => {
            if (userLocation.uuid) {
              return this.LocationsService.getLocation(userLocation.uuid);
            } else {
              return undefined;
            }
          })
          .then(location => {
            if (_.get(location, 'callerId')) {
              this.locationCallerIdUuid = _.get(location, 'callerId.uuid');
              this.locationOption = new CallerIdOption(CallerId.LOCATION_TYPE.name, new CallerIdConfig('', this.$translate.instant('callerIdPanel.locationCallerIdDescription'), `${_.get(location, 'callerId.name')} - ${_.get(location, 'callerId.number')}`, CallerId.LOCATION_TYPE.key));
              this.options.push(this.locationOption);
            }
          });
      }
    });

    this.callerIdInputs = callerIdInputs;
    this.validator = {
      pattern: this.invalidCharactersValidation,
    };
    this.errorMessage = {
      pattern: this.$translate.instant('callerIdPanel.invalidNameError'),
    };
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
    const directLineArray = _.filter(this.options, this.hasOption(CallerId.DIRECT_LINE_TYPE.name));
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
    const _selected = _.cloneDeep(selected);
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
      const _callerIdOptions = _.cloneDeep(this.options);
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
      case CallerId.LOCATION_TYPE.key:
        selected = this.locationOption;
        break;
      case CallerId.BLOCK_CALLERID_TYPE.key:
      default:
        selected = this.blockOption;
        break;
    }
    const _selected = {
      value: selected.value.externalCallerIdType,
      label: selected.label,
    };
    return _selected;
  }

  public setCallerIdNumber(number: string): void {
    this.customCallerIdNumber = number;
    this.onChange();
  }

  public invalidCharactersValidation(viewValue: string): boolean {
    const regex = new RegExp(/^[^\]"%<>[&|{}]{1,30}$/g);
    return regex.test(viewValue);
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
  public template = require('modules/huron/callerId/callerId.html');
  public bindings = {
    callerIdOptions: '<',
    callerIdSelected: '<',
    customCallerIdName: '<',
    customCallerIdNumber: '<',
    directLine: '<',
    companyNumbers: '<',
    onChangeFn: '&',
    ownerId: '<',
    ownerType: '<',
  };
}
