import { Notification } from '../../core/notifications/notification.service';

export abstract class ExpresswayContainerController {

    public backState = 'services-overview';

    /* @ngInject */
    constructor(
        private $modal: any,
        private $state: any,
        private Notification: Notification,
        private ServiceDescriptor: any,
        private serviceId: string,
        private connectorType: string
    ) { }

    public $onInit() {
        this.firstTimeSetup();
    }

    private firstTimeSetup = () => {
        this.ServiceDescriptor.isServiceEnabled(this.serviceId, (error, enabled) => {
            if (error) {
                this.Notification.errorWithTrackingId(error, 'hercules.genericFailure');
                return;
            }
            if (enabled) {
              return;
            }
            this.$modal.open({
                resolve: {
                    connectorType: () => this.connectorType,
                    serviceId: () => this.serviceId,
                    firstTimeSetup: true
                },
                controller: 'AddResourceController',
                controllerAs: 'vm',
                templateUrl: 'modules/hercules/service-specific-pages/components/add-resource/add-resource-modal.html',
                type: 'small'
            })
            .result
            .catch(() => {
                this.$state.go('services-overview');
            });

      });
    }

}
