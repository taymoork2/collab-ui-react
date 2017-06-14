export const JSON_US: string = 'modules/huron/pstn/pstnAreaService/states.json';
export const JSON_CA: string = 'modules/huron/pstn/pstnAreaService/provinces.json';
export const CCODE_US: string = 'US';
export const CCODE_CA: string = 'CA';

export interface IArea {
  name: string;
  abbreviation: string;
}

export interface IAreaData {
  zipName: string;
  typeName: string;
  areas: IArea[];
}

export class PstnAreaService {
  /* @ngInject */
  constructor (
    private $q,
    private $http,
    private $translate,
  ) {}

  public getStates(): ng.IPromise<any> {
    return this.$http.get(JSON_US);
  }

  public getProvinces(): ng.IPromise<any> {
    return this.$http.get(JSON_CA);
  }

  private createLocation(zipKey: string, typeKey: string, areas: IArea[]): IAreaData {
    return {
      zipName: this.$translate.instant(zipKey),
      typeName: this.$translate.instant(typeKey),
      areas: areas,
    };
  }

  public getCountryAreas(countryCode): ng.IPromise<IAreaData> {
    let defer = this.$q.defer();
    switch (countryCode) {
      case CCODE_CA:
        this.getProvinces().then((areas) => {
          defer.resolve(this.createLocation('pstnSetup.postal', 'pstnSetup.province', areas.data));
        });
        break;
      case CCODE_US:
      default:
        this.getStates().then((areas) => {
          defer.resolve(this.createLocation('pstnSetup.zip', 'pstnSetup.state', areas.data));
        });
        break;
    }
    return defer.promise;
  }
}
