var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var servicesOverview;
(function (servicesOverview) {
    var ServicesOverviewCallCard = (function (_super) {
        __extends(ServicesOverviewCallCard, _super);
        function ServicesOverviewCallCard() {
            _super.call(this, 'modules/hercules/servicesOverview/serviceCard.tpl.html', 'servicesOverview.cards.call.title', 'servicesOverview.cards.call.description', 'icon-circle-call', true, 'people');
            this._buttons = [
                { name: 'servicesOverview.cards.call.buttons.numbers', link: 'hurondetails/lines', buttonClass: 'btn-link' },
                { name: 'servicesOverview.cards.call.buttons.features', link: 'hurondetails/features', buttonClass: 'btn-link' },
                { name: 'servicesOverview.cards.call.buttons.settings', link: 'hurondetails/settings', buttonClass: 'btn-link' }];
            this._loading = false;
        }
        ServicesOverviewCallCard.prototype.getShowMoreButton = function () {
            return undefined;
        };
        ServicesOverviewCallCard.prototype.getButtons = function () {
            return _.take(this._buttons, 3);
        };
        return ServicesOverviewCallCard;
    }(servicesOverview.ServicesOverviewCard));
    servicesOverview.ServicesOverviewCallCard = ServicesOverviewCallCard;
})(servicesOverview || (servicesOverview = {}));
