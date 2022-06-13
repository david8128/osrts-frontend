// Open Source Race Timing System - Front-end
// Wojciech Grynczel & Guillaume Deconinck

import { Component, AfterViewInit, ViewEncapsulation } from '@angular/core';
import { Title }  from '@angular/platform-browser';
import { Router } from '@angular/router';
import { SocketService } from './services/feathers.service';

var swal = require('sweetalert2');
declare var jQuery:any;

@Component({
  selector: 'app-root',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit {

  constructor(private titleService: Title, private router: Router, public auth: SocketService) {
    this.titleService.setTitle("II CNVTE - Resultados");
  }

  ngAfterViewInit(){
  }

  signOut(){
      swal({
          title: '',
          text: "¿Está seguro de que desea cerrar la sesión?",
          type: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          cancelButtonText: 'Cancelar',
          confirmButtonText: 'Cerrar sesión'
      }).then(()=> {
          this.auth.logout();
          this.router.navigate(['/']);
      }).catch(e => {});
  }
}
