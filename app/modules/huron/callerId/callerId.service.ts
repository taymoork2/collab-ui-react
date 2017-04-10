import { ICallerID } from './index';
import { CallerIdOption } from './callerId.component';
import { LineConsumerType } from './../lines/services';

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

  public getCallerId(_type: LineConsumerType, _typeId: string, _numberId: string): ng.IPromise<ICallerID> {
    return this.callerIDService.get({
      customerId: this.Authinfo.getOrgId(),
      type: _type,
      typeId: _typeId,
      numberId: _numberId,
    }).$promise;
  }

  public updateCallerId(_type: LineConsumerType, _typeId: string, _numberId: string | undefined, data: CallerIdOption) {
    let result: any = _.cloneDeep(data);
    delete result.url;
    return this.callerIDService.update({
      customerId: this.Authinfo.getOrgId(),
      type: _type,
      typeId: _typeId,
      numberId: _numberId,
    }, result).$promise;
  }

  public listCompanyNumbers() {
    return this.CompanyNumberService.query({
      customerId: this.Authinfo.getOrgId(),
    }).$promise;
  }
}
