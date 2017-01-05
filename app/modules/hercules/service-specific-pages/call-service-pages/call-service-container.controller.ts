import { ExpresswayContainerController } from '../expressway-common-container.controller';

export class CallServiceContainerController extends ExpresswayContainerController {

    public tabs: any = [{
        title: this.$translate.instant('common.resources'),
        state: 'call-service.list'
    }, {
        title: this.$translate.instant('common.settings'),
        state: 'call-service.settings'
    }];

    /* @ngInject */
    constructor(
        $modal,
        $state,
        Notification,
        private $translate: ng.translate.ITranslateService,
        ServiceDescriptor: any
    ) {
        super($modal, $state, Notification, ServiceDescriptor, 'squared-fusion-uc', 'c_ucmc');
    }


}

angular
    .module('Hercules')
    .controller('CallServiceContainerController', CallServiceContainerController);