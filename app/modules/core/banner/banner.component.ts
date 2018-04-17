class BannerController implements ng.IComponentController {
  /* @ngInject */
  constructor(
    private $rootScope: ng.IRootScopeService,
    private Authinfo,
  ) {}

  public iconCss: string;
  public isReadonly: boolean;
  public isVisible = false;
  public type: string;
  public translation: string;

  private destroyListener: Function;

  public $onInit() {
    this.isReadonly = this.Authinfo.isReadOnlyAdmin();

    this.destroyListener = this.$rootScope.$on('TOGGLE_HEADER_BANNER', (_event, data): void => {
      if (_.get(data, 'visible', false)) {
        this.isVisible = true;
        this.iconCss = _.get(data, 'iconCss');
        this.translation = _.get(data, 'translation');
        this.type = _.get(data, 'type');
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
