// Open Source Race Timing System - Front-end
// Wojciech Grynczel & Guillaume Deconinck

import { Component, OnInit, OnDestroy} from '@angular/core';
import { TimesService } from '../../services/times/times.service';
import {Subject} from 'rxjs';
import * as moment from 'moment/moment';
declare var jQuery: any;
var swal = require('sweetalert2');
import {Subscription} from 'rxjs';

const TIMES_PER_PAGE = 10;

@Component({
    selector: 'app-times',
    templateUrl: './times.component.html',
    styleUrls: ['./times.component.css'],
    providers: [TimesService]
})
export class TimesComponent implements OnInit, OnDestroy {
    loaded = false;
    subscription: Subscription;
    data:any;
    // paging
    currentPage = 1;
    query: any = {'$sort': {'timestamp' : -1}};
    columns = [
        { 'title': 'Checkpoint', 'selector': 'checkpoint_id', 'order': true, 'search': true, 'numeric': true},
        { 'title': 'Tag', 'selector': 'tag', 'order': false, 'search': true},
        { 'title': 'Time', 'selector': 'timestamp', 'order': true, 'search': false},
        { 'title': 'Fecha', 'selector': 'date', 'order': true, 'search': true},
        { 'title': 'Actions', 'selector': 'date', 'order': false, 'search': false, 'btn': true, },
    ];

    constructor(
      private _timesService: TimesService
    ) {
        this._timesService = _timesService;
    }

    ngOnInit() {
        this.subscription = this._timesService.timesSubject.subscribe((data) => {
            this.data = data;
            this.loaded = true;
            console.log(data);
        });

        this.find();
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    handleQueryUpdated(query) {
        this.query = query;
        this.find()
    }

    find() {
        this.query['$skip'] = (this.currentPage - 1) * TIMES_PER_PAGE;
        this.query['$limit'] = TIMES_PER_PAGE;
        this._timesService.find({ query: this.query });
    }

    remove(key:string){
        swal({
            title: '¿Está usted seguro ?',
            text: "¡Los datos ya no se pueden recuperar!",
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            cancelButtonText: 'Cancelar',
            confirmButtonText: 'Comprendido'
        }).then(()=> {
            this._timesService.remove(key);
            this.find();
            swal('Eliminado!');
        }).catch(e => {});
    }

    removeAll(){
        swal({
            title: '¿Está usted seguro ?',
            text: "¡Los datos ya no se pueden recuperar!",
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            cancelButtonText: 'Cancelar',
            confirmButtonText: 'Comprendido'
        }).then(()=> {
            this._timesService.remove(null);
            this.find();
            swal('Eliminados!');
        }).catch(e => {});
    }

    changePage(newPage) {
        this.currentPage = newPage;
        this.find();
    }
}
