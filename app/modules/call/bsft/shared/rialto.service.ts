import { Site } from './bsft-site';

interface IRialtoServiceProviderCustomerResource extends ng.resource.IResourceClass<ng.resource.IResource<any>> {}

interface IRialtoServiceProviderSiteResource extends ng.resource.IResourceClass<ng.resource.IResource<any>> {}

export class RialtoService {
  private rialtoServiceProviderCustomerResource: IRialtoServiceProviderCustomerResource;
  private rialtoServiceProviderSiteResource: IRialtoServiceProviderSiteResource;

  /* @ngInject */
  constructor(
    private $resource: ng.resource.IResourceService,
    private HuronConfig,
    private Authinfo,
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

  public saveCustomer(site: Site) {
    //TODO: samwi - create class to communicate with rialto
    const rialtoCustomer = {
      custCIOrgID: this.Authinfo.getOrgId(),
      customerName: this.Authinfo.getOrgName(),
      flexOrigin: true,
      customerAddress: {
        address1: site.address.address1,
        address2: site.address.address2,
        city: site.address.city,
        state: _.get(site, 'address.state.abbreviation'),
        postalCode: site.address.zipcode,
        country: _.get(site, 'address.country.abbreviation'),
      },
      customerContact: {
        contactFirstName: site.contact.firstName,
        contactLastName: site.contact.lastName,
        emailAddress: site.contact.email,
        telephoneNumber: {
          e164: site.contact.phoneNumber,
        },
      },
    };
    return this.rialtoServiceProviderCustomerResource.save({}, rialtoCustomer).$promise;
  }

  public getCustomer(customerId: string) {
    return this.rialtoServiceProviderCustomerResource.get({
      ciorgid: customerId,
    }).$promise;
  }

  public saveSite(customerId: string, site: Site) {
    //TODO: samwi - create class to communicate with rialto
    const rialtoSite = {
      siteName: site.name,
      siteType: 'FLEX',
      timezone: site.timeZone,
      emailAddress: site.contact.email,
      defaultSite: site.defaultLocation,
      siteAddress: {
        address1: site.address.address1,
        address2: site.address.address2,
        city: site.address.city,
        state: _.get(site, 'address.state.abbreviation'),
        postalCode: site.address.zipcode,
        country: _.get(site, 'address.country.abbreviation'),
      },
      siteContact: {
        contactFirstName: site.contact.firstName,
        contactLastName: site.contact.lastName,
        emailAddress: site.contact.email,
        telephoneNumber: {
          e164: site.contact.phoneNumber,
        },
      },
    };
    return this.rialtoServiceProviderSiteResource.save({
      customerId: customerId,
    }, rialtoSite).$promise;
  }

  public getSites(customerId: string) {
    return this.rialtoServiceProviderSiteResource.query({
      customerId: customerId,
    }).$promise;
  }
}
