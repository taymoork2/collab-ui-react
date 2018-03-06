import { UserCosService } from './userCos.service';
import { IRestriction } from './userCos';
import { Notification } from 'modules/core/notifications';

class UserClassOfService implements ng.IComponentController {

  private alwaysAllow: string;
  private neverAllow: string;
  private on: string;
  private off: string;
  private NATIONAL_CALLS: string = 'DIALINGCOSTAG_NATIONAL';
  private INTERNATIONAL_CALLS: string = 'DIALINGCOSTAG_INTERNATIONAL';
  private MOBILE_CALLS: string = 'DIALINGCOSTAG_MOBILE';
  private PREMIUM_CALLS: string = 'DIALINGCOSTAG_PREMIUM';
  public options = {};
  public memberType: string;
  public memberId;
  public form;
  public premiumNumbers: string;
  public loading: boolean = false;
  public saveInProcess: boolean = false;
  private changedRestrictions = new Array<any>();
  public currentRestrictions = new Array<any>();
  private callTrial: boolean;
  private roomSystemsTrial: boolean;
  private cosTrialToggle;
  public disableControl: boolean = true;

  /* @ngInject */
  constructor(
    private UserCosService: UserCosService,
    private $translate: ng.translate.ITranslateService,
    private $timeout: ng.ITimeoutService,
    private Notification: Notification,
    private $q: ng.IQService,
    private FeatureToggleService,
    private Authinfo,
  ) {}

  public $onInit(): void {
    this.alwaysAllow = this.$translate.instant('serviceSetupModal.cos.alwaysAllow');
    this.neverAllow = this.$translate.instant('serviceSetupModal.cos.neverAllow');
    this.on = this.$translate.instant('common.on');
    this.off = this.$translate.instant('common.off');

    this.UserCosService.getPremiumNumbers().then(dialPlan => {
      this.premiumNumbers = _.get(dialPlan, 'premiumNumbers', []).toString();
    });

    this.disableCos();
    this.loadRestrictions();
  }

  private loadRestrictions(): void {
    this.loading = true;
    this.UserCosService.getUserCos(this.memberType, this.memberId).then((cos) => {
      this.currentRestrictions = this.unifyRestrictions(cos);
    }).finally(() => {
      this.loading = false;
    });
  }

  private unifyRestrictions(cosRestrictions) {
    const customerCos = _.get<IRestriction[]>(cosRestrictions, 'customer', []);
    let memberCos: IRestriction[] = [];
    const unifiedRestrictions: IRestriction[] = [];

    if (_.has(cosRestrictions, 'place')) {
      memberCos = _.get(cosRestrictions, 'place', []);
    } else if (_.has(cosRestrictions, 'user')) {
      memberCos = _.get(cosRestrictions, 'user', []);
    }

    //create union of two collections with user taking priority
    _.forEach(customerCos, customerRestriction => {
      const cos = _.find(memberCos, memberRestriction => {
        return memberRestriction.restriction === customerRestriction.restriction;
      });

      this.options[customerRestriction.restriction] = {
        selected: '',
        options: [],
      };

      const customerDefaultOption = this.$translate.instant('serviceSetupModal.cos.orgSetting', {
        state: this.getSetting(customerRestriction.blocked),
      });

      if (_.isUndefined(cos)) {
        unifiedRestrictions.push(customerRestriction);
        this.options[customerRestriction.restriction].selected = customerDefaultOption;
      } else {
        unifiedRestrictions.push(cos);
        if (cos.blocked) {
          this.options[customerRestriction.restriction].selected = this.neverAllow;
        } else {
          this.options[customerRestriction.restriction].selected = this.alwaysAllow;
        }
      }

      this.options[customerRestriction.restriction].options.push(customerDefaultOption, this.alwaysAllow, this.neverAllow);
    });

    return unifiedRestrictions;
  }

  private getSetting(blocked): string {
    if (blocked) {
      return this.off;
    } else {
      return this.on;
    }
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

  public save(): void {
    this.saveInProcess = true;
    const promises: any = [];
    _.forEach(this.changedRestrictions, (restriction) => {
      //if has uuid, it is user specific
      if (restriction.uuid) {
        switch (restriction.selected) {
          case this.alwaysAllow:
            //put  w/ blocked: false
            promises.push(
              this.UserCosService.updateUserCos(this.memberId, this.memberType, restriction.uuid, {
                restriction: restriction.restriction,
                blocked: false,
              }));
            break;
          case this.neverAllow:
            //put w/ blocked: true
            promises.push(this.UserCosService.updateUserCos(this.memberId, this.memberType, restriction.uuid, {
              restriction: restriction.restriction,
              blocked: true,
            }));
            break;
          default:
            //delete w/ uuid
            promises.push(this.UserCosService.deleteUserCos(this.memberId, this.memberType, restriction.uuid));
            break;
        }
      } else {
        switch (restriction.selected) {
          case this.alwaysAllow:
            //post w/ blocked: false
            promises.push(this.UserCosService.createUserCos(this.memberId, this.memberType, {
              restriction: restriction.restriction,
              blocked: false,
            }));
            break;
          case this.neverAllow:
            //post w/ blocked: true
            promises.push(this.UserCosService.createUserCos(this.memberId, this.memberType, {
              restriction: restriction.restriction,
              blocked: true,
            }));
            break;
          default:
            //noop
            break;
        }
      }
    });
    this.$q.all(promises).then(() => {
      this.saveInProcess = false;
      this.$timeout(() => {
        this.reset();
        this.Notification.success('serviceSetupModal.cos.success');
      }, 500);
    }).catch((error) => {
      this.Notification.errorWithTrackingId(error, 'serviceSetupModal.cos.error');
    });
  }

  public reset() {
    this.changedRestrictions = [];
    this.loadRestrictions();
    this.form.$setPristine();
    this.form.$setUntouched();
  }

  public changeRestriction(newRestrictionChange: IRestriction): void {
    const indexnumber = _.findIndex(this.changedRestrictions, (changedRestriction) => {
      return _.get(changedRestriction, 'restriction', '') === newRestrictionChange.restriction;
    });

    newRestrictionChange['selected'] = this.options[newRestrictionChange.restriction].selected;

    if (indexnumber === -1) {
      this.changedRestrictions.push(newRestrictionChange);
    } else {
      this.changedRestrictions.splice(indexnumber, 1, newRestrictionChange);
    }
  }
}

export class UserClassOfServiceComponent implements ng.IComponentOptions {
  public controller = UserClassOfService;
  public template = require('modules/huron/cos/user/userCos.component.html');
  public bindings = {
    memberType: '@',
    memberId: '<',
  };
}
