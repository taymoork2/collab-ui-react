var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var globalsettings;
(function (globalsettings) {
    var AuthenticationSetting = (function (_super) {
        __extends(AuthenticationSetting, _super);
        function AuthenticationSetting() {
            _super.call(this, 'authentication');
            this.subsectionDescription = '';
        }
        return AuthenticationSetting;
    }(globalsettings.SettingSection));
    globalsettings.AuthenticationSetting = AuthenticationSetting;
    angular.module('Core').component('authenticationSetting', {
        bindings: {},
        controller: 'AuthenticationSettingController as vm',
        templateUrl: 'modules/core/settings/authentication/authenticationSetting.tpl.html',
    });
})(globalsettings || (globalsettings = {}));
