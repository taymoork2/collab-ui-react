import { FeatureToggleService } from 'modules/core/featureToggle';

class HybridCalendarPreferredWebexSiteCtrl implements ng.IComponentController {

  public preferredWebExSiteName: string;
  public supportsPreferredWebexSite = false;

  /* @ngInject */
  constructor(
    private FeatureToggleService: FeatureToggleService,
  ) { }

  public $onInit() {
    // See https://sqbu-github.cisco.com/WebExSquared/calendar-cloud-app/issues/5666 for tracking when to remove this feature toggle
    this.FeatureToggleService.supports(this.FeatureToggleService.features.calsvcShowPreferredSiteName)
      .then((supported) => {
        if (supported) {
          this.supportsPreferredWebexSite = true;
        }
      });
  }

}

export class HybridCalendarPreferredWebexSiteComponent implements ng.IComponentOptions {
  public controller = HybridCalendarPreferredWebexSiteCtrl;
  public template = `<div class="row collapse" ng-if="$ctrl.supportsPreferredWebexSite">
        <div class="columns small-3">
           <span class="hybrid-services-label">{{'hercules.cloudExtensions.preferredWebExSite' | translate}}:</span>
        </div>
        <div class="columns small-9">
          <span cs-loader ng-if="$ctrl.loading" class="hybrid-services-label loader-example--small"></span>
          <span ng-if="!$ctrl.loading && $ctrl.preferredWebExSiteName" class="hybrid-services-label">{{$ctrl.preferredWebExSiteName}}</span>
          <span ng-if="!$ctrl.loading && !$ctrl.preferredWebExSiteName" class="hybrid-services-label" translate="common.default"></span>
        </div>
      </div>`;
  public bindings = {
    preferredWebExSiteName: '<',
  };
}
