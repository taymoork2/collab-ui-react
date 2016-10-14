import { ICallerID } from './index';
import { CallerIdOption, CallerIdConfig } from './callerId.component';
import { LineConsumerType } from './../lines/services';
import { IOption } from './../dialing/dialing.service';

interface ICallerIDResource extends ng.resource.IResourceClass<ng.resource.IResource<ICallerID>> {
  update: ng.resource.IResourceMethod<ng.resource.IResource<ICallerID>>;
}
export class CallerIDService {
  private callerIDService: ICallerIDResource;
  private callerIDOptions: CallerIdOption[] = [];
  private companyNumberOption: CallerIdOption;
  private companyCallerIdOption: CallerIdOption;
  private customOption: CallerIdOption;
  private directLineOption: CallerIdOption;
  private blockOption: CallerIdOption;
  private companyIdPattern: string;
  private companyNumberPattern: string;
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
    private $resource: ng.resource.IResourceService,
    private Authinfo,
    private HuronConfig,
    private $translate: ng.translate.ITranslateService,
    private CompanyNumberService,
  ) {
    let updateAction: ng.resource.IActionDescriptor = {
      method: 'PUT',
    };

    this.callerIDService = <ICallerIDResource>this.$resource(this.HuronConfig.getCmiV2Url() + '/customers/:customerId/:type/:typeId/numbers/:numberId/features/callerids', {},
      {
        update: updateAction,
      });
  }

  public getCallerId(_type: LineConsumerType, _typeId: string, _numberId: string, external: string): ng.IPromise<ICallerID> {
    return this.initCallerId(external)
      .then(() => {
        return this.callerIDService.get({
          customerId: this.Authinfo.getOrgId(),
          type: _type,
          typeId: _typeId,
          numberId: _numberId,
        }).$promise
          .then(callerIdRes => {
            callerIdRes.externalCallerIdType = this.selectType(callerIdRes.externalCallerIdType);
            return callerIdRes;
          });
      });
  }

  public getSelected(selected: string): CallerIdConfig | undefined {
    let selectedArray = this.callerIDOptions.filter(option => {
      return selected === option.value.externalCallerIdType;
    });
    if (selectedArray.length) {
      return selectedArray[0].value;
    }
  }

  public getOptions(): IOption[] {
    let options: IOption[];
    let _callerIdOptions = _.cloneDeep(this.callerIDOptions);
    options = <IOption[]>_callerIdOptions.map((option) => {
      return {
        label: option.label,
        value: option.value.externalCallerIdType,
      };
    });
    return options;
  }

  public updateCallerId(_type: LineConsumerType, _typeId: string, _numberId: string | undefined, data: CallerIdOption) {
    let result: any = _.cloneDeep(data);
    result.externalCallerIdType = result.externalCallerIdType.value;
    if (result.externalCallerIdType === CallerIDService.COMPANY_CALLERID_TYPE.key) {
      result.companyNumber = this.companyIdPattern;
    } else if (result.externalCallerIdType === CallerIDService.COMPANY_NUMBER_TYPE.key) {
      result.companyNumber = this.companyNumberPattern;
    }
    delete result.url;
    delete result.callerIdSelected;
    return this.callerIDService.update({
      customerId: this.Authinfo.getOrgId(),
      type: _type,
      typeId: _typeId,
      numberId: _numberId,
    }, result).$promise;
  }
  public changeDirectLine(directLine: string, selected: any): {options: IOption[], selected: IOption} {
    if (_.last(this.callerIDOptions) && _.last(this.callerIDOptions).label === CallerIDService.DIRECT_LINE_TYPE.name) {
      this.callerIDOptions.pop();
    }
    if (directLine) {
      this.directLineOption = new CallerIdOption(CallerIDService.DIRECT_LINE_TYPE.name, new CallerIdConfig('', CallerIDService.DIRECT_LINE_TYPE.name, directLine, CallerIDService.DIRECT_LINE_TYPE.key));
      this.callerIDOptions.push(this.directLineOption);
      if (_.get(selected, 'label') === CallerIDService.DIRECT_LINE_TYPE.name) {
        selected = this.directLineOption;
      }
    } else if (_.get(selected, 'label') === CallerIDService.DIRECT_LINE_TYPE.name) {
      selected = this.blockOption;
    }
    let _selected: IOption = _.cloneDeep(selected);
    if (_.get(selected, 'value.externalCallerIdType')) {
      _selected.value = selected.value.externalCallerIdType;
    }
    return {
      options: this.getOptions(),
      selected: _selected,
    };
  }

  public initCallerId(external): ng.IPromise<CallerIdOption[]> {
    this.callerIDOptions = [];
    let _companyNumber;
    return this.listCompanyNumbers()
      .then((companyNumbers) => {
        // Company Number
        companyNumbers.filter((companyNumber) => {
          return companyNumber.externalCallerIdType === CallerIDService.COMPANY_NUMBER_TYPE.name;
        }).map((companyNumber) => {
          this.companyNumberPattern = companyNumber.uuid;
          this.companyNumberOption = new CallerIdOption(CallerIDService.COMPANY_NUMBER_TYPE.name, new CallerIdConfig(companyNumber.uuid, companyNumber.name, companyNumber.pattern, CallerIDService.COMPANY_NUMBER_TYPE.key));
          this.callerIDOptions.push(this.companyNumberOption);
          _companyNumber = companyNumber;
        });
        // Company Caller ID
        companyNumbers.filter((companyNumber) => {
          return companyNumber.externalCallerIdType === CallerIDService.COMPANY_CALLERID_TYPE.name;
        }).map((companyNumber) => {
          this.companyIdPattern = companyNumber.uuid;
          this.companyCallerIdOption = new CallerIdOption(CallerIDService.COMPANY_CALLERID_TYPE.name, new CallerIdConfig(companyNumber.uuid, companyNumber.name, companyNumber.pattern, CallerIDService.COMPANY_CALLERID_TYPE.key));
          this.callerIDOptions.push(this.companyCallerIdOption);
          _companyNumber = companyNumber;
        });
        // Custom
        this.customOption = new CallerIdOption(CallerIDService.CUSTOM_COMPANY_TYPE.name, new CallerIdConfig('', '',  '', CallerIDService.CUSTOM_COMPANY_TYPE.key));
        this.callerIDOptions.push(this.customOption);
        // Block Caller ID
        this.blockOption = new CallerIdOption(CallerIDService.BLOCK_CALLERID_TYPE.name, new CallerIdConfig('', this.$translate.instant('callerIdPanel.blockedCallerIdDescription'), '', CallerIDService.BLOCK_CALLERID_TYPE.key));
        this.callerIDOptions.push(this.blockOption);
        // Direct Line
        if (external) {
          this.directLineOption = new CallerIdOption(CallerIDService.DIRECT_LINE_TYPE.name, new CallerIdConfig('', CallerIDService.DIRECT_LINE_TYPE.name, external, CallerIDService.DIRECT_LINE_TYPE.key));
          this.callerIDOptions.push(this.directLineOption);
        }
      });
  }

  public selectType(type: any): IOption {
    let selected;
    switch (type) {
      case CallerIDService.COMPANY_NUMBER_TYPE.key:
        selected = this.companyNumberOption;
        break;
      case CallerIDService.COMPANY_CALLERID_TYPE.key:
        selected = this.companyCallerIdOption;
        break;
      case CallerIDService.DIRECT_LINE_TYPE.key:
        selected = this.directLineOption;
        break;
      case CallerIDService.CUSTOM_COMPANY_TYPE.key:
        selected = this.customOption;
        break;
      case CallerIDService.BLOCK_CALLERID_TYPE.key:
        selected = this.blockOption;
        break;
    }
    let _selected = {
      value: selected.value.externalCallerIdType,
      label: selected.label,
    };
    return _selected;
  }
  private listCompanyNumbers() {
    return this.CompanyNumberService.query({
      customerId: this.Authinfo.getOrgId(),
    }).$promise;
  }

  public isCustom(selected: IOption): boolean {
    return selected && selected.label === CallerIDService.CUSTOM_COMPANY_TYPE.name;
  }
}
