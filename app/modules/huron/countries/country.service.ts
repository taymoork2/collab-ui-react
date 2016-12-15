import { ICountry } from './country';

interface ICountryResource extends ng.resource.IResourceClass<ng.resource.IResource<ICountry>> {}

export class HuronCountryService {
  private countryResource: ICountryResource;
  private countries: Array<ICountry>;

  /* @ngInject */
  constructor(
    private $resource: ng.resource.IResourceService,
    private HuronConfig,
    private $q: ng.IQService,
  ) {
    this.countryResource = <ICountryResource>this.$resource(`${this.HuronConfig.getCmiV2Url()}/lists/countries`);
  }

  public getCountryList(): ng.IPromise<Array<ICountry>> {
    if (!this.countries) {
      return this.fetchCountryList();
    }
    return this.$q.resolve(this.countries);
  }

  private fetchCountryList(): ng.IPromise<Array<ICountry>> {
    let countries;
    return this.countryResource.get({}).$promise
      .then(countryList => {
        countries = _.get(countryList, 'countries', []);
        this.countries = countries;
        return this.countries;
      });
  }
}
