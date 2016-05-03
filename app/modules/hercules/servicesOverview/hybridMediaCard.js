var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var servicesOverview;
(function (servicesOverview) {
    var ServicesOverviewHybridMediaCard = (function (_super) {
        __extends(ServicesOverviewHybridMediaCard, _super);
        function ServicesOverviewHybridMediaCard() {
            _super.call(this, 'modules/hercules/servicesOverview/serviceCard.tpl.html', 'servicesOverview.cards.hybridMedia.title', 'servicesOverview.cards.hybridMedia.description', 'icon-circle-data', false, 'media', servicesOverview.CardType.hybrid);
            this._setupButton = {
                name: 'servicesOverview.genericButtons.setup',
                link: 'mediaservice',
                buttonClass: 'cta-btn'
            };
            this._buttons = [
                { name: 'servicesOverview.cards.hybridMedia.buttons.resources', link: 'mediaservice', buttonClass: 'btn-link' },
                { name: 'servicesOverview.cards.hybridMedia.buttons.settings', link: 'mediaservice/settings', buttonClass: 'btn-link' }];
        }
        ServicesOverviewHybridMediaCard.prototype.getShowMoreButton = function () {
            return undefined;
        };
        ServicesOverviewHybridMediaCard.prototype.getButtons = function () {
            if (this.active)
                return _.take(this._buttons, 3);
            return [this._setupButton];
        };
        ServicesOverviewHybridMediaCard.prototype.hybridStatusEventHandler = function (services) {
            this._status = this.filterAndGetCssStatus(services, ['squared-fusion-media']);
            this._active = this.filterAndGetEnabledService(services, ['squared-fusion-media']);
            this._loading = false;
        };
        return ServicesOverviewHybridMediaCard;
    }(servicesOverview.ServicesOverviewHybridCard));
    servicesOverview.ServicesOverviewHybridMediaCard = ServicesOverviewHybridMediaCard;
})(servicesOverview || (servicesOverview = {}));
