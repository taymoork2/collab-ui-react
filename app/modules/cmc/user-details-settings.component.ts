import { CmcUserData } from './cmcUserData';
import { CmcService } from './cmc.service';
import { IUser } from 'modules/core/auth/user/user';

interface ICmcUser extends IUser {
  phoneNumbers?: Array<any>;
}

class CmcUserDetailsSettingsController implements ng.IComponentController {

  private user: ICmcUser;
  public entitled: boolean = false;
  public showButtons: boolean = false;
  public mobileNumber: string;
  private oldCmcUserData: CmcUserData;

  /* @ngInject */
  constructor(private $log: ng.ILogService,
              private CmcService: CmcService) {
    this.$log.debug('CmcUserDetailsSettingsController');
  }

  public $onInit() {
    this.$log.debug('$onInit');
    this.extractCmcData();
    this.oldCmcUserData = new CmcUserData(this.mobileNumber, this.entitled);
    this.$log.warn('Current user:', this.user);
  }

  private extractCmcData() {
    this.entitled = this.extractCmcEntitlement();
    this.mobileNumber = this.extractMobileNumber();
    this.$log.info('Mobile number from user object:', this.mobileNumber);
    // TODO: Remove these overrides below when data are properly
    //       populated in the backend
    let persistedCmcData: CmcUserData = this.CmcService.getData(this.user.id);
    this.entitled = persistedCmcData.entitled;
    this.mobileNumber = persistedCmcData.mobileNumber;
  }

  //TODO: Not supposed to happen.
  //      Are we sure that we handle things correctly when user changes
  //      while we're in the cmc settings page for the user.
  //      For example in the middle of a save dialog...
  public $onChanges(changes: { [bindings: string]: ng.IChangesObject }): void {
    let userChanges = changes['user'];
    this.$log.warn('user changed unexpectedly:', userChanges);
    if (userChanges) {
      if (userChanges.currentValue) {
        this.user = <ICmcUser>userChanges.currentValue;
        this.extractCmcData();
      }
    }
  }

  private extractMobileNumber(): any {
    if (this.user.phoneNumbers) {
      let nbr = _.find<any>(this.user.phoneNumbers, (nbr) => {
        return nbr.type === 'mobile';
      });
      return nbr !== undefined ? nbr.value : null;
    } else {
      return null;
    }
  }

  private extractCmcEntitlement(): boolean {
    return _.includes(this.user.entitlements, 'cmc');
  }

  public save(): void {
    this.showButtons = false;

    let newData = new CmcUserData(this.mobileNumber, this.entitled);
    this.$log.warn('trying to set data', newData, ', id=', this.user.id);
    this.CmcService.setData(this.user.id, newData);

    this.oldCmcUserData.entitled = this.entitled;
    this.oldCmcUserData.mobileNumber = this.mobileNumber;

  }

  public cancel(): void {
    this.showButtons = false;
    this.entitled = this.oldCmcUserData.entitled;
    this.mobileNumber = this.oldCmcUserData.mobileNumber;
  }

  public dataChanged(): void {
    this.showButtons = true;
  }
}

export class CmcUserDetailsSettingsComponent implements ng.IComponentOptions {
  public controller = CmcUserDetailsSettingsController;
  public templateUrl = 'modules/cmc/user-details-settings.component.html';
  public bindings = {
    user: '<',
  };
}
