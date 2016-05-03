var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var servicesLanding;
(function (servicesLanding) {
    var ServicesLandingHybridManagementCard = (function (_super) {
        __extends(ServicesLandingHybridManagementCard, _super);
        function ServicesLandingHybridManagementCard() {
            _super.call(this, 'modules/hercules/servicesLanding/serviceCard.tpl.html', 'servicesLanding.cards.hybridManagement.title', 'servicesLanding.cards.hybridManagement.description', 'icon-circle-data', true, '', servicesLanding.CardType.hybrid);
            this._buttons = [
                { name: 'servicesLanding.cards.hybridManagement.buttons.resources', link: 'services/expressway-management' },
                { name: 'servicesLanding.cards.hybridManagement.buttons.settings', link: 'services/expressway-management/settings' }
            ];
        }
        ServicesLandingHybridManagementCard.prototype.getShowMoreButton = function () {
            return undefined;
        };
        ServicesLandingHybridManagementCard.prototype.getButtons = function () {
            return _.take(this._buttons, 3);
        };
        ServicesLandingHybridManagementCard.prototype.hybridStatusEventHandler = function (services) {
            this._status = this.filterAndGetCssStatus(services, ['squared-fusion-mgmt']);
            this._active = this.filterAndGetEnabledService(services, ['squared-fusion-mgmt']);
            this._loading = false;
        };
        return ServicesLandingHybridManagementCard;
    }(servicesLanding.ServicesLandingCard));
    servicesLanding.ServicesLandingHybridManagementCard = ServicesLandingHybridManagementCard;
})(servicesLanding || (servicesLanding = {}));
