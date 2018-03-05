var _ = require('lodash');
var KeyCodes = require('modules/core/accessibility').KeyCodes;

(function () {
  'use strict';

  angular
    .module('Sunlight')
    .controller('CareFeaturesCtrl', CareFeaturesCtrl)
    .run(function ($rootScope) {
      $rootScope.isCare = false;
    });

  /* @ngInject */
  function CareFeaturesCtrl($filter, $modal, $q, $translate, $state, $scope, $rootScope, AbcService, AutoAttendantCeInfoModelService, Authinfo, CardUtils, CareFeatureList, CvaService, CTService, EvaService, FeatureToggleService, HuronFeaturesListService, Log, Notification) {
    var vm = this;
    vm.isVirtualAssistantEnabled = $state.isVirtualAssistantEnabled;
    vm.isExpertVirtualAssistantEnabled = $state.isExpertVirtualAssistantEnabled;
    vm.isAppleBusinessChatEnabled = $state.isAppleBusinessChatEnabled;
    vm.init = init;

    var pageStates = {
      newFeature: 'NewFeature',
      showFeatures: 'ShowFeatures',
      loading: 'Loading',
      error: 'Error',
    };
    var listOfAllFeatures = [];
    var listOfCvaFeatures = [];
    var listOfEvaFeatures = [];
    var listOfNonVaFeatures = [];
    var featureToBeDeleted = {};
    var listOfAAFeatures = [];
    var listOfABCFeatures = [];

    vm.searchData = searchData;
    vm.deleteCareFeature = deleteCareFeature;
    vm.deleteCareFeatureKeypress = deleteCareFeatureKeypress;
    vm.openEmbedCodeModal = openEmbedCodeModal;
    vm.openEmbedCodeModalKeypress = openEmbedCodeModalKeypress;
    vm.filteredListOfFeatures = [];
    vm.pageState = pageStates.loading;
    vm.cardColor = {};
    vm.featureToolTip = function (type, name) {
      var assistantType = {
        cva: $translate.instant('careChatTpl.virtualAssistant.cva.featureText.name'),
        eva: $translate.instant('careChatTpl.virtualAssistant.eva.featureText.name'),
      };
      return $translate.instant('careChatTpl.assistantTooltip',
        { assistantType: assistantType[type], assistantName: name });
    };
    vm.placeholder = {
      name: 'Search',
    };
    vm.aaModel = {};
    vm.filterText = '';
    vm.filterValue = '';
    vm.template = null;
    vm.openNewCareFeatureModal = openNewCareFeatureModal;
    vm.spacesInUseText = spacesInUseText;
    vm.templatesInUseText = templatesInUseText;
    vm.generateHtmlPopover = generateHtmlPopover;
    vm.setFilter = setFilter;
    vm.hasMessage = Authinfo.isMessageEntitled();
    vm.hasCall = Authinfo.isSquaredUC();
    vm.tooltip = '';
    vm.purchaseLink = purchaseLink;
    vm.userHasAccess = userHasAccess;

    /* LIST OF FEATURES
     *
     *  To add a New Feature (like Voice Templates)
     *  1. Define the service to get the list of feature
     *  2. Inject the features Service into the Controller
     *  3. Add the Object for the feature in the format of the Features Array Object (features)
     *  4. Define the formatter
     * */
    vm.features = [{
      name: 'Ch',
      getFeature: CareFeatureList.getChatTemplates,
      formatter: CareFeatureList.formatTemplates,
      i18n: 'careChatTpl.chatTemplate',
      isEmpty: false,
      color: 'people',
      icons: ['icon-message'],
      featureIcons: { eva: EvaService.featureList.icons[0], cva: CvaService.featureList.icons[0] },
      data: [],
    }, {
      name: 'Ca',
      getFeature: CareFeatureList.getCallbackTemplates,
      formatter: CareFeatureList.formatTemplates,
      i18n: 'careChatTpl.chatTemplate',
      isEmpty: false,
      color: 'people',
      icons: ['icon-phone'],
      data: [],
    }, {
      name: 'ChCa',
      getFeature: CareFeatureList.getChatPlusCallbackTemplates,
      formatter: CareFeatureList.formatTemplates,
      i18n: 'careChatTpl.chatTemplate',
      isEmpty: false,
      color: 'people',
      icons: ['icon-message', 'icon-phone'],
      featureIcons: { eva: EvaService.featureList.icons[0], cva: CvaService.featureList.icons[0] },
      data: [],
    }];
    vm.filters = [{
      name: $translate.instant('common.all'),
      filterValue: CareFeatureList.filterConstants.all,
    }, {
      name: $translate.instant('careChatTpl.filterValue.customerSupportTemplates'),
      filterValue: CareFeatureList.filterConstants.customerSupport,
    },
    ];

    if (vm.isAppleBusinessChatEnabled) {
      vm.features.push(AbcService.featureList);
      vm.filters.push(AbcService.featureFilter);
    }

    if (vm.isVirtualAssistantEnabled) {
      vm.features.push(CvaService.featureList);
      vm.filters.push(CvaService.featureFilter);
    }

    if (vm.isExpertVirtualAssistantEnabled) {
      vm.features.push(EvaService.featureList);
    }

    /**
     * Function to push the AutoAttendant feature into the features list if
     * Hybrid is enabled.
     */
    function setupHybridFeatures() {
      return FeatureToggleService.supports(FeatureToggleService.features.atlasHybridEnable).then(function (results) {
        if (results) {
          vm.features.push({
            name: 'AA',
            getFeature: function () {
              return AutoAttendantCeInfoModelService.getCeInfosList();
            },
            formatter: HuronFeaturesListService.autoAttendants,
            isEmpty: false,
            i18n: 'huronFeatureDetails.aaName',
            color: 'primary',
            badge: 'primary',
            data: [],
          });

          vm.filters.push({
            name: $translate.instant('autoAttendant.title'),
            filterValue: CareFeatureList.filterConstants.autoAttendant,
          });
        }
      });
    }

    function settingFeatures() {
      var featuresPromises = getListOfFeatures();

      handleFeaturePromises(featuresPromises);

      $q.all(featuresPromises).then(function () {
        showNewFeaturePageIfNeeded();
      }).finally(function () {
        for (var i = 0; i < vm.features.length; i++) {
          listOfAllFeatures = listOfAllFeatures.concat(vm.features[i].data);
          switch (vm.features[i].name) {
            case 'customerVirtualAssistant':
              listOfCvaFeatures = listOfCvaFeatures.concat(vm.features[i].data);
              break;
            case 'expertVirtualAssistant':
              listOfEvaFeatures = listOfEvaFeatures.concat(vm.features[i].data);
              break;
            case 'AA':
              listOfAAFeatures = listOfAAFeatures.concat(vm.features[i].data);
              break;
            case 'appleBusinessChat':
              listOfABCFeatures = listOfABCFeatures.concat(vm.features[i].data);
              break;
            default:
              listOfNonVaFeatures = listOfNonVaFeatures.concat(vm.features[i].data);
              break;
          }
        }
        generateCvaInUseForABC();
        generateTemplateCountAndSpaceUsage();
        //by default "all" filter is the selected
        vm.filteredListOfFeatures = _.clone(listOfAllFeatures);
        if (listOfAllFeatures.length > 0) {
          vm.pageState = pageStates.showFeatures;
        }
      });

      if (!vm.hasMessage && !vm.hasCall) {
        vm.tooltip = $translate.instant('sunlightDetails.licensesMissing.messageAndCall');
      } else if (!vm.hasMessage) {
        vm.tooltip = $translate.instant('sunlightDetails.licensesMissing.messageOnly');
      }
    }

    init();

    function init() {
      vm.pageState = pageStates.loading;
      setupHybridFeatures()
        .then(_.noop)
        .finally(function () {
          settingFeatures();
        });
    }

    /**
     * Find the CVA name using the id for the ABC config objects
     */
    function generateCvaInUseForABC() {
      _.forEach(listOfABCFeatures, function (item) {
        if (!_.isEmpty(item.cvaId)) {
          var cva = _.find(listOfCvaFeatures, function (cvaFeature) {
            return cvaFeature.id === item.cvaId;
          });
          if (cva) {
            var feature = {};
            feature.featureType = 'cva';
            feature.name = cva.name;
            feature.id = cva.id;
            item.features = [];
            item.features.push(feature);
          }
        }
      });
    }

    /**
     * Generate the template count for both CVA and EVA and Space count for EVA only
     */
    function generateTemplateCountAndSpaceUsage() {
      _.forEach(listOfNonVaFeatures, function (item) {
        _.forEach(item.features, function (featureItem) {
          // for eva, we don't know the id, so will add the count to all eva's
          if (featureItem.featureType === 'eva') {
            _.forEach(listOfEvaFeatures, function (evaItem) {
              evaItem.templates.push(item.name);
            });
          } else if (!_.isEmpty(featureItem.id)) {
            var va = _.find(listOfCvaFeatures, function (vaFeature) {
              return vaFeature.id === featureItem.id;
            });

            if (va) {
              va.templates.push(item.name);
            }
          }
        });
      });

      // Generate the template html popover for CVA
      _.forEach(listOfCvaFeatures, function (item) {
        var popoverMainHeader = $translate.instant('careChatTpl.featureCard.cvaPopoverMainHeader');
        item.templatesHtmlPopover = generateTemplateCountHtmlPopover(popoverMainHeader, item);
      });

      // Generate the template html popover for EVA
      _.forEach(listOfEvaFeatures, function (item) {
        var popoverMainHeader = $translate.instant('careChatTpl.featureCard.evaPopoverMainHeader');
        item.templatesHtmlPopover = generateTemplateCountHtmlPopover(popoverMainHeader, item);
      });
    }

    function generateTemplateCountHtmlPopover(popoverMainHeader, feature) {
      var templatesList = _.get(feature, 'templates', []);

      var templatesHeader = $translate.instant('careChatTpl.featureCard.popoverTemplatesHeader', {
        numOfTemplates: templatesList.length,
      });

      var htmlString = '<div class="feature-card-popover"><h3 class="header">' + popoverMainHeader + '</h3>';
      htmlString += '<h3 class="sub-header">' + templatesHeader + '</h3><ul class="spaces-list">';

      _.forEach(templatesList, function (template) {
        htmlString += '<li>' + template + '</li>';
      });

      htmlString += '</ul></div>';
      return htmlString;
    }

    function generateHtmlPopover(feature) {
      var spacesList = _.get(feature, 'spaces', []);

      if (spacesList.length < 1) {
        return '<div class="feature-card-popover-error">' + $translate.instant('careChatTpl.featureCard.popoverErrorMessage') + '</div>';
      }

      var spacesHeader = $translate.instant('careChatTpl.featureCard.popoverSpacesHeader', {
        numOfSpaces: spacesList.length,
      });

      var htmlString = '<div class="feature-card-popover"><h3 class="sub-header">' + spacesHeader + '</h3><ul class="spaces-list">';

      _.forEach(spacesList, function (expertSpace) {
        htmlString += '<li>' + expertSpace.title;
        if (expertSpace.default) {
          htmlString += ' ' + $translate.instant('careChatTpl.featureCard.popoverDefaultSpace');
        }
        htmlString += '</li>';
      });

      htmlString += '</ul></div>';
      return htmlString;
    }

    function handleFeaturePromises(promises) {
      _.forEach(vm.features, function (feature, index) {
        promises[index].then(function (data) {
          return handleFeatureData(data, feature);
        }, function (response) {
          handleFailures(response, feature);
        });
      });
    }

    function handleFeatureData(data, feature) {
      var list = feature.formatter(data, feature);
      if (list.length > 0) {
        feature.data = list;
        feature.isEmpty = false;

        // Adding AutoAttedant as a new feature.
        if (feature.name === 'AA') {
          vm.aaModel = data;
        }

        if (feature.name === 'expertVirtualAssistant') {
          _.forEach(feature.data, function (eva, index) {
            return EvaService.getExpertAssistantSpaces(eva.id)
              .then(function (result) {
                feature.data[index].spaces = result.items;
                feature.data[index].spacesHtmlPopover = vm.generateHtmlPopover(feature.data[index]);
              })
              .catch(function () {
                feature.data[index].spaces = [];
                feature.data[index].spacesHtmlPopover = vm.generateHtmlPopover(feature.data[index]);
              });
          });
        }
      } else {
        feature.isEmpty = true;
        showReloadPageIfNeeded();
      }
    }

    function getListOfFeatures() {
      var promises = [];
      _.forEach(vm.features, function (value) {
        promises.push(value.getFeature());
      });
      return promises;
    }

    function handleFailures(response, feature) {
      vm.pageState = pageStates.error;
      Log.warn('Could not fetch features for customer with Id:', Authinfo.getOrgId());
      Notification.errorWithTrackingId(response, 'careChatTpl.failedToLoad', {
        featureText: $filter('translate')(feature.i18n),
      });
    }

    function areFeaturesEmpty() {
      var isEmpty = true;
      _.forEach(vm.features, function (feature) {
        isEmpty = isEmpty && feature.isEmpty;
      });
      return isEmpty;
    }

    function showNewFeaturePageIfNeeded() {
      if (vm.pageState !== pageStates.showFeatures && areFeaturesEmpty()) {
        vm.pageState = pageStates.newFeature;
      }
    }

    function reInstantiateMasonry() {
      CardUtils.resize(200);
    }

    function showReloadPageIfNeeded() {
      if (vm.pageState === pageStates.loading && areFeaturesEmpty()) {
        vm.pageState = pageStates.error;
      }
    }

    //Switches Data that populates the Features tab
    function setFilter(filterValue) {
      vm.filterValue = filterValue || 'all';
      vm.filteredListOfFeatures = CareFeatureList.filterCards(listOfAllFeatures, vm.filterValue, vm.filterText);
      reInstantiateMasonry();
    }

    /* This function does an in-page search for the string typed in search box*/
    function searchData(searchStr) {
      vm.filterText = searchStr;
      vm.filteredListOfFeatures = CareFeatureList.filterCards(listOfAllFeatures, vm.filterValue, vm.filterText);
      reInstantiateMasonry();
    }

    vm.editCareFeature = function (feature, $event) {
      if (feature.filterValue === 'AA') {
        $rootScope.isCare = true;
        vm.aaModel.aaName = feature.cardName;
        $state.go('huronfeatures.aabuilder', {
          aaName: vm.aaModel.aaName,
        });
      } else {
        $event.stopImmediatePropagation();
        if (feature.featureType === EvaService.evaServiceCard.id) {
          EvaService.getExpertAssistant(feature.templateId).then(function (template) {
            EvaService.evaServiceCard.goToService($state, {
              isEditFeature: true,
              template: template,
            });
          });
          return;
        }
        if (feature.featureType === CvaService.cvaServiceCard.id) {
          CvaService.getConfig(feature.templateId).then(function (template) {
            CvaService.cvaServiceCard.goToService($state, {
              isEditFeature: true,
              template: template,
            });
          });
          return;
        }
        CareFeatureList.getTemplate(feature.templateId).then(function (template) {
          $state.go('care.setupAssistant', {
            isEditFeature: true,
            template: template,
            type: template.configuration.mediaType,
          });
        });
      }
    };

    function userHasAccess(feature) {
      if (feature.featureType === EvaService.evaServiceCard.id) {
        var result = EvaService.getWarningIfNotOwner(feature);
        if (!result.valid) {
          $scope.warning = $translate.instant(result.warning.message, result.warning.args);
        }
        return result.valid;
      }
      return true;
    }

    function deleteCareFeature(feature, $event) {
      $event.preventDefault();
      $event.stopImmediatePropagation();
      featureToBeDeleted = feature;
      if (feature.hasDepends) {
        Notification.error('huronFeatureDetails.aaDeleteBlocked', {
          aaNames: feature.dependsNames.join(', '),
        });
        return;
      }

      /* Checking if feature has cardName then the feature is
       * AutoAttedant otherwise its a Customer Support template.
       */
      if (_.has(feature, 'cardName')) {
        $state.go('huronfeatures.deleteFeature', {
          deleteFeatureName: feature.cardName,
          deleteFeatureId: feature.id,
          deleteFeatureType: feature.filterValue,
        });
      } else {
        $state.go('care.Features.DeleteFeature', {
          deleteFeatureName: feature.name,
          deleteFeatureId: feature.templateId,
          deleteFeatureType: feature.featureType,
        });
      }
    }

    function deleteCareFeatureKeypress(feature, $event) {
      switch ($event.which) {
        case KeyCodes.ENTER:
        case KeyCodes.SPACE:
          $event.preventDefault();
          $event.stopImmediatePropagation();
          deleteCareFeature(feature, $event);
          break;
      }
    }

    function openEmbedCodeModal(feature, $event) {
      $event.preventDefault();
      $event.stopImmediatePropagation();
      CTService.openEmbedCodeModal(feature.templateId, feature.name);
    }

    function openEmbedCodeModalKeypress(feature, $event) {
      switch ($event.which) {
        case KeyCodes.ENTER:
        case KeyCodes.SPACE:
          $event.preventDefault();
          $event.stopImmediatePropagation();
          openEmbedCodeModal(feature, $event);
          break;
      }
    }

    /** Getting the details of the all the dependant AA's */
    vm.detailsHuronFeature = function (feature, $event) {
      $event.preventDefault();
      $event.stopImmediatePropagation();
      $state.go('huronfeatures.aaListDepends', {
        detailsFeatureName: feature.cardName,
        detailsFeatureId: feature.id,
        detailsFeatureType: feature.filterValue,
        detailsDependsList: feature.dependsNames,
      });
    };

    function spacesInUseText(feature) {
      var numOfSpaces = _.get(feature, 'spaces.length', 0);

      if (numOfSpaces > 0) {
        return $translate.instant('careChatTpl.featureCard.spacesInUseText', {
          numOfSpaces: numOfSpaces,
        });
      }

      return $translate.instant('careChatTpl.featureCard.unavailableSpacesInUseText');
    }

    function templatesInUseText(feature) {
      var numOfTemplates = _.get(feature, 'templates.length', 0);

      return $translate.instant('careChatTpl.featureCard.templatesInUseText', {
        numOfTemplates: numOfTemplates,
      });
    }

    function openNewCareFeatureModal() {
      $rootScope.isCare = true;
      $modal.open({
        template: '<care-feature-modal dismiss="$dismiss()" class="care-modal"></care-feature-modal>',
      });
    }

    //list is updated by deleting a feature
    $scope.$on('CARE_FEATURE_DELETED', function () {
      listOfAllFeatures.splice(listOfAllFeatures.indexOf(featureToBeDeleted), 1);
      // remove deleted feature from abc's in use
      if (featureToBeDeleted.featureType === CvaService.cvaServiceCard.id) {
        _.find(listOfAllFeatures, function (feature) {
          if (feature.featureType === AbcService.abcServiceCard.id) {
            if (feature.features && feature.features[0].id === featureToBeDeleted.id) {
              feature.features = [];
            }
          }
        });
      }
      vm.filteredListOfFeatures = listOfAllFeatures;
      featureToBeDeleted = {};
      if (listOfAllFeatures.length === 0) {
        vm.pageState = pageStates.newFeature;
      }
    });

    /** list is updated by deleting an Auto Attendant from care feature landing page */
    $scope.$on('HURON_FEATURE_DELETED', function () {
      listOfAllFeatures.splice(listOfAllFeatures.indexOf(featureToBeDeleted), 1);

      if (featureToBeDeleted.filterValue === 'AA' && featureToBeDeleted.hasReferences) {
        _.forEach(featureToBeDeleted.referenceNames, function (ref) {
          var cardToRefresh = _.find(listOfAllFeatures, function (feature) {
            return feature.cardName === ref;
          });
          if (!_.isUndefined(cardToRefresh)) {
            cardToRefresh.dependsNames.splice(cardToRefresh.dependsNames.indexOf(featureToBeDeleted.cardName), 1);
            if (cardToRefresh.dependsNames.length === 0) {
              cardToRefresh.hasDepends = false;
            }
          }
        });
      }

      vm.filteredListOfFeatures = listOfAllFeatures;
      featureToBeDeleted = {};
      if (listOfAllFeatures.length === 0) {
        vm.pageState = pageStates.newFeature;
      }
      if (vm.filterText) {
        searchData(vm.filterText);
      }
    });

    function purchaseLink() {
      $state.go('my-company.subscriptions');
    }
  }
})();
