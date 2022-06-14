// Open Source Race Timing System - Front-end
// Wojciech Grynczel & Guillaume Deconinck

import { Component, OnInit, OnDestroy } from '@angular/core';
import { RaceService } from '../../services/race/race.service';
import { TagsService } from '../../services/tags/tags.service';
import { TagsAssignerService } from '../../services/tags/tags-assigner.service';
import {Subscription} from 'rxjs';
declare var jQuery:any;
declare var swal: any;
var swal = require('sweetalert2');
import * as moment from 'moment/moment';
import 'moment/locale/es';
moment.locale('es');

@Component({
    selector: 'app-tags',
    templateUrl: './tags.component.html',
    styleUrls: ['./tags.component.css'],
    providers: [RaceService, TagsService, TagsAssignerService]
})
export class TagsComponent implements OnInit, OnDestroy {

  raceSubscription: Subscription;

  tags:any;
  totalTags:Number;
  tagsSubscription: Subscription;
  range={from:1, to:1, itr: ""};
  itrs=[];
  showOnlyITR="";
  showOnlyNotAssigned=false;

  // paging
  currentPage=1;
  nbPages=1;

  constructor(private _raceService: RaceService,
    private _tagsService: TagsService,
    private _tagsAssignerService: TagsAssignerService){

  }

  ngOnInit(){
    this.raceSubscription = this._raceService.raceSubject.subscribe((data)=>{
      this.itrs = data.tagsITR;
    });
    this._raceService.get();
    this.tagsSubscription = this._tagsService.tagsSubject.subscribe((data)=>{
      this.tags = data.tags;
      this.totalTags = data.count;
      this.nbPages = Math.ceil(data.count/this._tagsService.NB_TAGS);
    });
    this.find();
  }

  find(){
    let query = {$sort: {itr: 1, num:1 }};
    query['$skip'] = (this.currentPage-1)*this._tagsService.NB_TAGS;
    query['$limit'] = this._tagsService.NB_TAGS;
    if(this.showOnlyNotAssigned)
      query['assigned'] = false;
    if(this.showOnlyITR){
      query['itr'] = this.showOnlyITR;
    }
    this._tagsService.find({query: query});
  }

  createTags(){
    if(this.checkRange() && this.range.itr && this.range.itr.length!=0){
      this._tagsService.create(this.range);
      if(this.itrs.indexOf(this.range.itr)==-1){
        this.itrs.push(this.range.itr);
      }
      this.range = {from:1, to:1, itr:""};
    }
  }

  deleteTags(){
    if(this.checkRange()){
      this._tagsService.remove(this.range);
      this.range = {from:1, to:1, itr:""};
    }
  }

  checkRange(){
    return  ((this.range.from && this.range.from>0 && !this.range.to ) ||
            (this.range.from && this.range.from>0 && this.range.to && this.range.from <= this.range.to));
  }

  assignTags(){
    this._tagsAssignerService.assignTags();
  }

  toggleShowOnlyAssigned(){
    this.showOnlyNotAssigned=!this.showOnlyNotAssigned;
    this.find();
  }

  // ######
  // Paging
  // ######

  changePage(newPage){
    if(newPage>=1 && newPage<=this.nbPages){
      this.currentPage=newPage;
      this.find();
    }
  }

  ngOnDestroy(){
    if(this.raceSubscription)
      this.raceSubscription.unsubscribe();
    if(this.tagsSubscription)
      this.tagsSubscription.unsubscribe();
  }
}
