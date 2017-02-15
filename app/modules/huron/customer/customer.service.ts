import { Customer, CustomerVoice } from 'modules/huron/customer';

interface ICustomerResource extends ng.resource.IResourceClass<ng.resource.IResource<Customer>> {}

interface ICustomerVoiceResource extends ng.resource.IResourceClass<ng.resource.IResource<CustomerVoice>> {}

export class HuronCustomerService {
  private customerResource: ICustomerResource;
  private customerVoiceResource: ICustomerVoiceResource;

  /* @ngInject */
  constructor(
    private $resource: ng.resource.IResourceService,
    private Authinfo,
    private HuronConfig,
  ) {

    this.customerResource = <ICustomerResource>this.$resource(this.HuronConfig.getCmiUrl() + '/common/customers/:customerId');

    this.customerVoiceResource = <ICustomerVoiceResource>this.$resource(this.HuronConfig.getCmiUrl() + '/voice/customers/:customerId');
  }

  public getCustomer() {
    return this.customerResource.get({
      customerId: this.Authinfo.getOrgId(),
    }).$promise;
  }

  public getVoiceCustomer() {
    return this.customerVoiceResource.get({
      customerId: this.Authinfo.getOrgId(),
    }).$promise;
  }
}
