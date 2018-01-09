var _ = require('lodash');

(function () {
  'use strict';

  angular
    .module('Sunlight')
    .controller('CareFeaturesCtrl', CareFeaturesCtrl)
    .run(function ($rootScope) {
      $rootScope.isCare = false;
    });

  /* @ngInject */
  function CareFeaturesCtrl($filter, $modal, $q, $translate, $state, $scope, $rootScope, Authinfo, CardUtils, CareFeatureList, CTService, Log, Notification, CvaService, EvaService) {
    var vm = this;
    vm.isVirtualAssistantEnabled = $state.isVirtualAssistantEnabled;
    vm.isExpertVirtualAssistantEnabled = $state.isExpertVirtualAssistantEnabled;
    vm.init = init;
    var pageStates = {
      newFeature: 'NewFeature',
      showFeatures: 'ShowFeatures',
      loading: 'Loading',
      error: 'Error',
    };
    var listOfAllFeatures = [];
    var featureToBeDeleted = {};
    vm.searchData = searchData;
    vm.deleteCareFeature = deleteCareFeature;
    vm.openEmbedCodeModal = openEmbedCodeModal;
    vm.filteredListOfFeatures = [];
    vm.pageState = pageStates.loading;
    vm.cardColor = {};
    vm.placeholder = {
      name: 'Search',
    };
    vm.filterText = '';
    vm.template = null;
    vm.openNewCareFeatureModal = openNewCareFeatureModal;
    vm.spacesInUseText = spacesInUseText;
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
      data: [],
    }];
    vm.filters = [{
      name: $translate.instant('common.all'),
      filterValue: CareFeatureList.filterConstants.all,
    }, {
      name: $translate.instant('common.customerSupportTemplates'),
      filterValue: CareFeatureList.filterConstants.customerSupport,
    },
    ];

    if (vm.isVirtualAssistantEnabled) {
      vm.features.push(CvaService.featureList);
      vm.filters.push(CvaService.featureFilter);
    }

    if (vm.isExpertVirtualAssistantEnabled) {
      vm.features.push(EvaService.featureList);
    }

    init();

    function init() {
      vm.pageState = pageStates.loading;
      var featuresPromises = getListOfFeatures();

      handleFeaturePromises(featuresPromises);

      $q.all(featuresPromises).then(function () {
        showNewFeaturePageIfNeeded();
      }).finally(function () {
        for (var i = 0; i < vm.features.length; i++) {
          listOfAllFeatures = listOfAllFeatures.concat(vm.features[i].data);
        }
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

    function generateHtmlPopover(feature) {
      var spacesList = _.get(feature, 'spaces', []);

      if (spacesList.length < 1) {
        return '<div class="feature-card-popover-error">' + $translate.instant('careChatTpl.featureCard.popoverErrorMessage') + '</div>';
      }

      var popoverMainHeader = $translate.instant('careChatTpl.featureCard.popoverMainHeader');
      var spacesHeader = $translate.instant('careChatTpl.featureCard.popoverSpacesHeader', {
        numOfSpaces: spacesList.length,
      });

      var htmlString = '<div class="feature-card-popover"><h3 class="header">' + popoverMainHeader + '</h3>';
      htmlString += '<h3 class="sub-header">' + spacesHeader + '</h3><ul class="spaces-list">';

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

        if (feature.name === 'expertVirtualAssistant') {
          _.forEach(feature.data, function (eva, index) {
            return EvaService.getExpertAssistantSpaces(eva.id)
              .then(function (result) {
                feature.data[index].spaces = result.items;
                feature.data[index].htmlPopover = vm.generateHtmlPopover(feature.data[index]);
              })
              .catch(function () {
                feature.data[index].spaces = [];
                feature.data[index].htmlPopover = vm.generateHtmlPopover(feature.data[index]);
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
      vm.filteredListOfFeatures = CareFeatureList.filterCards(listOfAllFeatures, filterValue, vm.filterText);
      reInstantiateMasonry();
    }

    /* This function does an in-page search for the string typed in search box*/
    function searchData(searchStr) {
      vm.filterText = searchStr;
      vm.filteredListOfFeatures = CareFeatureList.filterCards(listOfAllFeatures, 'all', vm.filterText);
      reInstantiateMasonry();
    }

    vm.editCareFeature = function (feature, $event) {
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
      $state.go('care.Features.DeleteFeature', {
        deleteFeatureName: feature.name,
        deleteFeatureId: feature.templateId,
        deleteFeatureType: feature.featureType,
        deleteQueueId: feature.queueId,
      });
    }

    function openEmbedCodeModal(feature, $event) {
      $event.preventDefault();
      $event.stopImmediatePropagation();
      CTService.openEmbedCodeModal(feature.templateId, feature.name);
    }

    function spacesInUseText(feature) {
      var numOfSpaces = _.get(feature, 'spaces.length', 0);

      if (numOfSpaces > 0) {
        return $translate.instant('careChatTpl.featureCard.spacesInUseText', {
          numOfSpaces: numOfSpaces,
        });
      }

      return $translate.instant('careChatTpl.featureCard.unavailableSpacesInUseText');
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
      vm.filteredListOfFeatures = listOfAllFeatures;
      featureToBeDeleted = {};
      if (listOfAllFeatures.length === 0) {
        vm.pageState = pageStates.newFeature;
      }
    });

    function purchaseLink() {
      $state.go('my-company.subscriptions');
    }
  }
})();
