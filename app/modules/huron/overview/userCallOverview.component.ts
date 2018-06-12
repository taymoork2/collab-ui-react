import { LineService, LineConsumerType, Line, LINE_CHANGE } from 'modules/huron/lines/services';
import { IActionItem } from 'modules/core/components/sectionTitle/sectionTitle.component';
import { IFeature } from 'modules/core/components/featureList/featureList.component';
import { HuronVoicemailService, VOICEMAIL_CHANGE } from 'modules/huron/voicemail';
import { HuronUserService, UserRemoteDestination } from 'modules/huron/users';
import { PrimaryLineService, PrimaryNumber } from 'modules/huron/primaryLine';
import { Config } from 'modules/core/config/config';
const SNR_CHANGE = 'SNR_CHANGE';
const PRIMARY_LINE_SELECTION_CHANGE = 'PRIMARY_LINE_SELECTION_CHANGE';
const CLOUD_CALLING = 'cloud-calling';
class UserCallOverviewCtrl implements ng.IComponentController {

  public currentUser;
  public actionList: IActionItem[];
  public features: IFeature[];
  public directoryNumbers: Line[];
  public sipAddresses: {
    address: string,
    isPrimary: boolean,
  }[];
  public customerVmEnabled: boolean = false;
  public userVmEnabled: boolean = false;
  public hasCallFeatures: boolean = false;
  public userServices: string[] = [];
  public snrEnabled: boolean = false;
  public wide: boolean = true;
  public primaryLineEnabled: boolean = false;
  public userPrimaryNumber: PrimaryNumber;
  public isPrimaryLineFeatureEnabled: boolean = true;

  /* @ngInject */
  constructor(
    private $scope: ng.IScope,
    private $state: ng.ui.IStateService,
    private $stateParams: any,
    private $translate: ng.translate.ITranslateService,
    private Config: Config,
    private LineService: LineService,
    private HuronVoicemailService: HuronVoicemailService,
    private HuronUserService: HuronUserService,
    private PrimaryLineService: PrimaryLineService,
    private $q: ng.IQService,

  ) {
    this.currentUser = this.$stateParams.currentUser;
    this.$scope.$on(LINE_CHANGE, () => {
      this.initNumbers();
    });
    this.$scope.$on(VOICEMAIL_CHANGE, (_e, status) => {
      this.userVmEnabled = status;
      this.initFeatures();
    });
    this.$scope.$on(SNR_CHANGE, (_e, status) => {
      this.snrEnabled = status;
      this.initFeatures();
    });
    this.$scope.$on(PRIMARY_LINE_SELECTION_CHANGE, (_e, status) => {
      this.primaryLineEnabled = status;
      this.initFeatures();
    });
  }

  public $onInit(): void {
    this.mapSipAddresses();
    this.setHasCallFeatures();
    this.initActions();
    this.initNumbers();
    this.initServices();
  }

  private initActions(): void {
    this.actionList = [{
      actionKey: 'usersPreview.addNewLinePreview',
      actionFunction: () => {
        this.$state.go('user-overview.communication.line-overview');
      },
    }];
  }

  private initServices(): void {
    const promises  = {
      1: this.HuronVoicemailService.isEnabledForCustomer(),
      2: this.HuronUserService.getUserServices(this.currentUser.id),
      3: this.HuronUserService.getRemoteDestinations(this.currentUser.id),
      4: this.HuronUserService.getUserLineSelection(this.currentUser.id),
    };
    this.$q.all(promises).then( data => {
      this.customerVmEnabled = data[1];
      this.userServices = data[2];
      const rd: UserRemoteDestination[] = data[3];
      this.snrEnabled = (!_.isEmpty(rd) && rd[0].enableMobileConnect === 'true');
      this.userPrimaryNumber = data[4];
      this.checkPrimaryLineFeature(this.userPrimaryNumber);
    }).then(() => {
      this.userVmEnabled = this.HuronVoicemailService.isEnabledForUser(this.userServices);
      this.initFeatures();
    });
  }

