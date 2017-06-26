import { LineService, LineConsumerType, Line, LINE_CHANGE } from 'modules/huron/lines/services';
import { IActionItem } from 'modules/core/components/sectionTitle/sectionTitle.component';
import { IFeature } from 'modules/core/components/featureList/featureList.component';
import { HuronVoicemailService, VOICEMAIL_CHANGE } from 'modules/huron/voicemail';
import { HuronUserService, UserRemoteDestination } from 'modules/huron/users';
const SNR_CHANGE = 'SNR_CHANGE';
class UserCallOverviewCtrl implements ng.IComponentController {

  public currentUser;
  public actionList: IActionItem[];
  public features: IFeature[];
  public directoryNumbers: Line[];
  public customerVmEnabled: boolean = false;
  public userVmEnabled: boolean = false;
  public userServices: string[] = [];
  private externalTransferFeatureToggle;
  public snrEnabled: boolean = false;
  public wide: boolean = true;

  /* @ngInject */
  constructor(
    private $scope: ng.IScope,
    private $state: ng.ui.IStateService,
    private $stateParams: any,
    private $translate: ng.translate.ITranslateService,
    private LineService: LineService,
    private HuronVoicemailService: HuronVoicemailService,
    private HuronUserService: HuronUserService,
    private $q: ng.IQService,
    private FeatureToggleService,

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
  }

  public $onInit(): void {
    this.initActions();
    const promises  = {
      1: this.HuronVoicemailService.isEnabledForCustomer(),
      2: this.HuronUserService.getUserServices(this.currentUser.id),
      3: this.HuronUserService.getRemoteDestinations(this.currentUser.id),
      4: this.FeatureToggleService.supports(this.FeatureToggleService.features.hi1033),
    };
    this.$q.all(promises).then( data => {
      this.customerVmEnabled = data[1];
      this.userServices = data[2];
      const rd: UserRemoteDestination[] = data[3];
      this.snrEnabled = (!_.isEmpty(rd) && rd[0].enableMobileConnect === 'true');
      this.externalTransferFeatureToggle = data[4];
    }).then(() => {
      this.userVmEnabled = this.HuronVoicemailService.isEnabledForUser(this.userServices);
      this.initFeatures();
    });
    this.initNumbers();
  }

  private initActions(): void {
    this.actionList = [{
      actionKey: 'usersPreview.addNewLinePreview',
      actionFunction: () => {
        this.$state.go('user-overview.communication.line-overview');
      },
    }];
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

    let service: IFeature = {
      name: this.$translate.instant('telephonyPreview.speedDials'),
      state: 'speedDials',
      detail: undefined,
      actionAvailable: true,
    };
    this.features.push(service);

    const cosService: IFeature = {
      name: this.$translate.instant('serviceSetupModal.cos.title'),
      state: 'cos',
      detail: undefined,
      actionAvailable: true,
    };
    this.features.push(cosService);
    if (this.externalTransferFeatureToggle) {
      service = {
        name: this.$translate.instant('telephonyPreview.externalTransfer'),
        state: 'externaltransfer',
        detail: undefined,
        actionAvailable: true,
      };
      this.features.push(service);
    }
  }

  public clickFeature(feature: IFeature) {
    this.$state.go('user-overview.communication.' + feature.state, {
      currentUser: this.currentUser,
    });
  }

  private initNumbers(): void {
    this.LineService.getLineList(LineConsumerType.USERS, this.currentUser.id, this.wide)
      .then(lines => this.directoryNumbers = lines);
  }
}

export class UserCallOverviewComponent implements ng.IComponentOptions {
  public controller = UserCallOverviewCtrl;
  public templateUrl = 'modules/huron/overview/userCallOverview.html';
}
