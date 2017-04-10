import { ICountry } from './country';

interface ICountryResource extends ng.resource.IResourceClass<ng.resource.IResource<ICountry>> {}

export class HuronCountryService {
  private countryResource: ICountryResource;
  private hardCodedCountryResource: ICountryResource;
  private countries: Array<ICountry>;

  /* @ngInject */
  constructor(
    private $resource: ng.resource.IResourceService,
    private HuronConfig,
    private $q: ng.IQService,
  ) {
    this.countryResource = <ICountryResource>this.$resource(`${this.HuronConfig.getCmiV2Url()}/lists/countries`);
    this.hardCodedCountryResource = <ICountryResource>this.$resource('modules/huron/countries/countryList.json');
  }

  public getCountryList(): ng.IPromise<Array<ICountry>> {
    if (!this.countries) {
      return this.fetchCountryList();
    }
    return this.$q.resolve(this.countries);
  }

  // TODO (jlowery): Remove this after country selection in order processing is moved
  // to the commerce application.
  public getHardCodedCountryList(): ng.IPromise<Array<ICountry>> {
    return this.hardCodedCountryResource.query({}).$promise
      .then(countries => {
        return _.map(countries, country => {
          return {
            id: _.get(country, 'id'),
            name: _.get(country, 'name'),
            domain: _.get(country, 'domain'),
          };
        });
      });
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
