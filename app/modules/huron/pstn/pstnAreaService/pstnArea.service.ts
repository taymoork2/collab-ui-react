export const CCODE_US: string = 'US';
export const CCODE_CA: string = 'CA';

export interface IArea {
  name: string;
  abbreviation: string;
}

export class Area implements IArea {
  public name: string;
  public abbreviation: string;
  constructor(name: string, abbreviation: string) {
    this.name = name;
    this.abbreviation = abbreviation;
  }
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
    private $translate,
  ) {}

  public getStates(): ng.IPromise<any> {
    return this.$q.resolve(require('./states.json'));
  }

  public getProvinces(): ng.IPromise<any> {
    return this.$q.resolve(require('./provinces.json'));
  }

  private createLocation(zipKey: string, typeKey: string, areas: IArea[]): IAreaData {
    return {
      zipName: this.$translate.instant(zipKey),
      typeName: this.$translate.instant(typeKey),
      areas: areas,
    };
  }

  public getCountryAreas(countryCode): ng.IPromise<IAreaData> {
    switch (countryCode) {
      case CCODE_CA:
        return this.getProvinces().then(areas => {
          return this.$q.resolve(this.createLocation('pstnSetup.postal', 'pstnSetup.province', areas));
        });
      case CCODE_US:
      default:
        return this.getStates().then(areas => {
          return this.$q.resolve(this.createLocation('pstnSetup.zip', 'pstnSetup.state', areas));
        });
    }
  }
}
