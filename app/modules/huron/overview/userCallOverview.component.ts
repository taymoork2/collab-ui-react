import { LineService, LineConsumerType, Line, LINE_CHANGE } from 'modules/huron/lines/services';
import { DialingService, DialingType } from 'modules/huron/dialing';
import { IActionItem } from 'modules/core/components/sectionTitle/sectionTitle.component';
import { IFeature } from 'modules/core/components/featureList/featureList.component';
import { HuronVoicemailService, VOICEMAIL_CHANGE } from 'modules/huron/voicemail';
import { HuronUserService } from 'modules/huron/users';

class UserCallOverviewCtrl implements ng.IComponentController {

  public currentUser;
  public actionList: Array<IActionItem>;
  public features: Array<IFeature>;
  public directoryNumbers: Array<Line>;
  public customerVmEnabled: boolean = false;
  public userVmEnabled: boolean = false;
  public userServices: Array<string> = [];
  private cosFeatureToggle;

  /* @ngInject */
  constructor(
    private $scope: ng.IScope,
    private $state: ng.ui.IStateService,
    private $stateParams: any,
    private $translate: ng.translate.ITranslateService,
    private LineService: LineService,
    private DialingService: DialingService,
    private HuronVoicemailService: HuronVoicemailService,
    private HuronUserService: HuronUserService,
    private $q: ng.IQService,
    private Notification,
    private FeatureToggleService,
  ) {
    this.currentUser = this.$stateParams.currentUser;
    this.$scope.$on(LINE_CHANGE, () => {
      this.initNumbers();
    });
    this.$scope.$on(VOICEMAIL_CHANGE, () => {
      this.HuronUserService.getUserServices(this.currentUser.id).then(data => {
        this.userVmEnabled  = this.HuronVoicemailService.isEnabledForUser(data);
        this.initFeatures();
      });
    });
    this.$scope.$on(DialingType.LOCAL, (_e, data) => {
      this.DialingService.setLocalDialing(data, LineConsumerType.USERS, this.currentUser.id).then(() => {
        this.DialingService.initializeDialing(LineConsumerType.USERS, this.currentUser.id).then(() => {
          this.initFeatures();
        });
      }, (response) => {
        this.Notification.errorResponse(response, 'internationalDialingPanel.error');
      });
    });
    this.$scope.$on(DialingType.INTERNATIONAL, (_e, data) => {
      this.DialingService.setInternationalDialing(data, LineConsumerType.USERS, this.currentUser.id).then(() => {
        this.DialingService.initializeDialing(LineConsumerType.USERS, this.currentUser.id).then(() => {
          this.initFeatures();
        });
      }, (response) => {
        this.Notification.errorResponse(response, 'internationalDialingPanel.error');
      });
    });
  }

  public $onInit(): void {
    this.initActions();
    let promises  = {
      1: this.DialingService.initializeDialing(LineConsumerType.USERS, this.currentUser.id),
      2: this.HuronVoicemailService.isEnabledForCustomer(),
      3: this.HuronUserService.getUserServices(this.currentUser.id),
      4: this.FeatureToggleService.supports(this.FeatureToggleService.features.huronCustomerCos),
    };
    this.$q.all(promises).then( data => {
      this.customerVmEnabled = data[2];
      this.userServices = data[3];
      this.cosFeatureToggle = data[4];
    }).then( () => {
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
      let vmService: IFeature = {
        name: this.$translate.instant('telephonyPreview.voicemail'),
        state: 'voicemail',
        detail: this.userVmEnabled ? this.$translate.instant('common.on') : this.$translate.instant('common.off'),
        actionAvailable: true,
      };
      this.features.push(vmService);
    }

    let service: IFeature = {
      name: this.$translate.instant('telephonyPreview.speedDials'),
      state: 'speedDials',
      detail: undefined,
      actionAvailable: true,
    };
    this.features.push(service);
    if (!this.cosFeatureToggle) {
      service = {
        name: this.$translate.instant('telephonyPreview.internationalDialing'),
        state: 'internationalDialing',
        detail: this.DialingService.getInternationalDialing(LineConsumerType.USERS),
        actionAvailable: true,
      };
      this.features.push(service);
      service = {
        name: this.$translate.instant('telephonyPreview.localDialing'),
        state: 'local',
        detail: this.DialingService.getLocalDialing(LineConsumerType.USERS),
        actionAvailable: true,
      };
      this.features.push(service);
    }
    if (this.cosFeatureToggle) {
      service = {
        name: this.$translate.instant('serviceSetupModal.cos.title'),
        state: 'cos',
        detail: undefined,
        actionAvailable: true,
      };
      this.features.push(service);
    }
  }

  public clickFeature(feature: IFeature) {
    this.$state.go('user-overview.communication.' + feature.state, {
      watcher: feature.state === 'local' ? DialingType.LOCAL : DialingType.INTERNATIONAL,
      selected: feature.state === 'local' ? this.DialingService.getLocalDialing(LineConsumerType.USERS) : this.DialingService.getInternationalDialing(LineConsumerType.USERS),
      currentUser: this.currentUser,
    });
  }

  private initNumbers(): void {
    this.LineService.getLineList(LineConsumerType.USERS, this.currentUser.id)
      .then(lines => this.directoryNumbers = lines);
  }
}

export class UserCallOverviewComponent implements ng.IComponentOptions {
  public controller = UserCallOverviewCtrl;
  public templateUrl = 'modules/huron/overview/userCallOverview.html';
}
