var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var servicesOverview;
(function (servicesOverview) {
    var ServicesOverviewHybridContextCard = (function (_super) {
        __extends(ServicesOverviewHybridContextCard, _super);
        function ServicesOverviewHybridContextCard() {
            _super.call(this, 'modules/hercules/servicesOverview/serviceCard.tpl.html', 'servicesOverview.cards.hybridContext.title', 'servicesOverview.cards.hybridContext.description', 'icon-circle-data', true, 'context', servicesOverview.CardType.hybrid);
            this._buttons = [
                { name: 'servicesOverview.cards.hybridContext.buttons.settings', link: '', buttonClass: 'btn-link' }];
            this._loading = false;
        }
        ServicesOverviewHybridContextCard.prototype.getShowMoreButton = function () {
            return undefined;
        };
        ServicesOverviewHybridContextCard.prototype.getButtons = function () {
            return _.take(this._buttons, 3);
        };
        return ServicesOverviewHybridContextCard;
    }(servicesOverview.ServicesOverviewCard));
    servicesOverview.ServicesOverviewHybridContextCard = ServicesOverviewHybridContextCard;
})(servicesOverview || (servicesOverview = {}));
