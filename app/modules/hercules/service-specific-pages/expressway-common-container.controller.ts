import { Notification } from 'modules/core/notifications';

export abstract class ExpresswayContainerController {

    public backState = 'services-overview';
    public userStatusesSummary = [];
    protected subscribeStatusesSummary: any;

    /* @ngInject */
    constructor(
        private $modal: any,
        private $state: any,
        private Notification: Notification,
        protected ServiceDescriptor: any,
        protected USSService: any,
        protected servicesId: string[],
        private connectorType: string
    ) {
        this.firstTimeSetup();
        this.extractSummary();
        this.subscribeStatusesSummary = this.USSService.subscribeStatusesSummary('data', this.extractSummary.bind(this));
    }

    public extractSummary(): void {
        this.userStatusesSummary = this.USSService.extractSummaryForAService(this.servicesId);
    }

    protected firstTimeSetup(): void {
        this.ServiceDescriptor.isServiceEnabled(this.servicesId[0], (error, enabled) => {
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
                    servicesId: () => this.servicesId[0],
                    firstTimeSetup: true,
                },
                controller: 'AddResourceController',
                controllerAs: 'vm',
                templateUrl: 'modules/hercules/service-specific-pages/components/add-resource/add-resource-modal.html',
                type: 'small',
            })
            .result
            .catch(() => {
                this.$state.go('services-overview');
            });

      });
    }

}
