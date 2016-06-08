var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var globalsettings;
(function (globalsettings) {
    var SipDomainSetting = (function (_super) {
        __extends(SipDomainSetting, _super);
        function SipDomainSetting() {
            _super.call(this, 'sipDomain');
            this.subsectionLabel = '';
            this.subsectionDescription = '';
        }
        return SipDomainSetting;
    }(globalsettings.SettingSection));
    globalsettings.SipDomainSetting = SipDomainSetting;
    angular.module('Core').component('sipdomainSetting', {
        bindings: {
            showSaveButton: '<'
        },
        controller: 'EnterpriseSettingsCtrl',
        templateUrl: 'modules/core/settings/sipDomain/sipDomainSetting.tpl.html',
    });
})(globalsettings || (globalsettings = {}));
