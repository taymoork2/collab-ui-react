import { ExpresswayContainerController } from '../expressway-common-container.controller';
import { Notification } from 'modules/core/notifications';

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
        Notification: Notification,
        private $translate: ng.translate.ITranslateService,
        ServiceDescriptor: any,
        USSService: any
    ) {
        super($modal, $state, Notification, ServiceDescriptor, USSService, ['squared-fusion-uc'], 'c_ucmc');
        this.addConnectIfEnabled();
    }

    private addConnectIfEnabled() {
        this.ServiceDescriptor.isServiceEnabled('squared-fusion-ec', (error, enabled) => {
            if (!error && enabled) {
                this.servicesId.push('squared-fusion-ec');
                this.subscribeStatusesSummary.cancel();
                this.extractSummary();
                this.subscribeStatusesSummary = this.USSService.subscribeStatusesSummary('data', this.extractSummary.bind(this));
            }
        })
    }

}

angular
    .module('Hercules')
    .controller('CallServiceContainerController', CallServiceContainerController);