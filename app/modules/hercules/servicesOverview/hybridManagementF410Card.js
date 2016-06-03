var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var servicesOverview;
(function (servicesOverview) {
    var ServicesOverviewHybridManagementF410Card = (function (_super) {
        __extends(ServicesOverviewHybridManagementF410Card, _super);
        function ServicesOverviewHybridManagementF410Card() {
            _super.call(this, {
                name: 'servicesOverview.cards.clusterList.title',
                description: 'servicesOverview.cards.clusterList.description',
                cardClass: 'cluster-list',
                cardType: servicesOverview.CardType.hybrid
            });
            this._buttons = [
                {
                    name: 'servicesOverview.cards.clusterList.buttons.all',
                    link: 'services/clusters',
                    buttonClass: 'btn-link'
                }
            ];
            this._loading = false;
        }
        ServicesOverviewHybridManagementF410Card.prototype.getShowMoreButton = function () {
            return undefined;
        };
        ServicesOverviewHybridManagementF410Card.prototype.getButtons = function () {
            return this._buttons;
        };
        ServicesOverviewHybridManagementF410Card.prototype.f410FeatureEventHandler = function (hasFeature) {
            this._display = hasFeature;
        };
        return ServicesOverviewHybridManagementF410Card;
    }(servicesOverview.ServicesOverviewCard));
    servicesOverview.ServicesOverviewHybridManagementF410Card = ServicesOverviewHybridManagementF410Card;
})(servicesOverview || (servicesOverview = {}));
