import { IToolkitModalService } from 'modules/core/modal';
import { HcsTestManagerService, HtmResource } from '../shared';
import { CardUtils } from 'modules/core/cards';

export class TaasResourceViewComponent implements ng.IComponentOptions {
  public controller = TaasResourceViewCtrl;
  public template = require('./resources.component.html');
}

export class TaasResourceViewCtrl implements ng.IComponentController {
  public readonly STATE_NEW: string     = 'NEW';
  public readonly STATE_LOADING: string = 'LOADING';
  public readonly STATE_SHOW: string    = 'SHOW';
  public readonly STATE_RELOAD: string  = 'RELOAD';

  public pageState: string = this.STATE_LOADING;
  public backState = 'taasSuites';
  public resources: HtmResource[] = [];

  /* @ngInject */
  constructor(
    private HcsTestManagerService: HcsTestManagerService,
    private CardUtils: CardUtils,
    private $state: ng.ui.IStateService,
    public $modal: IToolkitModalService,
    public $q: ng.IQService,
    ) {}

  public $onInit(): void {
    this.HcsTestManagerService.getResources()
    .then(resources => {
      this.resources = resources;
      if (this.resources.length === 0) {
        this.pageState = this.STATE_NEW;
      } else {
        this.pageState = this.STATE_SHOW;
      }
      this.reInstantiateMasonry();
    }).catch(() => this.handleFailures());
  }

  public handleFailures(): void {
    this.showReloadPageIfNeeded();
  }

  public showReloadPageIfNeeded(): void {
    if (this.pageState === this.STATE_LOADING) {
      this.pageState = this.STATE_RELOAD;
    }
  }

  public reInstantiateMasonry(): void {
    this.CardUtils.resize();
  }

  public reload(): void {
    this.$state.go(this.$state.current, {}, {
      reload: true,
    });
  }

  public createResource(): void {
    this.$state.go('taasServiceManager.resourceCreate');
  }

}
