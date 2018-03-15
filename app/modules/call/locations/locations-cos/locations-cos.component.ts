import { IRestriction, LocationCos } from 'modules/call/shared/cos';

class LocationClassOfServiceCtrl implements ng.IComponentController {
  public premiumNumbers: string;
  public premiumNumbersString: string;
  public cosRestrictions: LocationCos;
  public onChangeFn: Function;
  public locationRestrictions: IRestriction[] = [];

  private callTrial: boolean;
  private roomSystemsTrial: boolean;
  private cosTrialToggle: boolean;
  public disableControl: boolean = true;
  private NATIONAL_CALLS: string = 'DIALINGCOSTAG_NATIONAL';
  private INTERNATIONAL_CALLS: string = 'DIALINGCOSTAG_INTERNATIONAL';
  private MOBILE_CALLS: string = 'DIALINGCOSTAG_MOBILE';
  private PREMIUM_CALLS: string = 'DIALINGCOSTAG_PREMIUM';

  /* @ngInject */
  constructor(
    private $q: ng.IQService,
    private FeatureToggleService,
    private Authinfo,
  ) {}

  public $onInit(): void {
    this.disableCos();
  }

  public $onChanges(changes: { [bindings: string]: ng.IChangesObject<any> }): void {
    const { premiumNumbers, cosRestrictions } = changes;

    if (premiumNumbers && premiumNumbers.currentValue) {
      this.premiumNumbersString = _.toString(premiumNumbers.currentValue);
    }

    if (cosRestrictions && cosRestrictions.currentValue) {
      this.locationRestrictions = this.unifyRestrictions(cosRestrictions.currentValue);
    }
  }

  private unifyRestrictions(cosRestrictions: LocationCos): IRestriction[] {
    const customerRestrictions = _.get<IRestriction[]>(cosRestrictions, 'customer', []);
    const locationRestrictions = _.get<IRestriction[]>(cosRestrictions, 'location', []);
    const unifiedRestrictions: IRestriction[] = [];

    _.forEach(customerRestrictions, customerRestriction => {
      const restriction = _.find(locationRestrictions, locationRestriction => {
        return locationRestriction.restriction === customerRestriction.restriction;
      });

      if (_.isUndefined(restriction)) {
        unifiedRestrictions.push(customerRestriction);
      } else {
        unifiedRestrictions.push(restriction);
      }
    });

    return unifiedRestrictions;
  }

  public onChange(value: IRestriction): void {
    const cosRestrictionsCopy = _.cloneDeep(this.cosRestrictions);
    const index = _.findIndex(this.cosRestrictions.location, changedRestriction => {
      return _.get(changedRestriction, 'restriction', '') === value.restriction;
    });

    if (index === -1) {
      cosRestrictionsCopy.location.push(value);
    } else if (cosRestrictionsCopy.location[index].uuid) {
      cosRestrictionsCopy.location[index].blocked = value.blocked;
    } else {
      cosRestrictionsCopy.location.splice(index, 1);
    }

    this.onChangeFn({
      restrictions: cosRestrictionsCopy,
    });
  }

  public getTitle(restriction): string {
    switch (restriction) {
      case this.NATIONAL_CALLS:
        return 'serviceSetupModal.cos.nationalTitle';
      case this.INTERNATIONAL_CALLS:
        return 'serviceSetupModal.cos.internationalTitle';
      case this.MOBILE_CALLS:
        return 'serviceSetupModal.cos.mobileTitle';
      case this.PREMIUM_CALLS:
        return 'serviceSetupModal.cos.premiumTitle';
      default:
        return restriction;
    }
  }

  public getDescription(restriction): string {
    switch (restriction) {
      case this.NATIONAL_CALLS:
        return 'serviceSetupModal.cos.nationalDesc';
      case this.INTERNATIONAL_CALLS:
        return 'serviceSetupModal.cos.internationalDesc';
      case this.MOBILE_CALLS:
        return 'serviceSetupModal.cos.mobileDesc';
      case this.PREMIUM_CALLS:
        return 'serviceSetupModal.cos.premiumDesc';
      default:
        return restriction;
    }
  }

  public disableCos(): void {
    this.cosTrialToggle = this.FeatureToggleService.supports('h-cos-trial');
    this.callTrial = this.Authinfo.getLicenseIsTrial('COMMUNICATION', 'ciscouc');
    this.roomSystemsTrial = this.Authinfo.getLicenseIsTrial('SHARED_DEVICES');
    if ((!_.isUndefined(this.callTrial) && !this.callTrial) || (!_.isUndefined(this.roomSystemsTrial) && !this.roomSystemsTrial)) {
      this.disableControl = false;
    } else {
      this.$q.resolve(this.cosTrialToggle)
        .then((response) => {
          if (response) {
            this.disableControl = false;
          } else {
            this.disableControl = true;
          }
        });
    }
  }

}

export class LocationClassOfServiceComponent implements ng.IComponentOptions {
  public controller = LocationClassOfServiceCtrl;
  public template = require('modules/call/locations/locations-cos/locations-cos.component.html');
  public bindings = {
    cosRestrictions: '<',
    onChangeFn: '&',
    premiumNumbers: '<',
  };
}
