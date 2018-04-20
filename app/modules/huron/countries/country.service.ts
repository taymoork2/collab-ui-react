import { ICountry } from './country';

interface ICountryResource extends ng.resource.IResourceClass<ng.resource.IResource<ICountry>> {}

export class HuronCountryService {
  private countryResource: ICountryResource;
  private countries: ICountry[];

  /* @ngInject */
  constructor(
    private $resource: ng.resource.IResourceService,
    private HuronConfig,
    private $q: ng.IQService,
    private Authinfo,
  ) {
    this.countryResource = <ICountryResource>this.$resource(`${this.HuronConfig.getCmiV2Url()}/customers/:customerId/countries`, { customerId: '@customerId' });
  }

  public getCountryList(): ng.IPromise<ICountry[]> {
    if (!this.countries) {
      return this.fetchCountryList();
    }
    return this.$q.resolve(this.countries);
  }

  // TODO (jlowery): Remove this after country selection in order processing is moved
  // to the commerce application.
  public getHardCodedCountryList(): ng.IPromise<ICountry[]> {
    return this.$q.resolve(require('./countryList.json'))
      .then(countries => {
        return _.map(countries, country => {
          return {
            id: _.get<string>(country, 'id'),
            name: _.get<string>(country, 'name'),
            domain: _.get<string>(country, 'domain'),
          };
        });
      });
  }

  private fetchCountryList(): ng.IPromise<ICountry[]> {
    let countries;
    return this.countryResource.get({
      customerId: this.Authinfo.getUserOrgId(),
    }).$promise
      .then(countryList => {
        countries = _.get(countryList, 'countries', []);
        this.countries = countries;
        return this.countries;
      });
  }
}
