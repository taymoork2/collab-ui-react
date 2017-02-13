export class PlaceCallOverviewData {
    public preferredLanguageOptions: any[];
    public preferredLanguage: any;
    public placesPreferredLanguage: string;
    public defaultPreferredLanugage: any;
    public siteLevelPreferredLanguage: string;
}

export class PlaceCallOverviewService {
    private placeCallOverviewDataCopy: PlaceCallOverviewData;
    private errors: Array<any> = [];

    /* @ngInject */
    constructor(
        private ServiceSetup,
        private PlacesService,
        private Authinfo,
        private Notification,
        private $translate: ng.translate.ITranslateService,
        private $q: ng.IQService,
    ) {}

    public getOrganizationLevelLanguage() {
        return this.ServiceSetup.listSites().then(() => {
            if (this.ServiceSetup.sites.length !== 0) {
            return this.ServiceSetup.getSite(this.ServiceSetup.sites[0].uuid)
            .then(site => _.get(site, 'preferredLanguage'));
            }
        });
    }

    public getSiteLanguages() {
        return this.ServiceSetup.getSiteLanguages().then(languages => {
            return  _.sortBy(this.ServiceSetup.getTranslatedSiteLanguages(languages), 'label');
        });
    }

    public getCmiPlaceInfo(placesId) {
        let queryString = {
            customerId: this.Authinfo.getOrgId(),
            placesId: placesId,
        };
        return this.PlacesService.get(queryString).$promise;
    }

    public updateCmiPlacePreferredLanguage(placesId, placePreferredLanguage) {
        let queryString = {
            customerId: this.Authinfo.getOrgId(),
            placesId: placesId,
        };
        let requestBody = {
            preferredLanguage: placePreferredLanguage,
        };
        return this.PlacesService.update(queryString, requestBody).$promise;
    }

    public getPlaceCallOverviewData(placesId): ng.IPromise<PlaceCallOverviewData> {
        let placeCallOverviewData = new PlaceCallOverviewData();
        this.errors = [];
        let promises: Array<ng.IPromise<any>> = [];
        promises.push(this.getOrganizationLevelLanguage());
        promises.push(this.getSiteLanguages());
        promises.push(this.getCmiPlaceInfo(placesId));
        return this.$q.all(promises).then( (data) => {
            if (this.errors.length > 0) {
                this.Notification.notify(this.errors, 'preferredLanguage.failedToFetchSiteLanguages');
                return this.$q.reject();
            }
            let siteLevelPreferredLanguage = data[0];
            let languages = data[1];
            let placesPreferredLanguage = data[2]['preferredLanguage'];
            let organizationLanguage = this.findPreferredLanguageByCode(languages, siteLevelPreferredLanguage);
            let defaultPreferredLanugage = this.getDefaultPreferredLanguage(organizationLanguage['label']);
            placeCallOverviewData.siteLevelPreferredLanguage = siteLevelPreferredLanguage;
            placeCallOverviewData.preferredLanguageOptions = this.setOrgPrefLanguageInOptions(defaultPreferredLanugage, languages);
            placeCallOverviewData.placesPreferredLanguage = placesPreferredLanguage;
            placeCallOverviewData.defaultPreferredLanugage = defaultPreferredLanugage;
            placeCallOverviewData.preferredLanguage = placesPreferredLanguage ?
                                                        this.findPreferredLanguageByCode(languages, placesPreferredLanguage) :
                                                        defaultPreferredLanugage;
            this.placeCallOverviewDataCopy = this.clonePlaceCallOverviewData(placeCallOverviewData);
            return placeCallOverviewData;
        });
    }

    private setOrgPrefLanguageInOptions(defaultPreferredLanugage, languages): any {
        let preferredLanguageOptions: any[] = [];
        preferredLanguageOptions.push(defaultPreferredLanugage);
        preferredLanguageOptions = preferredLanguageOptions.concat(languages);
        return preferredLanguageOptions;
    }

    public findPreferredLanguageByCode(languages, language_code): any {
        return _.find(languages, function (language) {
        return language['value'] === language_code;
        });
    }

    public matchesOriginalConfig(placeCallOverviewData: PlaceCallOverviewData): boolean {
        return _.isEqual(placeCallOverviewData, this.placeCallOverviewDataCopy);
    }

    private getDefaultPreferredLanguage(organizationLevelLanguage): any {
        let defaultPrefix: string = this.$translate.instant('preferredLanguage.organizationSettingLabel');
        let translatedLanguageLabel: string = organizationLevelLanguage ?
                                            this.$translate.instant(organizationLevelLanguage) :
                                            'languages.englishAmerican';
        let defaultLanguage = {
        label: defaultPrefix + translatedLanguageLabel,
        value: '',
        };
        return defaultLanguage;
    }

    private clonePlaceCallOverviewData(placeCallOverviewData: PlaceCallOverviewData): PlaceCallOverviewData {
        return _.cloneDeep(placeCallOverviewData);
    }

    public checkForPreferredLanguageChanges(preferredLanguage): boolean {
        return _.isEqual(preferredLanguage, this.placeCallOverviewDataCopy.preferredLanguage);

    }

}
