import { BmmpService } from 'modules/bmmp/bmmp.service';
import { ProPackService } from 'modules/core/proPack/proPack.service';
import { LearnMoreBannerService } from './learnMoreBanner.service';

abstract class LearnMoreAbstractBanner implements ng.IComponentController {
  public isReadOnly: boolean;
  protected isProPackEnabledNotPurchased: boolean;
  protected location: string;

  // watches
  private stateWatchDeregister: Function;
  private elementWatchDeregister: Function;

  /* @ngInject */
  constructor(
    private $element: ng.IRootElementService,
    private $scope: ng.IScope,
    protected $state: ng.ui.IStateService,
    private Analytics,
    protected Authinfo,
    private BmmpService: BmmpService,
    private ProPackService: ProPackService,
    protected LearnMoreBannerService: LearnMoreBannerService,
  ) { }

  public $onInit(): void {
    this.isReadOnly = this.Authinfo.isReadOnlyAdmin();

    this.ProPackService.hasProPackEnabledAndNotPurchased().then((toggle: boolean): void => {
      this.isProPackEnabledNotPurchased = toggle;

      if (this.isProPackEnabledNotPurchased) {
        this.stateWatchDeregister = this.$scope.$watch((): string | undefined => {
          return this.$state.current.name;
        }, (): void => {
          if (this.show()) {
            this.BmmpService.init();
          }
        });

        this.elementWatchDeregister = this.$scope.$watch((): boolean => {
          return this.LearnMoreBannerService.isElementVisible(this.location, this.$element.find(this.LearnMoreBannerService.CLOSE_ELEMENTS[this.location]));
        }, (visible: boolean): void => {
          if (visible) {
            this.setFunctions();
          }
        });
      }
    });
  }

  private setFunctions(): void {
    this.$element.find(this.LearnMoreBannerService.CLOSE_ELEMENTS[this.location]).on('click', (): void => {
      this.Analytics.trackPremiumEvent(this.Analytics.sections.PREMIUM.eventNames.BMMP_DISMISSAL, `${this.location}_banner`);
      this.stateWatchDeregister();
      this.elementWatchDeregister();
    });

    this.$element.find(this.LearnMoreBannerService.LINK_ELEMENTS[this.location]).on('click', (): void => {
      this.Analytics.trackPremiumEvent(this.Analytics.sections.PREMIUM.eventNames.LEARN_MORE, `${this.location}_banner`);
    });
  }

  public abstract show(): boolean;
}

class LearnMoreOverviewCtrl extends LearnMoreAbstractBanner {
  /* @ngInject */
  constructor(
    $element: ng.IRootElementService,
    $scope: ng.IScope,
    $state: ng.ui.IStateService,
    Analytics,
    Authinfo,
    BmmpService: BmmpService,
    ProPackService: ProPackService,
    LearnMoreBannerService: LearnMoreBannerService,
  ) {
    super($element, $scope, $state, Analytics, Authinfo, BmmpService, ProPackService, LearnMoreBannerService);
  }

  public $onInit(): void {
    this.location = this.LearnMoreBannerService.OVERVIEW_LOCATION;
    super.$onInit();
  }

  public show(): boolean {
    return (this.$state.current.name === this.location) && this.isProPackEnabledNotPurchased && this.Authinfo.isEnterpriseCustomer();
  }
}

class LearnMoreReportsCtrl extends LearnMoreAbstractBanner {
  /* @ngInject */
  constructor(
    $element: ng.IRootElementService,
    $scope: ng.IScope,
    $state: ng.ui.IStateService,
    Analytics,
    Authinfo,
    BmmpService: BmmpService,
    ProPackService: ProPackService,
    LearnMoreBannerService: LearnMoreBannerService,
  ) {
    super($element, $scope, $state, Analytics, Authinfo, BmmpService, ProPackService, LearnMoreBannerService);
  }

  public $onInit(): void {
    this.location = this.LearnMoreBannerService.REPORTS_LOCATION;
    super.$onInit();
  }

  public show(): boolean {
    return (this.$state.current.name === 'reports.spark') && this.isProPackEnabledNotPurchased && this.Authinfo.isEnterpriseCustomer();
  }
}

export class LearnMoreOverviewComponent implements ng.IComponentOptions {
  public template = `<div class="overview-bmmp-banner cs-alert-banner--info" ng-if="$ctrl.show()" ng-class="{ 'readonly': $ctrl.isReadOnly }">
    <div class="cisco-bmmp-marketing-closeable-widget"
      data-application-page="overview"
      data-widget-location="top-bar"
      data-close-handler="closeWidget();"
      data-styled="true">
    </div>
  </div>`;
  public controller = LearnMoreOverviewCtrl;
  public bindings = {};
}

export class LearnMoreReportsComponent implements ng.IComponentOptions {
  public template = `<div class="reports-bmmp-banner" ng-if="$ctrl.show()" ng-class="{ 'readonly': $ctrl.isReadOnly }">
    <div class="cisco-bmmp-marketing-closeable-widget"
      data-application-page="reports"
      data-widget-location="top-bar"
      data-close-handler="closeWidget();"
      data-styled="true">
    </div>
  </div>`;
  public controller = LearnMoreReportsCtrl;
  public bindings = {};
}
