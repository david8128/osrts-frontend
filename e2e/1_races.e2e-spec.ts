// Open Source Race Timing System - Front-end
// Wojciech Grynczel & Guillaume Deconinck

import { RealTimeRacingSystemPage } from './app.po';
import { browser, element, by, } from 'protractor';
import { RacesPage } from './races.po';

describe('Races Page', () => {
    let page: RacesPage;

    beforeAll(() => {
        page = new RacesPage();
    });

    it('should display message saying app works', () => {
        page.navigateTo();
        expect(browser.getCurrentUrl()).toContain('/#/admin/races');
    });

    it('should open races page', () => {
        browser.get('/#/admin/races');
        browser.sleep(500);
        expect(browser.getCurrentUrl()).toContain('/#/admin/races');
    });

    it('should open modal - new race', () => {
        page.createRace();
        expect(page.getModalClass()).toMatch('visible');
        expect(page.getModalTitle()).toEqual('Nouvelle course');
    });

    it('should close modal - new race', () => {
        page.closeModal();
        expect(page.getModalClass()).toMatch('hidden');
    });

    it('should fail to create new race 1 - wrong date (15/04/2017 - 16/04/2017)', () => {
        page.createRace();
        page.setValue('place', 'Bruxelles');
        page.setValue('from', '15/04/2017');
        page.setValue('to', '16/04/2017');
        page.clearFocus('place');
        expect(element(by.name('create')).getAttribute('class')).toMatch('disabled');
        element(by.name('hasChecked')).click();
        expect(element(by.name('create')).getAttribute('class')).not.toMatch('disabled');
        page.saveModal();
        expect(page.getSweetTitle()).toEqual('Les dates ne sont pas valides !');
        page.closeSweet();
    });

    it('should fail to create new race 2 - wrong date (15-04-2017 - 14-04-2017)', () => {
        page.setValue('place', 'Bruxelles');
        page.setValue('from', '15-04-2017');
        page.setValue('to', '14-04-2017');
        page.clearFocus('place');
        page.saveModal();
        expect(page.getSweetTitle()).toEqual('Les dates ne sont pas valides !');
        page.closeSweet();
    });

    it('should success to create new race 1', () => {
        page.setValue('place', 'Bruxelles');
        page.setValue('from', '01-04-2017');
        page.setValue('to', '02-04-2017');
        page.clearFocus('place');
        page.saveModal();
        expect(page.getModalClass()).toMatch('hidden');
        expect(element(by.css('.race-place')).getText()).toEqual('Bruxelles');
        expect(element(by.css('.race-from')).getText()).toEqual('01-04-2017');
        expect(element(by.css('.race-to')).getText()).toEqual('02-04-2017');
    });

    it('should succeed to create new race 2 - single day (15-04-2017 - 15-04-2017)', () => {
        page.createRace();
        page.setValue('place', 'Bruxelles');
        page.setValue('from', '15-04-2017');
        page.setValue('to', '15-04-2017');
        page.clearFocus('place');
        element(by.name('hasChecked')).click();
        page.saveModal();
        expect(page.getModalClass()).toMatch('hidden');
        expect(element(by.css('.race-place')).getText()).toEqual('Bruxelles');
        expect(element(by.css('.race-from')).getText()).toEqual('15-04-2017');
        expect(element(by.css('.race-to')).getText()).toEqual('15-04-2017');
    });

    it('should success to create new race 3', () => {
        page.createRace();
        page.setValue('place', 'LLN');
        page.setValue('from', '05-05-2017');
        page.setValue('to', '06-05-2017');
        page.clearFocus('place');
        element(by.name('hasChecked')).click();
        page.saveModal();
        expect(page.getModalClass()).toMatch('hidden');
        expect(element(by.css('.race-place')).getText()).toEqual('LLN');
        expect(element(by.css('.race-from')).getText()).toEqual('05-05-2017');
        expect(element(by.css('.race-to')).getText()).toEqual('06-05-2017');
    });

    it('should modify the race', () => {
        page.editRace();
        expect(element(by.name('place')).getAttribute('value')).toEqual('LLN');
        expect(element(by.name('from')).getAttribute('value')).toEqual('05-05-2017');
        expect(element(by.name('to')).getAttribute('value')).toEqual('06-05-2017');
        page.setValue('place', 'Flemalle');
        page.setValue('from', '02-09-2017');
        page.setValue('to', '03-09-2017');
        expect(element(by.name('place')).getAttribute('value')).toEqual('Flemalle');
        expect(element(by.name('from')).getAttribute('value')).toEqual('02-09-2017');
        expect(element(by.name('to')).getAttribute('value')).toEqual('03-09-2017');
        page.clearFocus('place');
        page.updateModal();
        expect(element(by.css('.modals')).getAttribute('class')).toMatch('hidden');
        expect(element(by.css('.race-place')).getText()).toEqual('Flemalle');
        expect(element(by.css('.race-from')).getText()).toEqual('02-09-2017');
        expect(element(by.css('.race-to')).getText()).toEqual('03-09-2017');
    });
});
