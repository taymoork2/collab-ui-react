import { Customer, CustomerVoice } from 'modules/huron/customer';

interface ICustomerResource extends ng.resource.IResourceClass<ng.resource.IResource<Customer>> {
  update: ng.resource.IResourceMethod<ng.resource.IResource<void>>;
}

interface ICustomerVoiceResource extends ng.resource.IResourceClass<ng.resource.IResource<CustomerVoice>> {
  update: ng.resource.IResourceMethod<ng.resource.IResource<void>>;
}

export class HuronCustomerService {
  private customerResource: ICustomerResource;
  private customerVoiceResource: ICustomerVoiceResource;

  /* @ngInject */
  constructor(
    private $resource: ng.resource.IResourceService,
    private Authinfo,
    private HuronConfig,
  ) {

    let updateAction: ng.resource.IActionDescriptor = {
      method: 'PUT',
    };

    this.customerResource = <ICustomerResource>this.$resource(this.HuronConfig.getCmiUrl() + '/common/customers/:customerId', {},
      {
        update: updateAction,
      });

    this.customerVoiceResource = <ICustomerVoiceResource>this.$resource(this.HuronConfig.getCmiUrl() + '/voice/customers/:customerId', {},
      {
        update: updateAction,
      });
  }

  public getCustomer(): ng.IPromise<Customer> {
    return this.customerResource.get({
      customerId: this.Authinfo.getOrgId(),
    }).$promise;
  }

  public updateCustomer(customer: Customer): ng.IPromise<void> {
    return this.customerResource.update({
      customerId: this.Authinfo.getOrgId(),
    }, {
      servicePackage: _.get(customer, 'servicePackage'),
      voicemail: _.get(customer, 'voicemail'),
    }).$promise;
  }

  public getVoiceCustomer(): ng.IPromise<CustomerVoice> {
    return this.customerVoiceResource.get({
      customerId: this.Authinfo.getOrgId(),
    }).$promise;
  }

  public updateVoiceCustomer(customer: CustomerVoice): ng.IPromise<void> {
    return this.customerVoiceResource.update({
      customerId: this.Authinfo.getOrgId(),
    }, {
      regionCode: customer.regionCode,
    }).$promise;
  }

}