  private initFeatures(): void {
    this.features = [];
    if (this.customerVmEnabled) {
      const vmService: IFeature = {
        name: this.$translate.instant('telephonyPreview.voicemail'),
        state: 'voicemail',
        detail: this.userVmEnabled ? this.$translate.instant('common.on') : this.$translate.instant('common.off'),
        actionAvailable: true,
      };
      this.features.push(vmService);
    }
    const snrService: IFeature = {
      name: this.$translate.instant('telephonyPreview.singleNumberReach'),
      state: 'snr',
      detail: this.snrEnabled ? this.$translate.instant('common.on') : this.$translate.instant('common.off'),
      actionAvailable: true,
    };
    this.features.push(snrService);

    const phoneButtonLayoutService: IFeature = {
      name: this.$translate.instant('telephonyPreview.phoneButtonLayout'),
      state: 'phoneButtonLayout',
      detail: undefined,
      actionAvailable: true,
    };
    this.features.push(phoneButtonLayoutService);

    const cosService: IFeature = {
      name: this.$translate.instant('serviceSetupModal.cos.title'),
      state: 'cos',
      detail: undefined,
      actionAvailable: true,
    };
    this.features.push(cosService);

    const externalTransferService: IFeature = {
      name: this.$translate.instant('telephonyPreview.externalTransfer'),
      state: 'externaltransfer',
      detail: undefined,
      actionAvailable: true,
    };
    this.features.push(externalTransferService);

    if (this.isPrimaryLineFeatureEnabled) {
      const primaryLineService: IFeature = {
        name: this.$translate.instant('primaryLine.title'),
        state: 'primaryLine',
        detail: this.primaryLineEnabled ? this.$translate.instant('primaryLine.primaryLineLabel')
                                        : this.$translate.instant('primaryLine.autoLabel'),
        actionAvailable: true,
      };
      this.features.push(primaryLineService);
    }
  }

  private mapSipAddresses(): void {
    const sipAddresses = _.chain(this.currentUser.sipAddresses)
      .filter({ type: CLOUD_CALLING })
      .map(_address => {
        return {
          address: _.get<string>(_address, 'value', ''),
          isPrimary: _.get<boolean>(_address, 'primary', false),
        };
     })
     .orderBy(['isPrimary'], ['desc'])
     .value();
    this.sipAddresses = sipAddresses;
  }

  private setHasCallFeatures(): void {
    const hasEntitlement = _.includes(this.currentUser.entitlements,  this.Config.entitlements.huron);

    const hasLicense = _.some(this.currentUser.licenseID, licenseId => {
      return _.startsWith(licenseId.toString(), this.Config.offerCodes.CO);
    });

    this.hasCallFeatures = hasEntitlement && hasLicense;
  }


  public clickFeature(feature: IFeature) {
    const lineSelection = {
      primaryLineEnabled: this.primaryLineEnabled,
      module: 'user',
    };
    this.$state.go('user-overview.communication.' + feature.state, {
      currentUser: this.currentUser,
      lineSelection: lineSelection,
    });
  }

  private initNumbers(): void {
    this.LineService.getLineList(LineConsumerType.USERS, this.currentUser.id, this.wide)
      .then(lines => this.directoryNumbers = lines);
  }

  private checkPrimaryLineFeature(userPrimaryNumber: PrimaryNumber): void {
    if (!_.isEmpty(userPrimaryNumber)) {
      this.primaryLineEnabled = userPrimaryNumber.alwaysUseForOutboundCalls;
    }
    if (!this.PrimaryLineService.checkIfMultiLineExists(this.directoryNumbers)) {
      this.isPrimaryLineFeatureEnabled = false;
    }
  }
}

export class UserCallOverviewComponent implements ng.IComponentOptions {
  public controller = UserCallOverviewCtrl;
  public template = require('modules/huron/overview/userCallOverview.html');
}
