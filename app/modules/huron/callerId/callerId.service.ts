import { ICallerID } from './callerId';
import { CallerIdOption, CallerIdConfig, COMPANY_NUMBER_TYPE, COMPANY_CALLERID_TYPE, CUSTOM_COMPANY_TYPE, BLOCK_CALLERID_TYPE, DIRECT_LINE_TYPE } from './index';
interface ICallerIDResource extends ng.resource.IResourceClass<ng.resource.IResource<ICallerID>> {
  update: ng.resource.IResourceMethod<ng.resource.IResource<ICallerID>>;
}
export class CallerIDService {
  private callerIDService: ICallerIDResource;

  /* @ngInject */
  constructor(
    private $resource: ng.resource.IResourceService,
    private Authinfo,
    private HuronConfig,
    private $translate,
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

  public getCallerId(_type, _typeId, _numberId): ng.IPromise<ICallerID> {
    return this.callerIDService.get({
      customerId: this.Authinfo.getOrgId(),
      type: _type,
      typeId: _typeId,
      numberId: _numberId,
    }).$promise;
  }

  public updateCallerId(_type, _typeId, _numberId, data) {
    let result = _.cloneDeep(data);
    delete result.url;
    delete result.callerIdSelected;
    return this.callerIDService.update({
      customerId: this.Authinfo.getOrgId(),
      type: _type,
      typeId: _typeId,
      numberId: _numberId,
    }, result).$promise;
  }

  public initCallerId(options, selected, data): ng.IPromise<{selected: CallerIdOption, options: CallerIdOption[]}> {
    let _companyNumber;
    let companyNumberOption, companyCallerIdOption, customOption, directLineOption, blockOption;
    return this.listCompanyNumbers()
      .then((companyNumbers) => {
        // Company Number
        companyNumbers.filter((companyNumber) => {
          return companyNumber.externalCallerIdType === COMPANY_NUMBER_TYPE.name;
        }).map((companyNumber) => {
          companyNumberOption = new CallerIdOption(COMPANY_NUMBER_TYPE.name, new CallerIdConfig(companyNumber.uuid, companyNumber.name, companyNumber.pattern, COMPANY_NUMBER_TYPE.key));
          options.push(companyNumberOption);
          _companyNumber = companyNumber;
        });
        // Company Caller ID
        companyNumbers.filter((companyNumber) => {
          return companyNumber.externalCallerIdType === COMPANY_CALLERID_TYPE.name;
        }).map((companyNumber) => {
          companyCallerIdOption = new CallerIdOption(COMPANY_CALLERID_TYPE.name, new CallerIdConfig(companyNumber.uuid, companyNumber.name, companyNumber.pattern, COMPANY_CALLERID_TYPE.key));
          options.push(companyCallerIdOption);
          _companyNumber = companyNumber;
        });
        // Custom
        customOption = new CallerIdOption(CUSTOM_COMPANY_TYPE.name, new CallerIdConfig('', '',  '', CUSTOM_COMPANY_TYPE.key));
        options.push(customOption);
        // Block Caller ID
        blockOption = new CallerIdOption(BLOCK_CALLERID_TYPE.name, new CallerIdConfig('', this.$translate.instant('callerIdPanel.blockedCallerIdDescription'), '', BLOCK_CALLERID_TYPE.key));
        options.push(blockOption);
        // Direct Line
        if (data.line.external) {
          directLineOption = new CallerIdOption(DIRECT_LINE_TYPE.name, new CallerIdConfig('', DIRECT_LINE_TYPE.name, data.line.external, DIRECT_LINE_TYPE.key));
          options.push(directLineOption);
        }
        switch (data.callerId.externalCallerIdType) {
          case COMPANY_NUMBER_TYPE.key: {
            selected = companyNumberOption;
            break;
          }
          case COMPANY_CALLERID_TYPE.key: {
            selected = companyCallerIdOption;
            break;
          }
          case DIRECT_LINE_TYPE.key: {
            selected = directLineOption;
            break;
          }
          case CUSTOM_COMPANY_TYPE.key: {
            selected = customOption;
            break;
          }
          case BLOCK_CALLERID_TYPE.key: {
            selected = blockOption;
            break;
          }
        }
        return {
          selected: selected,
          options: options,
        };
      });
  }
  private listCompanyNumbers() {
    return this.CompanyNumberService.query({
      customerId: this.Authinfo.getOrgId(),
    }).$promise;
  }
}
