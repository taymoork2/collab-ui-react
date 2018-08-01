import { RialtoSite, RialtoCustomer, RialtoCustomerResponse } from './bsft-rialto';

interface IRialtoServiceProviderCustomerResource extends ng.resource.IResourceClass<ng.resource.IResource<any>> {}

interface IRialtoServiceProviderSiteResource extends ng.resource.IResourceClass<ng.resource.IResource<any>> {}

export class RialtoService {
  private rialtoServiceProviderCustomerResource: IRialtoServiceProviderCustomerResource;
  private rialtoServiceProviderSiteResource: IRialtoServiceProviderSiteResource;

  /* @ngInject */
  constructor(
    private $resource: ng.resource.IResourceService,
    private HuronConfig,
  ) {
    const saveAction: ng.resource.IActionDescriptor = {
      method: 'POST',
      headers: {
        Accept: 'application/json',
      },
    };

    this.rialtoServiceProviderCustomerResource = <IRialtoServiceProviderCustomerResource>this.$resource(`${this.HuronConfig.getRialtoUrl()}/sp/customer/:customerId`, {},
      {
        save: saveAction,
      });

    this.rialtoServiceProviderSiteResource = <IRialtoServiceProviderSiteResource>this.$resource(`${this.HuronConfig.getRialtoUrl()}/sp/customer/:customerId/site`, {},
      {
        save: saveAction,
      });
  }

  public saveCustomer(rialtoCustomer: RialtoCustomer) {
    return this.rialtoServiceProviderCustomerResource.save({}, rialtoCustomer).$promise;
  }

  public getCustomer(customerId: string) {
    return this.rialtoServiceProviderCustomerResource.get({
      ciorgid: customerId,
    }).$promise
      .then(response => response)
      .catch(() => new RialtoCustomerResponse());
  }

  public saveSite(customerId: string, rialtoSite: RialtoSite) {
    return this.rialtoServiceProviderSiteResource.save({
      customerId: customerId,
    }, rialtoSite).$promise;
  }

  public getSites(customerId: string) {
    return this.rialtoServiceProviderSiteResource.get({
      customerId: customerId,
    }).$promise;
  }
}
