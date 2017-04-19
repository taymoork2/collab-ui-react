import { IUser } from 'modules/core/auth/user/user';

interface ICmcUser extends IUser {
  phoneNumbers?: Array<any>;
}

class CmcUserDetailsSettingsController implements ng.IComponentController {

  private user: ICmcUser;
  public entitled: boolean = false;
  public showButtons: boolean = false;
  public mobile: string;


  /* @ngInject */
  constructor(private $log: ng.ILogService) {
    this.$log.debug('CmcUserDetailsSettingsController');
  }

  public $onInit() {
    this.$log.debug('$onInit');
  }

  public save(): void {
    this.showButtons = false;
  }

  public cancel(): void {
    this.showButtons = false;
  }

  public toggleClick(value): void {
    this.$log.debug('entitled', this.entitled);
    this.$log.debug('mobile', this.mobile);
    this.$log.debug('value', value);
    if (value === this.isEntitled() && this.mobile === this.mobileNumber()) {
      this.showButtons = false;
    } else {
      this.showButtons = (value && !this.entitled) || (!value && this.entitled) || (this.mobile !== this.mobileNumber());
    }
  }

  public $onChanges(changes: { [bindings: string]: ng.IChangesObject }): void {
    let userChanges = changes['user'];
    this.$log.debug('userChanges', userChanges);
    if (userChanges) {
      if (userChanges.currentValue) {
        this.user = <ICmcUser>userChanges.currentValue;
        // TODO Remove !!!
        if (this.user.userName === 'afroyhau@cisco.com') {
          this.fakeCmcAndMobileIfNotPresent();
        }
        this.entitled = this.isEntitled();
        this.mobile = this.mobileNumber();
      }
    }
  }

  private mobileNumber(): any {
    if (this.user.phoneNumbers) {
      let nbr = _.find<any>(this.user.phoneNumbers, (nbr) => {
        return nbr.type === 'mobile';
      });
      return nbr !== undefined ? nbr.value : null;
    } else {
      return null;
    }
  }

  private isEntitled(): boolean {
    return !!_.find(this.user.entitlements, (ent) => {
      return ent === 'cmc';
    });
  }

  private fakeCmcAndMobileIfNotPresent() {
    this.user.entitlements.push('cmc');
    if (!this.user.phoneNumbers) {
      this.user.phoneNumbers = [];
    }
    this.user.phoneNumbers.push({
      type: 'mobile',
      value: '+47 12345678',
    });
  }
}

export class CmcUserDetailsSettingsComponent implements ng.IComponentOptions {
  public controller = CmcUserDetailsSettingsController;
  public templateUrl = 'modules/cmc/user-details-settings.component.html';
  public bindings = {
    user: '<',
  };
}
