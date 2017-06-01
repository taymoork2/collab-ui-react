import storageModule from 'modules/core/storage';
import { CurrentLanguageDirective } from './currentLang.directive';

const LanguagesProvider = require('./languages');
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
  .name;
