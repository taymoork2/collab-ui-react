var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var servicesOverview;
(function (servicesOverview) {
    var ServicesOverviewCalendarCard = (function (_super) {
        __extends(ServicesOverviewCalendarCard, _super);
        function ServicesOverviewCalendarCard() {
            _super.call(this, 'modules/hercules/servicesOverview/serviceCard.tpl.html', 'servicesOverview.cards.calendar.title', 'servicesOverview.cards.calendar.description', 'icon-circle-calendar', true, 'calendar', servicesOverview.CardType.hybrid);
            this._buttons = [
                { name: 'servicesOverview.cards.calendar.buttons.resources', link: 'services/calendar', buttonClass: 'btn-link' },
                { name: 'servicesOverview.cards.calendar.buttons.settings', link: 'services/calendar/settings', buttonClass: 'btn-link' }];
        }
        ServicesOverviewCalendarCard.prototype.getShowMoreButton = function () {
            return undefined;
        };
        ServicesOverviewCalendarCard.prototype.getButtons = function () {
            return _.take(this._buttons, 3);
        };
        ServicesOverviewCalendarCard.prototype.hybridStatusEventHandler = function (services) {
            this._status = this.filterAndGetCssStatus(services, ['squared-fusion-cal']);
            this._active = this.filterAndGetEnabledService(services, ['squared-fusion-cal']);
            this._loading = false;
        };
        return ServicesOverviewCalendarCard;
    }(servicesOverview.ServicesOverviewCard));
    servicesOverview.ServicesOverviewCalendarCard = ServicesOverviewCalendarCard;
})(servicesOverview || (servicesOverview = {}));
