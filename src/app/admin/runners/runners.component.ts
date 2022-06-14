// Open Source Race Timing System - Front-end
// Wojciech Grynczel & Guillaume Deconinck

import { Component, OnInit, AfterViewInit, OnDestroy} from '@angular/core';
import { RunnersService } from '../../services/runners/runners.service';
import {Subscription} from 'rxjs';
var swal = require('sweetalert2');
import * as moment from 'moment/moment';
declare var jQuery: any;
import { PaginationComponent } from '../../components/pagination/pagination.component';

@Component({
  selector: 'app-runners',
  templateUrl: './runners.component.html',
  styleUrls: ['./runners.component.css'],
  providers: [RunnersService]
})
export class RunnersComponent implements OnInit, AfterViewInit, OnDestroy  {

  loaded:boolean;

  // Days management
  dateChosen="";

  // The data to be retrieved and the subscription for the runners
  private subscription: Subscription;
  runners=null;
  count:number;
  runnerToBeModified:any={};

  // Sorting
  columnSort="name";
  direction="asc";
  // Filtering
  filters = {nameFilter: '', ageFilter: '', teamNameFilter: '',
            typeFilter: '', waveFilter: '', tagIdFilter: ''};
  // paging
  currentPage=1;
  nbPages=1;

  constructor(private _runnersService: RunnersService) {
    this.loaded=false;
  }

  ngOnInit(){
      this.subscription = this._runnersService.runnersSubject.subscribe((data) => {
        if(!this.runners && data.count==0){
          this.loaded=true;
          return;
        }
        this.count = data.count;
        this.runners = data.runners;
        this.nbPages = Math.ceil(data.count/this._runnersService.NB_RUNNERS);
        this.loaded=true;
      }, (err) => {
        console.error(err);
      });
      this.find();

  }

  // Initialization after the view has been rendered for the modal
  ngAfterViewInit() {
    jQuery('.ui.modal-runner').modal({closable: false});
    jQuery(document).keypress((e)=>{
        if(e.which == 13 && e.target.nodeName == 'INPUT' && !jQuery('.ui.modal-runner').modal("is active")) {
            this.search();
        }
    });
  }

  // Query
  search(){
    this.currentPage=1;
    this.find();
  }

  find(){
    let query = {date: this.dateChosen};
    this.checkAndAddFilter(query, 'name', this.filters['nameFilter'], false);
    this.checkAndAddFilter(query, 'age', this.filters['ageFilter'], true);
    this.checkAndAddFilter(query, 'team_name', this.filters['teamNameFilter'], false);
    this.checkAndAddFilter(query, 'type', this.filters['typeFilter'], false);
    this.checkAndAddFilter(query, 'wave_id', this.filters['waveFilter'], true);
    this.checkAndAddFilterForTags(query, this.filters['tagIdFilter']);
    query['$sort'] = {};
    if(this.direction=='asc'){
      if(this.columnSort!="tag_id")
        query['$sort'][this.columnSort] = 1;
      else{
        query['$sort'] = {"tag.itr": 1, "tag.num": 1};
      }
    } else {
      if(this.columnSort!="tag_id")
        query['$sort'][this.columnSort] = -1;
      else{
        query['$sort'] = {"tag.itr": -1, "tag.num": -1};
      }
    }
    query['$skip'] = (this.currentPage-1)*this._runnersService.NB_RUNNERS;
    query['$limit'] = this._runnersService.NB_RUNNERS;
    console.log(query)
    this._runnersService.find({query: query});
  }

  checkAndAddFilter(query, field, filter, numeric){
    if(filter!=""){
      if(!numeric){
        query[field] = {$search: filter};
      } else if(numeric){
        let num = parseInt(filter);
        if(!isNaN(num))
          query[field] = num;
      }
    }
  }

  // Special method for the tags because they are on "two" fields ({tag: {num: ..., itr: ...}})
  checkAndAddFilterForTags(query, filter){
    if(filter!=""){
      if(isNaN(filter)){
        let letter = filter[0];
        query['tag.itr'] = {$search: letter};
        if(filter.length>1){
          let num = parseInt(filter.slice(1));
          query['tag.num'] = num;
        }
      } else {
        let num = parseInt(filter);
        query['tag.num'] = num;
      }
    }
  }


  // #######################
  // Modal related functions
  // #######################

  // Open modal
  clickModify(runnerId){
    this._runnersService.findOne(runnerId).then((data)=>{
      this.runnerToBeModified = data;
    });
    jQuery('.ui.modal-runner').modal('show');
  }

  // Save the modified runner
  submitForm($event){
    if(this.runnerToBeModified['tag'])
      this.runnerToBeModified['tag']['num'] = parseInt(this.runnerToBeModified['tag']['num'])
    this._runnersService.update(this.runnerToBeModified).then(()=>{
        this.clickCancel();
        swal({
            title: 'Modifié',
            type: 'success',
            timer: 1500,
            showCancelButton: false,
            showConfirmButton: false
        }).then((error)=>{
          console.log(error);
        }).catch((error)=>{
            console.log(error)
        });
    }).catch((err)=>{
        this.clickCancel();
        swal({
            title: 'Error',
            text: err.message,
            type: 'error',
            showCancelButton: false,
            showConfirmButton: true
        }).then((error)=>{
          console.log(error);
        }).catch((error)=>{
            console.log(error)
        });
    })
  }

  // Cancel in modal
  clickCancel(){
    jQuery('.ui.modal-runner').modal('hide');
    this.runnerToBeModified={};
  }

  // #########
  // End modal
  // #########

  // ##################
  // Remove in list
  // ##################

  remove(runnerId){
      swal({
          title: '¿Está usted seguro?',
          text: "¡Los datos ya no se pueden recuperar!",
          type: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          cancelButtonText: 'Cancelar',
          confirmButtonText: 'Confirmar'
      }).then(()=> {
          this._runnersService.remove(runnerId);
          swal(
              '¡Eliminado!',
              'El participante ha sido eliminado.',
              'success'
          )
      });
  }

  addTag(data){
      data.tag = {};
  }

  // ##########
  // Change day
  // ##########

  changeDate(date){
    this.loaded=false;
    // Reset filters
    this.dateChosen = date;
    this.columnSort="name";
    this.direction="asc";
    this.filters = {
        nameFilter: '',
        ageFilter: '',
        teamNameFilter: '',
        typeFilter: '',
        waveFilter: '',
        tagIdFilter: ''
    };
    this.search();
  }

  // ##################
  // Sorting functions
  // ##################

  // For showing the direction of the sort
  isThisColumnSort(column){
    return column == this.columnSort;
  }

  // When the column or the direction is changed
  clickColumn(column){
    if(this.columnSort==column){
      if(this.direction=="asc") this.direction="desc";
      else this.direction = "asc";
    } else {
      this.direction="asc";
      this.columnSort = column;
    }
    this.search();
  }

  // ######
  // Paging
  // ######

  changePage(newPage){
    // if(newPage>=1 && newPage<=this.nbPages){
      this.currentPage=newPage;
      this.find();
    // }
  }

  // #####################
  // When leaving the page
  // #####################

  ngOnDestroy(){
    if(this.subscription)
      this.subscription.unsubscribe();
  }
}
