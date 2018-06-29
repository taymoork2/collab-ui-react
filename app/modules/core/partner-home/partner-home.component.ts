import { Analytics } from 'modules/core/analytics';
import { Authinfo } from 'modules/core/scripts/services/authinfo';
import { CardUtils } from 'modules/core/cards';
import { FeatureToggleService } from 'modules/core/featureToggle';
import { Notification } from 'modules/core/notifications/notification.service';
import { IOverviewPageNotification } from 'modules/core/overview/overviewPage.types';
import { HcsFeatureAvailableNotification } from 'modules/core/partner-home/notifications';
import { UserOverviewService, IUserData } from 'modules/core/users/userOverview/userOverview.service';

type StatusTypes = 'danger' | 'warning' | 'success';

interface IState extends ng.ui.IStateService {
  modal: any;
}

interface ITrial {
  customerName: string;
  customerOrgId: string;
  daysLeft: number;
  duration: number;
  licenses: number;
  state: 'EXPIRED' | 'ACTIVE';
  usage: number;
}

class PartnerHomeController implements ng.IComponentController {
  // Default settings
  public showTrialsRefresh: boolean = true;
  public showExpired: boolean = false;
  public activeList: ITrial[] = [];
  public expiredList: ITrial[] = [];
  public notifications: any[] = [];
  public hcsFeatureToggle: boolean = false;
  public cardSize: string = 'cs-card--full';
  public isTestOrg: boolean = false;

  private readonly isCustomerPartner = !!this.Authinfo.isCustomerPartner;

  /* @ngInject */
  constructor(
    private $state: IState,
    private $translate: ng.translate.ITranslateService,
    private $window: ng.IWindowService,
    private Analytics: Analytics,
    private Authinfo: Authinfo,
    private CardUtils: CardUtils,
    private FeatureToggleService: FeatureToggleService,
    private Notification: Notification,
    private Orgservice,
    private PartnerService,
    private TrialService,
    private HcsFeatureAvailableNotification: HcsFeatureAvailableNotification,
    private UserOverviewService: UserOverviewService,
  ) {}

  public $onInit() {
    if (!this.isCustomerPartner) {
      this.getTrialsList();
    }

    this.initPartnerNotifications();

    this.Orgservice.isTestOrg()
      .then((isTestOrg) => {
        this.isTestOrg = isTestOrg;
      });
  }

  public initPartnerNotifications(): void {
    this.FeatureToggleService.supports(this.FeatureToggleService.features.atlasHostedCloudService)
      .then((result) => {
        this.hcsFeatureToggle = result;
        if (this.hcsFeatureToggle) {
          this.cardSize = 'cs-card--large';
          this.CardUtils.resize();
          return this.UserOverviewService.getUser(this.Authinfo.getUserId());
        } else {
          return;
        }
      })
      .then((response: IUserData | undefined) => {
        if (response) {
          const user = response.user;
          const isUpgrade = _.includes(user.entitlements, 'ucmgmt-uaas');
          if (!isUpgrade) {
            this.pushNotification(this.HcsFeatureAvailableNotification.createNotification(this.$state));
          }
        }
      })
      .catch((response) => {
        this.Notification.errorResponse(response, 'partnerHomePage.errGetTrialsQuery');
      });
  }

  public ariaTrialLabel(trial: ITrial) {
    const label = `${trial.customerName}, ${this.$translate.instant('partnerHomePage.aria.daysLeft', {
      count: trial.daysLeft,
    }, 'messageformat')}, ${this.$translate.instant('partnerHomePage.aria.userTotals', {
      users: trial.usage,
      licenses: trial.licenses,
    })}`;
    return label;
  }

  public ariaExpLabel(trial: ITrial) {
    const label = `${trial.customerName}, ${this.$translate.instant('partnerHomePage.aria.daysSinceExp', {
      count: this.getDaysAgo(trial.daysLeft),
    }, 'messageformat')}, ${this.$translate.instant('partnerHomePage.aria.userTotals', {
      users: trial.usage,
      licenses: trial.licenses,
    })}`;
    return label;
  }

  public getDaysAgo(daysLeft: number) {
    return Math.abs(daysLeft);
  }

  public getProgressStatus(trial: ITrial): StatusTypes {
    if (trial.daysLeft <= 5) {
      return 'danger';
    } else if (trial.daysLeft < (trial.duration / 2)) {
      return 'warning';
    } else {
      return 'success';
    }
  }

  public launchCustomerPortal(trial: ITrial) {
    this.$window.open(this.$state.href('login', {
      customerOrgId: trial.customerOrgId,
    }));
  }

  public openAddTrialModal() {
    this.Analytics.trackTrialSteps(this.Analytics.sections.TRIAL.eventNames.START_SETUP);

    const route = this.TrialService.getAddTrialRoute();
    this.$state.go(route.path, route.params).then(() => {
      this.$state.modal.result.finally(this.getTrialsList.bind(this));
    });
  }

  private getTrialsList() {
    this.showTrialsRefresh = true;
    this.TrialService.getTrialsList()
      .catch((response) => {
        this.Notification.errorResponse(response, 'partnerHomePage.errGetTrialsQuery');
      })
      .then((response) => {
        return this.PartnerService.loadRetrievedDataToList(_.get(response, 'data.trials', []), { isTrialData: true });
      })
      .then((trialsList) => {
        this.activeList = _.filter(trialsList, {
          state: 'ACTIVE',
        });
        this.expiredList = _.filter(trialsList, {
          state: 'EXPIRED',
        });
        this.showExpired = this.expiredList.length > 0;
      })
      .finally(() => {
        this.showTrialsRefresh = false;
        this.CardUtils.resize();
      });
  }

  public pushNotification(notification: IOverviewPageNotification, zOrder?: number): void {
    // Set the notification's zOrder if one is specified or does not exist
    notification.zOrder = zOrder || notification.zOrder || 0;
    this.notifications.push(notification);
  }

  public dismissNotification(notification: IOverviewPageNotification) {
    this.notifications = _.reject(this.notifications, {
      name: notification.name,
    });
    notification.dismiss();
  }
}

export class PartnerHomeComponent implements ng.IComponentOptions {
  public template = require('./partner-home.tpl.html');
  public controller = PartnerHomeController;
}
