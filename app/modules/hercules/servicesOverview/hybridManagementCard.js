var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var servicesOverview;
(function (servicesOverview) {
    var ServicesOverviewHybridManagementCard = (function (_super) {
        __extends(ServicesOverviewHybridManagementCard, _super);
        function ServicesOverviewHybridManagementCard() {
            _super.call(this, 'modules/hercules/servicesOverview/serviceCard.tpl.html', 'servicesOverview.cards.hybridManagement.title', 'servicesOverview.cards.hybridManagement.description', 'icon-circle-data', true, '', servicesOverview.CardType.hybrid);
            this._buttons = [
                { name: 'servicesOverview.cards.hybridManagement.buttons.resources', link: 'services/expressway-management', buttonClass: 'btn-link' },
                {
                    name: 'servicesOverview.cards.hybridManagement.buttons.settings',
                    link: 'services/expressway-management/settings',
                    buttonClass: 'btn-link'
                }
            ];
        }
        ServicesOverviewHybridManagementCard.prototype.getShowMoreButton = function () {
            return undefined;
        };
        ServicesOverviewHybridManagementCard.prototype.getButtons = function () {
            return _.take(this._buttons, 3);
        };
        ServicesOverviewHybridManagementCard.prototype.hybridStatusEventHandler = function (services) {
            this._status = this.filterAndGetCssStatus(services, ['squared-fusion-mgmt']);
            this._active = this.filterAndGetEnabledService(services, ['squared-fusion-mgmt']);
            this._loading = false;
        };
        return ServicesOverviewHybridManagementCard;
    }(servicesOverview.ServicesOverviewHybridCard));
    servicesOverview.ServicesOverviewHybridManagementCard = ServicesOverviewHybridManagementCard;
})(servicesOverview || (servicesOverview = {}));
