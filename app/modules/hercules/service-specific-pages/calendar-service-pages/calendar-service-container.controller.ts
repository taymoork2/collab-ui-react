import { ExpresswayContainerController } from '../expressway-common-container.controller';

export class CalendarServiceContainerController extends ExpresswayContainerController {

    public tabs: any = [{
        title: this.$translate.instant('common.resources'),
        state: 'calendar-service.list'
    }, {
        title: this.$translate.instant('common.settings'),
        state: 'calendar-service.settings'
    }];

    /* @ngInject */
    constructor(
        $modal,
        $state,
        Notification,
        private $translate: ng.translate.ITranslateService,
        ServiceDescriptor: any
    ) {
        super($modal, $state, Notification, ServiceDescriptor, 'squared-fusion-cal', 'c_cal');
    }

}

angular
    .module('Hercules')
    .controller('CalendarServiceContainerController', CalendarServiceContainerController);