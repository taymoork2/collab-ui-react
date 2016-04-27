var __extends = (this && this.__extends) || function (d, b) {
  for (var p in b)
    if (b.hasOwnProperty(p)) d[p] = b[p];

  function __() {
    this.constructor = d;
  }
  d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var servicesLanding;
(function (servicesLanding) {
  var ServicesLandingHybridCallCard = (function (_super) {
    __extends(ServicesLandingHybridCallCard, _super);

    function ServicesLandingHybridCallCard() {
      _super.call(this, 'modules/hercules/servicesLanding/serviceCard.tpl.html', 'servicesLanding.cards.hybridCall.title', 'servicesLanding.cards.hybridCall.description', 'icon-circle-data', false, 'call', servicesLanding.CardType.hybrid);
      this._setupButton = {
        name: 'servicesLanding.genericButtons.setup',
        link: 'services/call',
        buttonClass: 'cta-btn'
      };
      this._buttons = [{
        name: 'servicesLanding.cards.hybridCall.buttons.resources',
        link: 'services/call'
      }, {
        name: 'servicesLanding.cards.hybridCall.buttons.settings',
        link: 'services/call/settings'
      }];
    }
    ServicesLandingHybridCallCard.prototype.getShowMoreButton = function () {
      return undefined;
    };
    ServicesLandingHybridCallCard.prototype.getButtons = function () {
      if (this.active)
        return _.take(this._buttons, 3);
      return [this._setupButton];
    };
    ServicesLandingHybridCallCard.prototype.hybridStatusEventHandler = function (services) {
      this._status = this.filterAndGetCssStatus(services, ['squared-fusion-ec', 'squared-fusion-uc']);
      this._active = this.filterAndGetEnabledService(services, ['squared-fusion-ec', 'squared-fusion-uc']);
      this._loading = false;
    };
    return ServicesLandingHybridCallCard;
  }(servicesLanding.ServicesLandingCard));
  servicesLanding.ServicesLandingHybridCallCard = ServicesLandingHybridCallCard;
})(servicesLanding || (servicesLanding = {}));
