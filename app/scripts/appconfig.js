(function () {
  'use strict';

  /* eslint angular/di:0 */

  angular
    .module('wx2AdminWebClientApp')
    .config(['$httpProvider', '$stateProvider', '$urlRouterProvider', '$translateProvider', '$compileProvider',
      function ($httpProvider, $stateProvider, $urlRouterProvider, $translateProvider, $compileProvider) {
        var sidepanelMemo = 'sidepanelMemo';

        // sidepanel helper
        function isStateInSidepanel($state) {
          var rootStateName = $state.current.name.split('.')[0];
          var rootState = $state.get(rootStateName);
          var rootStateIsSidepanel = rootState.parent === 'sidepanel';
          return $state.current.parent === 'sidepanel' || (rootStateIsSidepanel && $state.includes(rootState));
        }

        //Add blob to the default angular whitelist
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|tel|file|blob):/);

        $urlRouterProvider.otherwise('login');
        $stateProvider
          .state('login', {
            url: '/login',
            views: {
              'main@': {
                templateUrl: 'modules/core/login/login.tpl.html',
                controller: 'LoginCtrl'
              }
            },
            authenticate: false
          })
          .state('activateUser', {
            url: '/activate-user',
            views: {
              'main@': {
                template: '<div ui-view></div>',
                controller: 'ActivateUserController'
              }
            },
            authenticate: false
          })
          .state('activateUser.successPage', {
            url: '/success-page',
            views: {
              'main@': {
                template: '<div ui-view></div>'
              }
            },
            authenticate: false
          })
          .state('activateUser.errorPage', {
            url: '/error-page',
            views: {
              'main@': {
                template: '<div ui-view></div>'
              }
            },
            authenticate: false
          })
          .state('activateProduct', {
            url: '/activate-product',
            views: {
              'main@': {
                template: '<div ui-view></div>',
                controller: 'ActivateProductController'
              }
            }
          })
          .state('activateProduct.successPage', {
            url: '/success-page',
            views: {
              'main@': {
                template: '<div ui-view></div>'
              }
            }
          })
          .state('activateProduct.errorPage', {
            url: '/error-page',
            views: {
              'main@': {
                template: '<div ui-view></div>'
              }
            }
          })
          .state('unauthorized', {
            views: {
              'main@': {
                templateUrl: 'modules/core/stateRedirect/unauthorized.tpl.html',
                controller: 'StateRedirectCtrl',
                controllerAs: 'stateRedirect'
              }
            },
            authenticate: false
          })
          .state('login-error', {
            views: {
              'main@': {
                templateUrl: 'modules/core/stateRedirect/loginError.tpl.html',
                controller: 'StateRedirectCtrl',
                controllerAs: 'stateRedirect'
              }
            },
            authenticate: false
          })
          .state('404', {
            url: '/404',
            views: {
              'main@': {
                templateUrl: 'modules/core/stateRedirect/404.tpl.html',
                controller: 'StateRedirectCtrl',
                controllerAs: 'stateRedirect'
              }
            },
            authenticate: false
          })
          .state('main', {
            views: {
              'main@': {
                templateUrl: 'modules/core/views/main.tpl.html'
              }
            },
            abstract: true,
            sticky: true
          })
          .state('partner', {
            template: '<div ui-view></div>',
            url: '/partner',
            parent: 'main',
            abstract: true
          })
          .state('sidepanel', {
            abstract: true,
            onEnter: /* @ngInject */ function ($modal, $state, $previousState) {
              if ($state.sidepanel) {
                $state.sidepanel.stopPreviousState = true;
              } else {
                $previousState.memo(sidepanelMemo);
              }
              $state.sidepanel = $modal.open({
                template: '<cs-sidepanel></cs-sidepanel>',
                windowTemplateUrl: 'sidepanel/sidepanel-modal.tpl.html',
                backdrop: false,
                keyboard: false
              });
              $state.sidepanel.result.finally(function () {
                if (!this.stopPreviousState && !$state.modal) {
                  $state.sidepanel = null;
                  var previousState = $previousState.get(sidepanelMemo);
                  if (previousState) {
                    if (isStateInSidepanel($state)) {
                      return $previousState.go(sidepanelMemo).then(function () {
                        $previousState.forget(sidepanelMemo);
                      });
                    }
                  }
                }
              }.bind($state.sidepanel));
            },
            onExit: /* @ngInject */ function ($state, $previousState) {
              if ($state.sidepanel) {
                $state.sidepanel.dismiss();
              }
            }
          });

        // See http://angular-translate.github.io/docs/#/guide/19_security
        $translateProvider.useSanitizeValueStrategy('escapeParameters');
        $translateProvider.useStaticFilesLoader({
          prefix: 'l10n/',
          suffix: '.json'
        });
        $translateProvider.addInterpolation('$translateMessageFormatInterpolation');
        $translateProvider.preferredLanguage('en_US');
        $translateProvider.fallbackLanguage('en_US');

        $httpProvider.interceptors.push('TrackingIdInterceptor');
        $httpProvider.interceptors.push('ResponseInterceptor');
        $httpProvider.interceptors.push('TimingInterceptor');
        $httpProvider.interceptors.push('ServerErrorInterceptor');
        $httpProvider.interceptors.push('ReadonlyInterceptor');
      }
    ]);

  angular
    .module('Squared')
    .config(['$stateProvider',
      function ($stateProvider) {
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
              size: options.size,
              windowClass: options.windowClass,
              backdrop: options.backdrop || 'static',
              modalClass: $state.params.modalClass,
              modalId: $state.params.modalId,
              type: $state.params.modalType
            });
            $state.modal.result.finally(function () {
              if (!this.stopPreviousState) {
                $state.modal = null;
                var previousState = $previousState.get(modalMemo);
                if (previousState) {
                  return $previousState.go(modalMemo).then(function () {
                    $previousState.forget(modalMemo);
                  });
                }
              }
            }.bind($state.modal));
          };
        }

        /* @ngInject */
        function modalOnExit($state, $previousState) {
          if ($state.modal) {
            $state.modal.dismiss();
          }
        }

        $stateProvider
          .state('activate', {
            url: '/activate',
            views: {
              'main@': {
                templateUrl: 'modules/squared/views/activate.html',
                controller: 'ActivateCtrl'
              }
            },
            authenticate: false
          })
          .state('csadmin', {
            url: '/csadmin?eqp',
            templateUrl: 'modules/squared/csadmin/csadmin.html',
            controller: 'CsAdminCtrl',
            parent: 'main'
          })
          .state('downloads', {
            url: '/downloads',
            views: {
              'main@': {
                templateUrl: 'modules/squared/views/downloads.html',
                controller: 'DownloadsCtrl'
              }
            },
            authenticate: false
          })
          .state('domainmanagement', {
            templateUrl: 'modules/core/domainManagement/domainManagement.tpl.html',
            parent: 'main'
          })
          .state('domainmanagement.add', {
            parent: 'modal',
            views: {
              'modal@': {
                controller: 'DomainManageAddCtrl',
                controllerAs: 'dmpopup',
                templateUrl: 'modules/core/domainManagement/add.tpl.html',
                resolve: {
                  modalInfo: function ($state) {
                    $state.params.modalType = 'small';
                  }
                }
              }
            },
            params: {
              loggedOnUser: null
            }
          })
          .state('domainmanagement.instructions', {
            parent: 'modal',
            views: {
              'modal@': {
                controller: 'DomainManageInstructionsCtrl',
                controllerAs: 'dmpopup',
                templateUrl: 'modules/core/domainManagement/instructions.tpl.html',
                resolve: {
                  modalInfo: function ($state) {
                    $state.params.modalType = 'small';
                  }
                }
              }
            },
            params: {
              domain: null,
              loggedOnUser: null
            }
          })
          .state('domainmanagement.delete', {
            parent: 'modal',
            views: {
              'modal@': {
                controller: 'DomainManageDeleteCtrl',
                controllerAs: 'dmpopup',
                templateUrl: 'modules/core/domainManagement/delete.tpl.html',
                resolve: {
                  modalInfo: function ($state) {
                    $state.params.modalType = 'dialog';
                  }
                }
              }
            },
            params: {
              domain: null,
              loggedOnUser: null
            }
          })
          .state('domainmanagement.unclaim', {
            parent: 'modal',
            views: {
              'modal@': {
                controller: 'DomainManageDeleteCtrl',
                controllerAs: 'dmpopup',
                templateUrl: 'modules/core/domainManagement/unclaim.tpl.html',
                resolve: {
                  modalInfo: function ($state) {
                    $state.params.modalType = 'small';
                  }
                }
              }
            },
            params: {
              domain: null,
              loggedOnUser: null
            }
          })
          .state('domainmanagement.claim', {
            parent: 'modal',
            views: {
              'modal@': {
                controller: 'DomainManageClaimCtrl',
                controllerAs: 'dmpopup',
                templateUrl: 'modules/core/domainManagement/claim.tpl.html',
                resolve: {
                  modalInfo: function ($state) {
                    $state.params.modalType = 'small';
                  }
                }
              }
            },
            params: {
              domain: null,
              loggedOnUser: null
            }
          })
          .state('domainmanagement.verify', {
            parent: 'modal',
            views: {
              'modal@': {
                controller: 'DomainManageVerifyCtrl',
                controllerAs: 'dmpopup',
                templateUrl: 'modules/core/domainManagement/verify.tpl.html',
                resolve: {
                  modalInfo: function ($state) {
                    $state.params.modalType = 'small';
                  }
                }
              }
            },
            params: {
              domain: null,
              loggedOnUser: null
            }
          })
          .state('settings', {
            url: '/settings',
            templateUrl: 'modules/core/settings/settings.tpl.html',
            controller: 'SettingsCtrl',
            controllerAs: 'settingsCtrl',
            parent: 'main'
          })
          .state('authentication.enable3rdPartyAuth', {
            parent: 'modal',
            views: {
              'modal@': {
                controller: 'Enable3rdPartyAuthCtrl',
                controllerAs: 'enable3rdPartyAuth',
                templateUrl: 'modules/core/settings/authentication/enable3rdPartyAuth.tpl.html'
              }
            }
          })
          .state('profile', {
            url: '/profile',
            templateUrl: 'modules/core/partnerProfile/partnerProfile.tpl.html',
            controller: 'PartnerProfileCtrl',
            parent: 'main'
          })
          .state('brandingUpload', {
            parent: 'modalSmall',
            views: {
              'modal@': {
                templateUrl: 'modules/core/partnerProfile/branding/brandingUpload.tpl.html',
                controller: 'BrandingCtrl',
                controllerAs: 'brandupload',
              }
            },
            authenticate: false
          })
          .state('brandingExample', {
            parent: 'modal',
            views: {
              'modal@': {
                templateUrl: 'modules/core/partnerProfile/branding/brandingExample.tpl.html',
                controller: 'BrandingCtrl',
                controllerAs: 'brandEg',
              }
            },
            authenticate: false,
            params: {
              modalType: 'Partner'
            }
          })
          .state('invite', {
            url: '/invite',
            views: {
              'main@': {
                templateUrl: 'modules/squared/views/invite.html',
                controller: 'InviteCtrl'
              }
            },
            authenticate: false
          })
          .state('invitelauncher', {
            url: '/invitelauncher',
            templateUrl: 'modules/squared/views/invitelauncher.html',
            controller: 'InvitelauncherCtrl',
            parent: 'main',
            authenticate: false
          })
          .state('processorder', {
            url: '/processorder',
            templateUrl: 'modules/squared/views/processorder.html',
            controller: 'ProcessorderCtrl',
            controllerAs: 'processOrder',
            parent: 'main',
            authenticate: false
          })
          .state('overview', {
            url: '/overview',
            templateUrl: 'modules/core/overview/overview.tpl.html',
            controller: 'OverviewCtrl',
            controllerAs: 'overview',
            parent: 'main'
          })
          .state('my-company', {
            // url: '/my-company',
            templateUrl: 'modules/core/myCompany/myCompanyPage.tpl.html',
            controller: 'MyCompanyPageCtrl',
            controllerAs: 'mcp',
            parent: 'main',
            abstract: true
          })
          .state('my-company.subscriptions', {
            url: '/my-company/subscriptions',
            views: {
              'tabContent': {
                controllerAs: 'mcpSubscription',
                controller: 'MyCompanyPageSubscriptionCtrl',
                templateUrl: 'modules/core/myCompany/myCompanyPageSubscription.tpl.html'
              }
            }
          })
          .state('my-company.info', {
            url: '/my-company',
            views: {
              'tabContent': {
                controllerAs: 'mcpInfo',
                controller: 'MyCompanyPageInfoCtrl',
                templateUrl: 'modules/core/myCompany/myCompanyPageInfo.tpl.html'
              }
            }
          })
          .state('my-company.orders', {
            url: '/my-company/orders',
            views: {
              'tabContent': {
                controllerAs: 'mcpOrder',
                controller: 'MyCompanyPageOrderCtrl',
                templateUrl: 'modules/core/myCompany/myCompanyPageOrder.tpl.html'
              }
            }
          })
          .state('users', {
            abstract: true,
            template: '<div ui-view></div>',
            parent: 'main'
          })
          .state('users.list', {
            url: '/users',
            templateUrl: 'modules/core/users/userList/userList.tpl.html',
            controller: 'UserListCtrl',
            params: {
              showAddUsers: {}
            }
          })
          .state('users.delete', {
            parent: 'modal',
            views: {
              'modal@': {
                controller: 'UserDeleteCtrl',
                controllerAs: 'userDelete',
                templateUrl: 'modules/core/users/userDelete/userDelete.tpl.html',
                resolve: {
                  modalInfo: function ($state) {
                    $state.params.modalId = 'deleteUserModal';
                    $state.params.modalClass = 'modalContent';
                    $state.params.modalType = 'dialog';
                  }
                }
              }
            },
            params: {
              deleteUserOrgId: null,
              deleteUserUuId: null,
              deleteUsername: null,
            }
          })
          .state('users.deleteSelf', {
            parent: 'modal',
            views: {
              'modal@': {
                controller: 'UserDeleteCtrl',
                controllerAs: 'userDelete',
                templateUrl: 'modules/core/users/userDelete/userDeleteSelf.tpl.html',
                resolve: {
                  modalInfo: function ($state) {
                    $state.params.modalId = 'deleteUserModal';
                    $state.params.modalClass = 'modalContent';
                    $state.params.modalType = 'dialog';
                  }
                }
              }
            },
            params: {
              deleteUserOrgId: null,
              deleteUserUuId: null,
              deleteUsername: null
            }
          })
          .state('users.add', {
            parent: 'modalLarge',
            views: {
              'modal@': {
                controller: 'OnboardCtrl',
                template: '<div ui-view="usersAdd"></div>'
              },
              'usersAdd@users.add': {
                templateUrl: 'modules/core/users/userAdd/onboardUsersModal.tpl.html',
                resolve: {
                  modalInfo: function ($state) {
                    $state.params.modalClass = 'add-users';
                    $state.params.modalId = 'modalContent';
                  }
                }
              }
            }
          })
          .state('users.add.services', {
            views: {
              'usersAdd@users.add': {
                templateUrl: 'modules/core/users/userAdd/assignServicesModal.tpl.html',
                resolve: {
                  modalInfo: function ($state) {
                    $state.params.modalClass = 'add-users';
                    $state.params.modalId = 'modalContent';
                  }
                }
              }
            }
          })
          .state('users.add.services.dn', {
            views: {
              'usersAdd@users.add': {
                templateUrl: 'modules/huron/users/assignDnAndDirectLinesModal.tpl.html'
              }
            }
          })
          .state('users.convert', {
            parent: 'modalLarge',
            views: {
              'modal@': {
                controller: 'OnboardCtrl',
                template: '<div ui-view="usersConvert"></div>'
              },
              'usersConvert@users.convert': {
                templateUrl: 'modules/core/convertUsers/convertUsersModal.tpl.html',
                resolve: {
                  modalInfo: function ($state) {
                    $state.params.modalClass = 'convert-users';
                    $state.params.modalId = 'convertDialog';
                  }
                }
              }
            }
          })
          .state('users.convert.services', {
            views: {
              'usersConvert@users.convert': {
                templateUrl: 'modules/core/users/userAdd/assignServicesModal.tpl.html'
              }
            }
          })
          .state('users.convert.services.dn', {
            views: {
              'usersConvert@users.convert': {
                templateUrl: 'modules/huron/users/assignDnAndDirectLinesModal.tpl.html'
              }
            }
          })
          .state('users.csv', {
            parent: 'modalLarge',
            views: {
              'modal@': {
                controller: 'UserCsvCtrl',
                controllerAs: 'csv',
                template: '<div ui-view="usersCsv"></div>'
              },
              'usersCsv@users.csv': {
                templateUrl: 'modules/core/users/userCsv/userCsvFileModal.tpl.html'
              }
            }
          })
          .state('users.csv.results', {
            views: {
              'usersCsv@users.csv': {
                templateUrl: 'modules/core/users/userCsv/userCsvResultsModal.tpl.html'
              }
            }
          })
          .state('editService', {
            parent: 'modalLarge',
            views: {
              'modal@': {
                controller: 'OnboardCtrl',
                template: '<div ui-view="editServices"></div>'
              },
              'editServices@editService': {
                templateUrl: 'modules/core/users/userPreview/editServices.tpl.html'
              }
            },
            params: {
              currentUser: {}
            }
          })
          .state('editService.dn', {
            views: {
              'editServices@editService': {
                templateUrl: 'modules/huron/users/assignDnAndDirectLinesModal.tpl.html'
              }
            }
          })
          .state('userRedirect', {
            url: '/userRedirect',
            views: {
              'main@': {
                controller: 'userRedirectCtrl',
                controllerAs: 'userRedirect',
                templateUrl: 'modules/core/users/userRedirect/userRedirect.tpl.html'
              }
            }
          })
          .state('user-overview', {
            parent: 'sidepanel',
            views: {
              'sidepanel@': {
                controller: 'UserOverviewCtrl',
                controllerAs: 'userOverview',
                templateUrl: 'modules/core/users/userOverview/userOverview.tpl.html'
              },
              'header@user-overview': {
                templateUrl: 'modules/core/users/userOverview/userHeader.tpl.html'
              },
              'userPending@user-overview': {
                templateUrl: 'modules/core/users/userOverview/userPending.tpl.html'
              }
            },
            resolve: {
              currentUser: /* @ngInject */ function ($http, $stateParams, Config, Utils, Authinfo, UrlConfig) {
                var userUrl = UrlConfig.getScimUrl(Authinfo.getOrgId()) + '/' + $stateParams.currentUser.id;

                return $http.get(userUrl)
                  .then(function (response) {
                    angular.copy(response.data, this.currentUser);
                    this.entitlements = Utils.getSqEntitlements(this.currentUser);
                    return response.data;
                  }.bind($stateParams));
              }
            },
            params: {
              currentUser: {},
              entitlements: {},
              queryuserslist: {}
            },
            data: {
              displayName: 'Overview'
            }
          })
          .state('user-overview.communication', {
            templateUrl: 'modules/huron/overview/telephonyOverview.tpl.html',
            controller: 'TelephonyOverviewCtrl',
            controllerAs: 'telephonyOverview',
            params: {
              reloadToggle: false
            },
            data: {
              displayName: 'Call'
            }
          })
          .state('user-overview.communication.directorynumber', {
            templateUrl: 'modules/huron/lineSettings/lineSettings.tpl.html',
            controller: 'LineSettingsCtrl',
            controllerAs: 'lineSettings',
            params: {
              directoryNumber: {}
            },
            data: {
              displayName: 'Line Configuration'
            }
          })
          .state('user-overview.csdmDevice', {
            views: {
              '': {
                controller: 'DeviceOverviewCtrl',
                controllerAs: 'deviceOverview',
                templateUrl: 'modules/squared/devices/overview/deviceOverview.tpl.html'
              }
            },
            resolve: {
              channels: /* @ngInject */ function (CsdmUpgradeChannelService) {
                return CsdmUpgradeChannelService.getUpgradeChannelsPromise();
              }
            },
            params: {
              currentDevice: {},
              huronDeviceService: {}
            },
            data: {
              displayName: 'Device Configuration'
            }
          })
          .state('user-overview.communication.voicemail', {
            template: '<div uc-voicemail></div>',
            data: {
              displayName: 'Voicemail'
            }
          })
          .state('user-overview.communication.snr', {
            template: '<div uc-single-number-reach></div>',
            data: {
              displayName: 'Single Number Reach'
            }
          })
          .state('user-overview.communication.internationalDialing', {
            template: '<div uc-international-dialing></div>',
            data: {
              displayName: 'International Dialing'
            }
          })
          .state('user-overview.messaging', {
            templateUrl: 'modules/core/users/userPreview/userPreview.tpl.html',
            controller: 'UserPreviewCtrl',
            data: {
              displayName: 'Message'
            },
            params: {
              service: 'MESSAGING'
            }
          })
          .state('user-overview.hybrid-services-squared-fusion-cal', {
            templateUrl: 'modules/hercules/hybridServices/hybridServicesPreview.tpl.html',
            controller: 'HybridServicesPreviewCtrl',
            data: {
              displayName: 'Calendar Service'
            },
            params: {
              extensionId: {}
            }
          })
          .state('user-overview.hybrid-services-squared-fusion-uc', {
            templateUrl: 'modules/hercules/hybridServices/callServicePreview.tpl.html',
            controller: 'CallServicePreviewCtrl',
            data: {
              displayName: 'Call Service'
            },
            params: {
              extensionId: {}
            }
          })
          .state('user-overview.conferencing', {
            templateUrl: 'modules/core/users/userPreview/conferencePreview.tpl.html',
            controller: 'ConferencePreviewCtrl',
            controllerAs: 'confPreview',
            data: {
              displayName: 'Meeting'
            },
            params: {
              service: 'CONFERENCING'
            }
          })
          .state('user-overview.conferencing.webex', {
            templateUrl: 'modules/webex/userSettings/userSettings.tpl.html',
            controller: 'WebExUserSettingsCtrl',
            data: {
              displayName: 'Session Enablement'
            },
            params: {
              currentUser: {},
              site: {}
            }
          })
          .state('user-overview.conferencing.webex.webex2', {
            templateUrl: 'modules/webex/userSettings/userSettings2.tpl.html',
            controller: 'WebExUserSettings2Ctrl',
            data: {
              displayName: 'Privileges'
            },
            params: {
              currentUser: {},
              site: {}
            }
          })
          .state('user-overview.contactCenter', {
            templateUrl: 'modules/sunlight/users/userOverview/sunlightUserOverview.tpl.html',
            controller: 'SunlightUserOverviewCtrl',
            controllerAs: 'SunlightUserOverview',
            data: {
              displayName: 'Care'
            },
            params: {
              service: 'CONTACTCENTER'
            }
          })
          .state('user-overview.userProfile', {
            templateUrl: 'modules/core/users/userRoles/userRoles.tpl.html',
            controller: 'UserRolesCtrl',
            data: {
              displayName: 'Roles'
            }
          })

        // .state('users.list.preview', {
        //     templateUrl: 'modules/core/users/userPreview/userPreview.tpl.html',
        //     controller: 'UserPreviewCtrl'
        //   })
        //   .state('users.list.preview.conversations', {
        //     template: '<div user-entitlements current-user="currentUser" entitlements="entitlements" queryuserslist="queryuserslist"></div>'
        //   })
        //   .state('users.list.preview.roles', {
        //     template: '<div class="sub-details-full" user-roles current-user="currentUser" entitlements="entitlements" roles="roles" queryuserslist="queryuserslist"></div>'
        //   })
        //   .state('users.list.preview.directorynumber', {
        //     templateUrl: 'modules/huron/lineSettings/lineSettings.tpl.html',
        //     controller: 'LineSettingsCtrl',
        //     controllerAs: 'lineSettings',
        //     params: {
        //       showAddUsers: {},
        //       directoryNumber: {}
        //     }
        //   })
        //   .state('users.list.preview.voicemail', {
        //     template: '<div uc-voicemail></div>'
        //   })
        //   .state('users.list.preview.snr', {
        //     template: '<div uc-single-number-reach></div>'
        //   })
        //   .state('users.list.preview.device', {
        //     templateUrl: 'modules/huron/device/deviceDetail.tpl.html',
        //     controller: 'DeviceDetailCtrl',
        //     controllerAs: 'ucDeviceDetail',
        //     params: {
        //       showAddUsers: {},
        //       device: {}
        //     }
        //   })
        .state('groups', {
            abstract: true,
            template: '<div ui-view></div>',
            parent: 'main'
          })
          .state('groups.list', {
            url: '/groups',
            templateUrl: 'modules/core/groups/groupList/groupList.tpl.html',
            controller: 'ListGroupsCtrl'
          })
          .state('groups.list.preview', {
            templateUrl: 'modules/core/groups/groupPreview/groupPreview.tpl.html',
            controller: 'GroupPreviewCtrl'
          })
          .state('organizations', {
            url: '/organizations',
            templateUrl: 'modules/core/organizations/organizationList/organizationList.tpl.html',
            controller: 'ListOrganizationsCtrl',
            parent: 'main'
          })
          .state('organization-overview', {
            parent: 'sidepanel',
            views: {
              'sidepanel@': {
                controller: 'OrganizationOverviewCtrl',
                controllerAs: 'orgOverview',
                templateUrl: 'modules/core/organizations/organizationOverview/organizationOverview.tpl.html'
              },
              'header@organization-overview': {
                templateUrl: 'modules/core/organizations/organizationOverview/organizationHeader.tpl.html'
              }
            },
            params: {
              currentOrganization: null
            },
            data: {
              displayName: 'Overview'
            }
          })
          .state('organization-overview.features', {
            templateUrl: 'modules/core/organizations/organizationFeatures/organizationFeatures.tpl.html',
            controller: 'OrganizationFeaturesCtrl',
            controllerAs: 'features',
            params: {
              reloadToggle: false
            },
            data: {
              displayName: 'Beta Features'
            }
          })
          .state('organization-overview.add', {
            parent: 'modalLarge',
            views: {
              'modal@': {
                controller: 'OrganizationAddCtrl',
                controllerAs: 'orgAdd',
                template: '<div ui-view="orgAdd"></div>'
              },
              'orgAdd@organization-overview.add': {
                templateUrl: 'modules/core/organizations/organizationAdd/organizationAdd.tpl.html'
              }
            }
          })
          .state('organization-overview.add.info', {
            templateUrl: 'modules/core/organizations/organizationAdd/organizationAdd.tpl.html'
          })
          .state('organization-overview.add.addNumbers', {
            templateUrl: 'modules/core/organizations/organizationAdd/addNumbers.tpl.html',
            controller: 'DidAddCtrl',
            controllerAs: 'didAdd',
            params: {
              currentTrial: {},
              currentOrg: {}
            }
          })
          .state('site-list', {
            url: '/site-list',
            templateUrl: 'modules/core/siteList/siteList.tpl.html',
            controller: 'WebExSiteRowCtrl',
            controllerAs: 'siteList',
            parent: 'main'
          })
          .state('site-csv', {
            parent: 'modal',
            views: {
              'modal@': {
                controller: 'SiteCSVModalCtrl',
                templateUrl: 'modules/webex/siteCSVModal/siteCSVModal.tpl.html',
                controllerAs: 'siteCSVModalCtrl',
                resolve: {
                  modalInfo: function ($state) {
                    $state.params.modalType = 'small';
                  }
                }
              }
            },
            params: {
              siteRow: null
            }
          })
          .state('site-csv-results', {
            parent: 'modal',
            views: {
              'modal@': {
                controller: 'SiteCSVResultsCtrl',
                templateUrl: 'modules/webex/siteCSVResultsModal/siteCSVResults.tpl.html',
                controllerAs: 'siteCSVResult',
                resolve: {
                  modalInfo: function ($state) {
                    $state.params.modalType = 'small';
                  }
                }
              }
            },
            params: {
              siteRow: null
            }
          })
          .state('site-list.site-settings', {
            templateUrl: 'modules/webex/siteSettings/siteSettings.tpl.html',
            controller: 'WebExSiteSettingsCtrl',
            parent: 'main',
            params: {
              siteUrl: null
            }
          })
          .state('site-list.site-setting', {
            templateUrl: 'modules/webex/siteSetting/siteSetting.tpl.html',
            controller: 'WebExSiteSettingCtrl',
            parent: 'main',
            params: {
              siteUrl: null,
              webexPageId: null,
              settingPageIframeUrl: null
            }
          })
          .state('reports', {
            url: '/reports',
            templateUrl: 'modules/core/customerReports/customerReports.tpl.html',
            controller: 'CustomerReportsCtrl',
            controllerAs: 'nav',
            parent: 'main',
            params: {
              tab: null,
              siteUrl: null
            }
          })
          .state('reports-metrics', {
            url: '/reports/metrics',
            templateUrl: 'modules/core/customerReports/customerReports.tpl.html',
            controller: 'CustomerReportsCtrl',
            controllerAs: 'nav',
            parent: 'main',
            params: {
              tab: 'metrics',
              siteUrl: null
            }
          })
          .state('webex-reports', {
            url: '/reports/webex',
            templateUrl: 'modules/core/customerReports/customerReports.tpl.html',
            controller: 'CustomerReportsCtrl',
            controllerAs: 'nav',
            parent: 'main',
            params: {
              tab: 'webex',
              siteUrl: null
            }
          })
          .state('webex-reports.webex-reports-iframe', {
            templateUrl: 'modules/webex/siteReportsIframe/siteReportIframe.tpl.html',
            controller: 'ReportsIframeCtrl',
            parent: 'main',
            params: {
              siteUrl: null,
              reportPageId: null,
              reportPageIframeUrl: null
            },
            data: {
              displayName: 'Reports Page2'
            }
          })
          .state('userprofile', {
            url: '/userprofile/:uid',
            templateUrl: 'modules/squared/views/userprofile.html',
            controller: 'UserProfileCtrl',
            parent: 'main'
          })
          .state('support', {
            url: '/support',
            templateUrl: 'modules/squared/support/support.html',
            controller: 'SupportCtrl',
            parent: 'main'
          })
          .state('support.status', {
            url: '/status',
            views: {
              'supportPane': {
                templateUrl: 'modules/squared/support/support-status.html',
                controller: 'SupportCtrl',
                controllerAs: 'support'
              }
            }
          })
          .state('support.logs', {
            url: '/logs?search',

            views: {
              'supportPane': {
                templateUrl: 'modules/squared/support/support-logs.html',
                controller: 'SupportCtrl',
              }
            }
          })
          .state('support.billing', {
            url: '/billing?enc',
            views: {
              'supportPane': {
                templateUrl: 'modules/squared/support/support-billing.html',
                controller: 'BillingCtrl'
              }
            }

          })
          .state('billing', {
            url: '/orderprovisioning?enc',
            templateUrl: 'modules/squared/support/billing.tpl.html',
            controller: 'BillingCtrl',
            parent: 'main'
          })

        /*
          devices
        */

        .state('devices', {
            url: '/devices',
            templateUrl: 'modules/squared/devices/devices.html',
            controller: 'DevicesCtrl',
            controllerAs: 'sc',
            parent: 'main',
            data: {
              bodyClass: 'devices-page'
            }
          })
          .state('device-overview', {
            parent: 'sidepanel',
            views: {
              'sidepanel@': {
                controller: 'DeviceOverviewCtrl',
                controllerAs: 'deviceOverview',
                templateUrl: 'modules/squared/devices/overview/deviceOverview.tpl.html'
              },
              'header@device-overview': {
                templateUrl: 'modules/squared/devices/overview/deviceHeader.tpl.html'
              }
            },
            resolve: {
              channels: /* @ngInject */ function (CsdmUpgradeChannelService) {
                return CsdmUpgradeChannelService.getUpgradeChannelsPromise();
              }
            },
            params: {
              currentDevice: {},
              huronDeviceService: {}
            },
            data: {
              displayName: 'Overview'
            }
          })
          .state('video', {
            parent: 'modalLarge',
            views: {
              'modal@': {
                templateUrl: 'modules/core/video/videoModal.tpl.html'
              }
            }
          })
          .state('partneroverview', {
            parent: 'partner',
            url: '/overview',
            templateUrl: 'modules/core/partnerHome/partnerHome.tpl.html',
            controller: 'PartnerHomeCtrl'
          })
          .state('partnerreports', {
            parent: 'partner',
            url: '/reports',
            templateUrl: 'modules/core/partnerReports/partnerReports.tpl.html',
            controller: 'PartnerReportCtrl',
            controllerAs: 'nav'
          })
          .state('login_swap', {
            url: '/login/:customerOrgId/:customerOrgName',
            views: {
              'main@': {
                templateUrl: 'modules/core/login/login.tpl.html',
                controller: 'LoginCtrl'
              }
            },
            authenticate: false
          })
          .state('launch_partner_org', {
            url: '/login/:partnerOrgId/:partnerOrgName/:launchPartner',
            views: {
              'main@': {
                templateUrl: 'modules/core/login/login.tpl.html',
                controller: 'LoginCtrl'
              }
            },
            authenticate: false
          })
          .state('partnercustomers', {
            parent: 'partner',
            template: '<div ui-view></div>',
            absract: true
          })
          .state('partnercustomers.list', {
            url: '/customers',
            templateUrl: 'modules/core/customers/customerList/customerList.tpl.html',
            controller: 'CustomerListCtrl',
            params: {
              filter: null
            }
          })
          .state('customer-overview', {
            parent: 'sidepanel',
            views: {
              'sidepanel@': {
                controller: 'CustomerOverviewCtrl',
                controllerAs: 'customerOverview',
                templateUrl: 'modules/core/customers/customerOverview/customerOverview.tpl.html'
              }
            },
            resolve: {
              identityCustomer: /* @ngInject */ function ($stateParams, $q, Orgservice) {
                var defer = $q.defer();
                if ($stateParams.currentCustomer) {
                  Orgservice.getOrg(orgCallback, $stateParams.currentCustomer.customerOrgId);
                }

                return defer.promise;

                function orgCallback(data, status) {
                  defer.resolve(data);
                }
              }
            },
            params: {
              currentCustomer: {}
            },
            data: {
              displayName: 'Overview'
            }
          })
          .state('customer-overview.externalNumbers', {
            controller: 'ExternalNumberDetailCtrl',
            controllerAs: 'externalNumbers',
            templateUrl: 'modules/huron/externalNumbers/externalNumberDetail.tpl.html',
            data: {
              displayName: 'Phone Numbers'
            }
          })
          .state('customer-overview.customerAdministrators', {
            controller: 'CustomerAdministratorDetailCtrl',
            controllerAs: 'customerAdmin',
            templateUrl: 'modules/core/customers/customerAdministrators/customerAdministratorDetail.tpl.html',
            data: {
              displayName: 'Partner Administrators'
            }
          })
          .state('customer-overview.pstnOrderOverview', {
            controller: 'PstnOrderOverviewCtrl',
            controllerAs: 'pstnOrderOverview',
            templateUrl: 'modules/huron/orderManagement/pstnOrderOverview.tpl.html',
            data: {
              displayName: 'PSTN Orders'
            },
            params: {
              currentCustomer: {}
            }
          })
          .state('customer-overview.pstnOrderDetail', {
            parent: 'customer-overview.pstnOrderOverview',
            controller: 'PstnOrderDetailCtrl',
            controllerAs: 'pstnOrderDetail',
            templateUrl: 'modules/huron/orderManagement/pstnOrderDetail.tpl.html',
            data: {
              displayName: 'Order'
            },
            params: {
              currentOrder: {}
            }
          })
          .state('modal', {
            abstract: true,
            onEnter: modalOnEnter(),
            onExit: modalOnExit
          })
          .state('modalLarge', {
            abstract: true,
            onEnter: modalOnEnter({
              size: 'lg'
            }),
            onExit: modalOnExit
          })
          .state('modalSmall', {
            abstract: true,
            onEnter: modalOnEnter({
              size: 'sm'
            }),
            onExit: modalOnExit
          })
          .state('modalFull', {
            abstract: true,
            onEnter: modalOnEnter({
              windowClass: 'modal-full',
              backdrop: 'static'
            }),
            onExit: modalOnExit
          })
          .state('wizardmodal', {
            abstract: true,
            onEnter: /* @ngInject */ function ($modal, $state, $previousState) {
              $previousState.memo(wizardmodalMemo);
              $state.modal = $modal.open({
                template: '<div ui-view="modal"></div>',
                controller: 'ModalWizardCtrl',
                windowTemplateUrl: 'modules/core/modal/wizardWindow.tpl.html',
                backdrop: 'static'
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
              }
            ]
          })
          .state('firsttimesplash', {
            abstract: true,
            views: {
              'main@': {
                templateUrl: 'modules/core/setupWizard/firstTimeWizard.tpl.html',
                controller: 'FirstTimeWizardCtrl'
              }
            }
          })
          .state('firsttimewizard', {
            parent: 'firsttimesplash',
            template: '<cr-wizard tabs="tabs" finish="finish" is-first-time="true"></cr-wizard>',
            controller: 'SetupWizardCtrl',
            data: {
              firstTimeSetup: true
            }
          })
          .state('setupwizardmodal', {
            parent: 'wizardmodal',
            views: {
              'modal@': {
                template: '<cr-wizard tabs="tabs" finish="finish"></cr-wizard>',
                controller: 'SetupWizardCtrl'
              }
            },
            params: {
              currentTab: {},
              currentSubTab: '',
              currentStep: '',
              onlyShowSingleTab: false
            },
            data: {
              firstTimeSetup: false
            }
          })
          .state('trialExtInterest', {
            url: '/trialExtInterest?eqp',
            templateUrl: 'modules/core/trialExtInterest/trialExtInterest.tpl.html',
            controller: 'TrialExtInterestCtrl',
            controllerAs: 'extInterest',
            parent: 'main'
          })
          .state('helpdesk-main', {
            views: {
              'main@': {
                controller: 'HelpdeskHeaderController',
                controllerAs: 'helpdeskHeaderCtrl',
                templateUrl: 'modules/squared/helpdesk/helpdesk.tpl.html'
              }
            },
            abstract: true,
            sticky: true
          })
          .state('helpdesklaunch', {
            url: '/helpdesklaunch',
            templateUrl: 'modules/squared/helpdesk/helpdesk-launch.html',
            parent: 'main'
          })
          .state('helpdesk', {
            url: '/helpdesk',
            template: '<div ui-view></div>',
            controller: 'HelpdeskController',
            controllerAs: 'helpdeskCtrl',
            parent: 'helpdesk-main'
          })
          .state('helpdesk.search', {
            url: '/',
            templateUrl: 'modules/squared/helpdesk/helpdesk-search.html'
          })
          .state('helpdesk.user', {
            url: '/user/:orgId/:id',
            templateUrl: 'modules/squared/helpdesk/helpdesk-user.html',
            controller: 'HelpdeskUserController',
            controllerAs: 'helpdeskUserCtrl',
            params: {
              user: null,
              id: null,
              orgId: null
            }
          })
          .state('helpdesk.org', {
            url: '/org/:id',
            templateUrl: 'modules/squared/helpdesk/helpdesk-org.html',
            controller: 'HelpdeskOrgController',
            controllerAs: 'helpdeskOrgCtrl',
            params: {
              org: null,
              id: null
            }
          })
          .state('helpdesk.cloudberry-device', {
            url: '/cloudberryDevice/:orgId/:id',
            templateUrl: 'modules/squared/helpdesk/helpdesk-cloudberry-device.html',
            controller: 'HelpdeskCloudberryDeviceController',
            controllerAs: 'helpdeskDeviceCtrl',
            params: {
              device: null,
              id: null,
              orgId: null
            }
          })
          .state('helpdesk.huron-device', {
            url: '/huronDevice/:orgId/:id',
            templateUrl: 'modules/squared/helpdesk/helpdesk-huron-device.html',
            controller: 'HelpdeskHuronDeviceController',
            controllerAs: 'helpdeskDeviceCtrl',
            params: {
              device: null,
              id: null,
              orgId: null
            }
          });
      }
    ]);

  angular
    .module('Huron')
    .config(['$stateProvider',
      function ($stateProvider) {
        $stateProvider
          .state('cdrsupport', {
            url: '/cdrsupport',
            templateUrl: 'modules/huron/cdrLogs/cdrlogs.tpl.html',
            controller: 'CdrLogsCtrl',
            controllerAs: 'cdr',
            parent: 'main'
          })
          .state('cdr-overview', {
            parent: 'sidepanel',
            views: {
              'sidepanel@': {
                controller: 'CdrOverviewCtrl',
                controllerAs: 'cdrpanel',
                templateUrl: 'modules/huron/cdrLogs/cdrOverview/cdrOverview.tpl.html'
              }
            },
            params: {
              cdrData: {},
              call: [],
              uniqueIds: [],
              events: [],
              imported: '',
              logstashPath: ''
            },
            data: {
              displayName: 'Advanced CDR Report'
            }
          })
          .state('cdrladderdiagram', {
            parent: 'modalFull',
            views: {
              'modal@': {
                templateUrl: 'modules/huron/cdrLogs/cdrLadderDiagram/cdrLadderDiagram.tpl.html',
                controller: 'CdrLadderDiagramCtrl',
                controllerAs: 'cdrLadderDiagram'
              }
            },
            params: {
              call: [],
              uniqueIds: [],
              events: [],
              imported: '',
              logstashPath: ''
            }
          })
          .state('callroutingBase', {
            abstract: true,
            parent: 'main',
            templateUrl: 'modules/huron/callRouting/callRouting.tpl.html'
          })
          .state('callrouting', {
            url: '/callrouting',
            parent: 'callroutingBase',
            views: {
              'header': {
                templateUrl: 'modules/huron/callRouting/callRoutingHeader.tpl.html'
              },
              'nav': {
                templateUrl: 'modules/huron/callRouting/callRoutingNav.tpl.html',
                controller: 'CallRoutingNavCtrl',
                controllerAs: 'nav'
              },
              'main': {
                template: '<div ui-view></div>'
              }
            }
          })
          .state('callpark', {
            url: '/callpark',
            parent: 'callrouting',
            templateUrl: 'modules/huron/callRouting/callPark/callPark.tpl.html',
            controller: 'CallParkCtrl',
            controllerAs: 'cp'
          })
          .state('callpickup', {
            url: '/callpickup',
            parent: 'callrouting',
            template: '<div></div>'
          })
          .state('intercomgroups', {
            url: '/intercomgroups',
            parent: 'callrouting',
            template: '<div></div>'
          })
          .state('paginggroups', {
            url: '/paginggroups',
            parent: 'callrouting',
            template: '<div></div>'
          })
          .state('huntgroups', {
            url: '/huntgroups',
            parent: 'callrouting',
            template: '<div></div>'
          })
          .state('mediaonhold', {
            parent: 'modalLarge',
            url: '/mediaonhold',
            views: {
              'modal@': {
                templateUrl: 'modules/huron/moh/moh.tpl.html',
                controller: 'MohCtrl',
                controllerAs: 'moh',
                resolve: {
                  modalInfo: function ($state) {
                    $state.params.modalClass = 'moh-content';
                  }
                }
              }
            }
          })
          .state('trialAdd', {
            abstract: true,
            parent: 'modal',
            views: {
              'modal@': {
                template: '<div ui-view></div>',
                controller: 'TrialAddCtrl',
                controllerAs: 'trial'
              }
            },
            params: {
              isEditing: false,
              currentTrial: {},
              details: {}
            }
          })
          .state('trialAdd.info', {
            templateUrl: 'modules/core/trials/trialAdd.tpl.html'
          })
          .state('trialAdd.finishSetup', {
            templateUrl: 'modules/core/trials/trialFinishSetup.tpl.html',
          })
          .state('trialAdd.webex', {
            templateUrl: 'modules/core/trials/trialWebex.tpl.html',
            controller: 'TrialWebexCtrl',
            controllerAs: 'webexTrial'
          })
          .state('trialAdd.call', {
            templateUrl: 'modules/core/trials/trialDevice.tpl.html',
            controller: 'TrialDeviceController',
            controllerAs: 'callTrial'
          })
          .state('trialAdd.pstn', {
            templateUrl: 'modules/core/trials/trialPstn.tpl.html',
            controller: 'TrialPstnCtrl',
            controllerAs: 'pstnTrial'
          })
          .state('trialAdd.emergAddress', {
            templateUrl: 'modules/core/trials/trialEmergAddress.tpl.html',
            controller: 'TrialEmergAddressCtrl',
            controllerAs: 'eAddressTrial'
          })
          .state('trialAdd.addNumbers', {
            templateUrl: 'modules/core/trials/addNumbers.tpl.html',
            controller: 'DidAddCtrl',
            controllerAs: 'didAdd',
            params: {
              currentTrial: {},
              currentOrg: {},
            }
          })
          .state('trialEdit', {
            abstract: true,
            parent: 'modal',
            views: {
              'modal@': {
                template: '<div ui-view></div>',
                controller: 'TrialEditCtrl',
                controllerAs: 'trial'
              }
            },
            params: {
              isEditing: true,
              currentTrial: {},
              details: {}
            }
          })
          .state('trialEdit.addNumbers', {
            templateUrl: 'modules/core/trials/addNumbers.tpl.html',
            controller: 'DidAddCtrl',
            controllerAs: 'didAdd',
            resolve: {
              modalInfo: function ($state) {
                $state.params.modalClass = 'add-did-numbers-modal';
                $state.params.modalId = 'didAddModal add-numbers';
              }
            },
            params: {
              currentOrg: {}
            }
          })
          .state('trialEdit.info', {
            templateUrl: 'modules/core/trials/trialEdit.tpl.html'
          })
          .state('trialEdit.finishSetup', {
            templateUrl: 'modules/core/trials/trialFinishSetup.tpl.html',
          })
          .state('trialEdit.webex', {
            templateUrl: 'modules/core/trials/trialWebex.tpl.html',
            controller: 'TrialWebexCtrl',
            controllerAs: 'webexTrial'
          })
          .state('trialEdit.call', {
            templateUrl: 'modules/core/trials/trialDevice.tpl.html',
            controller: 'TrialDeviceController',
            controllerAs: 'callTrial'
          })
          .state('trialEdit.pstn', {
            templateUrl: 'modules/core/trials/trialPstn.tpl.html',
            controller: 'TrialPstnCtrl',
            controllerAs: 'pstnTrial'
          })
          .state('trialEdit.emergAddress', {
            templateUrl: 'modules/core/trials/trialEmergAddress.tpl.html',
            controller: 'TrialEmergAddressCtrl',
            controllerAs: 'eAddressTrial'
          })
          .state('generateauthcode', {
            parent: 'modal',
            url: '/generateauthcode',
            params: {
              currentUser: {},
              activationCode: {}
            },
            views: {
              'modal@': {
                templateUrl: 'modules/huron/device/generateActivationCodeModal.tpl.html',
                controller: 'GenerateActivationCodeCtrl',
                controllerAs: 'genAuthCode'
              }
            }
          })
          .state('didadd', {
            parent: 'modal',
            params: {
              currentOrg: {},
              editMode: true
            },
            views: {
              'modal@': {
                templateUrl: 'modules/huron/didAdd/didAdd.tpl.html',
                controller: 'DidAddCtrl',
                controllerAs: 'didAdd'
              }
            }
          })
          .state('pstnSetup', {
            parent: 'modalFull',
            params: {
              customerId: {},
              customerName: {},
              customerEmail: {},
              customerCommunicationLicenseIsTrial: {}
            },
            views: {
              'modal@': {
                template: '<div ui-view></div>',
                controller: 'PstnSetupCtrl',
                controllerAs: 'pstnSetup'
              },
              '@pstnSetup': {
                templateUrl: 'modules/huron/pstnSetup/pstnProviders/pstnProviders.tpl.html',
                controller: 'PstnProvidersCtrl',
                controllerAs: 'pstnProviders'
              }
            }
          })
          .state('pstnSetup.contractInfo', {
            templateUrl: 'modules/huron/pstnSetup/pstnContractInfo/pstnContractInfo.tpl.html',
            controller: 'PstnContractInfoCtrl',
            controllerAs: 'pstnContractInfo'
          })
          .state('pstnSetup.serviceAddress', {
            templateUrl: 'modules/huron/pstnSetup/pstnServiceAddress/pstnServiceAddress.tpl.html',
            controller: 'PstnServiceAddressCtrl',
            controllerAs: 'pstnServiceAddress'
          })
          .state('pstnSetup.orderNumbers', {
            templateUrl: 'modules/huron/pstnSetup/pstnNumbers/pstnNumbers.tpl.html',
            controller: 'PstnNumbersCtrl',
            controllerAs: 'pstnNumbers'
          })
          .state('pstnSetup.swivelNumbers', {
            templateUrl: 'modules/huron/pstnSetup/pstnSwivelNumbers/pstnSwivelNumbers.tpl.html',
            controller: 'PstnSwivelNumbersCtrl',
            controllerAs: 'pstnSwivelNumbers'
          })
          .state('pstnSetup.review', {
            templateUrl: 'modules/huron/pstnSetup/pstnReview/pstnReview.tpl.html',
            controller: 'PstnReviewCtrl',
            controllerAs: 'pstnReview'
          })
          .state('pstnSetup.nextSteps', {
            templateUrl: 'modules/huron/pstnSetup/pstnNextSteps/pstnNextSteps.tpl.html',
            controller: 'PstnNextStepsCtrl',
            controllerAs: 'pstnNextSteps'
          })
          .state('hurondetailsBase', {
            abstract: true,
            parent: 'main',
            templateUrl: 'modules/huron/details/huronDetails.tpl.html'
          })
          .state('hurondetails', {
            url: '/hurondetails',
            parent: 'hurondetailsBase',
            views: {
              'header': {
                templateUrl: 'modules/huron/details/huronDetailsHeader.tpl.html',
                controller: 'HuronDetailsHeaderCtrl',
                controllerAs: 'header'
              },
              'main': {
                template: '<div ui-view></div>'
              }
            }
          })
          .state('huronlines', {
            url: '/lines',
            parent: 'hurondetails',
            templateUrl: 'modules/huron/lines/lineList.tpl.html',
            controller: 'LinesListCtrl',
            controllerAs: 'linesListCtrl'
          })
          .state('huronsettings', {
            url: '/settings',
            parent: 'hurondetails',
            templateUrl: 'modules/huron/settings/settings.tpl.html',
            controller: 'HuronSettingsCtrl',
            controllerAs: 'settings'
          })
          .state('huronfeatures', {
            url: '/features',
            parent: 'hurondetails',
            templateUrl: 'modules/huron/features/featureLanding/features.tpl.html',
            controller: 'HuronFeaturesCtrl',
            controllerAs: 'huronFeaturesCtrl'
          })
          .state('huronnewfeature', {
            url: '/newfeature',
            parent: 'hurondetails',
            templateUrl: 'modules/huron/features/newFeature/newFeature.tpl.html',
            controller: 'NewFeatureCtrl',
            controllerAs: 'newFeatureCtrl'
          })
          .state('huronfeatures.aabuilder', {
            parent: 'hurondetails',
            params: {
              aaName: '',
              aaTemplate: ''
            },
            templateUrl: 'modules/huron/features/autoAttendant/builder/aaBuilderMain.tpl.html',
            controller: 'AABuilderMainCtrl',
            controllerAs: 'aaBuilderMain'
          })
          .state('huronfeatures.deleteFeature', {
            parent: 'modal',
            views: {
              'modal@': {
                controller: 'HuronFeatureDeleteCtrl',
                controllerAs: 'huronFeatureDelete',
                templateUrl: 'modules/huron/features/featureLanding/featureDeleteModal.tpl.html',
                resolve: {
                  modalInfo: function ($state) {
                    $state.params.modalType = 'dialog';
                  }
                }
              }
            },
            params: {
              deleteFeatureName: null,
              deleteFeatureId: null,
              deleteFeatureType: null
            }
          })
          .state('huronfeatures.aaListDepends', {
            parent: 'modal',
            views: {
              'modal@': {
                controller: 'HuronFeatureAADependsCtrl',
                controllerAs: 'huronFeatureAADepends',
                templateUrl: 'modules/huron/features/featureLanding/featureAADependsModal.tpl.html',
                resolve: {
                  modalInfo: function ($state) {
                    $state.params.modalType = 'dialog';
                  }
                }
              }
            },
            params: {
              detailsFeatureName: null,
              detailsFeatureId: null,
              detailsFeatureType: null,
              detailsDependsList: null
            }
          })
          .state('huronHuntGroup', {
            url: '/huronHuntGroup',
            parent: 'hurondetails',
            templateUrl: 'modules/huron/features/huntGroup/hgSetupAssistant.tpl.html',
            controller: 'HuntGroupSetupAssistantCtrl',
            controllerAs: 'huntGroupSA'
          })
          .state('huntgroupedit', {
            url: '/features/hg/edit',
            parent: 'main',
            templateUrl: 'modules/huron/features/huntGroup/edit/hgEdit.tpl.html',
            controller: 'HuntGroupEditCtrl',
            controllerAs: 'hge',
            params: {
              feature: null
            }
          });
      }
    ]);

  angular
    .module('Hercules')
    .config(['$stateProvider',
      function ($stateProvider) {
        $stateProvider
          .state('services-overview', {
            url: '/services/overview',
            templateUrl: 'modules/hercules/servicesOverview/servicesOverview.html',
            controller: 'ServicesOverviewCtrl',
            controllerAs: 'servicesOverviewCtrl',
            parent: 'main'
          })
          .state('cluster-list', {
            url: '/services/clusters',
            templateUrl: 'modules/hercules/fusion-pages/cluster-list.html',
            controller: 'FusionClusterListController',
            controllerAs: 'resourceList',
            parent: 'main',
            resolve: {
              hasFeatureToggle: /* @ngInject */ function (FeatureToggleService) {
                return FeatureToggleService.supports(FeatureToggleService.features.hybridServicesResourceList);
              }
            }
          })
          .state('expressway-settings', {
            url: '/services/cluster/expressway/:id/settings',
            templateUrl: 'modules/hercules/fusion-pages/expressway-settings.html',
            controller: 'ExpresswayClusterSettingsController',
            controllerAs: 'clusterSettings',
            parent: 'main'
          })
          .state('mediafusion-settings', {
            url: '/services/cluster/mediafusion/:id/settings',
            templateUrl: 'modules/hercules/fusion-pages/mediafusion-settings.html',
            controller: 'MediafusionClusterSettingsController',
            controllerAs: 'clusterSettings',
            parent: 'main'
          })
          .state('calendar-service', {
            templateUrl: 'modules/hercules/overview/overview.html',
            controller: 'ExpresswayServiceController',
            controllerAs: 'exp',
            data: {
              connectorType: 'c_cal'
            },
            params: {
              clusterId: null
            },
            parent: 'main',
            abstract: true
          })
          .state('calendar-service.list', {
            url: '/services/calendar',
            views: {
              fullPane: {
                templateUrl: 'modules/hercules/cluster-list/cluster-list.html'
              }
            },
            params: {
              clusterId: null
            }
          })
          .state('calendar-service.settings', {
            url: '/services/calendar/settings',
            views: {
              fullPane: {
                controllerAs: 'expresswayServiceSettings',
                controller: 'ExpresswayServiceSettingsController',
                templateUrl: 'modules/hercules/service-settings/calendar-service-settings.html'
              }
            }
          })
          .state('call-service', {
            templateUrl: 'modules/hercules/overview/overview.html',
            controller: 'ExpresswayServiceController',
            controllerAs: 'exp',
            data: {
              connectorType: 'c_ucmc'
            },
            params: {
              clusterId: null
            },
            parent: 'main'
          })
          .state('call-service.list', {
            url: '/services/call',
            views: {
              fullPane: {
                templateUrl: 'modules/hercules/cluster-list/cluster-list.html'
              }
            },
            params: {
              clusterId: null
            }
          })
          .state('call-service.settings', {
            url: '/services/call/settings',
            views: {
              fullPane: {
                controllerAs: 'expresswayServiceSettings',
                controller: 'ExpresswayServiceSettingsController',
                templateUrl: 'modules/hercules/service-settings/call-service-settings.html'
              }
            }
          })
          .state('management-service', {
            templateUrl: 'modules/hercules/overview/overview.html',
            controller: 'ExpresswayServiceController',
            controllerAs: 'exp',
            data: {
              connectorType: 'c_mgmt'
            },
            parent: 'main',
            abstract: true
          })
          .state('management-service.list', {
            url: '/services/expressway-management',
            views: {
              'fullPane': {
                templateUrl: 'modules/hercules/cluster-list/cluster-list.html'
              }
            }
          })
          .state('management-service.settings', {
            url: '/services/expressway-management/settings',
            views: {
              fullPane: {
                controllerAs: 'expresswayServiceSettings',
                controller: 'ExpresswayServiceSettingsController',
                templateUrl: 'modules/hercules/service-settings/management-service-settings.html'
              }
            }
          })
          .state('cluster-details', {
            parent: 'sidepanel',
            views: {
              'sidepanel@': {
                controllerAs: 'clusterDetailsCtrl',
                controller: 'ExpresswayServiceClusterController',
                templateUrl: 'modules/hercules/cluster-sidepanel/cluster-details.html'
              },
              'header@cluster-details': {
                templateUrl: 'modules/hercules/cluster-sidepanel/cluster-header.html'
              }
            },
            data: {
              displayName: 'Overview'
            },
            params: {
              clusterId: null,
              connectorType: null
            },
            resolve: {
              hasF410FeatureToggle: /* @ngInject */ function (FeatureToggleService) {
                return FeatureToggleService.supports(FeatureToggleService.features.hybridServicesResourceList);
              }
            }
          })
          .state('management-connector-details', {
            parent: 'sidepanel',
            views: {
              'sidepanel@': {
                templateUrl: 'modules/hercules/cluster-sidepanel/management-connector-details.html',
                controller: 'ExpresswayHostDetailsController',
                controllerAs: 'hostDetailsCtrl'
              }
            },
            data: {
              displayName: 'Management Connector'
            },
            params: {
              host: null,
              clusterId: null,
              connectorType: 'c_mgmt'
            }
          })
          .state('cluster-details.alarm-details', {
            templateUrl: 'modules/hercules/cluster-sidepanel/alarm-details.html',
            controller: 'AlarmController',
            controllerAs: 'alarmCtrl',
            data: {
              displayName: 'Alarm Details'
            },
            params: {
              alarm: null,
              host: null
            }
          })
          .state('cluster-details.host-details', {
            templateUrl: 'modules/hercules/cluster-sidepanel/host-details.html',
            controller: 'ExpresswayHostDetailsController',
            controllerAs: 'hostDetailsCtrl',
            data: {
              displayName: 'Host'
            },
            params: {
              host: null,
              clusterId: null,
              connectorType: null
            }
          });
      }
    ]);

  angular
    .module('Mediafusion')
    .config(['$stateProvider',
      function ($stateProvider) {
        $stateProvider

          .state('metrics', {
            url: '/metrics',
            controllerAs: 'GraphUtilCtrl',
            controller: 'AnalyticsUtilizationGraphController',
            templateUrl: 'modules/mediafusion/media-service/metrics/analytics-utilization-graph.html',
            parent: 'main'
          })
          .state('media-service', {
            templateUrl: 'modules/mediafusion/media-service/overview.html',
            controller: 'MediaServiceController',
            controllerAs: 'med',
            parent: 'main'
          })
          .state('media-service.list', {
            url: '/mediaservice',
            views: {
              'fullPane': {
                templateUrl: 'modules/mediafusion/media-service/resources/cluster-list.html'
              }
            }
          })
          .state('media-service.settings', {
            url: '/mediaservice/settings',
            views: {
              'fullPane': {
                controllerAs: 'mediaServiceSettings',
                controller: 'MediaServiceSettingsController',
                templateUrl: 'modules/mediafusion/media-service/settings/media-service-settings.html'
              }
            }
          })

        .state('connector-details', {
            parent: 'sidepanel',
            views: {
              'sidepanel@': {
                controllerAs: 'groupDetails',
                controller: 'GroupDetailsController',
                templateUrl: 'modules/mediafusion/media-service/side-panel/group-details.html'
              },
              'header@connector-details': {
                templateUrl: 'modules/mediafusion/media-service/side-panel/group-header.html'
              }
            },
            data: {
              displayName: 'Overview'
            },
            params: {
              groupName: {},
              selectedClusters: {}
            }
          })
          .state('connector-details.alarm-details', {
            templateUrl: 'modules/mediafusion/media-service/side-panel/alarm-details.html',
            controller: 'MediaAlarmController',
            controllerAs: 'alarmCtrl',
            data: {
              displayName: 'Alarm Details'
            },
            params: {
              alarm: null,
              host: null
            }
          })
          .state('connector-details.host-details', {
            templateUrl: 'modules/mediafusion/media-service/side-panel/host-details.html',
            controller: 'HostDetailsController',
            controllerAs: 'hostDetails',
            data: {
              displayName: 'Host'
            },
            params: {
              clusterId: null,
              properties: null,
              connector: null,
              hostLength: null
            }
          })
          .state('connector-details.group-settings', {
            templateUrl: 'modules/mediafusion/media-service/side-panel/group-settings.html',
            controller: 'GroupSettingsController',
            controllerAs: 'groupClusterSettingsCtrl',
            data: {
              displayName: 'Settings'
            },
            params: {
              clusterList: null,
              dispName: null
            }
          })

        //V2 API changes
        .state('media-service-v2', {
            templateUrl: 'modules/mediafusion/media-service-v2/overview.html',
            controller: 'MediaServiceControllerV2',
            controllerAs: 'med',
            parent: 'main'
          })
          .state('media-service-v2.list', {
            url: '/mediaserviceV2',
            views: {
              'fullPane': {
                templateUrl: 'modules/mediafusion/media-service-v2/resources/cluster-list.html'
              }
            }
          })
          .state('media-service-v2.settings', {
            url: '/mediaserviceV2/settings',
            views: {
              'fullPane': {
                controllerAs: 'mediaServiceSettings',
                controller: 'MediaServiceSettingsControllerV2',
                templateUrl: 'modules/mediafusion/media-service-v2/settings/media-service-settings.html'
              }
            }
          })

        .state('connector-details-v2', {
            parent: 'sidepanel',
            views: {
              'sidepanel@': {
                controllerAs: 'groupDetails',
                controller: 'GroupDetailsControllerV2',
                templateUrl: 'modules/mediafusion/media-service-v2/side-panel/group-details.html'
              },
              'header@connector-details-v2': {
                templateUrl: 'modules/mediafusion/media-service-v2/side-panel/group-header.html'
              }
            },
            data: {
              displayName: 'Overview'
            },
            params: {
              clusterName: {},
              nodes: {},
              cluster: {}
            }
          })
          .state('connector-details-v2.alarm-details', {
            templateUrl: 'modules/mediafusion/media-service-v2/side-panel/alarm-details.html',
            controller: 'MediaAlarmControllerV2',
            controllerAs: 'alarmCtrl',
            data: {
              displayName: 'Alarm Details'
            },
            params: {
              alarm: null,
              host: null
            }
          })
          .state('connector-details-v2.host-details', {
            templateUrl: 'modules/mediafusion/media-service-v2/side-panel/host-details.html',
            controller: 'HostDetailsControllerV2',
            controllerAs: 'hostDetails',
            data: {
              displayName: 'Host'
            },
            params: {
              clusterId: null,
              connector: null,
              hostLength: null,
              selectedCluster: null
            }
          })
          .state('connector-details-v2.group-settings', {
            templateUrl: 'modules/mediafusion/media-service-v2/side-panel/group-settings.html',
            controller: 'GroupSettingsControllerV2',
            controllerAs: 'groupClusterSettingsCtrl',
            data: {
              displayName: 'Settings'
            },
            params: {
              clusterList: null,
              dispName: null
            }
          });
      }
    ]);

  angular
    .module('Ediscovery')
    .config(['$stateProvider',
      function ($stateProvider) {
        $stateProvider

          .state('ediscovery-main', {
          views: {
            'main@': {
              templateUrl: 'modules/ediscovery/ediscovery.tpl.html'
            }
          },
          abstract: true,
          sticky: true
        })

        .state('ediscovery', {
            url: '/ediscovery',
            template: '<div ui-view></div>',
            parent: 'ediscovery-main'
          })
          .state('ediscovery.search', {
            url: '/search',
            controller: 'EdiscoverySearchController',
            controllerAs: 'ediscoverySearchCtrl',
            templateUrl: 'modules/ediscovery/ediscovery-search.html',
            params: {
              report: null,
              reRun: false,
            }
          })
          .state('ediscovery.reports', {
            url: '/reports',
            controller: 'EdiscoveryReportsController',
            controllerAs: 'ediscoveryCtrl',
            templateUrl: 'modules/ediscovery/ediscovery-reports.html'
          });
      }
    ]);

  angular
    .module('Messenger')
    .config(['$stateProvider',
      function ($stateProvider) {
        $stateProvider
          .state('messenger', {
            parent: 'main',
            url: '/messenger',
            templateUrl: 'modules/messenger/ci-sync/ciSync.tpl.html',
            controller: 'CiSyncCtrl',
            controllerAs: 'sync'
          });
      }
    ]);

  angular
    .module('Sunlight')
    .config(['$stateProvider',
      function ($stateProvider) {
        $stateProvider
          .state('care', {
            parent: 'main',
            abstract: true
          })
          .state('care.DetailsBase', {
            parent: 'main',
            abstract: true,
            templateUrl: 'modules/sunlight/details/details.tpl.html'
          })
          .state('care.Details', {
            url: '/careDetails',
            parent: 'care.DetailsBase',
            views: {
              'header': {
                templateUrl: 'modules/sunlight/details/detailsHeader.tpl.html',
                controller: 'DetailsHeaderCtrl',
                controllerAs: 'header'
              },
              'main': {
                template: '<div ui-view></div>'
              }
            }
          })
          .state('care.Settings', {
            url: '/settings',
            parent: 'care.Details'
          })
          .state('care.Features', {
            url: '/features',
            parent: 'care.Details',
            templateUrl: 'modules/sunlight/features/featureLanding/careFeatures.tpl.html',
            controller: 'CareFeaturesCtrl',
            controllerAs: 'careFeaturesCtrl'
          })
          .state('care.ChatSA', {
            url: '/careChat',
            parent: 'care.Details',
            templateUrl: 'modules/sunlight/features/chat/ctSetupAssistant.tpl.html',
            controller: 'CareChatSetupAssistantCtrl',
            controllerAs: 'careChatSA'
          })
          .state('care.Features.DeleteFeature', {
            parent: 'modal',
            views: {
              'modal@': {
                controller: 'CareFeaturesDeleteCtrl',
                controllerAs: 'careFeaturesDeleteCtrl',
                templateUrl: 'modules/sunlight/features/featureLanding/careFeaturesDeleteModal.tpl.html',
                resolve: {
                  modalInfo: function ($state) {
                    $state.params.modalType = 'dialog';
                  }
                }
              }
            },
            params: {
              deleteFeatureName: null,
              deleteFeatureId: null,
              deleteFeatureType: null
            }
          });
      }
    ]);
})();
