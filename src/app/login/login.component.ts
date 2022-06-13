// Open Source Race Timing System - Front-end
// Wojciech Grynczel & Guillaume Deconinck

import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SocketService } from '../services/feathers.service';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  public user:any = {};
  public error:any= {};
  constructor(private router: Router, private socketService: SocketService) { }

  signIn() {
    this.socketService.authenticate(this.user).then(response => {
      this.postSignIn();
    })
    .catch((error)=>{
      this.error['title'] = "Conexión denegada";
      this.error['message'] = "Nombre de cuenta o contraseña incorrectos.";
    });
  }

  private postSignIn(): void {
    this.router.navigate(['/admin']);
  }
}
