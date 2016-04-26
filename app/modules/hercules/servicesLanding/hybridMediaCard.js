var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var servicesLanding;
(function (servicesLanding) {
    var ServicesLandingHybridMediaCard = (function (_super) {
        __extends(ServicesLandingHybridMediaCard, _super);
        function ServicesLandingHybridMediaCard() {
            _super.call(this, 'modules/hercules/servicesLanding/serviceCard.tpl.html', 'servicesLanding.cards.hybridMedia.title', 'servicesLanding.cards.hybridMedia.description', 'icon-circle-data', false, 'media', servicesLanding.CardType.hybrid);
            this._setupButton = { name: 'servicesLanding.genericButtons.setup', link: 'mediaservice', buttonClass: 'cta-btn' };
            this._buttons = [
                { name: 'servicesLanding.cards.hybridMedia.buttons.resources', link: 'mediaservice' },
                { name: 'servicesLanding.cards.hybridMedia.buttons.settings', link: 'mediaservice/settings' }];
        }
        ServicesLandingHybridMediaCard.prototype.getShowMoreButton = function () {
            return undefined;
        };
        ServicesLandingHybridMediaCard.prototype.getButtons = function () {
            if (this.active)
                return _.take(this._buttons, 3);
            return [this._setupButton];
        };
        ServicesLandingHybridMediaCard.prototype.hybridStatusEventHandler = function (services) {
            this._status = this.filterAndGetCssStatus(services, ['squared-fusion-media']);
            this._active = this.filterAndGetEnabledService(services, ['squared-fusion-media']);
            this._loading = false;
        };
        return ServicesLandingHybridMediaCard;
    }(servicesLanding.ServicesLandingCard));
    servicesLanding.ServicesLandingHybridMediaCard = ServicesLandingHybridMediaCard;
})(servicesLanding || (servicesLanding = {}));
