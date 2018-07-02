import { CoreEvent } from 'modules/core/shared/event.constants';

/**
 * This component creates/removes global banners.
 * Usage:
 *   this.$rootScope.$emit(CoreEvent.HEADER_BANNER_TOGGLED, bannerData);
 *
 * bannerData object properties:
 * @param {string} name [Required] the name of the banner
 * @param {string} state the state name where this banner should show, default to persist in all states
 * @param {string} translation the banner text, default to undefined
 * @param {string} type the banner type, e.g. 'info', danger', default to 'info'
 * @param {string} iconCss the icon name to show in front of the banner text, default to undefined
 * @param {string} isVisible to display or remove the banner, default to false, whcih is to remove the banner
 * @param {string} closeable to display a close button (X) to the right of the banner, default to true
 */

export interface IBannerInfo {
  name: string;
  state?: string;
  translation?: string;
  type?: string;
  iconCss?: string;
  isVisible?: boolean;
  closeable?: boolean;
}

class IBannerInfoClass implements IBannerInfo {
  public name: string;
  public state?: string;
  public translation?: string;
  public type?: string;
  public iconCss?: string;
  public isVisible?: boolean;
  public closeable?: boolean;

  constructor(bannerInfo: IBannerInfo) {
    this.name = bannerInfo.name;
    this.state = _.get(bannerInfo, 'state', undefined);
    this.translation = _.get(bannerInfo, 'translation', undefined);
    this.type = _.get(bannerInfo, 'type', 'info');
    this.iconCss = _.get(bannerInfo, 'iconCss', undefined);
    this.isVisible = _.get(bannerInfo, 'isVisible', false);
    this.closeable = _.get(bannerInfo, 'closeable', true);
  }
}

class BannerController implements ng.IComponentController {
  private bannerList: IBannerInfo[] = [];
  private destroyListener: Function;

  /* @ngInject */
  constructor(
    private $rootScope: ng.IRootScopeService,
    private $state: ng.ui.IStateService,
  ) {}

  public $onInit() {
    this.destroyListener = this.$rootScope.$on(CoreEvent.HEADER_BANNER_TOGGLED, (_event, bannerData: IBannerInfo): void => {
      if (!this.validateBannerData(bannerData)) {
        return;
      }

      const bannerInfo: IBannerInfo = new IBannerInfoClass(bannerData);

      if (bannerInfo.isVisible) {
        this.addBanner(bannerInfo);
      } else {
        this.removeBanner(bannerInfo);
      }
    });
  }

  public $onDestroy() {
    this.destroyListener();
  }

  private validateBannerData(bannerInfo: IBannerInfo): boolean {
    if (_.isNil(bannerInfo.name) || _.isEmpty(_.trim(bannerInfo.name))) {
      return false;
    }

    const isVisible = _.get(bannerInfo, 'isVisible', false);
    if (isVisible && (_.isNil(bannerInfo.translation) || _.isEmpty(_.trim(bannerInfo.translation)))) {
      return false;
    }

    return true;
  }

  private addBanner(bannerInfo: IBannerInfo): void {
    if (_.some(this.bannerList, banner => {
      return banner.name === bannerInfo.name;
    })) {
      return;
    }

    this.bannerList.push(bannerInfo);
  }

  private removeBanner(bannerInfo: IBannerInfo): void {
    _.remove(this.bannerList, banner => {
      return banner.name === bannerInfo.name;
    });
  }

  public showInTheState(banner: IBannerInfo): boolean {
    if (_.isUndefined(banner.state)) {
      return true;
    }

    if (this.$state.current.name === banner.state) {
      return true;
    }

    return false;
  }
}

export class BannerComponent implements ng.IComponentOptions {
  public controller = BannerController;
  public template = require('modules/core/shared/banner/banner.tpl.html');
  public bindings = {};
}
