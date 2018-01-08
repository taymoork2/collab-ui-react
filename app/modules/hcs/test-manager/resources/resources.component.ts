import { IToolkitModalService } from 'modules/core/modal';
import { HcsTestManagerService, HtmResource } from '../shared';
import { CardUtils } from 'modules/core/cards';
import { State } from 'modules/hcs/test-manager/taskManager.const';

export class TaasResourceViewComponent implements ng.IComponentOptions {
  public controller = TaasResourceViewCtrl;
  public template = require('./resources.component.html');
}

export class TaasResourceViewCtrl implements ng.IComponentController {
  public readonly STATE_NEW = State.New;
  public readonly STATE_LOADING = State.Loading;
  public readonly STATE_RELOAD = State.Reload;
  public readonly STATE_SHOW = State.Show;
  public pageState: State = State.Loading;
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
        this.pageState = State.New;
      } else {
        this.pageState = State.Show;
      }
      this.reInstantiateMasonry();
    }).catch(() => this.handleFailures());
  }

  public handleFailures(): void {
    this.showReloadPageIfNeeded();
  }

  public showReloadPageIfNeeded(): void {
    if (this.pageState === State.Loading) {
      this.pageState = State.Reload;
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
