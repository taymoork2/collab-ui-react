import { CoreEvent } from 'modules/core/shared/event.constants';

class BannerController implements ng.IComponentController {
  /* @ngInject */
  constructor(
    private $rootScope: ng.IRootScopeService,
  ) {}

  public iconCss: string;
  public isVisible = false;
  public type: string;
  public translation: string;
  public closeable: boolean;

  private destroyListener: Function;

  public $onInit() {
    this.destroyListener = this.$rootScope.$on(CoreEvent.HEADER_BANNER_TOGGLED, (_event, data): void => {
      if (_.get(data, 'visible', false)) {
        this.isVisible = true;
        this.iconCss = _.get(data, 'iconCss');
        this.translation = _.get(data, 'translation');
        this.type = _.get(data, 'type');
        this.closeable = _.get(data, 'closeable', false);
      } else {
        this.isVisible = false;
      }
    });
  }

  public $onDestroy() {
    this.destroyListener();
  }
}

export class BannerComponent implements ng.IComponentOptions {
  public controller = BannerController;
  public template = require('modules/core/banner/banner.tpl.html');
  public bindings = {};
}
