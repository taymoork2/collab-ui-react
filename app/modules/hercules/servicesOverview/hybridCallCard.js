var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var servicesOverview;
(function (servicesOverview) {
    var ServicesOverviewHybridCallCard = (function (_super) {
        __extends(ServicesOverviewHybridCallCard, _super);
        function ServicesOverviewHybridCallCard() {
            _super.call(this, 'modules/hercules/servicesOverview/serviceCard.tpl.html', 'servicesOverview.cards.hybridCall.title', 'servicesOverview.cards.hybridCall.description', 'icon-circle-data', false, 'call', servicesOverview.CardType.hybrid);
            this._setupButton = {
                name: 'servicesOverview.genericButtons.setup',
                link: 'services/call',
                buttonClass: 'cta-btn'
            };
            this._buttons = [
                { name: 'servicesOverview.cards.hybridCall.buttons.resources', link: 'services/call', buttonClass: 'btn-link' },
                { name: 'servicesOverview.cards.hybridCall.buttons.settings', link: 'services/call/settings', buttonClass: 'btn-link' }];
        }
        ServicesOverviewHybridCallCard.prototype.getShowMoreButton = function () {
            return undefined;
        };
        ServicesOverviewHybridCallCard.prototype.getButtons = function () {
            if (this.active)
                return _.take(this._buttons, 3);
            return [this._setupButton];
        };
        ServicesOverviewHybridCallCard.prototype.hybridStatusEventHandler = function (services) {
            this._status = this.filterAndGetCssStatus(services, ['squared-fusion-ec', 'squared-fusion-uc']);
            this._active = this.filterAndGetEnabledService(services, ['squared-fusion-ec', 'squared-fusion-uc']);
            this._loading = false;
        };
        return ServicesOverviewHybridCallCard;
    }(servicesOverview.ServicesOverviewHybridCard));
    servicesOverview.ServicesOverviewHybridCallCard = ServicesOverviewHybridCallCard;
})(servicesOverview || (servicesOverview = {}));
