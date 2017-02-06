export class PreferredLanguageService {

    /* @ngInject */
    constructor(
        private ServiceSetup,
        private PlacesService,
        private Authinfo
    ) {}

    public getSiteLevelLanguage() {
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

    public updateCmiPlaceInfo(placesId, placePreferredLanguage) {
        let queryString = {
            customerId: this.Authinfo.getOrgId(),
            placesId: placesId,
        };
        let requestBody = {
            preferredLanguage: placePreferredLanguage,
        };
        return this.PlacesService.update(queryString, requestBody).$promise;
    }

    public getPreferredLanguage(languages, language_code): any {
        return _.find(languages, function (language) {
        return language['value'] === language_code;
        });
    }

}
