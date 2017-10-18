import storageModule from 'modules/core/storage';
import { CurrentLanguageDirective } from './currentLang.directive';
import { l10nBundleLoader } from './l10n-bundle-loader';
import { LanguagesProvider } from './languages.provider';

const SettingsMenuCtrl = require('./settingsMenuCtrl');

export default angular
  .module('core.languages', [
    require('angular-ui-router'),
    require('angular-translate'),
    storageModule,
  ])
  .provider('languages', LanguagesProvider)
  .controller('SettingsMenuCtrl', SettingsMenuCtrl)
  .directive('currentLanguage', CurrentLanguageDirective.factory)
  .factory('l10nBundleLoader', l10nBundleLoader)
  .name;
