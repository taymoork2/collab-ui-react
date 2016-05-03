var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var servicesOverview;
(function (servicesOverview) {
    var ServicesOverviewMeetingCard = (function (_super) {
        __extends(ServicesOverviewMeetingCard, _super);
        function ServicesOverviewMeetingCard() {
            _super.call(this, 'modules/hercules/servicesOverview/serviceCard.tpl.html', 'servicesOverview.cards.meeting.title', 'servicesOverview.cards.meeting.description', 'icon-circle-group', true, 'meetings');
            this.moreButton = { name: 'servicesOverview.showMore', link: 'site-list', buttonClass: 'btn-link' };
            this._buttons = [];
        }
        ServicesOverviewMeetingCard.prototype.getShowMoreButton = function () {
            if (this._buttons.length > 3) {
                return this.moreButton;
            }
            return undefined;
        };
        ServicesOverviewMeetingCard.prototype.getButtons = function () {
            return _.take(this._buttons, 3);
        };
        ServicesOverviewMeetingCard.prototype.updateWebexSiteList = function (data) {
            var _this = this;
            if (!data) {
                this._loading = false;
                return;
            }
            _.forEach(data, function (serviceFeature) {
                _this._buttons.push({ name: serviceFeature.license.siteUrl, link: 'site-list', buttonClass: 'btn-link' });
            });
            this._loading = false;
        };
        return ServicesOverviewMeetingCard;
    }(servicesOverview.ServicesOverviewCard));
    servicesOverview.ServicesOverviewMeetingCard = ServicesOverviewMeetingCard;
})(servicesOverview || (servicesOverview = {}));
