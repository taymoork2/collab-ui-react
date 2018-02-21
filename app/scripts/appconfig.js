(function () {
  'use strict';

  /* eslint angular/di:0 */
  var loadedModules = [];

  function resolveLazyLoad(requireFunction) {
    // https://github.com/ocombe/ocLazyLoad/issues/321
    // $$animateJs issue when 'ng' module is "reloaded" through $ocLazyLoad
    // force $$animateJs to be loaded before we try to lazy load
    return /* @ngInject */ function lazyLoad($$animateJs, $ocLazyLoad, $q) {
      return $q(function resolvePromise(resolve) {
        requireFunction(requireDoneCallback);

        function requireDoneCallback(_module) {
          var moduleName;
          if (_.isObject(_module) && _.has(_module, 'default')) {
            moduleName = _module.default;
          } else {
            moduleName = _module;
          }
          // Don't reload a loaded module or core angular module
          if (_.includes(loadedModules, moduleName) || _.includes($ocLazyLoad.getModules(), moduleName) || _.startsWith(moduleName, 'ng')) {
            resolve();
          } else {
            loadedModules.push(moduleName);
            $ocLazyLoad.toggleWatch(true);
            $ocLazyLoad.inject(moduleName)
              .finally(function finishLazyLoad() {
                $ocLazyLoad.toggleWatch(false);
                resolve();
              });
          }
        }
      });
    };
  }

  function translateDisplayName(translateKey) {
    return /* @ngInject */ function translate($translate) {
      _.set(this, 'data.displayName', $translate.instant(translateKey));
    };
  }

  function toResolveParam(paramName, defaultVal) {
    return /* @ngInject */ function ($stateParams) {
      return _.get($stateParams, paramName, defaultVal);
    };
  }

  function stateParamsToResolveParams(stateParams) {
    return _.reduce(stateParams, function (result, defaultVal, paramName) {
      result[paramName] = toResolveParam(paramName, defaultVal);
      return result;
    }, {});
  }

  angular
    .module('wx2AdminWebClientApp')
    .config(['$httpProvider', '$stateProvider', '$urlRouterProvider', '$translateProvider', '$compileProvider', 'languagesProvider',
      function ($httpProvider, $stateProvider, $urlRouterProvider, $translateProvider, $compileProvider, languagesProvider) {
        var sidepanelMemo = 'sidepanelMemo';

        // sidepanel helper
        function isStateInSidepanel($state) {
          var rootStateName = $state.current.name.split('.')[0];
          var rootState = $state.get(rootStateName);
          var rootStateIsSidepanel = rootState.parent === 'sidepanel';
          return $state.current.parent === 'sidepanel' || (rootStateIsSidepanel && $state.includes(rootState));
        }

        /* @ngInject */
        function SidePanelLargeOpen($window) {
          $window.document.querySelector('.side-panel').classList.add('large');
        }

        /* @ngInject */
        function SidePanelLargeClose($window) {
          $window.document.querySelector('.side-panel').classList.remove('large');
        }
        //Add blob to the default angular whitelist
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|tel|file|blob):/);

        $urlRouterProvider.otherwise(function ($injector) {
          // inspired by https://github.com/angular-ui/ui-router/issues/600
          // unit tests $digest not settling due to $location url changes
          var $window = $injector.get('$window');
          var Utils = $injector.get('Utils');
          var oauthCodeParams = Utils.getFromStandardGetParams($window.document.URL);
          if (!_.has(oauthCodeParams, 'error')) {
            var $state = $injector.get('$state');
            $state.go('login');
          }
        });
        $stateProvider
          .state('modal', {
            abstract: true,
            onEnter: modalOnEnter({
              type: 'full',
            }),
            onExit: modalOnExit,
          })
          .state('modalDialog', {
            abstract: true,
            onEnter: modalOnEnter({
              type: 'dialog',
            }),
            onExit: modalOnExit,
          })
          .state('modalSmall', {
            abstract: true,
            onEnter: modalOnEnter({
              type: 'small',
            }),
            onExit: modalOnExit,
          })
          .state('wizardmodal', {
            abstract: true,
            onEnter: /* @ngInject */ function ($modal, $state, $previousState) {
              $previousState.memo(wizardmodalMemo);
              $state.modal = $modal.open({
                template: '<div ui-view="modal"></div>',
                controller: 'ModalWizardCtrl',
                backdrop: 'static',
              });
              $state.modal.result.finally(function () {
                $state.modal = null;
                var previousState = $previousState.get(wizardmodalMemo);
                if (previousState) {
                  return $previousState.go(wizardmodalMemo);
                }
              });
            },
            onExit: ['$state', '$previousState',
              function ($state, $previousState) {
                if ($state.modal) {
                  $previousState.forget(wizardmodalMemo);
                  $state.modal.close();
                }
              },
            ],
          })
          .state('login', {
            parent: 'loginLazyLoad',
            url: '/login?bmmp_env&email&customerOrgId&partnerOrgId&subscriptionId&lang',
            views: {
              'main@': {
                template: '<login/>',
              },
            },
            params: {
              reauthorize: undefined,
            },
            authenticate: false,
          })
          .state('activateUser', {
            parent: 'mainLazyLoad',
            url: '/activate-user',
            views: {
              'main@': {
                template: '<div ui-view></div>',
                controller: 'ActivateUserController',
              },
            },
            authenticate: false,
          })
          .state('activateUser.successPage', {
            url: '/success-page',
            views: {
              'main@': {
                template: '<div ui-view></div>',
              },
            },
            authenticate: false,
          })
          .state('activateUser.errorPage', {
            url: '/error-page',
            views: {
              'main@': {
                template: '<div ui-view></div>',
              },
            },
            authenticate: false,
          })
          .state('activateProduct', {
            parent: 'mainLazyLoad',
            url: '/activate-product',
            views: {
              'main@': {
                template: '<div ui-view></div>',
                controller: 'ActivateProductController',
              },
            },
          })
          .state('activateProduct.successPage', {
            url: '/success-page',
            views: {
              'main@': {
                template: '<div ui-view></div>',
              },
            },
          })
          .state('activateProduct.errorPage', {
            url: '/error-page',
            views: {
              'main@': {
                template: '<div ui-view></div>',
              },
            },
          })
          .state('unauthorized', {
            parent: 'stateRedirectLazyLoad',
            views: {
              'main@': {
                template: require('modules/core/stateRedirect/unauthorized.tpl.html'),
                controller: 'StateRedirectCtrl',
                controllerAs: 'stateRedirect',
              },
            },
            authenticate: false,
          })
          .state('login-error', {
            parent: 'stateRedirectLazyLoad',
            views: {
              'main@': {
                template: require('modules/core/stateRedirect/loginError.tpl.html'),
                controller: 'StateRedirectCtrl',
                controllerAs: 'stateRedirect',
              },
            },
            authenticate: false,
          })
          .state('backend-temp-unavailable', {
            views: {
              'main@': {
                template: require('modules/core/stateRedirect/backendTempUnavailable.tpl.html'),
              },
            },
            authenticate: false,
          })
          .state('server-maintenance', {
            views: {
              'main@': {
                template: require('modules/core/stateRedirect/serverMaintenance.tpl.html'),
              },
            },
            authenticate: false,
          })
          .state('404', {
            parent: 'stateRedirectLazyLoad',
            url: '/404',
            views: {
              'main@': {
                template: require('modules/core/stateRedirect/404.tpl.html'),
                controller: 'StateRedirectCtrl',
                controllerAs: 'stateRedirect',
              },
            },
            authenticate: false,
          })
          .state('mainLazyLoad', {
            views: {
              'main@': {
                template: '<div ui-view="main"></div>',
              },
            },
            resolve: {
              lazy: resolveLazyLoad(function (done) {
                require.ensure([], function () {
                  done(require('./main'));
                }, 'modules');
              }),
            },
            abstract: true,
          })
          .state('loginLazyLoad', {
            views: {
              'main@': {
                template: '<div ui-view="main"></div>',
              },
            },
            resolve: {
              lazy: resolveLazyLoad(function (done) {
                require.ensure([], function () {
                  done(require('modules/core/login'));
                }, 'login');
              }),
            },
            abstract: true,
          })
          .state('stateRedirectLazyLoad', {
            views: {
              'main@': {
                template: '<div ui-view="main"></div>',
              },
            },
            resolve: {
              lazy: resolveLazyLoad(function (done) {
                require.ensure([], function () {
                  done(require('modules/core/stateRedirect/stateRedirect.controller'));
                }, 'state-redirect');
              }),
            },
            abstract: true,
          })
          .state('main-unauthenticated', {
            parent: 'mainLazyLoad',
            views: {
              'main@': {
                template: '<div ui-view=""></div>',
              },
            },
            abstract: true,
          })
          .state('main', {
            views: {
              'main@': {
                template: require('modules/core/views/main.tpl.html'),
              },
            },
            abstract: true,
            resolve: {
              lazy: resolveLazyLoad(function (done) {
                require.ensure([], function () {
                  done(require('./main'));
                }, 'modules');
              }),
            },
            sticky: true,
          })
          .state('partner', {
            template: '<div ui-view></div>',
            url: '/partner',
            parent: 'main',
            abstract: true,
          })
          .state('sidepanel', {
            abstract: true,
            onExit: panelOnExit,
            onEnter: panelOnEnter(),
          })
          .state('largepanel', {
            abstract: true,
            onExit: panelOnExit,
            onEnter: panelOnEnter({
              type: 'large',
            }),
          });
        // Enter and Exit functions for panel(large or side)
        function panelOnEnter(options) {
          options = options || {};
          return /* @ngInject */ function ($modal, $state, $previousState) {
            if (_.get($state, 'current.data.sidepanel', '') !== 'not-full') {
              if (!options.type) {
                options.type = 'side-panel-full-height nav-expanded';
              } else {
                options.type += ' side-panel-full-height nav-expanded';
              }
            }

            if ($state.sidepanel) {
              $state.sidepanel.stopPreviousState = true;
            } else {
              $previousState.memo(sidepanelMemo);
            }

            var template = '<cs-sidepanel role="complementary"';
            template += options.type ? ' size="' + options.type + '"' : '';
            template += '></cs-sidepanel>';
            $state.sidepanel = $modal.open({
              template: template,
              // TODO(pajeter): remove inline template when cs-modal is updated
              windowTemplate: '<div modal-render="{{$isRendered}}" tabindex="-1" role="dialog" class="sidepanel-modal"' +
                'modal-animation-class="fade"' +
                'modal-in-class="in"' +
                'ng-style="{\'z-index\': 1051, display: \'block\', visibility: \'visible\'}">' +
                '<div class="modal-content" modal-transclude></div>' +
                ' </div>',
              backdrop: false,
              keyboard: false,
            });
            $state.sidepanel.result.finally(function () {
              if (!this.stopPreviousState && !$state.modal) {
                $state.sidepanel = null;
                var previousState = $previousState.get(sidepanelMemo);
                if (previousState) {
                  var isStateInLargepanel = $state.current.parent === 'largepanel';
                  if (isStateInSidepanel($state) || isStateInLargepanel) {
                    return $previousState.go(sidepanelMemo).then(function () {
                      $previousState.forget(sidepanelMemo);
                    });
                  }
                }
              }
            }.bind($state.sidepanel));
          };
        }

        /* @ngInject */
        function panelOnExit($state) {
          if ($state.sidepanel) {
            $state.sidepanel.dismiss();
          }
        }

        // See http://angular-translate.github.io/docs/#/guide/19_security
        $translateProvider.useSanitizeValueStrategy('escapeParameters');
        $translateProvider.useLoader('l10nBundleLoader');
        $translateProvider.addInterpolation('$translateMessageFormatInterpolation');
        $translateProvider.preferredLanguage(languagesProvider.getPreferredLanguage());
        $translateProvider.fallbackLanguage(languagesProvider.getFallbackLanguage());
        $translateProvider.useMissingTranslationHandler('missingTranslationHandler');

        $httpProvider.interceptors.push('TrackingIdInterceptor');
        $httpProvider.interceptors.push('ResponseInterceptor');
        $httpProvider.interceptors.push('TimingInterceptor');
        $httpProvider.interceptors.push('ServerErrorInterceptor');
        $httpProvider.interceptors.push('ReadonlyInterceptor');

        var modalMemo = 'modalMemo';
        var wizardmodalMemo = 'wizardmodalMemo';

        // Modal States Enter and Exit functions
        function modalOnEnter(options) {
          options = options || {};
          return /* @ngInject */ function ($modal, $state, $previousState) {
            if ($state.modal) {
              $state.modal.stopPreviousState = true;
            } else {
              $previousState.memo(modalMemo);
            }
            $state.modal = $modal.open({
              template: '<div ui-view="modal"></div>',
              windowClass: options.windowClass,
              backdrop: options.backdrop || 'static',
              modalClass: $state.params.modalClass,
              modalId: $state.params.modalId,
              type: options.type,
            });
            $state.modal.result.finally(function () {
              if (!this.stopPreviousState) {
                $state.modal = null;
                //context-fields-sidepanel needs to update the view with new values after the update; otherwise go back to previous state
                if ($state.current.name !== 'context-fields-sidepanel' && $state.current.name !== 'context-fieldsets-sidepanel') {
                  var previousState = $previousState.get(modalMemo);
                  if (previousState) {
                    return $previousState.go(modalMemo).then(function () {
                      $previousState.forget(modalMemo);
                    });
                  }
                }
              }
            }.bind($state.modal));
          };
        }

        /* @ngInject */
        function modalOnExit($state) {
          if ($state.modal) {
            $state.modal.dismiss();
          }
        }
        $stateProvider
          .state('addDeviceFlow', {
            parent: 'modal',
            views: {
              'modal@': {
                controller: 'ChooseDeviceTypeCtrl',
                controllerAs: 'chooseDeviceType',
                template: require('modules/squared/devices/addDeviceNew/ChooseDeviceTypeTemplate.tpl.html'),
              },
            },
            params: {
              wizard: null,
            },
          })
          .state('addDeviceFlow.confirmRoomDeviceOnly', {
            parent: 'modalDialog',
            views: {
              'modal@': {
                controller: 'ConfirmRoomDeviceOnlyCtrl',
                controllerAs: 'confirmRoomDeviceOnly',
                template: require('modules/squared/devices/addDeviceNew/ConfirmRoomDeviceOnlyTemplate.tpl.html'),
              },
            },
            params: {
              wizard: null,
            },
          })
          .state('addDeviceFlow.chooseDeviceType', {
            parent: 'modal',
            views: {
              'modal@': {
                controller: 'ChooseDeviceTypeCtrl',
                controllerAs: 'chooseDeviceType',
                template: require('modules/squared/devices/addDeviceNew/ChooseDeviceTypeTemplate.tpl.html'),
              },
            },
            params: {
              wizard: null,
            },
          })
          .state('addDeviceFlow.chooseAccountType', {
            parent: 'modal',
            views: {
              'modal@': {
                controller: 'ChooseAccountTypeCtrl',
                controllerAs: 'chooseAccountType',
                template: require('modules/squared/devices/addDeviceNew/ChooseAccountTypeTemplate.tpl.html'),
              },
            },
            params: {
              wizard: null,
            },
          })
          .state('addDeviceFlow.choosePersonal', {
            parent: 'modal',
            views: {
              'modal@': {
                controller: 'ChoosePersonalCtrl',
                controllerAs: 'choosePersonal',
                template: require('modules/squared/devices/addDeviceNew/ChoosePersonalTemplate.tpl.html'),
              },
            },
            params: {
              wizard: null,
            },
          })
          .state('addDeviceFlow.chooseSharedSpace', {
            parent: 'modal',
            views: {
              'modal@': {
                controller: 'ChooseSharedSpaceCtrl',
                controllerAs: 'choosePlace',
                template: require('modules/squared/devices/addDeviceNew/ChooseSharedSpaceTemplate.tpl.html'),
              },
            },
            params: {
              wizard: null,
            },
          })
          .state('addDeviceFlow.newSharedSpace', {
            parent: 'modal',
            views: {
              'modal@': {
                controller: 'NewSharedSpaceCtrl',
                controllerAs: 'newPlace',
                template: require('modules/squared/devices/addPlace/NewSharedSpaceTemplate.tpl.html'),
              },
            },
            params: {
              wizard: null,
            },
          })
          .state('addDeviceFlow.addLines', {
            parent: 'modal',
            views: {
              'modal@': {
                controller: 'AddLinesCtrl',
                controllerAs: 'addLines',
                template: require('modules/squared/common/AddLinesTemplate.tpl.html'),
              },
            },
            params: {
              wizard: null,
            },
          })
          .state('addDeviceFlow.showActivationCode', {
            parent: 'modal',
            params: {
              wizard: null,
            },
            views: {
              'modal@': {
                template: require('modules/squared/devices/addDeviceNew/ShowActivationCodeTemplate.tpl.html'),
                controller: 'ShowActivationCodeCtrl',
                controllerAs: 'showActivationCode',
              },
            },
          })
          .state('addDeviceFlow.editServices', {
            parent: 'modal',
            params: {
              wizard: null,
            },
            views: {
              'modal@': {
                template: require('modules/squared/places/editServices/EditServicesTemplate.tpl.html'),
                controller: 'EditServicesCtrl',
                controllerAs: 'editServices',
              },
            },
          })
          .state('addDeviceFlow.editCalendarService', {
            parent: 'modal',
            params: {
              wizard: null,
            },
            views: {
              'modal@': {
                template: '<edit-calendar-service id="edit-calendar-modal" class="modal-content" dismiss="$dismiss()"></edit-calendar-service>',
              },
            },
          })
          .state('addDeviceFlow.callConnectOptions', {
            parent: 'modal',
            params: {
              wizard: null,
            },
            views: {
              'modal@': {
                template: '<call-connect-options id="call-connect-options-modal" class="modal-content" dismiss="$dismiss()"></call-connect-options>',
              },
            },
          })
          .state('activate', {
            url: '/activate',
            views: {
              'main@': {
                template: require('modules/squared/views/activate.html'),
                controller: 'ActivateCtrl',
              },
            },
            resolve: {
              lazy: resolveLazyLoad(function (done) {
                require.ensure([], function () {
                  done(require('modules/squared/scripts/controllers/activate'));
                }, 'activate');
              }),
            },
            authenticate: false,
          })
          .state('csadmin', {
            url: '/csadmin?eqp',
            template: require('modules/squared/csadmin/csadmin.html'),
            controller: 'CsAdminCtrl',
            parent: 'main',
          })
          .state('downloads', {
            url: '/downloads',
            parent: 'main-unauthenticated',
            template: require('modules/squared/views/downloads.html'),
            controller: 'DownloadsCtrl',
            authenticate: false,
          })
          .state('domainmanagement', {
            template: require('modules/core/domainManagement/domainManagement.tpl.html'),
            parent: 'main',
          })
          .state('domainmanagement.add', {
            parent: 'modalSmall',
            views: {
              'modal@': {
                controller: 'DomainManageAddCtrl',
                controllerAs: 'dmpopup',
                template: require('modules/core/domainManagement/add.tpl.html'),
              },
            },
            params: {
              loggedOnUser: null,
            },
          })
          .state('domainmanagement.instructions', {
            parent: 'modalSmall',
            views: {
              'modal@': {
                controller: 'DomainManageInstructionsCtrl',
                controllerAs: 'dmpopup',
                template: require('modules/core/domainManagement/instructions.tpl.html'),
              },
            },
            params: {
              domain: null,
              loggedOnUser: null,
            },
          })
          .state('domainmanagement.delete', {
            parent: 'modalDialog',
            views: {
              'modal@': {
                controller: 'DomainManageDeleteCtrl',
                controllerAs: 'dmpopup',
                template: require('modules/core/domainManagement/delete.tpl.html'),
              },
            },
            params: {
              domain: null,
              loggedOnUser: null,
            },
          })
          .state('domainmanagement.unclaim', {
            parent: 'modalSmall',
            views: {
              'modal@': {
                controller: 'DomainManageDeleteCtrl',
                controllerAs: 'dmpopup',
                template: require('modules/core/domainManagement/unclaim.tpl.html'),
              },
            },
            params: {
              domain: null,
              loggedOnUser: null,
            },
          })
          .state('domainmanagement.claim', {
            parent: 'modalSmall',
            views: {
              'modal@': {
                controller: 'DomainManageClaimCtrl',
                controllerAs: 'dmpopup',
                template: require('modules/core/domainManagement/claim.tpl.html'),
              },
            },
            params: {
              domain: null,
              loggedOnUser: null,
            },
          })
          .state('domainmanagement.verify', {
            parent: 'modalSmall',
            views: {
              'modal@': {
                controller: 'DomainManageVerifyCtrl',
                controllerAs: 'dmpopup',
                template: require('modules/core/domainManagement/verify.tpl.html'),
              },
            },
            params: {
              domain: null,
              loggedOnUser: null,
            },
          })
          .state('settings', {
            url: '/settings',
            template: require('modules/core/settings/settings.tpl.html'),
            controller: 'SettingsCtrl',
            controllerAs: 'settingsCtrl',
            parent: 'main',
            params: {
              showSettings: null,
            },
          })
          .state('profile', {
            url: '/profile',
            template: require('modules/core/partnerProfile/partnerProfile.tpl.html'),
            controller: 'PartnerProfileCtrl',
            parent: 'main',
          })
          .state('brandingUpload', {
            parent: 'modalSmall',
            views: {
              'modal@': {
                template: require('modules/core/partnerProfile/branding/brandingUpload.tpl.html'),
                controller: 'BrandingCtrl',
                controllerAs: 'brandupload',
              },
            },
            authenticate: false,
          })
          .state('brandingExample', {
            parent: 'modal',
            views: {
              'modal@': {
                template: require('modules/core/partnerProfile/branding/brandingExample.tpl.html'),
                controller: 'BrandingExampleCtrl',
                controllerAs: 'brandEg',
              },
            },
            authenticate: false,
            params: {
              modalType: 'Partner',
            },
          })
          .state('deviceBrandingExample', {
            parent: 'modal',
            views: {
              'modal@': {
                template: require('modules/core/settings/branding/deviceBrandingExample.html'),
                controller: 'BrandingExampleCtrl',
                controllerAs: 'brandEg',
              },
            },
            authenticate: false,
          })
          .state('processorder', {
            url: '/processorder',
            template: require('modules/squared/views/processorder.html'),
            controller: 'ProcessorderCtrl',
            controllerAs: 'processOrder',
            parent: 'main-unauthenticated',
            authenticate: false,
          })
          .state('overview', {
            url: '/overview',
            template: require('modules/core/overview/overview.tpl.html'),
            controller: 'OverviewCtrl',
            controllerAs: 'overview',
            parent: 'main',
          })
          .state('my-company', {
            template: require('modules/core/myCompany/myCompanyPage.tpl.html'),
            controller: 'MyCompanyPageCtrl',
            controllerAs: 'mcp',
            parent: 'main',
            abstract: true,
          })
          .state('my-company.subscriptions', {
            url: '/my-company/subscriptions',
            resolve: {
              account: /* @ngInject */ function (AccountService) {
                return AccountService.updateAuthinfoAccount();
              },
            },
            views: {
              tabContent: {
                controllerAs: 'mcpSub',
                controller: 'MySubscriptionCtrl',
                template: require('modules/core/myCompany/mySubscriptions/mySubscription.tpl.html'),
              },
            },
          })
          .state('my-company.info', {
            url: '/my-company',
            views: {
              tabContent: {
                controllerAs: 'mcpInfo',
                controller: 'MyCompanyPageInfoCtrl',
                template: require('modules/core/myCompany/myCompanyPageInfo.tpl.html'),
              },
            },
          })
          .state('my-company.orders', {
            url: '/my-company/orders',
            views: {
              tabContent: {
                template: '<my-company-orders></my-company-orders>',
              },
            },
          })
          .state('my-company.billing', {
            url: '/my-company/billing',
            views: {
              tabContent: {
                template: '<my-company-billing></my-company-billing>',
              },
            },
          })
          .state('users', {
            abstract: true,
            template: '<div ui-view></div>',
            parent: 'main',
          })
          .state('users.list', {
            url: '/users',
            template: require('modules/core/users/userList/userList.tpl.html'),
            controller: 'UserListCtrl',
            params: {
              showAddUsers: {},
              preSelectedUserId: '',
            },
          })
          .state('users.delete', {
            parent: 'modalDialog',
            views: {
              'modal@': {
                controller: 'UserDeleteCtrl',
                controllerAs: 'userDelete',
                template: require('modules/core/users/userDelete/userDelete.tpl.html'),
                resolve: {
                  modalInfo: function ($state) {
                    $state.params.modalId = 'deleteUserModal';
                    $state.params.modalClass = 'modalContent';
                  },
                },
              },
            },
            params: {
              deleteUserOrgId: null,
              deleteUserUuId: null,
              deleteUsername: null,
            },
          })
          .state('users.deleteSelf', {
            parent: 'modalDialog',
            views: {
              'modal@': {
                controller: 'UserDeleteCtrl',
                controllerAs: 'userDelete',
                template: require('modules/core/users/userDelete/userDeleteSelf.tpl.html'),
                resolve: {
                  modalInfo: function ($state) {
                    $state.params.modalId = 'deleteUserModal';
                    $state.params.modalClass = 'modalContent';
                  },
                },
              },
            },
            params: {
              deleteUserOrgId: null,
              deleteUserUuId: null,
              deleteUsername: null,
            },
          })
          .state('users.add', {
            parent: 'modal',
            abstract: true,
            views: {
              'modal@': {
                controller: 'OnboardCtrl',
                controllerAs: 'obc',
                template: '<div ui-view="usersAdd"></div>',
              },
            },
          })
          .state('users.add.manual', {
            views: {
              'usersAdd@users.add': {
                template: '<manual-add-users-modal auto-assign-template-data="$resolve.autoAssignTemplateData" dismiss="$dismiss()"></manual-add-users-modal>',
              },
            },
            resolve: stateParamsToResolveParams({
              resetOnboardStoreStates: null,
              autoAssignTemplateData: null,
            }),
            params: {
              resetOnboardStoreStates: null,
              autoAssignTemplateData: null,
            },
          })
          .state('users.add.services', {
            views: {
              'usersAdd@users.add': {
                template: require('modules/core/users/userAdd/assignServicesModal.tpl.html'),
                resolve: {
                  modalInfo: function ($state) {
                    $state.params.modalClass = 'add-users';
                    $state.params.modalId = 'modalContent';
                  },
                },
              },
            },
          })
          .state('users.add.services.dn', {
            views: {
              'usersAdd@users.add': {
                template: require('modules/huron/users/assignDnAndDirectLinesModal.tpl.html'),
              },
            },
          })
          .state('users.add.results', {
            views: {
              'usersAdd@users.add': {
                template: '<add-users-results-modal dismiss="$dismiss()" convert-pending="$resolve.convertPending" convert-users-flow="$resolve.convertUsersFlow" num-updated-users="$resolve.numUpdatedUsers" num-added-users="$resolve.numAddedUsers" results="$resolve.results"></add-users-results-modal>',
              },
            },
            resolve: stateParamsToResolveParams({
              convertPending: false,
              convertUsersFlow: false,
              numUpdatedUsers: 0,
              numAddedUsers: 0,
              results: [],
            }),
            params: {
              convertPending: false,
              convertUsersFlow: false,
              numUpdatedUsers: 0,
              numAddedUsers: 0,
              results: [],
            },
          })

          ///////////////////////////
          .state('users.manage.picker', {
            controller: 'UserManageModalPickerController',
            template: '<div class="user-manage-picker__center-spinner"><i class="icon icon-spinner icon-5x"></i></div>',
          })
          .state('users.manage', {
            abstract: true,
            parent: 'modal',
            resolve: {
              account: /* @ngInject */ function (AccountService) {
                return AccountService.updateAuthinfoAccount();
              },
            },
            views: {
              'modal@': {
                controller: 'UserManageModalController',
                controllerAs: 'ummc',
                template: '<div ui-view></div>',
              },
            },
          })
          .state('users.manage.org', {
            controller: 'UserManageOrgController',
            controllerAs: 'umoc',
            template: require('modules/core/users/userManage/userManageOrg.tpl.html'),
          })
          .state('users.manage.activedir', {
            controller: 'UserManageActiveDirController',
            controllerAs: 'umadc',
            template: require('modules/core/users/userManage/userManageActiveDir.tpl.html'),
          })
          .state('users.manage.emailSuppress', {
            template: '<user-manage-email-suppress dismiss="$dismiss()"></user-manage-email-suppress>',
            params: {
              manageType: null,
              prevState: null,
            },
          })
          .state('users.manage.dir-sync', {
            abstract: true,
            controller: 'UserManageDirSyncController',
            controllerAs: 'umds',
            template: require('modules/core/users/userManage/dir-sync/user-manage-dir-sync.html'),
          })
          // TODO refactor used logic from 'AddUserCtrl' -> 'UserManageDirSyncController' and rm AddUserCtrl
          .state('users.manage.dir-sync.add', {
            abstract: true,
            controller: 'AddUserCtrl',
            controllerAs: 'auc',
            template: '<div ui-view class="flex-container flex-item-resize"></div>',
          })
          .state('users.manage.dir-sync.add.ob', {
            abstract: true,
            controller: 'OnboardCtrl',
            controllerAs: 'obc',
            template: '<div ui-view class="flex-container flex-item-resize"></div>',
          })
          .state('users.manage.dir-sync.add.ob.autoAssignLicenseSummary', {
            template: '<user-manage-dir-sync-auto-assign-license-summary></user-manage-dir-sync-auto-assign-license-summary>',
          })
          .state('users.manage.dir-sync.add.ob.installConnector', {
            template: require('modules/core/users/userManage/dir-sync/user-manage-dir-sync-install-connector.html'),
          })
          .state('users.manage.dir-sync.add.ob.syncStatus', {
            template: require('modules/core/users/userManage/dir-sync/user-manage-dir-sync-status.html'),
          })
          .state('users.manage.dir-sync.add.ob.dirsyncServices', {
            template: require('modules/core/users/userManage/dir-sync/user-manage-dir-sync-assign-services.html'),
            controller: /* @ngInject */ function ($scope) {
              $scope.dirsyncInitForServices();
            },
          })
          .state('users.manage.dir-sync.add.ob.dirsyncResult', {
            template: require('modules/core/users/userManage/dir-sync/user-manage-dir-sync-results.html'),
            controller: /* @ngInject */ function ($scope) {
              $scope.umds.isBusy = true;
              $scope.csv.model = $scope.model;
              $scope.bulkSave().then(function () {
                $scope.umds.isBusy = false;
              });
            },
          })
          .state('users.manage.edit-auto-assign-template-modal', {
            template: '<edit-auto-assign-template-modal dismiss="$dismiss()" prev-state="$resolve.prevState" is-edit-template-mode="$resolve.isEditTemplateMode" auto-assign-template-data="$resolve.autoAssignTemplateData"></edit-auto-assign-template-modal>',
            resolve: stateParamsToResolveParams({
              prevState: 'users.manage.picker',
              isEditTemplateMode: false,
              autoAssignTemplateData: null,
              userEntitlementsStateData: null,
            }),
            params: {
              prevState: 'users.manage.picker',
              isEditTemplateMode: false,
              autoAssignTemplateData: null,
              userEntitlementsStateData: null,
            },
          })
          .state('users.manage.edit-summary-auto-assign-template-modal', {
            template: '<edit-summary-auto-assign-template-modal dismiss="$dismiss()" auto-assign-template-data="$resolve.autoAssignTemplateData" is-edit-template-mode="$resolve.isEditTemplateMode"></edit-summary-auto-assign-template-modal>',
            resolve: stateParamsToResolveParams({
              autoAssignTemplateData: null,
              isEditTemplateMode: false,
            }),
            params: {
              autoAssignTemplateData: null,
              isEditTemplateMode: false,
            },
          })
          .state('users.manage.onboard-summary-for-auto-assign-modal', {
            template: '<onboard-summary-for-auto-assign-modal dismiss="$dismiss()" auto-assign-template-data="$resolve.autoAssignTemplateData" user-list="$resolve.userList"></onboard-summary-for-auto-assign-modal>',
            resolve: stateParamsToResolveParams({
              autoAssignTemplateData: null,
              userList: null,
            }),
            params: {
              autoAssignTemplateData: null,
              userList: null,
            },
          })

          //////////////////

          .state('users.convert', {
            parent: 'modal',
            views: {
              'modal@': {
                controller: 'OnboardCtrl',
                template: '<div ui-view="usersConvert" class="convert-users"></div>',
              },
              'usersConvert@users.convert': {
                template: '<cr-convert-users-modal/>',
                resolve: {
                  modalInfo: function ($state) {
                    $state.params.modalId = 'convertDialog';
                  },
                },
              },
            },
            params: {
              manageUsers: false,
              readOnly: false,
              isDefaultAutoAssignTemplateActivated: undefined,
            },
            resolve: {
              isDefaultAutoAssignTemplateActivated: /* @ngInject */ function ($stateParams, AutoAssignTemplateModel, AutoAssignTemplateService, FeatureToggleService) {
                return FeatureToggleService.supports(FeatureToggleService.features.atlasF3745AutoAssignLicenses).then(function (isEnabled) {
                  if (!isEnabled) {
                    return;
                  }

                  if (typeof $stateParams.isDefaultAutoAssignTemplateActivated !== 'undefined') {
                    AutoAssignTemplateModel.isDefaultAutoAssignTemplateActivated = $stateParams.isDefaultAutoAssignTemplateActivated;
                    return;
                  }
                  return AutoAssignTemplateService.isDefaultAutoAssignTemplateActivated().then(function (isDefaultAutoAssignTemplateActivated) {
                    AutoAssignTemplateModel.isDefaultAutoAssignTemplateActivated = isDefaultAutoAssignTemplateActivated;
                  });
                });
              },
            },
          })
          .state('users.convert.auto-assign-license-summary', {
            views: {
              'usersConvert@users.convert': {
                template: '<user-convert-auto-assign-license-summary save="convertUsers()" save-loading="btnConvertLoad" dismiss="$dismiss()"></user-convert-auto-assign-license-summary>',
              },
            },
          })
          .state('users.convert.services', {
            views: {
              'usersConvert@users.convert': {
                template: require('modules/core/users/userAdd/assignServicesModal.tpl.html'),
              },
            },
          })
          .state('users.convert.services.dn', {
            views: {
              'usersConvert@users.convert': {
                template: require('modules/huron/users/assignDnAndDirectLinesModal.tpl.html'),
              },
            },
          })
          .state('users.convert.results', {
            views: {
              'usersConvert@users.convert': {
                template: '<add-users-results-modal dismiss="$dismiss()" convert-pending="$resolve.convertPending" convert-users-flow="$resolve.convertUsersFlow" num-updated-users="$resolve.numUpdatedUsers" num-added-users="$resolve.numAddedUsers" results="$resolve.results"></add-users-results-modal>',
              },
            },
            resolve: stateParamsToResolveParams({
              convertPending: false,
              convertUsersFlow: false,
              numUpdatedUsers: 0,
              numAddedUsers: 0,
              results: [],
            }),
            params: {
              convertPending: false,
              convertUsersFlow: false,
              numUpdatedUsers: 0,
              numAddedUsers: 0,
              results: [],
            },
          })
          .state('users.csv', {
            parent: 'users.manage',
            views: {
              'modal@': {
                controller: 'UserCsvCtrl',
                controllerAs: 'csv',
                template: '<div ui-view="usersCsv"></div>',
              },
              'usersCsv@users.csv': {
                template: require('modules/core/users/userCsv/userCsvFileModal.tpl.html'),
              },
            },
          })
          .state('users.csv.results', {
            views: {
              'usersCsv@users.csv': {
                template: require('modules/core/users/userCsv/userCsvResultsModal.tpl.html'),
              },
            },
          })
          .state('users.csv.task-manager', {
            views: {
              'usersCsv@users.csv': {
                template: '<user-task-manager-modal dismiss="$dismiss()"></user-task-manager-modal>',
              },
            },
            params: {
              job: {
                fileName: undefined,
                fileData: undefined,
                exactMatchCsv: undefined,
              },
              task: undefined,
            },
          })
          .state('editService', {
            parent: 'modal',
            resolve: {
              account: /* @ngInject */ function (AccountService) {
                return AccountService.updateAuthinfoAccount();
              },
            },
            views: {
              'modal@': {
                controller: 'OnboardCtrl',
                template: '<div ui-view="editServices"></div>',
              },
              'editServices@editService': {
                template: require('modules/core/users/userOverview/editServices.tpl.html'),
              },
            },
            params: {
              currentUser: {},
            },
          })
          .state('editService.dn', {
            views: {
              'editServices@editService': {
                template: require('modules/huron/users/assignDnAndDirectLinesModal.tpl.html'),
              },
            },
          })
          .state('userRedirect', {
            parent: 'mainLazyLoad',
            url: '/userRedirect',
            views: {
              'main@': {
                controller: 'userRedirectCtrl',
                controllerAs: 'userRedirect',
                template: require('modules/core/users/userRedirect/userRedirect.tpl.html'),
              },
            },
          })
          .state('user-overview', {
            parent: 'sidepanel',
            views: {
              'sidepanel@': {
                controller: 'UserOverviewCtrl',
                controllerAs: 'userOverview',
                template: require('modules/core/users/userOverview/userOverview.tpl.html'),
              },
              'header@user-overview': {
                template: require('modules/core/users/userOverview/userHeader.tpl.html'),
              },
              'userPending@user-overview': {
                template: require('modules/core/users/userOverview/userPending.tpl.html'),
              },
              'side-panel-container@user-overview': {
                template: require('modules/core/users/userOverview/userOverviewFirstScreen.tpl.html'),
              },
            },
            resolve: {
              currentUser: /* @ngInject */ function (UserOverviewService, $stateParams) {
                return UserOverviewService.getUser($stateParams.currentUserId)
                  .then(function (response) {
                    $stateParams.currentUser = response.user;
                    $stateParams.entitlements = response.sqEntitlements;
                  });
              },
              displayName: translateDisplayName('common.overview'),
            },
            params: {
              currentUser: {},
              entitlements: {},
              queryuserslist: {},
              currentUserId: '',
              orgInfo: {},
              preferredLanguageDetails: {},
              userLocation: {},
              memberType: '',
            },
            data: {},
          })
          .state('user-overview.communication', {
            views: {
              'side-panel-container@user-overview': {
                template: '<user-call-overview></user-call-overview>',
              },
            },
            params: {
              reloadToggle: false,
            },
            data: {},
            resolve: {
              lazy: resolveLazyLoad(function (done) {
                require.ensure([], function () {
                  done(require('modules/huron/overview'));
                }, 'user-call-overview');
              }),
              displayName: translateDisplayName('sidePanelBreadcrumb.call'),
            },
          })
          .state('user-overview.userDetails', {
            views: {
              'side-panel-container@user-overview': {
                template: '<uc-preferred-language-details preferred-language-feature="$resolve.preferredLanguageDetails"></uc-preferred-language-details>',
              },
            },
            params: {
              reloadToggle: false,
            },
            data: {},
            resolve: {
              displayName: translateDisplayName('usersPreview.userDetails'),
              lazy: resolveLazyLoad(function (done) {
                require.ensure([], function () {
                  done(require('modules/huron/preferredLanguage/preferredLanguageDetails'));
                }, 'uc-preferred-language-details');
              }),
              preferredLanguageDetails: /* @ngInject */ function ($stateParams) {
                return _.get($stateParams, 'preferredLanguageDetails');
              },
            },
          })
          .state('user-overview.userLocationDetails', {
            views: {
              'side-panel-container@user-overview': {
                template: '<uc-user-location-details user-id="$resolve.userId" userLocation="$resolve.userLocation"></uc-user-location-details>',
              },
            },
            params: {
              reloadToggle: false,
              userDetails: {},
              userLocation: {},
            },
            data: {},
            resolve: {
              displayName: translateDisplayName('usersPreview.location'),
              lazy: resolveLazyLoad(function (done) {
                require.ensure([], function () {
                  done(require('modules/call/locations/locations-user-details'));
                }, 'locations-user-details');
              }),
              userId: /* @ngInject */ function ($stateParams) {
                return _.get($stateParams.currentUser, 'id');
              },
              userLocation: /* @ngInject */ function ($stateParams) {
                return _.get($stateParams.userLocation, 'userLocation');
              },
            },
          })
          .state('user-overview.csdmDevice', {
            views: {
              'side-panel-container@user-overview': {
                controller: 'DeviceOverviewCtrl',
                controllerAs: 'deviceOverview',
                template: require('modules/squared/devices/overview/deviceOverview.tpl.html'),
              },
            },
            resolve: {
              channels: /* @ngInject */ function (CsdmUpgradeChannelService) {
                return CsdmUpgradeChannelService.getUpgradeChannelsPromise();
              },
              displayName: translateDisplayName('sidePanelBreadcrumb.deviceConfiguration'),
            },
            params: {
              currentDevice: {},
              huronDeviceService: {},
            },
            data: {},
          })
          .state('user-overview.csdmDevice.emergencyServices', {
            views: {
              'side-panel-container@user-overview': {
                template: '<uc-emergency-services></uc-emergency-services>',
              },
            },
            resolve: {
              displayName: translateDisplayName('spacesPage.emergencyTitle'),
            },
            data: {},
            params: {
              currentAddress: {},
              currentNumber: '',
              status: '',
              staticNumber: '',
            },
          })
          .state('user-overview.communication.voicemail', {
            views: {
              'side-panel-container@user-overview': {
                template: '<uc-user-voicemail  owner-id="$resolve.ownerId"></uc-user-voicemail>',
              },
            },
            params: {
              watcher: null,
              selected: null,
            },
            data: {},
            resolve: {
              lazy: resolveLazyLoad(function (done) {
                require.ensure([], function () {
                  done(require('modules/huron/voicemail'));
                }, 'user-call-voicemail');
              }),
              displayName: translateDisplayName('sidePanelBreadcrumb.voiceMail'),
              ownerId: /* @ngInject */ function ($stateParams) {
                return _.get($stateParams.currentUser, 'id');
              },
            },
          })
          .state('user-overview.communication.snr', {

            views: {
              'side-panel-container@user-overview': {
                template: '<uc-snr owner-id="$resolve.ownerId" ></uc-snr>',
              },
            },
            data: {},
            resolve: {
              lazy: resolveLazyLoad(function (done) {
                require.ensure([], function () {
                  done(require('modules/huron/snr'));
                }, 'user-call-snr');
              }),
              ownerId: /* @ngInject */ function ($stateParams) {
                return _.get($stateParams.currentUser, 'id');
              },
              displayName: translateDisplayName('singleNumberReachPanel.title'),
            },
          })
          .state('user-overview.communication.speedDials', {
            views: {
              'side-panel-container@user-overview': {
                template: '<uc-speed-dial owner-type="users" owner-id="$resolve.ownerId"></uc-speed-dial>',
              },
            },
            data: {},
            resolve: {
              lazy: resolveLazyLoad(function (done) {
                require.ensure([], function () {
                  done(require('modules/huron/speedDials'));
                }, 'user-call-speed-dials');
              }),
              ownerId: /* @ngInject */ function ($stateParams) {
                return _.get($stateParams.currentUser, 'id');
              },
              displayName: translateDisplayName('telephonyPreview.speedDials'),
            },
          })
          .state('user-overview.communication.phoneButtonLayout', {
            views: {
              'side-panel-container@user-overview': {
                template: '<uc-phone-button-layout owner-type="users" owner-id="$resolve.ownerId"></uc-phone-button-layout>',
              },
            },
            resolve: {
              lazy: resolveLazyLoad(function (done) {
                require.ensure([], function () {
                  done(require('modules/huron/phoneButtonLayout'));
                }, 'user-call-phonebuttonlayout');
              }),
              ownerId: /* @ngInject */ function ($stateParams) {
                return _.get($stateParams.currentUser, 'id');
              },
              data: /* @ngInject */ function ($state, $translate) {
                $state.get('user-overview.communication.phoneButtonLayout').data.displayName = $translate.instant('telephonyPreview.phoneButtonLayout');
              },
            },
          })
          .state('user-overview.communication.cos', {
            views: {
              'side-panel-container@user-overview': {
                template: '<uc-user-cos-form member-type="users" member-id="$resolve.ownerId"></uc-user-cos-form>',
              },
            },
            resolve: {
              lazy: resolveLazyLoad(function (done) {
                require.ensure([], function () {
                  done(require('modules/huron/cos/user'));
                }, 'user-call-cos');
              }),
              ownerId: /* @ngInject */ function ($stateParams) {
                return _.get($stateParams.currentUser, 'id');
              },
              displayName: translateDisplayName('serviceSetupModal.cos.title'),
            },
          })
          .state('user-overview.communication.externaltransfer', {
            views: {
              'side-panel-container@user-overview': {
                template: '<uc-external-transfer member-type="users" member-id="$resolve.ownerId"></uc-external-transfer>',
              },
            },
            params: {
              watcher: null,
              selected: null,
            },
            resolve: {
              lazy: resolveLazyLoad(function (done) {
                require.ensure([], function () {
                  done(require('modules/huron/externaltransfer'));
                }, 'user-call-externaltransfer');
              }),
              ownerId: /* @ngInject */ function ($stateParams) {
                return _.get($stateParams.currentUser, 'id');
              },
              displayName: translateDisplayName('serviceSetupModal.externalTransfer.title'),
            },
          })
          .state('user-overview.communication.internationalDialing', {
            views: {
              'side-panel-container@user-overview': {
                template: '<uc-dialing  watcher="$resolve.watcher" selected="$resolve.selected" title="internationalDialingPanel.title"></uc-dialing>',
              },
            },
            params: {
              watcher: null,
              selected: null,
            },
            data: {},
            resolve: {
              watcher: /* @ngInject */ function ($stateParams) {
                return _.get($stateParams, 'watcher');
              },
              selected: /* @ngInject */ function ($stateParams) {
                return _.get($stateParams, 'selected');
              },
              displayName: translateDisplayName('internationalDialingPanel.title'),
            },
          })
          .state('user-overview.communication.local', {
            views: {
              'side-panel-container@user-overview': {
                template: '<uc-dialing  watcher="$resolve.watcher" selected="$resolve.selected" title="telephonyPreview.localDialing"></uc-dialing>',
              },
            },
            params: {
              watcher: null,
              selected: null,
            },
            data: {},
            resolve: {
              watcher: /* @ngInject */ function ($stateParams) {
                return _.get($stateParams, 'watcher');
              },
              selected: /* @ngInject */ function ($stateParams) {
                return _.get($stateParams, 'selected');
              },
              displayName: translateDisplayName('telephonyPreview.localDialing'),
            },
          })
          .state('user-overview.communication.primaryLine', {
            template: '<uc-primary-line owner-id="$resolve.ownerId" line-selection="$resolve.lineSelection"></uc-primary-line>',
            params: {
              ownerId: null,
              lineSelection: {},
            },
            data: {},
            resolve: {
              lazy: resolveLazyLoad(function (done) {
                require.ensure([], function () {
                  done(require('modules/huron/primaryLine'));
                }, 'uc-primary-line');
              }),
              ownerId: /* @ngInject */ function ($stateParams) {
                return _.get($stateParams.currentUser, 'id');
              },
              lineSelection: /* @ngInject */ function ($stateParams) {
                return _.get($stateParams, 'lineSelection', {});
              },
              displayName: translateDisplayName('primaryLine.title'),
            },
          })
          .state('user-overview.communication.line-overview', {
            views: {
              'side-panel-container@user-overview': {
                template: '<uc-line-overview owner-type="user" owner-name="$resolve.ownerName" owner-id="$resolve.ownerId" number-id="$resolve.numberId"></uc-line-overview>',
              },
            },
            params: {
              numberId: '',
            },
            data: {},
            resolve: {
              lazy: resolveLazyLoad(function (done) {
                require.ensure([], function () {
                  done(require('modules/huron/lines/lineOverview'));
                }, 'user-call-line');
              }),
              displayName: translateDisplayName('directoryNumberPanel.title'),
              ownerId: /* @ngInject */ function ($stateParams) {
                return _.get($stateParams.currentUser, 'id');
              },
              ownerName: /* @ngInject */ function ($stateParams) {
                return _.get($stateParams.currentUser, 'displayName');
              },
              numberId: /* @ngInject */ function ($stateParams) {
                return _.get($stateParams, 'numberId', '');
              },
            },
          })
          .state('user-overview.messaging', {
            views: {
              'side-panel-container@user-overview': {
                template: require('modules/core/users/userOverview/messaging-preview/messaging-preview.html'),
                controller: 'MessagingPreviewCtrl',
                controllerAs: '$ctrl',
              },
            },
            data: {},
            resolve: {
              displayName: translateDisplayName('sidePanelBreadcrumb.userOverViewMessage'),
            },
            params: {
              licenseType: 'MESSAGING',
            },
          })
          .state('user-overview.hybrid-services-spark-hybrid-impinterop', {
            views: {
              'side-panel-container@user-overview': {
                template: '<hybrid-message-user-settings user-id="$resolve.userId" user-email-address="$resolve.userName"></hybrid-message-user-settings>',
              },
            },
            data: {},
            resolve: {
              userId: /* @ngInject */ function ($stateParams) {
                return $stateParams.currentUser.id;
              },
              userName: /* @ngInject */ function ($stateParams) {
                return $stateParams.currentUser.userName;
              },
              displayName: translateDisplayName('hercules.hybridServiceNames.spark-hybrid-impinterop'),
            },
          })
          .state('user-overview.hybrid-services-spark-hybrid-impinterop.history', {
            views: {
              'side-panel-container@user-overview': {
                template: '<user-status-history service-id="\'spark-hybrid-impinterop\'"></user-status-history>',
              },
            },
            data: {},
            resolve: {
              displayName: translateDisplayName('sidePanelBreadcrumb.statusHistory'),
            },
            params: {
              serviceId: {},
            },
          })
          .state('user-overview.hybrid-services-squared-fusion-cal', {
            views: {
              'side-panel-container@user-overview': {
                template: '<hybrid-calendar-service-user-settings user-id="$resolve.userId" user-email-address="$resolve.userName" preferred-web-ex-site-name="$resolve.preferredWebExSiteName"></hybrid-calendar-service-user-settings>',
              },
            },
            data: {},
            resolve: {
              userId: /* @ngInject */ function ($stateParams) {
                return $stateParams.currentUser.id;
              },
              userName: /* @ngInject */ function ($stateParams) {
                return $stateParams.currentUser.userName;
              },
              preferredWebExSiteName: /* @ngInject */ function ($stateParams, HybridServiceUserSidepanelHelperService) {
                return HybridServiceUserSidepanelHelperService.getPreferredWebExSiteName($stateParams.currentUser, $stateParams.orgInfo);
              },
              displayName: translateDisplayName('hercules.serviceNames.squared-fusion-cal'),
            },
          })
          .state('user-overview.hybrid-services-squared-fusion-cal.history', {
            views: {
              'side-panel-container@user-overview': {
                template: '<user-status-history service-id="\'squared-fusion-cal\'"></user-status-history>',
              },
            },
            data: {},
            resolve: {
              displayName: translateDisplayName('sidePanelBreadcrumb.statusHistory'),
            },
            params: {
              serviceId: {},
            },
          })
          .state('user-overview.hybrid-services-squared-fusion-uc', {
            views: {
              'side-panel-container@user-overview': {
                template: '<hybrid-call-service-aggregated-section user-id="$resolve.userId" user-email-address="$resolve.userName"></hybrid-call-service-aggregated-section>',
              },
            },
            data: {},
            resolve: {
              userId: /* @ngInject */ function ($stateParams) {
                return $stateParams.currentUser.id;
              },
              userName: /* @ngInject */ function ($stateParams) {
                return $stateParams.currentUser.userName;
              },
              displayName: translateDisplayName('hercules.serviceNames.squared-fusion-uc'),
            },
          })
          .state('user-overview.hybrid-services-squared-fusion-uc.aware-settings', {
            views: {
              'side-panel-container@user-overview': {
                template: '<hybrid-call-service-aware-user-settings user-id="$resolve.userId" user-email-address="$resolve.userEmailAddress"></hybrid-call-service-aware-user-settings>',
              },
            },
            data: {},
            params: {
              userId: '',
              userEmailAddress: '',
            },
            resolve: {
              userId: /* @ngInject */ function ($stateParams) {
                return $stateParams.userId;
              },
              displayName: translateDisplayName('sidePanelBreadcrumb.aware'),
              userEmailAddress: /* @ngInject */ function ($stateParams) {
                return $stateParams.userEmailAddress;
              },
            },
          })
          .state('user-overview.hybrid-services-squared-fusion-uc.aware-settings.uc-history', {
            views: {
              'side-panel-container@user-overview': {
                template: '<user-status-history service-id="\'squared-fusion-uc\'"></user-status-history>',
              },
            },
            data: {},
            resolve: {
              displayName: translateDisplayName('sidePanelBreadcrumb.statusHistory'),
            },
            params: {
              serviceId: {},
            },
          })
          .state('user-overview.hybrid-services-squared-fusion-uc.connect-settings', {
            views: {
              'side-panel-container@user-overview': {
                template: '<hybrid-call-service-connect-user-settings user-id="$resolve.userId" user-email-address="$resolve.userEmailAddress" user-test-tool-feature-toggled="$resolve.userTestToolFeatureToggled"></hybrid-call-service-connect-user-settings>',
              },
            },
            data: {},
            params: {
              userId: '',
              userEmailAddress: '',
            },
            resolve: {
              displayName: translateDisplayName('sidePanelBreadcrumb.connect'),
              userId: /* @ngInject */ function ($stateParams) {
                return $stateParams.userId;
              },
              userEmailAddress: /* @ngInject */ function ($stateParams) {
                return $stateParams.userEmailAddress;
              },
              userTestToolFeatureToggled: /* @ngInject */ function (FeatureToggleService) {
                return FeatureToggleService.supports(FeatureToggleService.features.atlasHybridCallUserTestTool);
              },
            },
          })
          .state('user-overview.hybrid-services-squared-fusion-uc.connect-settings.ec-history', {
            views: {
              'side-panel-container@user-overview': {
                template: '<user-status-history service-id="\'squared-fusion-ec\'"></user-status-history>',
              },
            },
            data: {},
            resolve: {
              displayName: translateDisplayName('sidePanelBreadcrumb.statusHistory'),
            },
            params: {
              serviceId: {},
            },
          })
          .state('user-overview.conferencing', {
            views: {
              'side-panel-container@user-overview': {
                template: require('modules/core/users/userOverview/conferencePreview.tpl.html'),
                controller: 'ConferencePreviewCtrl',
                controllerAs: 'confPreview',
              },
            },
            data: {},
            resolve: {
              displayName: translateDisplayName('sidePanelBreadcrumb.meeting'),
            },
            params: {
              service: 'CONFERENCING',
            },
          })
          .state('user-overview.conferencing.webex', {
            views: {
              'side-panel-container@user-overview': {
                template: require('modules/webex/userSettings/userSettings.tpl.html'),
                controller: 'WebExUserSettingsCtrl',
              },
            },
            data: {},
            resolve: {
              displayName: translateDisplayName('sidePanelBreadcrumb.meeting'),
            },
            params: {
              currentUser: {},
              site: {},
            },
          })
          .state('user-overview.conferencing.webex.webex2', {
            views: {
              'side-panel-container@user-overview': {
                template: require('modules/webex/userSettings/userSettings2.tpl.html'),
                controller: 'WebExUserSettings2Ctrl',
              },
            },
            data: {},
            resolve: {
              displayName: translateDisplayName('sidePanelBreadcrumb.privileges'),
            },
            params: {
              currentUser: {},
              site: {},
            },
          })
          .state('user-overview.contactCenter', {
            views: {
              'side-panel-container@user-overview': {
                template: require('modules/sunlight/users/userOverview/sunlightUserOverview.tpl.html'),
                controller: 'SunlightUserOverviewCtrl',
                controllerAs: 'SunlightUserOverview',
              },
            },
            data: {},
            resolve: {
              displayName: translateDisplayName('sidePanelBreadcrumb.care'),
            },
            params: {
              service: 'CONTACTCENTER',
            },
          })
          .state('user-overview.user-profile', {
            views: {
              'side-panel-container@user-overview': {
                controller: 'UserRolesCtrl',
                template: require('modules/core/users/userRoles/userRoles.tpl.html'),
              },
            },
            resolve: {
              displayName: translateDisplayName('usersPreview.userDetails'),
            },
          })
          .state('user-overview.roles-and-security', {
            views: {
              'side-panel-container@user-overview': {
                controller: 'UserRolesCtrl',
                template: require('modules/core/users/userRoles/userRoles.tpl.html'),
              },
            },
            data: {},
            resolve: {
              displayName: translateDisplayName('usersPreview.rolesAndSecurity'),
            },
          })

          // FOR Development: allow editing of user's feature toggles
          .state('edit-featuretoggles', {
            url: '/editfeaturetoggles',
            template: '<feature-toggles-editor></feature-toggles-editor>',
            parent: 'main',
            resolve: {
              lazy: resolveLazyLoad(function (done) {
                require(['modules/core/featureToggle/editor'], done);
              }),
            },
          })

          .state('organizations', {
            url: '/organizations',
            template: require('modules/core/organizations/organizationList/organizationList.tpl.html'),
            controller: 'ListOrganizationsCtrl',
            parent: 'main',
          })
          .state('organization-overview', {
            parent: 'sidepanel',
            views: {
              'sidepanel@': {
                controller: 'OrganizationOverviewCtrl',
                controllerAs: 'orgOverview',
                template: require('modules/core/organizations/organizationOverview/organizationOverview.tpl.html'),
              },
              'header@organization-overview': {
                template: require('modules/core/organizations/organizationOverview/organizationHeader.tpl.html'),
              },
            },
            params: {
              currentOrganization: null,
            },
            data: {},
            resolve: {
              displayName: translateDisplayName('common.overview'),
            },
          })
          .state('organization-overview.features', {
            views: {
              'side-panel-container@organization-overview': {
                template: require('modules/core/organizations/organizationFeatures/organizationFeatures.tpl.html'),
                controller: 'OrganizationFeaturesCtrl',
                controllerAs: 'features',
              },
            },
            params: {
              reloadToggle: false,
            },
            data: {},
            resolve: {
              displayName: translateDisplayName('organizationsPage.betaFeatures'),
            },
          })
          .state('site-list', {
            url: '/site-list',
            template: require('modules/core/siteList/siteListBase.tpl.html'),
            controller: 'WebExSiteBaseCtrl',
            controllerAs: 'siteList',
            parent: 'main',
            resolve: {
              accountLinkingPhase2: /* @ngInject */ function (FeatureToggleService) {
                return FeatureToggleService.supports(FeatureToggleService.features.atlasAccountLinkingPhase2);
              },
            },
          })
          .state('site-list.not-linked', {
            url: '/not-linked',
            views: {
              tabContent: {
                controllerAs: 'siteList',
                controller: 'WebExSiteRowCtrl',
                template: require('modules/core/siteList/siteList.tpl.html'),
              },
            },
          })
          .state('site-list.linked', {
            url: '/services/linked',
            views: {
              tabContent: {
                template: '<linked-sites originator="$resolve.originator"></linked-sites>',
              },
            },
            params: {
              originator: 'Menu',
            },
            resolve: {
              originator: /*@ngInject */ function ($stateParams) {
                return $stateParams['originator'];
              },
            },
          })
          .state('site-list.linked.details', {
            parent: 'sidepanel',
            views: {
              'sidepanel@': {
                template: '<linked-sites-details selected-site-info="$resolve.selectedSiteInfo" show-wizard-fn="$resolve.showWizardFn(siteInfo)" launch-webex-fn="$resolve.launchWebexFn(site, useHomepage)"></linked-sites-details>',
              },
            },
            params: {
              selectedSiteInfo: null,
              showWizardFn: null,
              launchWebexFn: null,
            },
            data: {},
            resolve: {
              displayName: translateDisplayName('accountLinking.siteDetails.breadCrumb'),
              selectedSiteInfo: /*@ngInject */ function ($stateParams) {
                return $stateParams['selectedSiteInfo'];
              },
              showWizardFn: /*@ngInject */ function ($stateParams) {
                return $stateParams['showWizardFn'];
              },
              launchWebexFn: /*@ngInject */ function ($stateParams) {
                return $stateParams['launchWebexFn'];
              },
            },
          })
          .state('site-list.linked.details.wizard', {
            views: {
              'modal@': {
                template: '<account-linking-wizard dismiss="$dismiss()" site-info="$resolve.siteInfo" operation="$resolve.operation" launch-webex-fn="$resolve.launchWebexFn(site, useHomepage)" set-account-linking-mode-fn="$resolve.setAccountLinkingModeFn(siteUrl, mode, domains)"></account-linking-wizard>',
                resolve: {
                  modalInfo: function ($state) {
                    $state.params.modalClass = 'account-linking-wizard-custom';
                  },
                },
              },
            },
            params: {
              siteInfo: null,
              operation: null,
              launchWebexFn: null,
              setAccountLinkingModeFn: null,
            },
            resolve: {
              siteInfo: /*@ngInject */ function ($stateParams) {
                return $stateParams['siteInfo'];
              },
              operation: /*@ngInject */ function ($stateParams) {
                return $stateParams['operation'];
              },
              launchWebexFn: /*@ngInject */ function ($stateParams) {
                return $stateParams['launchWebexFn'];
              },
              setAccountLinkingModeFn: /*@ngInject */ function ($stateParams) {
                return $stateParams['setAccountLinkingModeFn'];
              },
            },
            onEnter: modalOnEnter({
              type: 'full',
            }),
            onExit: modalOnExit,
          })
          .state('site-list-add', {
            parent: 'modal',
            views: {
              'modal@': {
                template: '<webex-add-site-modal  modal-title="\'firstTimeWizard.addWebexSite\'" dismiss="$dismiss()" class="context-modal add-webex-site"></webex-add-site-modal>',
              },
            },
          })
          .state('site-list-distribute-licenses', {
            parent: 'modal',
            views: {
              'modal@': {
                template: '<webex-add-site-modal subscription-id="$resolve.subscriptionId" single-step="3" modal-title="\'webexSiteManagement.redistributeLicenses\'" dismiss="$dismiss()" class="context-modal add-webex-site"></webex-add-site-modal>',
              },
            },
            params: {
              subscriptionId: null,
            },
            resolve: {
              subscriptionId: /* @ngInject */ function ($stateParams) {
                return $stateParams['subscriptionId'];
              },
            },
          })
          .state('site-list-delete', {
            parent: 'modal',
            views: {
              'modal@': {
                template: '<webex-delete-site-modal subscription-id="$resolve.subscriptionId" site-url="$resolve.siteUrl" dismiss="$dismiss()" class="context-modal add-webex-site"></webex-delete-site-modal>',
              },
            },
            params: {
              subscriptionId: null,
              siteUrl: null,
            },
            resolve: {
              subscriptionId: /* @ngInject */ function ($stateParams) {
                return $stateParams['subscriptionId'];
              },
              siteUrl: /* @ngInject */ function ($stateParams) {
                return $stateParams['siteUrl'];
              },
            },
          })
          .state('site-csv', {
            parent: 'modalSmall',
            views: {
              'modal@': {
                controller: 'SiteCSVModalCtrl',
                template: require('modules/webex/siteCSVModal/siteCSVModal.tpl.html'),
                controllerAs: 'siteCSVModalCtrl',
              },
            },
            params: {
              siteRow: null,
            },
          })
          .state('site-csv-results', {
            parent: 'modalSmall',
            views: {
              'modal@': {
                controller: 'SiteCSVResultsCtrl',
                template: require('modules/webex/siteCSVResultsModal/siteCSVResults.tpl.html'),
                controllerAs: 'siteCSVResult',
              },
            },
            params: {
              siteRow: null,
            },
          })
          .state('site-list.site-settings', {
            template: require('modules/webex/siteSettings/siteSettings.tpl.html'),
            controller: 'WebExSiteSettingsCtrl',
            parent: 'main',
            params: {
              siteUrl: null,
            },
          })
          .state('site-list.site-setting', {
            template: require('modules/webex/siteSetting/siteSetting.tpl.html'),
            controller: 'WebExSiteSettingCtrl',
            parent: 'main',
            params: {
              siteUrl: null,
              webexPageId: null,
              settingPageIframeUrl: null,
            },
          })
          .state('reports', {
            url: '/reports',
            template: require('modules/core/customerReports/customerReportsHeader.tpl.html'),
            controller: 'CustomerReportsHeaderCtrl',
            controllerAs: 'header',
            parent: 'main',
          })
          .state('reports.spark', {
            url: '/spark',
            views: {
              tabContent: {
                controllerAs: 'nav',
                controller: 'SparkReportCtrl',
                template: require('modules/core/customerReports/sparkReports/sparkReports.tpl.html'),
              },
            },
          })
          .state('reports.sparkMetrics', {
            url: '/sparkMetrics',
            views: {
              tabContent: {
                controllerAs: 'nav',
                controller: 'SparkMetricsCtrl',
                template: require('modules/core/customerReports/sparkMetrics/sparkMetrics.tpl.html'),
              },
            },
          })
          .state('reports.webex-metrics', {
            url: '/webexMetrics',
            views: {
              tabContent: {
                controllerAs: 'nav',
                controller: 'WebExMetricsCtrl',
                template: require('modules/core/customerReports/webexMetrics/webexMetrics.tpl.html'),
              },
            },
          })
          .state('reports.webex-metrics.metrics', {
            url: '/:siteUrl/metrics',
            views: {
              metricsContent: {
                template: '<metrics-frame></metrics-frame>',
              },
            },
          })
          .state('reports.webex-metrics.MEI', {
            url: '/:siteUrl/MEI',
            views: {
              metricsContent: {
                template: '<metrics-frame></metrics-frame>',
              },
            },
          })
          .state('reports.webex-metrics.system', {
            url: '/system',
            views: {
              metricsContent: {
                template: '<metrics-frame></metrics-frame>',
              },
            },
          })
          .state('reports.webex-metrics.main', {
            url: '/main/:reportType',
            views: {
              metricsContent: {
                template: '<metrics-frame></metrics-frame>',
              },
            },
            params: {
              reportType: null,
            },
          })
          .state('reports.webex-metrics.dashboard', {
            url: '/dashboard',
            views: {
              metricsContent: {
                template: '<metrics-frame></metrics-frame>',
              },
            },
          })
          .state('reports.webex-metrics.jms', {
            url: '/jms',
            views: {
              metricsContent: {
                template: '<metrics-frame></metrics-frame>',
              },
            },
          })
          .state('reports.webex-metrics.jmt', {
            url: '/jmt',
            views: {
              metricsContent: {
                template: '<metrics-frame></metrics-frame>',
              },
            },
          })
          .state('reports.webex-metrics.diagnostics', {
            url: '/diagnostics',
            views: {
              metricsContent: {
                template: '<dgc-webex-reports-search></dgc-webex-reports-search>',
              },
            },
          })
          .state('dgc', {
            parent: 'main',
            template: '<div ui-view></div>',
          })
          .state('dgc.tab', {
            template: '<dgc-tab></dgc-tab>',
          })
          .state('dgc.tab.meetingdetail', {
            url: '/diagnostics/meeting/:cid',
            views: {
              tabContent: {
                template: '<dgc-tab-meetingdetail></dgc-tab-meetingdetail>',
              },
            },
          })
          .state('dgc.tab.participants', {
            url: '/diagnostics/participants/:cid',
            views: {
              tabContent: {
                template: '<dgc-tab-participants></dgc-tab-participants>',
              },
            },
          })
          .state('reports.webex-metrics.classic', {
            url: '/classic',
            views: {
              metricsContent: {
                controllerAs: 'nav',
                controller: 'WebexReportsCtrl',
                template: require('modules/core/customerReports/webexReports/webexReports.tpl.html'),
              },
            },
            params: {
              siteUrl: null,
            },
          })
          .state('reports.mediaservice', {
            url: '/mediaservice',
            views: {
              tabContent: {
                controllerAs: 'nav',
                controller: 'MediaReportsController',
                template: require('modules/mediafusion/reports/media-reports-phase-two.html'),
              },
            },
            resolve: {
              hasMFMultipleInsightFeatureToggle: /* @ngInject */ function (FeatureToggleService) {
                return FeatureToggleService.supports(FeatureToggleService.features.atlasMediaServiceMultipleInsights);
              },
            },
          })
          .state('reports.care', {
            url: '/care',
            views: {
              tabContent: {
                controllerAs: 'nav',
                controller: 'CareReportsController',
                template: require('modules/sunlight/reports/careReports.tpl.html'),
              },
            },
          })
          .state('reports.device-usage', {
            url: '/device/usage',
            views: {
              tabContent: {
                controllerAs: 'deviceUsage',
                controller: 'DeviceUsageCtrl',
                template: require('modules/core/customerReports/deviceUsage/total.tpl.html'),
              },
            },
          })
          .state('reports.webex', {
            url: '/webex',
            views: {
              tabContent: {
                controllerAs: 'nav',
                controller: 'WebexReportsCtrl',
                template: require('modules/core/customerReports/webexReports/webexReports.tpl.html'),
              },
            },
            params: {
              siteUrl: null,
            },
          })
          .state('webex-reports-iframe', {
            template: require('modules/webex/siteReportsIframe/siteReportIframe.tpl.html'),
            controller: 'ReportsIframeCtrl',
            parent: 'main',
            params: {
              siteUrl: null,
              reportPageId: null,
              reportPageIframeUrl: null,
            },
            data: {
              displayName: 'Reports Page2',
            },
          })
          .state('userprofile', {
            url: '/userprofile/:uid',
            template: require('modules/squared/views/userprofile.html'),
            controller: 'UserProfileCtrl',
            parent: 'main',
          })
          .state('support', {
            url: '/support',
            template: require('modules/squared/support/support.html'),
            controller: 'SupportCtrl',
            parent: 'main',
            resolve: {
              hasAtlasHybridCallUserTestTool: /* @ngInject */ function (FeatureToggleService) {
                return FeatureToggleService.supports(FeatureToggleService.features.atlasHybridCallUserTestTool);
              },
            },
          })
          .state('support.status', {
            url: '/status',
            views: {
              supportPane: {
                template: require('modules/squared/support/support-status.html'),
                controller: 'SupportCtrl',
                controllerAs: 'support',
              },
            },
          })
          .state('support.logs', {
            url: '/logs?search',

            views: {
              supportPane: {
                template: require('modules/squared/support/support-logs.html'),
                controller: 'SupportCtrl',
              },
            },
          })
          .state('support.billing', {
            url: '/billing?enc',
            views: {
              supportPane: {
                template: require('modules/squared/support/support-billing.html'),
                controller: 'BillingCtrl',
              },
            },

          })
          .state('billing', {
            url: '/orderprovisioning?enc',
            template: require('modules/squared/support/billing.tpl.html'),
            controller: 'BillingCtrl',
            parent: 'main',
          })

          /*
           devices
           */
          .state('places', {
            url: '/places',
            template: require('modules/squared/places/places.html'),
            controller: 'PlacesCtrl',
            controllerAs: 'sc',
            parent: 'main',
            params: {
              preSelectedPlaceId: '',
            },
            data: {
              bodyClass: 'places-page',
            },
          })
          .state('place-overview', {
            parent: 'sidepanel',
            views: {
              'sidepanel@': {
                template: '<place-overview></place-overview>',
              },
              'header@place-overview': {
                template: require('modules/squared/places/overview/placeHeader.html'),
              },
            },
            params: {
              currentPlace: {},
            },
            data: {},
            resolve: {
              displayName: /* @ngInject */ function ($translate, FeatureToggleService) {
                return FeatureToggleService.csdmDevicePlaceLinkGetStatus().then(function (enabled) {
                  if (enabled) {
                    _.set(this, 'data.displayName', $translate.instant('sidePanelBreadcrumb.place'));
                  } else {
                    _.set(this, 'data.displayName', $translate.instant('sidePanelBreadcrumb.overview'));
                  }
                }.bind(this));
              },
            },
          })
          .state('place-overview.placeLocationDetails', {
            views: {
              'side-panel-container@place-overview': {
                template: '<uc-user-location-details user-id="$resolve.userId"></uc-user-location-details>',
              },
            },
            params: {
              reloadToggle: false,
              userDetails: {},
              memberType: '',
            },
            data: {},
            resolve: {
              displayName: translateDisplayName('usersPreview.location'),
              lazy: resolveLazyLoad(function (done) {
                require.ensure([], function () {
                  done(require('modules/call/locations/locations-user-details'));
                }, 'locations-user-details');
              }),
              userId: /* @ngInject */ function ($stateParams) {
                return _.get($stateParams.currentPlace, 'cisUuid');
              },
            },
          })
          .state('place-overview.preferredLanguage', {
            views: {
              'side-panel-container@place-overview': {
                template: '<uc-preferred-language-details preferred-language-feature="$resolve.preferredLanguageFeature"></uc-preferred-language-details>',
              },
            },
            params: {
              reloadToggle: false,
              preferredLanguageFeature: {},
            },
            data: {},
            resolve: {
              displayName: translateDisplayName('serviceSetupModal.preferredLanguage'),
              lazy: resolveLazyLoad(function (done) {
                require.ensure([], function () {
                  done(require('modules/huron/preferredLanguage/preferredLanguageDetails'));
                }, 'uc-preferred-language-details');
              }),
              preferredLanguageFeature: /* @ngInject */ function ($stateParams) {
                return _.get($stateParams, 'preferredLanguageFeature');
              },
            },
          })
          .state('place-overview.csdmDevice', {
            views: {
              'side-panel-container@place-overview': {
                controller: 'DeviceOverviewCtrl',
                controllerAs: 'deviceOverview',
                template: require('modules/squared/devices/overview/deviceOverview.tpl.html'),
              },
            },
            resolve: {
              channels: /* @ngInject */ function (CsdmUpgradeChannelService) {
                return CsdmUpgradeChannelService.getUpgradeChannelsPromise();
              },
              displayName: /* @ngInject */ function ($translate, FeatureToggleService) {
                return FeatureToggleService.csdmDevicePlaceLinkGetStatus().then(function (enabled) {
                  if (enabled) {
                    _.set(this, 'data.displayName', $translate.instant('sidePanelBreadcrumb.device'));
                  } else {
                    _.set(this, 'data.displayName', $translate.instant('sidePanelBreadcrumb.deviceConfiguration'));
                  }
                }.bind(this));
              },
            },
            params: {
              currentDevice: {},
              huronDeviceService: {},
            },
            data: {},
          })
          .state('place-overview.csdmDevice.emergencyServices', {
            views: {
              'side-panel-container@place-overview': {
                template: '<uc-emergency-services></uc-emergency-services>',
              },
            },
            resolve: {
              displayName: translateDisplayName('spacesPage.emergencyTitle'),
            },
            data: {},
            params: {
              currentAddress: {},
              currentNumber: '',
              status: '',
              staticNumber: '',
            },
          })
          .state('place-overview.communication', {
            views: {
              'side-panel-container@place-overview': {
                template: '<place-call-overview></place-call-overview>',
              },
            },
            params: {
              reloadToggle: false,
            },
            data: {},
            resolve: {
              lazy: resolveLazyLoad(function (done) {
                require.ensure([], function () {
                  done(require('modules/squared/places/callOverview'));
                }, 'place-call-overview');
              }),
              displayName: translateDisplayName('sidePanelBreadcrumb.call'),
            },
          })
          .state('place-overview.communication.speedDials', {
            views: {
              'side-panel-container@place-overview': {
                template: '<uc-speed-dial owner-type="places" owner-id="$resolve.ownerId"></uc-speed-dial>',
              },
            },
            data: {},
            resolve: {
              lazy: resolveLazyLoad(function (done) {
                require.ensure([], function () {
                  done(require('modules/huron/speedDials'));
                }, 'place-call-speed-dials');
              }),
              ownerId: /* @ngInject */ function ($stateParams) {
                return _.get($stateParams.currentPlace, 'cisUuid');
              },
              displayName: translateDisplayName('telephonyPreview.speedDials'),
            },
          })
          .state('place-overview.communication.phoneButtonLayout', {
            views: {
              'side-panel-container@place-overview': {
                template: '<uc-phone-button-layout owner-type="places" owner-id="$resolve.ownerId"></uc-phone-button-layout>',
              },
            },
            resolve: {
              lazy: resolveLazyLoad(function (done) {
                require.ensure([], function () {
                  done(require('modules/huron/phoneButtonLayout'));
                }, 'place-call-phonebuttonlayout');
              }),
              ownerId: /* @ngInject */ function ($stateParams) {
                return _.get($stateParams.currentPlace, 'id');
              },
              data: /* @ngInject */ function ($state, $translate) {
                $state.get('place-overview.communication.phoneButtonLayout').data.displayName = $translate.instant('telephonyPreview.phoneButtonLayout');
              },
            },
          })
          .state('place-overview.communication.cos', {
            views: {
              'side-panel-container@place-overview': {
                template: '<uc-user-cos-form member-type="places" member-id="$resolve.ownerId"></uc-user-cos-form>',
              },
            },
            resolve: {
              lazy: resolveLazyLoad(function (done) {
                require.ensure([], function () {
                  done(require('modules/huron/cos/user'));
                }, 'place-call-cos');
              }),
              ownerId: /* @ngInject */ function ($stateParams) {
                return _.get($stateParams.currentPlace, 'cisUuid');
              },
              displayName: translateDisplayName('serviceSetupModal.cos.title'),
            },
          })
          .state('place-overview.communication.internationalDialing', {
            views: {
              'side-panel-container@place-overview': {
                template: '<uc-dialing  watcher="$resolve.watcher" selected="$resolve.selected" title="internationalDialingPanel.title"></uc-dialing>',
              },
            },
            params: {
              watcher: null,
              selected: null,
            },
            data: {},
            resolve: {
              watcher: /* @ngInject */ function ($stateParams) {
                return _.get($stateParams, 'watcher');
              },
              selected: /* @ngInject */ function ($stateParams) {
                return _.get($stateParams, 'selected');
              },
              displayName: translateDisplayName('telephonyPreview.internationalDialing'),
            },
          })
          .state('place-overview.communication.local', {
            views: {
              'side-panel-container@place-overview': {
                template: '<uc-dialing  watcher="$resolve.watcher" selected="$resolve.selected" title="telephonyPreview.localDialing"></uc-dialing>',
              },
            },
            params: {
              watcher: null,
              selected: null,
            },
            data: {},
            resolve: {
              watcher: /* @ngInject */ function ($stateParams) {
                return _.get($stateParams, 'watcher');
              },
              selected: /* @ngInject */ function ($stateParams) {
                return _.get($stateParams, 'selected');
              },
              displayName: translateDisplayName('telephonyPreview.localDialing'),
            },
          })
          .state('place-overview.communication.line-overview', {
            views: {
              'side-panel-container@place-overview': {
                template: '<uc-line-overview owner-type="place" owner-name="$resolve.ownerName" owner-id="$resolve.ownerId" owner-place-type="$resolve.ownerPlaceType" number-id="$resolve.numberId"></uc-line-overview>',
              },
            },
            params: {
              numberId: '',
            },
            data: {},
            resolve: {
              lazy: resolveLazyLoad(function (done) {
                require.ensure([], function () {
                  done(require('modules/huron/lines/lineOverview'));
                }, 'place-call-line');
              }),
              ownerId: /* @ngInject */ function ($stateParams) {
                return _.get($stateParams.currentPlace, 'cisUuid');
              },
              ownerName: /* @ngInject */ function ($stateParams) {
                return _.get($stateParams.currentPlace, 'displayName');
              },
              ownerPlaceType: /* @ngInject */ function ($stateParams) {
                return _.get($stateParams.currentPlace, 'type');
              },
              numberId: /* @ngInject */ function ($stateParams) {
                return _.get($stateParams, 'numberId', '');
              },
              displayName: translateDisplayName('directoryNumberPanel.title'),
            },
          })
          .state('place-overview.communication.externaltransfer', {
            views: {
              'side-panel-container@place-overview': {
                template: '<uc-external-transfer member-type="places" member-id="$resolve.ownerId"></uc-external-transfer>',
              },
            },
            resolve: {
              lazy: resolveLazyLoad(function (done) {
                require.ensure([], function () {
                  done(require('modules/huron/externaltransfer'));
                }, 'place-call-externaltransfer');
              }),
              ownerId: /* @ngInject */ function ($stateParams) {
                return _.get($stateParams.currentPlace, 'cisUuid');
              },
              displayName: translateDisplayName('serviceSetupModal.externalTransfer.title'),
            },
          })
          .state('place-overview.communication.primaryLine', {
            template: '<uc-primary-line owner-id="$resolve.placeId" line-selection="$resolve.lineSelection"></uc-primary-line>',
            params: {
              placeId: null,
              lineSelection: {},
            },
            data: {},
            resolve: {
              lazy: resolveLazyLoad(function (done) {
                require.ensure([], function () {
                  done(require('modules/huron/primaryLine'));
                }, 'uc-primary-line');
              }),
              placeId: /* @ngInject */ function ($stateParams) {
                return _.get($stateParams.currentPlace, 'cisUuid');
              },
              displayName: translateDisplayName('primaryLine.title'),
              lineSelection: /* @ngInject */ function ($stateParams) {
                return _.get($stateParams, 'lineSelection');
              },
            },
          })
          .state('place-overview.hybrid-services-squared-fusion-cal', {
            views: {
              'side-panel-container@place-overview': {
                template: require('modules/squared/places/overview/hybrid-calendar-service-place-settings/hybridCalendarServicePlaceSettings.template.html'),
                controller: 'HybridCalendarServicePlaceSettingsCtrl',
              },
            },
            data: {},
            resolve: {
              displayName: translateDisplayName('hercules.serviceNames.squared-fusion-cal'),
            },
            params: {
              serviceId: {},
              parentState: 'place-overview',
              editService: {},
              getCurrentPlace: {},
            },
          })
          .state('place-overview.hybrid-services-squared-fusion-cal.history', {
            views: {
              'side-panel-container@place-overview': {
                template: '<user-status-history service-id="\'squared-fusion-cal\'"></user-status-history>',
              },
            },
            data: {
              displayName: 'Status History',
            },
            params: {
              serviceId: {},
            },
            resolve: {
              displayName: translateDisplayName('sidePanelBreadcrumb.statusHistory'),
            },
          })
          .state('place-overview.hybrid-services-squared-fusion-gcal', {

            views: {
              'side-panel-container@place-overview': {
                template: require('modules/squared/places/overview/hybrid-calendar-service-place-settings/hybridCalendarServicePlaceSettings.template.html'),
                controller: 'HybridCalendarServicePlaceSettingsCtrl',
              },
            },
            data: {},
            resolve: {
              displayName: translateDisplayName('hercules.serviceNames.squared-fusion-cal'),
            },
            params: {
              serviceId: {},
              editService: {},
              getCurrentPlace: {},
            },
          })
          .state('place-overview.hybrid-services-squared-fusion-gcal.history', {
            views: {
              'side-panel-container@place-overview': {
                template: '<user-status-history service-id="\'squared-fusion-gcal\'"></user-status-history>',
              },
            },
            data: {},
            params: {
              serviceId: {},
            },
            resolve: {
              displayName: translateDisplayName('sidePanelBreadcrumb.statusHistory'),
            },
          })
          .state('place-overview.hybrid-services-squared-fusion-uc', {
            views: {
              'side-panel-container@place-overview': {
                template: require('modules/squared/places/overview/hybrid-call-service-place-settings/hybridCallServicePlaceSettings.template.html'),
                controller: 'HybridCallServicePlaceSettingsCtrl',
              },
            },
            data: {},
            params: {
              editService: {},
              getCurrentPlace: {},
            },
            resolve: {
              displayName: translateDisplayName('hercules.serviceNames.squared-fusion-uc'),
            },
          })
          .state('place-overview.hybrid-services-squared-fusion-uc.uc-history', {
            views: {
              'side-panel-container@place-overview': {
                template: '<user-status-history service-id="\'squared-fusion-uc\'"></user-status-history>',
              },
            },
            data: {},
            params: {
              serviceId: {},
            },
            resolve: {
              displayName: translateDisplayName('sidePanelBreadcrumb.awareStatusHistory'),
            },
          })
          .state('devices', {
            url: '/devices',
            template: '<devices-redux></devices-redux>',
            parent: 'main',
          })
          .state('devices.search', {
            url: '/search/:q',
          })
          .state('device-overview', {
            parent: 'sidepanel',
            views: {
              'sidepanel@': {
                controller: 'DeviceOverviewCtrl',
                controllerAs: 'deviceOverview',
                template: require('modules/squared/devices/overview/deviceOverview.tpl.html'),
              },
              'header@device-overview': {
                template: require('modules/squared/devices/overview/deviceHeader.tpl.html'),
              },
            },
            resolve: {
              channels: /* @ngInject */ function (CsdmUpgradeChannelService) {
                return CsdmUpgradeChannelService.getUpgradeChannelsPromise();
              },
              displayName: translateDisplayName('sidePanelBreadcrumb.overview'),
            },
            params: {
              currentDevice: {},
              huronDeviceService: {},
              deviceDeleted: null,
            },
          })
          .state('device-overview.emergencyServices', {
            parent: 'device-overview',
            views: {
              'sidepanel@': {
                template: '<uc-emergency-services></uc-emergency-services>',
              },
              'header@device-overview.emergencyServices': {
                template: require('modules/squared/devices/emergencyServices/emergencyServicesHeader.tpl.html'),
              },
            },
            resolve: {
              displayName: translateDisplayName('spacesPage.emergencyTitle'),
            },
            data: {},
            params: {
              currentAddress: {},
              currentNumber: '',
              status: '',
              staticNumber: '',
            },
          })
          .state('video', {
            parent: 'modal',
            views: {
              'modal@': {
                template: '<cr-video-modal class="modal-content" dismiss="$dismiss()"></cr-video-modal>',
              },
            },
            resolve: {
              lazy: resolveLazyLoad(function (done) {
                require.ensure([], function () {
                  done(require('modules/core/video'));
                }, 'video');
              }),
            },
          })
          .state('partneroverview', {
            parent: 'partner',
            url: '/overview',
            template: require('modules/core/partnerHome/partnerHome.tpl.html'),
            controller: 'PartnerHomeCtrl',
          })
          .state('partnerreports', {
            parent: 'partner',
            url: '/reports',
            template: '<div ui-view></div>',
            controller: 'PartnerReportsSwitchCtrl',
          })
          .state('partnerreports.base', {
            parent: 'partner',
            url: '/base',
            template: require('modules/core/partnerReports/partnerReports.tpl.html'),
            controller: 'PartnerReportCtrl',
            controllerAs: 'nav',
          })
          .state('partnerreports.tab', {
            parent: 'partner',
            template: '<partner-reports-tabs></partner-reports-tabs>',
          })
          .state('partnerreports.tab.base', {
            url: '/metrics',
            template: require('modules/core/partnerReports/partnerReports.tpl.html'),
            controller: 'PartnerReportCtrl',
            controllerAs: 'nav',
          })
          .state('partnerreports.tab.ccaReports', {
            template: '<cca-reports-tabs></cca-reports-tabs>',
          })
          .state('partnerreports.tab.ccaReports.group', {
            url: '/ccareports/:name',
            template: '<cca-reports report-chart-data="$ctrl.chartsData"></cca-reports>',
          })
          .state('partnerreports.spark', {
            parent: 'partner',
            url: '/spark',
            template: require('modules/core/partnerReports/sparkReports/sparkReports.tpl.html'),
            controller: 'SparkReportsCtrl',
            controllerAs: '$ctrl',
          })
          .state('partnercustomers', {
            parent: 'partner',
            template: '<div ui-view></div>',
            absract: true,
          })
          .state('gem', {
            parent: 'partner',
            controller: 'GemCtrl',
            template: '<div ui-view></div>',
          })
          .state('gemOverview', {
            parent: 'partner',
            url: '/services/overview',
            template: '<cca-card></cca-card>',
          })
          .state('gem.servicesPartner', {
            url: '/services/spList',
            template: require('modules/gemini/common/servicePartner.tpl.html'),
            controller: 'servicePartnerCtrl',
            controllerAs: 'gsls',
          })
          .state('gem.base', {
            abstract: true,
            template: '<gem-base></gem-base>',
          })
          .state('gem.base.cbgs', {
            controller: 'CbgsCtrl',
            controllerAs: 'cbgsCtrl',
            url: '/services/gemcbg/:companyName/:customerId',
            template: require('modules/gemini/callbackGroup/cbgs.tpl.html'),
          })
          .state('gem.base.tds', {
            url: '/services/td/:companyName/:customerId',
            template: '<gm-telephony-domains></gm-telephony-domains>',
          })
          .state('gem.modal', {
            abstract: true,
            parent: 'modal',
            views: {
              'modal@': {
                template: '<div ui-view></div>',
              },
            },
          })
          .state('gem.modal.request', {
            controller: 'CbgRequestCtrl',
            controllerAs: 'cbgrCtrl',
            params: {
              customerId: null,
            },
            template: require('modules/gemini/callbackGroup/cbgRequest.tpl.html'),
          })
          .state('gmTdDetails', {
            data: {},
            params: {
              info: {},
            },
            parent: 'sidepanel',
            views: {
              'sidepanel@': {
                template: '<gm-td-details></gm-td-details>',
              },
              'header@gmTdDetails': {
                template: require('modules/gemini/telephonyDomain/details/gmTdDetailsHeader.tpl.html'),
              },
            },
          })
          .state('gmTdDetails.sites', {
            params: {
              data: {},
            },
            views: {
              'side-panel-container@gmTdDetails': {
                template: '<gm-td-sites></gm-td-sites>',
              },
            },
          })
          .state('gmTdDetails.notes', {
            views: {
              'side-panel-container@gmTdDetails': {
                template: '<gm-td-notes></gm-td-notes>',
              },
            },
            params: {
              obj: {},
            },
          })
          .state('gmTdNumbersRequest', {
            data: {},
            params: {
              info: {},
            },
            parent: 'largepanel',
            views: {
              'sidepanel@': {
                template: '<gm-td-numbers></gm-td-numbers>',
              },
              'header@gmTdNumbersRequest': {
                template: require('modules/gemini/telephonyDomain/details/gmTdDetailsHeader.tpl.html'),
              },
            },
          })
          .state('gmTdDetails.gmTdNumbers', {
            views: {
              'side-panel-container@gmTdDetails': {
                template: '<gm-td-numbers></gm-td-numbers>',
              },
            },
            onEnter: SidePanelLargeOpen,
            onExit: SidePanelLargeClose,
          })
          .state('gemCbgDetails', {
            data: {},
            parent: 'sidepanel',
            params: {
              info: {},
            },
            views: {
              'sidepanel@': {
                template: '<cbg-details></cbg-details>',
              },
            },
          })
          .state('gemCbgDetails.sites', {
            views: {
              'side-panel-container@gemCbgDetails': {
                template: '<cbg-sites></cbg-sites>',
              },
            },
            params: {
              obj: {},
            },
          })
          .state('gemCbgDetails.editCountry', {
            views: {
              'side-panel-container@gemCbgDetails': {
                template: '<cbg-edit-country></cbg-edit-country>',
              },
            },
            params: {
              obj: {},
            },
          })
          .state('gemCbgDetails.notes', {
            views: {
              'side-panel-container@gemCbgDetails': {
                template: '<cbg-notes></cbg-notes>',
              },
            },
            params: {
              obj: {},
            },
          })
          .state('partnercustomers.list', {
            url: '/customers',
            template: require('modules/core/customers/customerList/customerList.tpl.html'),
            controller: 'CustomerListCtrl',
            controllerAs: 'customerList',
            params: {
              filter: null,
            },
          })
          .state('partner-services-overview', {
            url: '/services-overview',
            template: '<services-overview url-params="$resolve.urlParams"></services-overview>',
            parent: 'partner',
            resolve: {
              urlParams: /* @ngInject */ function ($stateParams) {
                return $stateParams;
              },
            },
          })
          .state('taasSuites', {
            parent: 'main',
            url: '/taasSuite',
            template: '<taas-suite-view></taas-suite-view>',
          })
          .state('taasTaskView', {
            parent: 'main',
            url: '/taasTaskView',
            template: '<taas-task-view suite="$resolve.suite"></taas-task-view>',
            params: {
              suite: {},
            },
            resolve: {
              lazy: resolveLazyLoad(function (done) {
                require.ensure([], function () {
                  done(require('modules/hcs/task-manager/task/task-view.component'));
                }, 'taas-test-view');
              }),
              suite: /* @ngInject */ function ($stateParams) {
                return $stateParams.suite;
              },
            },
          })
          .state('taasResource', {
            parent: 'main',
            url: '/taasResource',
            template: '<taas-resource-view></taas-resource-view>',
          })
          .state('taasSchedule', {
            parent: 'main',
            url: '/taasSchedule',
            template: '<taas-schedule-view></taas-schedule-view>',
          })
          .state('taasScheduleView.list', {
            url: '/taasScheduleView',
            template: '<taas-schedule-view></taas-schedule-view>',
            params: {
              filter: null,
            },
          })
          .state('taasResults', {
            parent: 'main',
            url: '/taasResults',
            template: '<taas-results-view></taas-results-view>',
          })
          .state('taasResultsView.list', {
            url: '/taasResultsView',
            template: '<taas-results-view></taas-results-view>',
            params: {
              filter: null,
            },
          })
          .state('taasServiceManager', {
            abstract: true,
            parent: 'modalSmall',
            views: {
              'modal@': {
                template: '<div ui-view></div>',
              },
            },
          })
          .state('taasServiceManager.scheduler', {
            parent: 'taasServiceManager',
            params: {
              suite: {},
              customerId: '',
            },
            views: {
              'modal@': {
                template: '<schedule-create-modal suite="$resolve.suite" customerId="$resolve.customerId"  class="modal-content" style="margin:initial" dismiss="$dismiss()" close="$close()"></tsm-modal>',
              },
            },
            resolve: {
              suite: /* @ngInject */ function ($stateParams) {
                return $stateParams.suite;
              },
              customerId: /* @ngInject */ function ($stateParams) {
                return $stateParams.customerId;
              },
            },
          })
          .state('taasServiceManager.resourcesCreate', {
            parent: 'modal',
            params: {},
            views: {
              'modal@': {
                template: '<resources-create-modal class="modal-content" style="margin:initial" dismiss="$dismiss()" close="$close()"></resource-create-modal>',
              },
            },
          })
          .state('taasServiceManager.suiteCreate', {
            parent: 'taasServiceManager',
            views: {
              'modal@': {
                template: '<suite-create-modal class="modal-content" style="margin:initial" dismiss="$dismiss()" close="$close()"></suite-create-modal>',
              },
            },
          })
          .state('customer-overview', {
            parent: 'sidepanel',
            views: {
              'sidepanel@': {
                controller: 'CustomerOverviewCtrl',
                controllerAs: 'customerOverview',
                template: require('modules/core/customers/customerOverview/customerOverview.tpl.html'),
              },
            },
            resolve: {
              identityCustomer: /* @ngInject */ function ($stateParams, $q, Orgservice) {
                var defer = $q.defer();
                if ($stateParams.currentCustomer) {
                  var params = {
                    basicInfo: true,
                  };
                  Orgservice.getOrg(orgCallback, $stateParams.currentCustomer.customerOrgId, params);
                }

                return defer.promise;

                function orgCallback(data) {
                  defer.resolve(data);
                }
              },
              displayName: translateDisplayName('common.overview'),
            },
            params: {
              currentCustomer: {},
            },
            data: {},
            onEnter: /* @ngInject */ function (Orgservice, $stateParams, HuronCompassService) {
              HuronCompassService.setIsCustomer(true);
              Orgservice.isTestOrg($stateParams.currentCustomer.customerOrgId).then(function (result) {
                $stateParams.isTestOrg = result;
              });
            },
            onExit: /* @ngInject */ function (HuronCompassService) {
              HuronCompassService.setIsCustomer(false);
              HuronCompassService.setCustomerBaseDomain();
            },
          })
          .state('customer-overview.customerAdministrators', {
            views: {
              'side-panel-container@customer-overview': {
                controller: 'CustomerAdministratorDetailCtrl',
                controllerAs: 'customerAdmin',
                template: require('modules/core/customers/customerAdministrators/customerAdministratorDetail.tpl.html'),
              },
            },
            resolve: {
              displayName: translateDisplayName('customerPage.administrators'),
            },
            data: {},
          })
          .state('customer-overview.customerSubscriptions', {
            views: {
              'side-panel-container@customer-overview': {
                controller: 'CustomerSubscriptionsDetailCtrl',
                controllerAs: '$ctrl',
                template: require('modules/core/customers/customerSubscriptions/customerSubscriptionsDetail.tpl.html'),
              },
            },
            resolve: {
              displayName: translateDisplayName('customerPage.orderRequest'),
            },
          })
          .state('customer-overview.ordersOverview', {
            params: {
              currentCustomer: {},
              isCarrierByopstn: {},
            },
            data: {},
            views: {
              'side-panel-container@customer-overview': {
                template: '<uc-orders-overview is-partner="true" current-customer="$resolve.currentCustomer"></uc-orders-overview>',
              },
            },
            resolve: {
              displayName: translateDisplayName('customerPage.pstnOrders'),
              lazy: resolveLazyLoad(function (done) {
                require(['modules/huron/pstn/pstnOrderManagement/ordersOverview'], done);
              }),
              currentCustomer: /* @ngInject */ function ($stateParams) {
                return $stateParams.currentCustomer;
              },
            },
          })
          .state('customer-overview.meetingDetail', {
            views: {
              'side-panel-container@customer-overview': {
                controller: 'MeetingDetailCtrl',
                controllerAs: 'meetingDetail',
                template: require('modules/core/customers/customerOverview/meetingDetail.tpl.html'),
              },
            },
            resolve: {
              displayName: translateDisplayName('customerPage.meetingLicenses'),
            },
            data: {},
            params: {
              meetingLicenses: {},
            },
          })
          .state('customer-overview.sharedDeviceDetail', {
            views: {
              'side-panel-container@customer-overview': {
                controller: 'SharedDeviceDetailCtrl',
                controllerAs: 'sharedDeviceDetail',
                template: require('modules/core/customers/customerOverview/sharedDeviceDetail.tpl.html'),
              },
            },
            resolve: {
              displayName: translateDisplayName('customerPage.sharedDeviceLicenses'),
            },
            data: {},
            params: {
              sharedDeviceLicenses: {},
            },
          })
          .state('customer-overview.careLicenseDetail', {
            views: {
              'side-panel-container@customer-overview': {
                controller: 'CareLicenseDetailCtrl',
                controllerAs: 'careLicenseDetail',
                template: require('modules/core/customers/customerOverview/careLicenseDetail.tpl.html'),
              },
            },
            resolve: {
              displayName: translateDisplayName('customerPage.careLicenses'),
            },
            data: {},
            params: {
              careLicense: {},
            },
          })
          .state('customer-overview.externalNumbers', {
            views: {
              'side-panel-container@customer-overview': {
                controller: 'ExternalNumberDetailCtrl',
                controllerAs: 'externalNumbers',
                template: require('modules/huron/externalNumbers/externalNumberDetail.tpl.html'),
              },
            },
            resolve: {
              displayName: translateDisplayName('customerPage.phoneNumbers'),
            },
            data: {},
          })
          .state('customer-overview.domainDetail', {
            views: {
              'side-panel-container@customer-overview': {
                controller: 'DomainDetailCtrl',
                controllerAs: 'domainDetail',
                template: require('modules/core/customers/customerOverview/domainDetail.tpl.html'),
              },
            },
            resolve: {
              displayName: translateDisplayName('customerPage.domains'),
            },
            data: {},
            params: {
              webexDomains: {},
            },
          })
          .state('customerPstnOrdersOverview', {
            parent: 'sidepanel',
            params: {
              currentCustomer: {},
              vendor: undefined,
            },
            data: {},
            views: {
              'sidepanel@': {
                template: '<uc-customer-pstn-orders-overview current-customer="$resolve.currentCustomer" vendor="$resolve.vendor"></uc-customer-pstn-orders-overview>',
              },
            },
            resolve: {
              displayName: translateDisplayName('customerPage.pstnOrders'),
              lazy: resolveLazyLoad(function (done) {
                require(['modules/huron/pstn/pstnOrderManagement/customerPstnOrdersOverview'], done);
              }),
              currentCustomer: /* @ngInject */ function ($stateParams) {
                return $stateParams.currentCustomer;
              },
              vendor: /* @ngInject */ function ($stateParams) {
                return $stateParams.vendor;
              },
            },
          })
          .state('customerPstnOrdersOverview.orderDetail', {
            params: {
              currentOrder: {},
              currentCustomer: {},
              isCarrierByopstn: {},
            },
            data: {},
            views: {
              'side-panel-container@customerPstnOrdersOverview': {
                template: '<uc-order-detail current-customer= "$resolve.currentCustomer" current-order="$resolve.currentOrder" is-carrier-byopstn= "$resolve.isCarrierByopstn"></uc-order-detail>',
              },
            },
            resolve: {
              displayName: /* @ngInject */ function ($state, $stateParams) {
                var displayName = $stateParams.vendor === 'BYOPSTN' ?
                  $stateParams.currentOrder.formattedDate :
                  $stateParams.currentOrder.carrierOrderId;
                _.set(this, 'data.displayName', displayName);
              },
              lazy: resolveLazyLoad(function (done) {
                require(['modules/huron/pstn/pstnOrderManagement/orderDetail'], done);
              }),
              currentOrder: /* @ngInject */ function ($stateParams) {
                return $stateParams.currentOrder;
              },
              currentCustomer: /* @ngInject */ function ($stateParams) {
                return $stateParams.currentCustomer;
              },
              isCarrierByopstn: /* @ngInject */ function ($stateParams) {
                return $stateParams.isCarrierByopstn;
              },
            },
          })
          .state('customer-overview.orderDetail', {
            views: {
              'side-panel-container@customer-overview': {
                template: '<uc-order-detail current-customer= "$resolve.currentCustomer" current-order="$resolve.currentOrder", is-carrier-byopstn= "$resolve.isCarrierByopstn"></uc-order-detail>',
              },
            },
            parent: 'customer-overview.ordersOverview',
            params: {
              currentCustomer: {},
              currentOrder: {},
              isCarrierByopstn: {},
            },
            data: {},
            resolve: {
              displayName: /* @ngInject */ function ($state, $translate, $stateParams) {
                var displayName = $stateParams.isCarrierByopstn ?
                  $stateParams.currentOrder.formattedDate :
                  $stateParams.currentOrder.carrierOrderId;
                _.set(this, 'data.displayName', displayName);
              },
              lazy: resolveLazyLoad(function (done) {
                require(['modules/huron/pstn/pstnOrderManagement/orderDetail'], done);
              }),
              currentCustomer: /* @ngInject */ function ($stateParams) {
                return $stateParams.currentCustomer;
              },
              currentOrder: /* @ngInject */ function ($stateParams) {
                return $stateParams.currentOrder;
              },
              isCarrierByopstn: /* @ngInject */ function ($stateParams) {
                return $stateParams.isCarrierByopstn;
              },
            },
          })
          .state('firsttimesplash', {
            parent: 'mainLazyLoad',
            abstract: true,
            views: {
              'main@': {
                template: require('modules/core/setupWizard/firstTimeWizard.tpl.html'),
                controller: 'FirstTimeWizardCtrl',
              },
            },
          })
          .state('firsttimewizard', {
            parent: 'firsttimesplash',
            template: '<cr-wizard tabs="tabs" finish="finish" is-first-time="true"></cr-wizard>',
            controller: 'SetupWizardCtrl',
            data: {
              firstTimeSetup: true,
            },
          })
          .state('setupwizardmodal', {
            parent: 'wizardmodal',
            views: {
              'modal@': {
                template: '<cr-wizard class="modal-content" tabs="tabs" finish="finish"></cr-wizard>',
                controller: 'SetupWizardCtrl',
              },
            },
            params: {
              currentTab: {},
              currentSubTab: '',
              currentStep: '',
              numberOfSteps: undefined,
              onlyShowSingleTab: false,
              showStandardModal: false,
            },
            data: {
              firstTimeSetup: false,
            },
          })
          .state('trialExtInterest', {
            url: '/trialExtInterest?eqp',
            template: require('modules/core/trialExtInterest/trialExtInterest.tpl.html'),
            controller: 'TrialExtInterestCtrl',
            controllerAs: 'extInterest',
            parent: 'main',
          })
          .state('helpdesk-main', {
            parent: 'mainLazyLoad',
            views: {
              'main@': {
                controller: 'HelpdeskHeaderController',
                controllerAs: 'helpdeskHeaderCtrl',
                template: require('modules/squared/helpdesk/helpdesk.tpl.html'),
              },
            },
            abstract: true,
            sticky: true,
          })
          .state('helpdesklaunch', {
            url: '/helpdesklaunch',
            template: require('modules/squared/helpdesk/helpdesk-launch.html'),
            parent: 'main',
          })
          .state('helpdesk', {
            template: '<div ui-view></div>',
            controller: 'HelpdeskController',
            controllerAs: 'helpdeskCtrl',
            parent: 'helpdesk-main',
          })
          .state('helpdesk.search', {
            url: '/helpdesk',
            template: require('modules/squared/helpdesk/helpdesk-search.html'),
          })
          .state('helpdesk.user', {
            url: '/helpdesk/user/:orgId/:id',
            template: require('modules/squared/helpdesk/helpdesk-user.html'),
            controller: 'HelpdeskUserController',
            controllerAs: 'helpdeskUserCtrl',
            params: {
              user: null,
              id: null,
              orgId: null,
            },
          })
          .state('helpdesk.order', {
            url: '/helpdesk/order/:orderId/:id',
            template: require('modules/squared/helpdesk/helpdesk-order.html'),
            controller: 'HelpdeskOrderController',
            controllerAs: 'helpdeskOrderCtrl',
            params: {
              order: null,
            },
          })
          .state('helpdesk.org', {
            url: '/helpdesk/org/:id',
            template: require('modules/squared/helpdesk/helpdesk-org.html'),
            controller: 'HelpdeskOrgController',
            controllerAs: 'helpdeskOrgCtrl',
            params: {
              org: null,
              id: null,
            },
          })
          .state('helpdesk.cloudberry-device', {
            url: '/helpdesk/cloudberryDevice/:orgId/:id',
            template: require('modules/squared/helpdesk/helpdesk-cloudberry-device.html'),
            controller: 'HelpdeskCloudberryDeviceController',
            controllerAs: 'helpdeskDeviceCtrl',
            params: {
              device: null,
              id: null,
              orgId: null,
            },
          })
          .state('helpdesk.huron-device', {
            url: '/helpdesk/huronDevice/:orgId/:id',
            template: require('modules/squared/helpdesk/helpdesk-huron-device.html'),
            controller: 'HelpdeskHuronDeviceController',
            controllerAs: 'helpdeskDeviceCtrl',
            params: {
              device: null,
              id: null,
              orgId: null,
            },
          })
          .state('provisioning-main', {
            views: {
              'main@': {
                controller: 'ProvisioningController',
                controllerAs: 'provisioningCtrl',
                template: require('modules/squared/provisioning-console/provisioning.html'),
              },
            },
            abstract: true,
            resolve: {
              // TODO: agendel 8/1/2017  here to remove this and use mainLazyLoad
              lazy: resolveLazyLoad(function (done) {
                require.ensure([], function () {
                  done(require('./main'));
                }, 'modules');
              }),
            },
            sticky: true,
          })
          .state('provisioning', {
            url: '/provisioning',
            parent: 'provisioning-main',
          })
          .state('provisioning.pending', {
            url: '/pending',
            data: {
              sidepanel: 'not-full',
            },
            views: {
              provisioningView: {
                template: require('modules/squared/provisioning-console/pending/provisioning-pending.html'),
              },
            },
          })
          .state('provisioning.completed', {
            url: '/completed',
            data: {
              sidepanel: 'not-full',
            },
            views: {
              provisioningView: {
                template: require('modules/squared/provisioning-console/completed/provisioning-completed.html'),
              },
            },
          })
          .state('order-details', {
            parent: 'sidepanel',
            data: {
              sidepanel: 'not-full',
            },
            views: {
              'sidepanel@': {
                controller: 'ProvisioningDetailsController',
                controllerAs: 'provisioningDetailsCtrl',
                template: require('modules/squared/provisioning-console/overview/provisioning-details.html'),
              },
            },
            params: {
              order: {},
            },
          });

        $stateProvider
          .state('cdrsupport', {
            url: '/cdrsupport',
            template: require('modules/huron/cdrLogs/cdrlogs.tpl.html'),
            controller: 'CdrLogsCtrl',
            controllerAs: 'cdr',
            parent: 'main',
          })
          .state('cdr-overview', {
            parent: 'sidepanel',
            views: {
              'sidepanel@': {
                controller: 'CdrOverviewCtrl',
                controllerAs: 'cdrpanel',
                template: require('modules/huron/cdrLogs/cdrOverview/cdrOverview.tpl.html'),
              },
            },
            params: {
              cdrData: {},
              call: [],
              uniqueIds: [],
              events: [],
              imported: '',
              logstashPath: '',
            },
            data: {},
            resolve: {
              displayName: translateDisplayName('cdrLogs.advancedCDR'),
            },
          })
          .state('cdrladderdiagram', {
            parent: 'modal',
            views: {
              'modal@': {
                template: require('modules/huron/cdrLogs/cdrLadderDiagram/cdrLadderDiagram.tpl.html'),
                controller: 'CdrLadderDiagramCtrl',
                controllerAs: 'cdrLadderDiagram',
              },
            },
            params: {
              call: [],
              uniqueIds: [],
              events: [],
              imported: '',
              logstashPath: '',
            },
          })
          .state('trial', {
            abstract: true,
            parent: 'modal',
            views: {
              'modal@': {
                template: '<div ui-view></div>',
                controller: 'TrialCtrl',
                controllerAs: 'trial',
              },
            },
            params: {
              isEditing: false,
              currentTrial: {},
              details: {},
              mode: {},
            },
            onEnter: /* @ngInject */ function (HuronCompassService) {
              HuronCompassService.setIsCustomer(true);
            },
          })
          .state('trial.info', {
            template: require('modules/core/trials/trial.tpl.html'),
          })
          .state('trial.finishSetup', {
            template: require('modules/core/trials/trialFinishSetup.tpl.html'),
          })
          .state('trial.webex', {
            template: require('modules/core/trials/trialWebex.tpl.html'),
            controller: 'TrialWebexCtrl',
            controllerAs: 'webexTrial',
          })
          .state('trial.call', {
            template: require('modules/core/trials/trialDevice.tpl.html'),
            controller: 'TrialDeviceController',
            controllerAs: 'callTrial',
          })
          .state('trial.pstnDeprecated', {
            template: require('modules/core/trials/trialPstn.tpl.html'),
            controller: 'TrialPstnCtrl',
            controllerAs: 'pstnTrial',
          })
          .state('trial.pstn', {
            template: '<uc-pstn-trial-setup class="modal-content" dismiss="$dismiss()"></uc-pstn-trial-setup>',
            controller: 'TrialPstnCtrl',
            controllerAs: 'pstnTrial',
            resolve: {
              lazy: resolveLazyLoad(function (done) {
                require.ensure([], function () {
                  done(require('modules/huron/pstn/pstnTrialSetup'));
                }, 'pstn-setup');
              }),
            },
          })
          .state('trial.emergAddress', {
            template: require('modules/core/trials/trialEmergAddress.tpl.html'),
            controller: 'TrialEmergAddressCtrl',
            controllerAs: 'eAddressTrial',
          })
          .state('trial.addNumbers', {
            template: require('modules/core/trials/addNumbers.tpl.html'),
            controller: 'DidAddCtrl',
            controllerAs: 'didAdd',
            params: {
              currentTrial: {},
              currentOrg: {},
            },
          })
          .state('didadd', {
            parent: 'modal',
            params: {
              currentOrg: {},
              editMode: true,
            },
            views: {
              'modal@': {
                template: require('modules/huron/didAdd/didAdd.tpl.html'),
                controller: 'DidAddCtrl',
                controllerAs: 'didAdd',
              },
            },
          })
          .state('pstn', {
            parent: 'modal',
            params: {
              customerId: {},
              customerName: {},
              customerEmail: {},
              customerCommunicationLicenseIsTrial: {},
              customerRoomSystemsLicenseIsTrial: {},
            },
            views: {
              'modal@': {
                template: '<uc-pstn-wizard customer-id="$resolve.customerId" customer-name="$resolve.customerName" customer-email="$resolve.customerEmail" customer-communication-license-is-trial="$resolve.customerCommunicationLicenseIsTrial" customer-room-systems-license-is-trial="$resolve.customerRoomSystemsLicenseIsTrial"></uc-pstn-wizard>',
              },
            },
            resolve: {
              customerId: /* @ngInject */ function ($stateParams) {
                return $stateParams.customerId;
              },
              customerName: /* @ngInject */ function ($stateParams) {
                return $stateParams.customerName;
              },
              customerEmail: /* @ngInject */ function ($stateParams) {
                return $stateParams.customerEmail;
              },
              customerCommunicationLicenseIsTrial: /* @ngInject */ function ($stateParams) {
                return $stateParams.customerCommunicationLicenseIsTrial;
              },
              customerRoomSystemsLicenseIsTrial: /* @ngInject */ function ($stateParams) {
                return $stateParams.customerRoomSystemsLicenseIsTrial;
              },
            },
          })
          .state('pstnWizard', {
            parent: 'modal',
            params: {
              customerId: '',
              customerName: '',
              customerEmail: '',
              customerCommunicationLicenseIsTrial: '',
              customerRoomSystemsLicenseIsTrial: '',
              showContractIncomplete: false,
              refreshFn: function () {},
            },
            views: {
              'modal@': {
                template: '<uc-pstn-paid-wizard class="modal-content" customer-id="$resolve.customerId" customer-communication-license-is-trial="$resolve.customerCommunicationLicenseIsTrial" customer-room-systems-license-is-trial="$resolve.customerRoomSystemsLicenseIsTrial" dismiss="$dismiss()" close="$close()" refresh-fn="$resolve.refreshFn()"></uc-pstn-paid-wizard>',
                resolve: {
                  modalInfo: function ($state) {
                    $state.params.modalClass = 'pstn-numbers';
                  },
                },
              },
            },
            resolve: {
              lazy: resolveLazyLoad(function (done) {
                require.ensure([], function () {
                  done(require('modules/huron/pstn/pstnWizard'));
                }, 'pstn-wizard');
              }),
              customerSetup: /* @ngInject */ function ($stateParams, PstnModel, PstnService, Notification) {
                PstnModel.setCustomerId($stateParams.customerId);
                PstnModel.setCustomerExists(false);
                PstnModel.setCustomerName($stateParams.customerName);
                PstnModel.setCustomerEmail($stateParams.customerEmail);
                PstnModel.setIsTrial($stateParams.customerCommunicationLicenseIsTrial && $stateParams.customerRoomSystemsLicenseIsTrial);
                //Reset Carriers
                PstnModel.setCarriers([]);

                //Verify the the Terminus Reseller is setup, otherwise setup the Reseller
                if (!PstnModel.isResellerExists()) {
                  PstnService.getResellerV2().then(function () {
                    PstnModel.setResellerExists(true);
                  }).catch(function () {
                    PstnService.createResellerV2().then(function () {
                      PstnModel.setResellerExists(true);
                    }).catch(function (response) {
                      Notification.errorResponse(response, 'pstnSetup.resellerCreateError');
                    });
                  });
                }
              },
              refreshFn: /* @ngInject */ function ($stateParams) {
                return $stateParams.refreshFn;
              },
            },
          })
          .state('pstnSetup', {
            parent: 'modal',
            params: {
              customerId: {},
              customerName: {},
              customerEmail: {},
              customerCommunicationLicenseIsTrial: {},
              customerRoomSystemsLicenseIsTrial: {},
              refreshFn: function () {},
            },
            views: {
              'modal@': {
                template: '<div ui-view></div>',
                controller: 'PstnSetupCtrl',
                controllerAs: 'pstnSetup',
              },
              '@pstnSetup': {
                template: require('modules/huron/pstnSetup/pstnProviders/pstnProviders.tpl.html'),
                controller: 'PstnProvidersCtrl',
                controllerAs: 'pstnProviders',
              },
            },
          })
          .state('pstnSetup.contractInfo', {
            template: require('modules/huron/pstnSetup/pstnContractInfo/pstnContractInfo.tpl.html'),
            controller: 'PstnContractInfoCtrl',
            controllerAs: 'pstnContractInfo',
          })
          .state('pstnSetup.serviceAddress', {
            template: require('modules/huron/pstnSetup/pstnServiceAddress/pstnServiceAddress.tpl.html'),
            controller: 'PstnServiceAddressCtrl',
            controllerAs: 'pstnServiceAddress',
          })
          .state('pstnSetup.orderNumbers', {
            template: require('modules/huron/pstnSetup/pstnNumbers/pstnNumbers.tpl.html'),
            controller: 'PstnNumbersCtrl',
            controllerAs: 'pstnNumbers',
          })
          .state('pstnSetup.swivelNumbers', {
            template: require('modules/huron/pstnSetup/pstnSwivelNumbers/pstnSwivelNumbers.tpl.html'),
            controller: 'PstnSwivelNumbersCtrl',
            controllerAs: 'pstnSwivelNumbers',
          })
          .state('pstnSetup.review', {
            template: require('modules/huron/pstnSetup/pstnReview/pstnReview.tpl.html'),
            controller: 'PstnReviewCtrl',
            controllerAs: 'pstnReview',
          })
          .state('pstnSetup.nextSteps', {
            template: require('modules/huron/pstnSetup/pstnNextSteps/pstnNextSteps.tpl.html'),
            controller: 'PstnNextStepsCtrl',
            controllerAs: 'pstnNextSteps',
            params: {
              portOrders: null,
            },
          })
          .state('hurondetailsBase', {
            abstract: true,
            parent: 'main',
            template: require('modules/huron/details/huronDetails.html'),
          })
          .state('hurondetails', {
            parent: 'hurondetailsBase',
            views: {
              header: {
                template: '<uc-huron-details-header></uc-huron-details-header>',
              },
              main: {
                template: '<div ui-view autoscroll="true"></div>',
              },
            },
            resolve: {
              lazy: resolveLazyLoad(function (done) {
                require.ensure([], function () {
                  done(require('modules/huron/details'));
                }, 'call-details');
              }),
            },
          })
          .state('huronlines', {
            url: '/services/call-lines',
            parent: 'hurondetails',
            template: require('modules/huron/lines/lineList.tpl.html'),
            controller: 'LinesListCtrl',
            controllerAs: 'linesListCtrl',
          })
          .state('externalNumberDelete', {
            parent: 'modalDialog',
            params: {
              numberInfo: {},
              refreshFn: function () {},
            },
            views: {
              'modal@': {
                template: '<delete-external-number number-info="$resolve.numberInfo" refresh-fn="$resolve.refreshFn()" dismiss="$dismiss()"></delete-external-number>',
              },
            },
            resolve: {
              numberInfo: /* @ngInject */ function ($stateParams) {
                return _.get($stateParams, 'numberInfo');
              },
              refreshFn: /* @ngInject */ function ($stateParams) {
                return $stateParams.refreshFn;
              },
            },
          })
          .state('huronsettings', {
            url: '/services/call-settings',
            parent: 'hurondetails',
            template: '<uc-settings ftsw="false"></uc-settings>',
            resolve: {
              lazy: resolveLazyLoad(function (done) {
                require.ensure([], function () {
                  done(require('modules/call/settings'));
                }, 'call-settings');
              }),
            },
          })
          .state('huronsettingslocation', {
            url: '/services/call-settings-location',
            parent: 'hurondetails',
            template: '<uc-call-settings></uc-call-settings>',
            resolve: {
              lazy: resolveLazyLoad(function (done) {
                require.ensure([], function () {
                  done(require('modules/call/settings'));
                }, 'call-settings-location');
              }),
            },
          })
          .state('call-locations', {
            url: '/services/call-locations',
            parent: 'hurondetails',
            template: '<uc-call-locations></uc-call-locations>',
            resolve: {
              lazy: resolveLazyLoad(function (done) {
                require.ensure([], function () {
                  done(require('modules/call/locations'));
                }, 'call-locations');
              }),
            },
          })
          .state('call-locations-add', {
            url: '/services/call-locations/add',
            parent: 'hurondetails',
            template: '<uc-call-locations-wizard></uc-call-locations-wizard>',
            resolve: {
              lazy: resolveLazyLoad(function (done) {
                require.ensure([], function () {
                  done(require('modules/call/locations/locations-wizard/index'));
                }, 'add-call-location');
              }),
            },
          })
          .state('call-locations-edit', {
            url: '/services/call-locations/edit',
            parent: 'main',
            template: '<uc-call-location uuid="$resolve.locationId" name="$resolve.name"></uc-call-location>',
            params: {
              currentLocation: {},
              feature: null,
            },
            resolve: {
              lazy: resolveLazyLoad(function (done) {
                require.ensure([], function () {
                  done(require('modules/call/locations'));
                }, 'edit-call-location');
              }),
              locationId: /* @ngInject */ function ($stateParams) {
                return _.get($stateParams.currentLocation, 'uuid');
              },
              name: /* @ngInject */ function ($stateParams) {
                return _.get($stateParams.currentLocation, 'name');
              },
            },
          })
          .state('huronrecords', {
            parent: 'modal',
            views: {
              'modal@': {
                template: require('modules/huron/cdrReports/cdrReportsModal.html'),
              },
            },
          })
          .state('users.enableVoicemail', {
            parent: 'modal',
            views: {
              'modal@': {
                template: require('modules/call/settings/settings-bulk-enable-vm-modal/settings-bulk-enable-vm-modal.html'),
              },
            },
          })
          .state('huronfeatures', {
            url: '/services/call-features',
            parent: 'hurondetails',
            template: require('modules/huron/features/featureLanding/features.tpl.html'),
            controller: 'HuronFeaturesCtrl',
            controllerAs: 'huronFeaturesCtrl',
          })
          .state('huronfeatures.aabuilder', {
            parent: 'hurondetails',
            params: {
              aaName: '',
              aaTemplate: '',
            },
            template: require('modules/huron/features/autoAttendant/builder/aaBuilderMain.tpl.html'),
            controller: 'AABuilderMainCtrl',
            controllerAs: 'aaBuilderMain',
          })
          .state('huronfeatures.deleteFeature', {
            parent: 'modalDialog',
            views: {
              'modal@': {
                controller: 'HuronFeatureDeleteCtrl',
                controllerAs: 'huronFeatureDelete',
                template: require('modules/huron/features/featureLanding/featureDeleteModal.tpl.html'),
              },
            },
            params: {
              deleteFeatureName: null,
              deleteFeatureId: null,
              deleteFeatureType: null,
            },
          })
          .state('huronfeatures.aaListDepends', {
            parent: 'modalDialog',
            views: {
              'modal@': {
                controller: 'HuronFeatureAADependsCtrl',
                controllerAs: 'huronFeatureAADepends',
                template: require('modules/huron/features/featureLanding/featureAADependsModal.tpl.html'),
              },
            },
            params: {
              detailsFeatureName: null,
              detailsFeatureId: null,
              detailsFeatureType: null,
              detailsDependsList: null,
            },
          })
          .state('huronCallPickup', {
            url: '/callPickup',
            parent: 'hurondetails',
            template: '<uc-call-pickup></uc-call-pickup>',
            resolve: {
              lazy: resolveLazyLoad(function (done) {
                require.ensure([], function () {
                  done(require('modules/call/features/call-pickup'));
                }, 'call-pickup');
              }),
            },
          })
          .state('callpickupedit', {
            url: '/features/pi/edit',
            parent: 'main',
            template: '<uc-call-pickup></uc-call-pickup>',
            params: {
              feature: null,
            },
            resolve: {
              lazy: resolveLazyLoad(function (done) {
                require.ensure([], function () {
                  done(require('modules/call/features/call-pickup'));
                }, 'call-pickup');
              }),
            },
          })
          .state('huronCallPark', {
            url: '/huronCallPark',
            parent: 'hurondetails',
            template: '<uc-call-park></uc-call-park>',
            resolve: {
              lazy: resolveLazyLoad(function (done) {
                require.ensure([], function () {
                  done(require('modules/call/features/call-park'));
                }, 'call-park');
              }),
            },
          })
          .state('callparkedit', {
            url: '/features/cp/edit',
            parent: 'main',
            template: '<uc-call-park></uc-call-park>',
            params: {
              feature: null,
            },
            resolve: {
              lazy: resolveLazyLoad(function (done) {
                require.ensure([], function () {
                  done(require('modules/call/features/call-park'));
                }, 'call-park');
              }),
            },
          })
          .state('huronHuntGroup', {
            url: '/huronHuntGroup',
            parent: 'hurondetails',
            template: '<uc-hunt-group></uc-hunt-group>',
            resolve: {
              lazy: resolveLazyLoad(function (done) {
                require(['modules/call/features/hunt-group'], done);
              }),
            },
          })
          .state('huntgroupedit', {
            url: '/features/hg/edit',
            parent: 'main',
            template: '<uc-hunt-group></uc-hunt-group>',
            params: {
              feature: null,
            },
            resolve: {
              lazy: resolveLazyLoad(function (done) {
                require(['modules/call/features/hunt-group'], done);
              }),
            },
          })
          .state('huronPagingGroup', {
            url: '/huronPagingGroup',
            parent: 'main',
            template: '<pg-setup-assistant></pg-setup-assistant>',
            resolve: {
              lazy: resolveLazyLoad(function (done) {
                require.ensure([], function () {
                  done(require('modules/call/features/paging-group/paging-group-setup-assistant'));
                }, 'call-paging-group');
              }),
            },
          })
          .state('huronPagingGroupEdit', {
            url: '/huronPagingGroupEdit',
            parent: 'main',
            template: '<uc-paging-group></uc-paging-group>',
            resolve: {
              lazy: resolveLazyLoad(function (done) {
                require.ensure([], function () {
                  done(require('modules/call/features/paging-group'));
                }, 'call-paging-group');
              }),
            },
            params: {
              feature: null,
            },
          });

        $stateProvider
          .state('services-overview', {
            url: '/services?office365&reason',
            template: '<services-overview url-params="$resolve.urlParams"></services-overview>',
            parent: 'main',
            resolve: {
              urlParams: /* @ngInject */ function ($stateParams) {
                return $stateParams;
              },
            },
          })
          .state('cluster-list', {
            url: '/services/clusters',
            template: '<hybrid-services-cluster-list-with-cards has-cucm-support-feature-toggle="$resolve.hasCucmSupportFeatureToggle" has-enterprise-private-trunking-feature-toggle="$resolve.hasEnterprisePrivateTrunkingFeatureToggle"></hybrid-services-cluster-list-with-cards>',
            parent: 'main',
            resolve: {
              hasCucmSupportFeatureToggle: /* @ngInject */ function (FeatureToggleService) {
                return FeatureToggleService.supports(FeatureToggleService.features.atlasHybridCucmSupport);
              },
              hasEnterprisePrivateTrunkingFeatureToggle: /* @ngInject */ function (FeatureToggleService) {
                return FeatureToggleService.supports(FeatureToggleService.features.huronEnterprisePrivateTrunking);
              },
            },
          })
          // hybrid context
          .state('context', {
            parent: 'main',
            template: '<context-container back-state="$resolve.backState"></context-container>',
            params: {
              backState: null,
            },
            resolve: {
              backState: /* @ngInject */ function ($stateParams) {
                return $stateParams.backState;
              },
            },
          })
          .state('context-resources', {
            url: '/services/context',
            parent: 'context',
            views: {
              subHeader: {
                template: '<context-resources-sub-header></context-resources-sub-header>',
              },
              contextServiceView: {
                template: '<hybrid-service-cluster-list service-id="\'contact-center-context\'" cluster-id="$resolve.clusterId"></hybrid-service-cluster-list>',
                controller: /* @ngInject */ function (Analytics) {
                  return Analytics.trackHybridServiceEvent(Analytics.sections.HS_NAVIGATION.eventNames.VISIT_CONTEXT_LIST);
                },
              },
            },
            params: {
              clusterId: null,
            },
            resolve: {
              clusterId: /* @ngInject */ function ($stateParams) {
                return $stateParams.clusterId;
              },
            },
          })
          .state('context-cluster', {
            abstract: true,
            url: '/services/cluster/context/:id',
            parent: 'main',
            template: '<hybrid-services-cluster-page cluster-id="$resolve.id" back-state="$resolve.backState"></hybrid-services-cluster-page>',
            params: {
              backState: null,
            },
            resolve: {
              id: /* @ngInject */ function ($stateParams) {
                return $stateParams.id;
              },
              backState: /* @ngInject */ function ($stateParams) {
                return $stateParams.backState;
              },
            },
          })
          .state('context-cluster.nodes', {
            url: '/nodes',
            template: '<hybrid-services-nodes-page back-state="$resolve.backState" cluster-id="$resolve.id"></hybrid-services-nodes-page>',
          })
          .state('context-cluster-sidepanel', {
            parent: 'sidepanel',
            views: {
              'sidepanel@': {
                template: '<cluster-sidepanel-overview cluster-type="\'cs_mgmt\'" cluster-id="$resolve.id" connector-type="$resolve.connectorType"></cluster-sidepanel-overview>',
              },
              'header@context-cluster-sidepanel': {
                template: require('modules/hercules/cluster-sidepanel/cluster-sidepanel-overview/cluster-sidepanel-overview-header.html'),
              },
              'side-panel-container@context-cluster-sidepanel': {
                template: require('modules/hercules/cluster-sidepanel/cluster-sidepanel-overview/cluster-sidepanel-overview-content.html'),
              },
            },
            // If data not present, $state.current.data.displayName can't be changed
            data: {},
            params: {
              clusterId: null,
              connectorType: null,
            },
            resolve: {
              id: /* @ngInject */ function ($stateParams) {
                return $stateParams.clusterId;
              },
              connectorType: /* @ngInject */ function ($stateParams) {
                return $stateParams.connectorType;
              },
            },
          })
          .state('context-fields', {
            url: '/services/context/fields',
            parent: 'context',
            views: {
              contextServiceView: {
                template: require('modules/context/fields/hybrid-context-fields.html'),
                controller: 'HybridContextFieldsCtrl',
                controllerAs: 'contextFields',
              },
            },
          })
          .state('context-field-modal', {
            parent: 'modal',
            views: {
              'modal@': {
                template: '<context-field-modal existing-field-ids="$resolve.existingFieldIds" callback="$resolve.callback" existing-field-data="$resolve.existingFieldData" in-use="$resolve.inUse" dismiss="$dismiss()" class="context-modal"></context-field-modal>',
              },
            },
            params: {
              existingFieldIds: [],
              existingFieldData: {},
              inUse: false,
              callback: function () {},
            },
            resolve: {
              existingFieldIds: /* @ngInject */ function ($stateParams) {
                return $stateParams.existingFieldIds;
              },
              inUse: /* @ngInject */ function ($stateParams) {
                return $stateParams.inUse;
              },
              existingFieldData: /* @ngInject */ function ($stateParams) {
                return $stateParams.existingFieldData;
              },
              callback: /* @ngInject */ function ($stateParams) {
                return $stateParams.callback;
              },
            },
          })
          .state('context-fields-sidepanel', {
            parent: 'sidepanel',
            views: {
              'sidepanel@': {
                template: '<context-fields-sidepanel admin-authorization-status="$resolve.adminAuthorizationStatus" field="$resolve.field" process="$resolve.process" callback="$resolve.callback"></context-fields-sidepanel>',
              },
              'header@context-fields-sidepanel': {
                template: require('modules/context/fields/sidepanel/hybrid-context-fields-sidepanel-header.html'),
              },
            },
            data: {},
            params: {
              adminAuthorizationStatus: {},
              field: {},
              process: function () {},
              callback: function () {},
            },
            resolve: {
              adminAuthorizationStatus: /* @ngInject */ function ($stateParams) {
                return $stateParams.adminAuthorizationStatus;
              },
              field: /* @ngInject */ function ($stateParams) {
                return $stateParams.field;
              },
              process: /* @ngInject */ function ($stateParams) {
                return $stateParams.process;
              },
              callback: /* @ngInject */ function ($stateParams) {
                return $stateParams.callback;
              },
              displayName: translateDisplayName('common.overview'),
            },
          })
          .state('context-fields-sidepanel.options', {
            views: {
              'side-panel-container@context-fields-sidepanel': {
                template: '<context-field-sidepanel-options-list type-definition="$resolve.dataTypeDefinition" default-option="{{::$resolve.defaultOption}}"></context-field-sidepanel-options-list>',
              },
            },
            params: {
              dataTypeDefinition: {},
              defaultOption: undefined,
            },
            resolve: {
              dataTypeDefinition: /* @ngInject */ function ($stateParams) {
                return $stateParams.dataTypeDefinition;
              },
              defaultOption: /* @ngInject */ function ($stateParams) {
                return $stateParams.defaultOption;
              },
            },
          })
          .state('context-fieldsets', {
            url: '/services/context/fieldsets',
            parent: 'context',
            views: {
              contextServiceView: {
                template: require('modules/context/fieldsets/hybrid-context-fieldsets.html'),
                controller: 'HybridContextFieldsetsCtrl',
                controllerAs: 'contextFieldsets',
              },
            },
          })
          .state('context-fieldset-modal', {
            parent: 'modal',
            views: {
              'modal@': {
                template: '<context-fieldset-modal existing-fieldset-ids="$resolve.existingFieldsetIds" existing-fieldset-data="$resolve.existingFieldsetData" in-use="$resolve.inUse" callback="$resolve.callback" dismiss="$dismiss()" class="context-modal"></context-fieldset-modal>',
              },
            },
            params: {
              existingFieldsetIds: [],
              inUse: false,
              existingFieldsetData: {},
              callback: function () {},
            },
            resolve: {
              existingFieldsetIds: /* @ngInject */ function ($stateParams) {
                return $stateParams.existingFieldsetIds;
              },
              existingFieldsetData: /* @ngIngect */ function ($stateParams) {
                return $stateParams.existingFieldsetData;
              },
              inUse: /* @ngIngect */ function ($stateParams) {
                return $stateParams.inUse;
              },
              callback: /* @ngInject */ function ($stateParams) {
                return $stateParams.callback;
              },
            },
          })
          .state('context-fieldsets-sidepanel', {
            parent: 'sidepanel',
            views: {
              'sidepanel@': {
                template: '<context-fieldsets-sidepanel admin-authorization-status="$resolve.adminAuthorizationStatus" fieldset="$resolve.fieldset" process="$resolve.process" callback="$resolve.callback" ></context-fieldsets-sidepanel>',
              },
              'header@context-fieldsets-sidepanel': {
                template: require('modules/context/fieldsets/sidepanel/hybrid-context-fieldsets-sidepanel-header.html'),
              },
            },
            data: {},
            params: {
              adminAuthorizationStatus: {},
              fieldset: {},
              process: function () {},
              callback: function () {},
            },
            resolve: {
              adminAuthorizationStatus: /* @ngInject */ function ($stateParams) {
                return $stateParams.adminAuthorizationStatus;
              },
              fieldset: /* @ngInject */ function ($stateParams) {
                return $stateParams.fieldset;
              },
              process: /* @ngInject */ function ($stateParams) {
                return $stateParams.process;
              },
              callback: /* @ngInject */ function ($stateParams) {
                return $stateParams.callback;
              },
              displayName: translateDisplayName('sidePanelBreadcrumb.overview'),
            },
          })
          .state('context-fieldsets-sidepanel.fields', {
            views: {
              'side-panel-container@context-fieldsets-sidepanel': {
                template: require('modules/context/fieldsets/sidepanel/fieldList/hybrid-context-fieldsets-field-list.html'),
                controller: 'ContextFieldsetsSidepanelFieldListCtrl',
                controllerAs: 'contextFieldsetsSidepanelFieldListCtrl',
              },
            },

            data: {},
            params: {
              fields: {},
            },
            resolve: {
              fields: /* @ngInject */ function ($stateParams) {
                return $stateParams.fields;
              },
              displayName: translateDisplayName('sidePanelBreadcrumb.fields'),
            },
          })
          .state('context-settings', {
            url: '/services/context/settings',
            parent: 'context',
            views: {
              contextServiceView: {
                template: '<context-settings></context-settings>',
              },
            },
          })
          .state('private-trunk-overview', {
            url: '/private-trunk-overview',
            parent: 'main',
            template: '<private-trunk-overview has-private-trunk-feature-toggle="$resolve.hasPrivateTrunkFeatureToggle" back-to="$resolve.backState"></private-trunk-overview>',
            params: {
              backState: null,
              clusterId: null,
            },
            resolve: {
              lazy: resolveLazyLoad(function (done) {
                require.ensure([], function () {
                  done(require('modules/hercules/private-trunk/private-trunk-overview'));
                }, 'private-trunk-overview');
              }),
              hasPrivateTrunkFeatureToggle: /* @ngInject */ function (FeatureToggleService) {
                return FeatureToggleService.supports(FeatureToggleService.features.huronEnterprisePrivateTrunking);
              },
              backState: /* @ngInject */ function ($stateParams) {
                return $stateParams.backState;
              },
            },
          })
          .state('private-trunk-overview.settings', {
            url: '/settings',
            views: {
              privateTrunkSettings: {
                template: '<private-trunk-overview-settings has-private-trunk-feature-toggle="$resolve.hasPrivateTrunkFeatureToggle"></private-trunk-overview-settings>',
              },
            },
            resolve: {
              lazy: resolveLazyLoad(function (done) {
                require.ensure([], function () {
                  done(require('modules/hercules/private-trunk/private-trunk-overview-settings'));
                }, 'private-trunk-overview-settings');
              }),
              hasPrivateTrunkFeatureToggle: /* @ngInject */ function (FeatureToggleService) {
                return FeatureToggleService.supports(FeatureToggleService.features.huronEnterprisePrivateTrunking);
              },
            },
          })
          .state('private-trunk-overview.list', {
            url: '/list',
            views: {
              sipDestinationList: {
                template: '<hybrid-service-cluster-list service-id="\'ept\'" cluster-id="$resolve.clusterId"></hybrid-service-cluster-list>',
              },
            },
            resolve: {
              clusterId: /* @ngInject */ function ($stateParams) {
                return $stateParams.clusterId;
              },
            },
          })
          .state('context-cluster-sidepanel.host-details', {
            views: {
              'side-panel-container@context-cluster-sidepanel': {
                template: require('modules/hercules/cluster-sidepanel/host-details/host-details.html'),
                controller: 'HybridServicesHostDetailsController',
                controllerAs: 'hostDetailsCtrl',
              },
            },
            data: {
              displayName: 'Node',
            },
            params: {
              host: null,
              hostSerial: null,
            },
          })
          // Cluster settings and nodes
          .state('expressway-cluster', {
            abstract: true,
            url: '/services/cluster/expressway/:id',
            parent: 'main',
            template: '<hybrid-services-cluster-page cluster-id="$resolve.id" back-state="$resolve.backState"></hybrid-services-cluster-page>',
            params: {
              backState: null,
            },
            resolve: {
              id: /* @ngInject */ function ($stateParams) {
                return $stateParams.id;
              },
              backState: /* @ngInject */ function ($stateParams) {
                return $stateParams.backState;
              },
            },
          })
          .state('expressway-cluster.nodes', {
            url: '/nodes',
            template: '<hybrid-services-nodes-page back-state="$resolve.backState" cluster-id="$resolve.id"></hybrid-services-nodes-page>',
          })
          .state('expressway-cluster.settings', {
            url: '/settings',
            template: '<expressway-cluster-settings-page cluster-id="$resolve.id"></expressway-cluster-settings-page>',
          })
          .state('hybrid-services-connector-sidepanel', {
            parent: 'sidepanel',
            views: {
              'sidepanel@': {
                template: '<hybrid-services-connector-sidepanel connector="$resolve.connector"></hybrid-services-connector-sidepanel>',
              },
              'header@hybrid-services-connector-sidepanel': {
                template: require('modules/hercules/hybrid-services-connector-sidepanel/hybrid-services-connector-sidepanel-header.html'),
              },
            },
            // If data not present, $state.current.data.displayName can't be changed
            data: {},
            params: {
              connector: null,
            },
            resolve: {
              connector: /* @ngInject */ function ($stateParams) {
                return $stateParams.connector;
              },
            },
          })
          .state('hybrid-services-connector-sidepanel.alarm-details', {
            views: {
              'side-panel-container@hybrid-services-connector-sidepanel': {
                template: '<alarm-details-sidepanel alarm="$resolve.alarm"></alarm-details-sidepanel>',
              },
            },
            // If data not present, $state.current.data.displayName can't be changed
            data: {},
            params: {
              alarm: null,
            },
            resolve: {
              alarm: /* @ngInject */ function ($stateParams) {
                return $stateParams.alarm;
              },
            },
          })
          .state('hds', {
            template: require('modules/hds/resources/hybrid-data-security-container.html'),
            controller: 'HDSServiceController',
            controllerAs: 'hdsServiceController',
            parent: 'main',
            params: {
              clusterId: null,
              backState: null,
            },
          })
          .state('hds.list', {
            url: '/hds/resources',
            views: {
              fullPane: {
                template: '<hybrid-service-cluster-list service-id="\'spark-hybrid-datasecurity\'" cluster-id="$resolve.clusterId"></hybrid-service-cluster-list>',
                controller: /* @ngInject */ function (Analytics) {
                  return Analytics.trackHybridServiceEvent(Analytics.sections.HS_NAVIGATION.eventNames.VISIT_HDS_LIST);
                },
              },
            },
            resolve: {
              clusterId: /* @ngInject */ function ($stateParams) {
                return $stateParams.clusterId;
              },
            },
          })
          .state('hds.settings', {
            url: '/hds/settings',
            views: {
              fullPane: {
                controller: 'HDSSettingsController',
                controllerAs: 'hdsSettings',
                template: require('modules/hds/settings/hds-settings.html'),
              },
            },
          })
          .state('hds-cluster-details', {
            parent: 'sidepanel',
            views: {
              'sidepanel@': {
                template: '<cluster-sidepanel-overview cluster-type="\'hds_app\'" cluster-id="$resolve.id" connector-type="$resolve.connectorType"></cluster-sidepanel-overview>',
              },
              'header@hds-cluster-details': {
                template: require('modules/hercules/cluster-sidepanel/cluster-sidepanel-overview/cluster-sidepanel-overview-header.html'),
              },
              'side-panel-container@hds-cluster-details': {
                template: require('modules/hercules/cluster-sidepanel/cluster-sidepanel-overview/cluster-sidepanel-overview-content.html'),
              },
            },
            data: {},
            params: {
              clusterId: null,
              connectorType: null,
            },
            resolve: {
              id: /* @ngInject */ function ($stateParams) {
                return $stateParams.clusterId;
              },
              connectorType: /* @ngInject */ function ($stateParams) {
                return $stateParams.connectorType;
              },
              displayName: translateDisplayName('sidePanelBreadcrumb.overview'),
            },
          })
          .state('hds-cluster-details.host-details', {
            views: {
              'side-panel-container@hds-cluster-details': {
                template: require('modules/hercules/cluster-sidepanel/host-details/host-details.html'),
                controller: 'HybridServicesHostDetailsController',
                controllerAs: 'hostDetailsCtrl',
              },
            },
            data: {},
            params: {
              host: null,
              hostSerial: null,
            },
            resolve: {
              displayName: translateDisplayName('sidePanelBreadcrumb.node'),
            },
          })
          .state('hds-cluster-details.alarm-details', {
            views: {
              'side-panel-container@hds-cluster-details': {
                template: '<alarm-details-sidepanel alarm="$resolve.alarm"></alarm-details-sidepanel>',
              },
            },
            // If data not present, $state.current.data.displayName can't be changed
            data: {},
            params: {
              alarm: null,
            },
            resolve: {
              alarm: /* @ngInject */ function ($stateParams) {
                return $stateParams.alarm;
              },
            },
          })
          .state('hds-cluster', {
            abstract: true,
            url: '/services/cluster/hds/:id',
            parent: 'main',
            template: '<hybrid-services-cluster-page cluster-id="$resolve.id" back-state="$resolve.backState"></hybrid-services-cluster-page>',
            params: {
              backState: null,
            },
            resolve: {
              id: /* @ngInject */ function ($stateParams) {
                return $stateParams.id;
              },
              backState: /* @ngInject */ function ($stateParams) {
                return $stateParams.backState;
              },
            },
          })
          .state('hds-cluster.nodes', {
            url: '/nodes',
            template: '<hybrid-services-nodes-page back-state="$resolve.backState" cluster-id="$resolve.id"></hybrid-services-nodes-page>',
          })
          .state('hds-cluster.settings', {
            url: '/settings',
            template: '<hybrid-data-security-cluster-settings cluster-id="$resolve.id"></hybrid-data-security-cluster-settings>',
          })
          .state('mediafusion-cluster', {
            abstract: true,
            url: '/services/cluster/mediafusion/:id',
            parent: 'main',
            template: '<hybrid-services-cluster-page cluster-id="$resolve.id" back-state="$resolve.backState"></hybrid-services-cluster-page>',
            params: {
              backState: null,
            },
            resolve: {
              id: /* @ngInject */ function ($stateParams) {
                return $stateParams.id;
              },
              backState: /* @ngInject */ function ($stateParams) {
                return $stateParams.backState;
              },
            },
          })
          .state('mediafusion-cluster.nodes', {
            url: '/nodes',
            template: '<hybrid-services-nodes-page back-state="$resolve.backState" cluster-id="$resolve.id"></hybrid-services-nodes-page>',
          })
          .state('mediafusion-cluster.settings', {
            url: '/settings',
            template: '<hybrid-media-cluster-settings cluster-id="$resolve.id" has-mf-phase-two-toggle="$resolve.hasMFFeatureToggle" has-mf-trusted-sip-toggle="$resolve.hasMFSIPFeatureToggle"has-mf-cascade-bw-config-toggle="$resolve.hasMFCascadeBwConfigToggle"></hybrid-media-cluster-settings>',
            resolve: {
              id: /* @ngInject */ function ($stateParams) {
                return $stateParams.id;
              },
              hasMFFeatureToggle: /* @ngInject */ function (FeatureToggleService) {
                return FeatureToggleService.supports(FeatureToggleService.features.atlasMediaServicePhaseTwo);
              },
              hasMFSIPFeatureToggle: /* @ngInject */ function (FeatureToggleService) {
                return FeatureToggleService.supports(FeatureToggleService.features.atlasMediaServiceTrustedSIP);
              },
              hasMFCascadeBwConfigToggle: /* @ngInject */ function (FeatureToggleService) {
                return FeatureToggleService.supports(FeatureToggleService.features.atlasMediaServiceCascadeBwConfig);
              },
            },
          })
          .state('cucm-cluster', {
            abstract: true,
            url: '/services/cluster/cucm/:id',
            parent: 'main',
            template: '<hybrid-services-cluster-page cluster-id="$resolve.id" back-state="$resolve.backState"></hybrid-services-cluster-page>',
            params: {
              backState: null,
            },
            resolve: {
              id: /* @ngInject */ function ($stateParams) {
                return $stateParams.id;
              },
              backState: /* @ngInject */ function ($stateParams) {
                return $stateParams.backState;
              },
            },
          })
          .state('cucm-cluster.nodes', {
            url: '/nodes',
            template: '<hybrid-services-nodes-page back-state="$resolve.backState" cluster-id="$resolve.id"></hybrid-services-nodes-page>',
          })
          .state('cucm-cluster.settings', {
            url: '/settings',
            template: '<cucm-cluster-settings cluster-id="$resolve.id"></cucm-cluster-settings>',
          })
          // Add Resource modal
          .state('add-resource', {
            abstract: true,
          })
          .state('add-resource.type-selector', {
            parent: 'modalSmall',
            views: {
              'modal@': {
                controller: 'TypeSelectorController',
                controllerAs: 'vm',
                template: require('modules/hercules/fusion-pages/add-resource/common/type-selector.html'),
              },
            },
            params: {
              wizard: null,
            },
            resolve: {
              hasCucmSupportFeatureToggle: /* @ngInject */ function (FeatureToggleService) {
                return FeatureToggleService.supports(FeatureToggleService.features.atlasHybridCucmSupport);
              },
              hasImpSupportFeatureToggle: /* @ngInject */ function (FeatureToggleService) {
                return FeatureToggleService.supports(FeatureToggleService.features.atlasHybridImp);
              },
            },
          })
          .state('add-resource.expressway', {
            abstract: true,
          })
          .state('add-resource.expressway.service-selector', {
            parent: 'modalSmall',
            views: {
              'modal@': {
                controller: 'ExpresswayServiceSelectorController',
                controllerAs: 'vm',
                template: require('modules/hercules/fusion-pages/add-resource/expressway/service-selector.html'),
              },
            },
            params: {
              wizard: null,
            },
            resolve: {
              hasImpSupportFeatureToggle: /* @ngInject */ function (FeatureToggleService) {
                return FeatureToggleService.supports(FeatureToggleService.features.atlasHybridImp);
              },
            },
          })
          .state('add-resource.expressway.hostname', {
            parent: 'modalSmall',
            views: {
              'modal@': {
                controller: 'ExpresswayEnterHostnameController',
                controllerAs: 'vm',
                template: require('modules/hercules/fusion-pages/add-resource/expressway/enter-hostname.html'),
              },
            },
            params: {
              wizard: null,
            },
          })
          .state('add-resource.expressway.name', {
            parent: 'modalSmall',
            views: {
              'modal@': {
                controller: 'ExpresswayEnterNameController',
                controllerAs: 'vm',
                template: require('modules/hercules/fusion-pages/add-resource/expressway/enter-name.html'),
              },
            },
            params: {
              wizard: null,
            },
          })
          .state('add-resource.expressway.resource-group', {
            parent: 'modalSmall',
            views: {
              'modal@': {
                controller: 'ExpresswaySelectResourceGroupController',
                controllerAs: 'vm',
                template: require('modules/hercules/fusion-pages/add-resource/expressway/select-resource-group.html'),
              },
            },
            params: {
              wizard: null,
            },
          })
          .state('add-resource.expressway.end', {
            parent: 'modalSmall',
            views: {
              'modal@': {
                controller: 'ExpresswayEndController',
                controllerAs: 'vm',
                template: require('modules/hercules/fusion-pages/add-resource/expressway/end.html'),
              },
            },
            params: {
              wizard: null,
            },
          })
          .state('add-resource.mediafusion', {
            abstract: true,
          })
          .state('add-resource.mediafusion.hostname', {
            parent: 'modalSmall',
            views: {
              'modal@': {
                controller: 'AddResourceControllerClusterViewV2',
                controllerAs: 'redirectResource',
                template: require('modules/mediafusion/media-service-v2/add-resources/add-resource-dialog.html'),
                modalClass: 'redirect-add-resource',
              },
            },
            params: {
              wizard: null,
              firstTimeSetup: false,
              yesProceed: false,
              fromClusters: true,
            },
          })
          .state('add-resource.mediafusion.name', {
            parent: 'modalSmall',
            views: {
              'modal@': {
                controller: 'MediafusionEnterNameController',
                controllerAs: 'vm',
                template: require('modules/hercules/fusion-pages/add-resource/mediafusion/enter-name.html'),
              },
            },
            params: {
              wizard: null,
            },
          })
          .state('add-resource.mediafusion.end', {
            parent: 'modalSmall',
            views: {
              'modal@': {
                controller: 'MediafusionEndController',
                controllerAs: 'vm',
                template: require('modules/hercules/fusion-pages/add-resource/mediafusion/end.html'),
              },
            },
            params: {
              wizard: null,
            },
          })
          .state('add-resource.context', {
            parent: 'modalSmall',
            views: {
              'modal@': {
                template: require('modules/hercules/fusion-pages/add-resource/context/context.html'),
              },
            },
            params: {
              wizard: null,
            },
          })
          .state('add-resource.cucm', {
            abstract: true,
          })
          .state('add-resource.cucm.hostname', {
            parent: 'modalSmall',
            views: {
              'modal@': {
                controller: 'CucmHostnameController',
                controllerAs: 'vm',
                template: require('modules/hercules/fusion-pages/add-resource/cucm/cucm-hostname.html'),
              },
            },
            params: {
              wizard: null,
            },
          })
          .state('add-resource.cucm.name', {
            parent: 'modalSmall',
            views: {
              'modal@': {
                controller: 'CucmClusterNameController',
                controllerAs: 'vm',
                template: require('modules/hercules/fusion-pages/add-resource/cucm/cucm-cluster-name.html'),
              },
            },
            params: {
              wizard: null,
            },
          })
          .state('add-resource.cucm.end', {
            parent: 'modalSmall',
            views: {
              'modal@': {
                controller: 'CucmEndController',
                controllerAs: 'vm',
                template: require('modules/hercules/fusion-pages/add-resource/cucm/cucm-end.html'),
              },
            },
            params: {
              wizard: null,
            },
          })
          .state('calendar-service', {
            template: require('modules/hercules/service-specific-pages/calendar-service-pages/calendar-service-container.html'),
            controller: 'CalendarServiceContainerController',
            controllerAs: 'vm',
            params: {
              backState: null,
              clusterId: null,
            },
            parent: 'main',
            abstract: true,
            resolve: {
              hasCapacityFeatureToggle: /* @ngInject */ function (FeatureToggleService) {
                return FeatureToggleService.supports(FeatureToggleService.features.atlasHybridCapacity);
              },
            },
          })
          .state('calendar-service.list', {
            url: '/services/calendar',
            views: {
              calendarServiceView: {
                template: require('modules/hercules/service-specific-pages/calendar-service-pages/calendar-service-resources.html'),
                controller: /* @ngInject */ function (Analytics) {
                  return Analytics.trackHybridServiceEvent(Analytics.sections.HS_NAVIGATION.eventNames.VISIT_CAL_EXC_LIST);
                },
              },
            },
          })
          .state('calendar-service.settings', {
            url: '/services/calendar/settings',
            views: {
              calendarServiceView: {
                template: '<calendar-service-settings-page></calendar-service-settings-page>',
              },
            },
          })
          .state('calendar-service.users', {
            url: '/services/calendar/users',
            views: {
              calendarServiceView: {
                template: '<calendar-service-users-page></calendar-service-users-page>',
              },
            },
          })
          .state('office-365-service', {
            abstract: true,
            parent: 'main',
            template: '<div ui-view></div>',
          })
          .state('office-365-service.settings', {
            url: '/services/office-365/settings',
            template: '<office-365-settings-page></office-365-settings-page>',
            controller: /* @ngInject */ function (Analytics) {
              return Analytics.trackHybridServiceEvent(Analytics.sections.HS_NAVIGATION.eventNames.VISIT_CAL_O365_SETTINGS);
            },
          })
          .state('google-calendar-service', {
            abstract: true,
            parent: 'main',
            template: '<div ui-view></div>',
          })
          .state('google-calendar-service.settings', {
            url: '/services/google-calendar/settings',
            template: '<google-calendar-settings-page></google-calendar-settings-page>',
            controller: /* @ngInject */ function (Analytics) {
              return Analytics.trackHybridServiceEvent(Analytics.sections.HS_NAVIGATION.eventNames.VISIT_CAL_GOOG_SETTINGS);
            },
          })
          .state('call-service', {
            template: require('modules/hercules/service-specific-pages/call-service-pages/call-service-container.html'),
            controller: 'CallServiceContainerController',
            controllerAs: 'vm',
            params: {
              backState: null,
              clusterId: null,
            },
            parent: 'main',
            resolve: {
              hasCapacityFeatureToggle: /* @ngInject */ function (FeatureToggleService) {
                return FeatureToggleService.supports(FeatureToggleService.features.atlasHybridCapacity);
              },
            },
          })
          .state('call-service.list', {
            url: '/services/call',
            views: {
              callServiceView: {
                template: require('modules/hercules/service-specific-pages/call-service-pages/call-service-resources.html'),
              },
              controller: /* @ngInject */ function (Analytics) {
                return Analytics.trackHybridServiceEvent(Analytics.sections.HS_NAVIGATION.eventNames.VISIT_CALL_LIST);
              },
            },
          })
          .state('call-service.settings', {
            url: '/services/call/settings',
            views: {
              callServiceView: {
                template: '<call-service-settings-page></call-service-settings-page>',
              },
            },
          })
          .state('call-service.users', {
            url: '/services/call/users',
            views: {
              callServiceView: {
                template: '<call-service-users-page></call-service-users-page>',
              },
            },
          })
          .state('imp-service', {
            template: require('modules/hercules/service-specific-pages/imp-service-pages/imp-service-container.html'),
            controller: 'ImpServiceContainerController',
            controllerAs: 'vm',
            params: {
              backState: null,
              clusterId: null,
            },
            parent: 'main',
            resolve: {
              hasCapacityFeatureToggle: /* @ngInject */ function (FeatureToggleService) {
                return FeatureToggleService.supports(FeatureToggleService.features.atlasHybridCapacity);
              },
            },
          })
          .state('imp-service.list', {
            url: '/services/imp',
            views: {
              impServiceView: {
                template: require('modules/hercules/service-specific-pages/imp-service-pages/imp-service-resources.html'),
              },
              controller: /* @ngInject */ function (Analytics) {
                return Analytics.trackHybridServiceEvent(Analytics.sections.HS_NAVIGATION.eventNames.VISIT_IMP_LIST);
              },
            },
            params: {
              clusterId: null,
            },
          })
          .state('imp-service.settings', {
            url: '/services/imp/settings',
            views: {
              impServiceView: {
                template: '<imp-settings-page></imp-settings-page>',
              },
            },
            resolve: {
              hasHybridImpFeatureToggle: /* @ngInject */ function (FeatureToggleService) {
                return FeatureToggleService.supports(FeatureToggleService.features.atlasHybridImp);
              },
            },
          })
          .state('imp-service.users', {
            url: '/services/imp/users',
            views: {
              impServiceView: {
                template: '<imp-service-users-page></imp-service-users-page>',
              },
            },
          })
          .state('private-trunk-settings', {
            parent: 'main',
            url: '/private-trunk-settings/:id',
            template: '<private-trunk-settings-page trunk-id="$resolve.id"></private-trunk-settings-page>',
            resolve: {
              id: /* @ngInject */ function ($stateParams) {
                return $stateParams.id;
              },
            },
          })
          .state('private-trunk-sidepanel', {
            parent: 'sidepanel',
            views: {
              'sidepanel@': {
                template: '<private-trunk-sidepanel trunk-id="$resolve.trunkId"></private-trunk-sidepanel>',
              },
              'header@private-trunk-sidepanel': {
                template: require('modules/hercules/private-trunk/private-trunk-sidepanel/private-trunk-sidepanel-header.html'),
              },
            },
            data: {},
            params: {
              clusterId: null,
            },
            resolve: {
              trunkId: /* @ngInject */ function ($stateParams) {
                return $stateParams.clusterId; // Deliberately "renaming" clusterId to trunkId here
              },
            },
          })
          .state('private-trunk-sidepanel.alarm-details', {
            views: {
              'side-panel-container@private-trunk-sidepanel': {
                template: '<alarm-details-sidepanel alarm="$resolve.alarm"></alarm-details-sidepanel>',
              },
            },
            // If data not present, $state.current.data.displayName can't be changed
            data: {},
            params: {
              alarm: null,
            },
            resolve: {
              alarm: /* @ngInject */ function ($stateParams) {
                return $stateParams.alarm;
              },
            },
          })
          .state('expressway-cluster-sidepanel', {
            parent: 'sidepanel',
            views: {
              'sidepanel@': {
                template: '<cluster-sidepanel-overview cluster-type="\'c_mgmt\'" cluster-id="$resolve.id" connector-type="$resolve.connectorType"></cluster-sidepanel-overview>',
              },
              'header@expressway-cluster-sidepanel': {
                template: require('modules/hercules/cluster-sidepanel/cluster-sidepanel-overview/cluster-sidepanel-overview-header.html'),
              },
              'side-panel-container@expressway-cluster-sidepanel': {
                template: require('modules/hercules/cluster-sidepanel/cluster-sidepanel-overview/cluster-sidepanel-overview-content.html'),
              },
            },
            // If data not present, $state.current.data.displayName can't be changed
            data: {},
            params: {
              clusterId: null,
              connectorType: null,
            },
            resolve: {
              id: /* @ngInject */ function ($stateParams) {
                return $stateParams.clusterId;
              },
              connectorType: /* @ngInject */ function ($stateParams) {
                return $stateParams.connectorType;
              },
            },
          })
          .state('expressway-cluster-sidepanel.host-details', {
            views: {
              'side-panel-container@expressway-cluster-sidepanel': {
                template: require('modules/hercules/cluster-sidepanel/host-details/host-details.html'),
                controller: 'HybridServicesHostDetailsController',
                controllerAs: 'hostDetailsCtrl',
              },
            },
            // If data not present, $state.current.data.displayName can't be changed
            data: {},
            params: {
              host: null,
              hostSerial: null,
              // we inherit params from the parent, and because of management connectors we shouldn't override
              // the parent connectorType param&
              specificType: null,
            },
          })
          .state('expressway-cluster-sidepanel.alarm-details', {
            views: {
              'side-panel-container@expressway-cluster-sidepanel': {
                template: '<alarm-details-sidepanel alarm="$resolve.alarm"></alarm-details-sidepanel>',
              },
            },
            // If data not present, $state.current.data.displayName can't be changed
            data: {},
            params: {
              alarm: null,
            },
            resolve: {
              alarm: /* @ngInject */ function ($stateParams) {
                return $stateParams.alarm;
              },
            },
          })
          .state('resource-group-settings', {
            url: '/services/resourceGroups/:id/settings',
            template: require('modules/hercules/fusion-pages/resource-group-settings/resource-group-settings.html'),
            controller: 'ResourceGroupSettingsController',
            controllerAs: 'rgsCtrl',
            parent: 'main',
          })
          .state('hybrid-services-event-history-page', {
            parent: 'main',
            url: '/services/clusters/history?cluster=clusterId&serviceId&connectorId',
            template: '<hybrid-services-event-history-page cluster-id="$resolve.clusterId" connector-id="$resolve.connectorId" service-id="$resolve.serviceId" resource-filter="$resolve.resourceFilter"></hybrid-services-event-history-page>',
            params: {
              clusterId: null,
              connectorId: null,
              serviceId: null,
              resourceFilter: null,
            },
            resolve: {
              clusterId: /* @ngInject */ function ($stateParams) {
                return $stateParams.clusterId;
              },
              connectorId: /* @ngInject */ function ($stateParams) {
                return $stateParams.connectorId;
              },
              serviceId: /* @ngInject */ function ($stateParams) {
                return $stateParams.serviceId;
              },
              resourceFilter: /* @ngInject */ function ($stateParams) {
                return $stateParams.resourceFilter;
              },
            },
          })
          .state('hybrid-services-event-history-page.sidepanel', {
            parent: 'sidepanel',
            views: {
              'sidepanel@': {
                template: '<hybrid-services-cluster-status-history-sidepanel event-item="$resolve.eventItem"></hybrid-services-event-history-cluster-alarm-history-sidepanel>',
              },
              'header@hybrid-services-event-history-page.sidepanel': {
                template: require('modules/hercules/hybrid-services-event-history-page/cluster-status-history/cluster-status-history-sidepanel-header.html'),
              },
            },
            params: {
              eventItem: null,
            },
            resolve: {
              eventItem: /* @ngInject */ function ($stateParams) {
                return $stateParams.eventItem;
              },
              displayName: translateDisplayName('sidePanelBreadcrumb.overview'),
            },
          });

        $stateProvider

          //V2 API changes
          .state('media-cluster-details', {
            parent: 'sidepanel',
            views: {
              'sidepanel@': {
                template: '<cluster-sidepanel-overview cluster-type="\'mf_mgmt\'" cluster-id="$resolve.id" connector-type="$resolve.connectorType"></cluster-sidepanel-overview>',
              },
              'header@media-cluster-details': {
                template: require('modules/hercules/cluster-sidepanel/cluster-sidepanel-overview/cluster-sidepanel-overview-header.html'),
              },
              'side-panel-container@media-cluster-details': {
                template: require('modules/hercules/cluster-sidepanel/cluster-sidepanel-overview/cluster-sidepanel-overview-content.html'),
              },
            },
            data: {},
            params: {
              clusterId: null,
              connectorType: null,
            },
            resolve: {
              id: /* @ngInject */ function ($stateParams) {
                return $stateParams.clusterId;
              },
              connectorType: /* @ngInject */ function ($stateParams) {
                return $stateParams.connectorType;
              },
              displayName: translateDisplayName('sidePanelBreadcrumb.overview'),
            },
          })
          .state('media-cluster-details.host-details', {
            views: {
              'side-panel-container@media-cluster-details': {
                template: require('modules/hercules/cluster-sidepanel/host-details/host-details.html'),
                controller: 'HybridServicesHostDetailsController',
                controllerAs: 'hostDetailsCtrl',
              },
            },
            data: {
              displayName: 'Node',
            },
            params: {
              host: null,
              hostSerial: null,
            },
          })
          .state('media-cluster-details.alarm-details', {
            views: {
              'side-panel-container@media-cluster-details': {
                template: '<alarm-details-sidepanel alarm="$resolve.alarm"></alarm-details-sidepanel>',
              },
            },
            // If data not present, $state.current.data.displayName can't be changed
            data: {},
            params: {
              alarm: null,
            },
            resolve: {
              alarm: /* @ngInject */ function ($stateParams) {
                return $stateParams.alarm;
              },
            },
          })

          .state('media-service-v2', {
            template: require('modules/mediafusion/media-service-v2/media-service-overview.html'),
            controller: 'MediaServiceControllerV2',
            controllerAs: 'med',
            parent: 'main',
            params: {
              backState: null,
              clusterId: null,
            },
          })
          .state('media-service-v2.list', {
            url: '/mediaserviceV2',
            views: {
              fullPane: {
                template: '<hybrid-service-cluster-list service-id="\'squared-fusion-media\'" cluster-id="$resolve.clusterId"></hybrid-service-cluster-list>',
                controller: /* @ngInject */ function (Analytics) {
                  return Analytics.trackHybridServiceEvent(Analytics.sections.HS_NAVIGATION.eventNames.VISIT_MEDIA_LIST);
                },
              },
            },
            resolve: {
              clusterId: /* @ngInject */ function ($stateParams) {
                return $stateParams.clusterId;
              },
            },
          })
          .state('media-service-v2.settings', {
            url: '/mediaserviceV2/settings',
            views: {
              fullPane: {
                controllerAs: 'mediaServiceSettings',
                controller: 'MediaServiceSettingsControllerV2',
                template: require('modules/mediafusion/media-service-v2/settings/media-service-settings.html'),
              },
            },
            controller: /* @ngInject */ function (Analytics) {
              return Analytics.trackHybridServiceEvent(Analytics.sections.HS_NAVIGATION.eventNames.VISIT_MEDIA_SETTINGS);
            },
          });

        $stateProvider
          .state('ediscovery-main', {
            parent: 'mainLazyLoad',
            views: {
              'main@': {
                template: require('modules/ediscovery/ediscovery.tpl.html'),
              },
            },
            abstract: true,
            sticky: true,
          })
          .state('ediscovery', {
            url: '/ediscovery',
            template: '<div ui-view></div>',
            parent: 'ediscovery-main',
          })
          .state('ediscovery.search', {
            url: '/search',
            controller: 'EdiscoverySearchController',
            controllerAs: 'ediscoverySearchCtrl',
            template: require('modules/ediscovery/ediscovery-search.html'),
            params: {
              report: null,
              reRun: false,
            },
          })
          .state('ediscovery.reports', {
            url: '/reports',
            controller: 'EdiscoveryReportsController',
            controllerAs: 'ediscoveryCtrl',
            template: require('modules/ediscovery/ediscovery-reports.html'),
          });

        $stateProvider
          .state('partnerManagement-main', {
            parent: 'mainLazyLoad',
            views: {
              'main@': {
                template: require('modules/squared/partner-management/pm-main.html'),
              },
            },
            abstract: true,
          })
          .state('partnerManagement', {
            url: '/partnerManagement',
            template: '<div ui-view></div>',
            controller: 'PartnerManagementController',
            controllerAs: 'ctrl',
            parent: 'partnerManagement-main',
          })
          .state('partnerManagement.search', {
            url: '/',
            template: require('modules/squared/partner-management/pm-search.html'),
          })
          .state('partnerManagement.searchResults', {
            template: require('modules/squared/partner-management/pm-searchResults.html'),
          })
          .state('partnerManagement.orgExists', {
            template: require('modules/squared/partner-management/pm-orgExists.html'),
          })
          .state('partnerManagement.orgClaimed', {
            template: require('modules/squared/partner-management/pm-orgClaimed.html'),
          })
          .state('partnerManagement.contactAdmin', {
            template: require('modules/squared/partner-management/pm-contactAdmin.html'),
          })
          .state('partnerManagement.create', {
            template: require('modules/squared/partner-management/pm-create.html'),
          })
          .state('partnerManagement.createSuccess', {
            template: require('modules/squared/partner-management/pm-createSuccess.html'),
          });

        $stateProvider
          .state('messenger', {
            parent: 'main',
            url: '/services/messenger',
            template: require('modules/messenger/ci-sync/ciSync.tpl.html'),
            controller: 'CiSyncCtrl',
            controllerAs: 'sync',
          });

        // Spark Care: set state provider elements
        require('./care.appconfig').configureStateProvider($stateProvider);

        $stateProvider
          .state('gss', {
            url: '/gss',
            template: require('modules/gss/gssIframe/gssIframe.tpl.html'),
            controller: 'GssIframeCtrl',
            controllerAs: 'gssIframeCtrl',
            parent: 'main',
          })
          .state('gss.dashboard', {
            url: '/dashboard',
            template: require('modules/gss/dashboard/dashboard.tpl.html'),
            controller: 'DashboardCtrl',
            controllerAs: 'dashboardCtrl',
          })
          .state('gss.components', {
            url: '/components',
            template: require('modules/gss/components/components.tpl.html'),
            controller: 'ComponentsCtrl',
            controllerAs: 'componentsCtrl',
          })
          .state('gss.components.deleteComponent', {
            url: '/delete',
            parent: 'gss.components',
            views: {
              '@gss': {
                controller: 'DelComponentCtrl',
                controllerAs: 'delComponentCtrl',
                template: require('modules/gss/components/deleteComponent/deleteComponent.tpl.html'),
              },
            },
            params: {
              component: null,
            },
          })
          .state('gss.services', {
            url: '/services',
            template: require('modules/gss/services/services.tpl.html'),
            controller: 'GSSServicesCtrl',
            controllerAs: 'gssServicesCtrl',
          })
          .state('gss.services.delete', {
            url: '/delete',
            views: {
              '@gss': {
                template: require('modules/gss/services/deleteService/deleteService.tpl.html'),
                controller: 'DeleteServiceCtrl',
                controllerAs: 'deleteServiceCtrl',
              },
            },
            params: {
              service: null,
            },
          })
          .state('gss.incidents', {
            url: '/incidents',
            template: require('modules/gss/incidents/incidents.tpl.html'),
            controller: 'IncidentsCtrl',
            controllerAs: 'incidentsCtrl',
          })
          .state('gss.incidents.new', {
            url: '/new',
            views: {
              '@gss': {
                template: require('modules/gss/incidents/createIncident/createIncident.tpl.html'),
                controller: 'CreateIncidentCtrl',
                controllerAs: 'createIncidentCtrl',
              },
            },
          })
          .state('gss.incidents.delete', {
            url: '/delete',
            views: {
              '@gss': {
                template: require('modules/gss/incidents/deleteIncident/deleteIncident.tpl.html'),
                controller: 'DeleteIncidentCtrl',
                controllerAs: 'deleteIncidentCtrl',
              },
            },
            params: {
              incident: null,
            },
          })
          .state('gss.incidents.update', {
            url: '/update',
            views: {
              '@gss': {
                template: require('modules/gss/incidents/updateIncident/updateIncident.tpl.html'),
                controller: 'UpdateIncidentCtrl',
                controllerAs: 'updateIncidentCtrl',
              },
            },
            params: {
              incident: null,
              actionType: null,
            },
          });
      },
    ]);
})();
