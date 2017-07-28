import { BmmpService } from 'modules/bmmp/bmmp.service';
import { ProPackService } from 'modules/core/proPack/proPack.service';
import { LearnMoreBannerService } from './learnMoreBanner.service';

class LearnMoreBannerCtrl {
  public location: string;
  public isReadOnly: boolean;
  private isProPackEnabledNotPurchased: boolean;

  // watches
  private stateWatchDeregister: Function;
  private elementWatchDeregister: Function;

  /* @ngInject */
  constructor(
    private $element: ng.IRootElementService,
    private $scope: ng.IScope,
    private $state: ng.ui.IStateService,
    private Analytics,
    private Authinfo,
    private BmmpService: BmmpService,
    private ProPackService: ProPackService,
    private LearnMoreBannerService: LearnMoreBannerService,
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

  public show(): boolean {
    const name: string | undefined = this.$state.current.name;
    if (name && name.indexOf(this.location) > -1) {
      return this.isProPackEnabledNotPurchased;
    } else {
      return false;
    }
  }

  public isOverview(): boolean {
    return this.location === this.LearnMoreBannerService.HEADER_LOCATION;
  }

  public isReports(): boolean {
    return this.location === this.LearnMoreBannerService.REPORTS_LOCATION;
  }

  public isEnterpriseCustomer(): boolean {
    return this.Authinfo.isEnterpriseCustomer();
  }
}

export class LearnMoreBannerComponent implements ng.IComponentOptions {
  public templateUrl = 'modules/bmmp/learn-more-banner/learnMoreBanner.tpl.html';
  public controller = LearnMoreBannerCtrl;
  public bindings = {
    location: '@',
  };
}
