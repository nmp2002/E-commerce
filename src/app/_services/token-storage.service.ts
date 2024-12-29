import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

const TOKEN_KEY = 'auth-token';
const USER_KEY = 'auth-user';
const CURRENT_MENU_BTN = 'current-menu-btn';

@Injectable({
  providedIn: 'root'
})
export class TokenStorageService {
  constructor() { }

  signOut(): void {
    window.sessionStorage.clear();
  }

  public saveToken(token: string): void {
    window.sessionStorage.removeItem(TOKEN_KEY);
    window.sessionStorage.setItem(TOKEN_KEY, token);
  }

  public getToken(): string | null {
    return window.sessionStorage.getItem(TOKEN_KEY);
  }

  public getListMenuTree(): any | null {
    const userToken = window.sessionStorage.getItem(USER_KEY);
    if (userToken != null && userToken != undefined) {
      const user = JSON.parse(userToken);
      return (user != null && user != undefined && user.lstMenuTree != null && user.lstMenuTree != undefined) ? user.lstMenuTree : null;
    }
    return null;
  }

  public saveUser(user: any): void {
    window.sessionStorage.removeItem(USER_KEY);
    window.sessionStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  public getUser(): any {
    const user = window.sessionStorage.getItem(USER_KEY);
    if (user) {
      return JSON.parse(user);
    }
    return {};
  }

  public getAvartarByUser(): any {
    let base64Avatar = this.getUser().avatar;
    if (base64Avatar != null && base64Avatar != undefined && base64Avatar != '') {
      const img = new Image();
      img.src = `data:image/jpeg;base64,${base64Avatar}`;
      return img.src;
    }
    return null;
  }

  public getListMenuReal(): any | null {
    const userToken = window.sessionStorage.getItem(USER_KEY);
    if (userToken != null && userToken != undefined) {
      const user = JSON.parse(userToken);
      return (user != null && user != undefined && user.lstMenu != null && user.lstMenu != undefined) ? user.lstMenu : null;
    }
    return null;
  }

  public isShowButton(btnCode: string, activatedRoute: ActivatedRoute): boolean {
    //console.log(activatedRoute?.parent?.parent?.routeConfig);
    //console.log(activatedRoute?.parent?.parent?.routeConfig?.path);
    //console.log(activatedRoute?.routeConfig?.path);
    const lstBtn = window.sessionStorage.getItem(CURRENT_MENU_BTN);
    if (lstBtn != null && lstBtn != undefined && lstBtn != '') {
      if (lstBtn.includes(btnCode)) {
        return true;
      }
    }
    return false;
  }

  public isShowAction(actionCode: string): boolean {
    const user = this.getUser();
    if (user != null && user != undefined && user != ''
      && user.mapRuleAction != null && user.mapRuleAction != undefined && user.mapRuleAction != '') {
      if (user.mapRuleAction.includes(actionCode)) {
        return true;
      }
    }
    return false;
  }

  public getButtonByMenu(currentUrl: string): void {
    if (currentUrl == null || currentUrl == undefined || currentUrl == '' || currentUrl == ' ') {
      window.sessionStorage.removeItem(CURRENT_MENU_BTN);
    } else {
      const lstMenuButton = this.getListMenuReal();
      let menuBtn = null;
      let isContainMenu = false;
      if (lstMenuButton != null && lstMenuButton != undefined) {
        for (var i = 0; i < lstMenuButton.length; i++) {
          let menu = lstMenuButton[i];
          if (menu != null && menu != undefined) {
            if (menu.url != null && menu.url != undefined
              && menu.url != '' && menu.url == currentUrl) {
              if (menu.menuBtn != null && menu.menuBtn != undefined) {
                menuBtn = menu.menuBtn;
              }
              isContainMenu = true;
              break;
            }
          }
        }
      }
      if (isContainMenu) {
        if (menuBtn != null && menuBtn != undefined) {
          window.sessionStorage.setItem(CURRENT_MENU_BTN, menuBtn);
        } else {
          window.sessionStorage.removeItem(CURRENT_MENU_BTN);
        }
      }
    }
  }
}
