import { Line } from '../lines/services';

class DirectoryNumberListCtrl implements ng.IComponentController {

  public directoryNumbers: Line[];
  private primaryLabel: string;
  private primarySharedLabel: string;
  private sharedLabel: string;
  private lineThreshold: number;
  public numberOfLines: number | undefined = this.lineThreshold;
  public lineLabelToggle: boolean;
  public isHI1484: boolean = false;

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
    private FeatureToggleService,
  ) {
    this.primaryLabel = this.$translate.instant('helpdesk.primary');
    this.primarySharedLabel = this.$translate.instant('helpdesk.primaryShared');
    this.sharedLabel = this.$translate.instant('helpdesk.shared');
  }

  public $onInit(): void {
    this.FeatureToggleService.supports(this.FeatureToggleService.features.hI1484)
      .then(result => this.isHI1484 = result);
  }

  public setLineUseLabel(primary: boolean, shared: boolean): string {
    if (primary && shared) {
      return this.primarySharedLabel;
    } else if (primary) {
      return this.primaryLabel;
    } else if (shared) {
      return this.sharedLabel;
    } else {
      return '';
    }
  }

  public showMoreClicked(): void {
    this.numberOfLines = undefined;
  }

  public showLessClicked(): void {
    this.numberOfLines = this.lineThreshold;
  }

  public showMoreButton(): boolean {
    if (this.directoryNumbers) {
      return (this.directoryNumbers.length > this.lineThreshold && this.numberOfLines === this.lineThreshold);
    } else {
      return false;
    }
  }

  public showLessButton(): boolean {
    if (this.directoryNumbers) {
      return (this.directoryNumbers.length > this.lineThreshold && this.numberOfLines === undefined);
    } else {
      return false;
    }
  }
}

angular
  .module('Huron')
  .component('directoryNumberList', {
    template: require('modules/huron/overview/directoryNumberList.html'),
    controller: DirectoryNumberListCtrl,
    bindings: {
      directoryNumbers: '<',
      directoryNumberSref: '@',
      lineThreshold: '@',
      voicemailEnabled: '<',
      onDirectoryNumberClick: '&',
    },
  });
