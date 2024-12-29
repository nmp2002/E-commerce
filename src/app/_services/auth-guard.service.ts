import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuardService implements CanActivate {
    constructor(public auth: AuthService, public router: Router) { }

    canActivate(): boolean {
  //      if (!this.auth.isAuthenticated()) {
  //          this.router.navigate(['login']);
  //          return false;
  //      }
        return true;
    }

    canActivateChild(): boolean {
        return this.canActivate();
    }

//    canActivate(): boolean {
//        return true; // Cho phép truy cập tất cả các tuyến đường
//  }
    
 
    
}