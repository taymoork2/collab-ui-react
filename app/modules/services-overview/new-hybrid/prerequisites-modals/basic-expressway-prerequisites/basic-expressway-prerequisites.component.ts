import { HybridServicesFlagService } from 'modules/hercules/services/hs-flag-service';
import { Notification } from 'modules/core/notifications';

export class BasicExpresswayPrerequisitesComponentController implements ng.IComponentController {

  public onChange: Function;
  private flagPrefix = 'atlas.hybrid.setup.call.expressway.';
  public checkboxes = {
    planCapacity: false,
    redundancy: false,
    followRequirements: false,
    bypassFirstTimeWizard: false,
    configureExpresswayC: false,
    openPortOnFirewall: false,
  };

  /* @ngInject */
  constructor(
    private $scope: ng.IScope,
    private $window: ng.IWindowService,
    private HybridServicesFlagService: HybridServicesFlagService,
    private Notification: Notification,
  ) {}

  public $onInit(): void {
    this.readflags()
      .catch((error) => {
        this.Notification.errorWithTrackingId(error, 'servicesOverview.cards.hybridCall.prerequisites.cannotReachFlagService');
      })
      .finally(() => {
        this.setupWatch();
      });
  }

  private getPrefixedFlags(): string[] {
    return _.map(Object.keys(this.checkboxes), (checkbox) => `${this.flagPrefix}${checkbox}`);
  }

  private readflags(): ng.IPromise<void> {
    const flags = this.getPrefixedFlags();
    return this.HybridServicesFlagService.readFlags(flags)
      .then((rawFlags) => {
        _.forEach(rawFlags, (flag) => {
          this.checkboxes[flag.name.replace(this.flagPrefix, '')] = flag.raised;
        });
      });
  }

  private setupWatch(): void {
    this.$scope.$watch(() => this.checkboxes, (newValue, oldValue) => {
      _.forEach(Object.keys(this.checkboxes), (flagName) => {
        if (oldValue[flagName] !== newValue[flagName]) {
          if (newValue[flagName]) {
            this.HybridServicesFlagService.raiseFlag(`${this.flagPrefix}${flagName}`);
          } else {
            this.HybridServicesFlagService.lowerFlag(`${this.flagPrefix}${flagName}`);
          }
        }
      });
      this.onChange({
        options: {
          numberChecked: this.getNumberOfCheckboxes(newValue),
          totalNumber: Object.keys(this.checkboxes).length,
        },
      });
    }, true);
  }

  private getNumberOfCheckboxes(checkboxes): number {
    return _.reduce(checkboxes, (sumTotalChecked, isChecked) => isChecked ? sumTotalChecked + 1 : sumTotalChecked, 0);
  }

  public openDocumentation(): void {
    this.$window.open('https://www.cisco.com/c/en/us/td/docs/voice_ip_comm/cloudCollaboration/spark/hybridservices/callservices/cmgt_b_ciscospark-hybrid-call-service-config-guide/cmgt_b_ciscospark-hybrid-call-service-config-guide_chapter_011.html');
  }

}

export class BasicExpresswayPrerequisitesComponent implements ng.IComponentOptions {
  public controller = BasicExpresswayPrerequisitesComponentController;
  public templateUrl = 'modules/services-overview/new-hybrid/prerequisites-modals/basic-expressway-prerequisites/basic-expressway-prerequisites.component.html';
  public bindings = {
    onChange: '&',
  };
}
