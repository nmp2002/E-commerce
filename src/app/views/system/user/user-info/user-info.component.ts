import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { TokenStorageService } from '../../../../_services/token-storage.service';
import { UserService } from '../../../../_services/user.service';
import { Notify } from 'notiflix';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { BehaviorSubject } from 'rxjs';
import { TblMenuService } from '../../../../_services/menu.service';
import { ActivatedRoute } from '@angular/router';

export class MenuNode {
  children: MenuNode[];
  menuId: number;
  parentId: number;
  menuCode: string;
  menuName: string;
  description: string;
  status: string;
  icon: string;
}

export class MenuFlatNode {
  menuName: string;
  menuId: number;
  parentId: number;
  level: number;
  menuCode: string;
  description: string;
  status: string;
  icon: string;
  expandable: boolean;
}

@Component({
  selector: 'app-user-info',
  templateUrl: './user-info.component.html'
})
export class UserDetailComponent implements OnInit {
  form: any = {
    id: null,
    fullname: null,
    username: null,
    email: null,
    password: null,
    telephone: null,
    address: null,
    deptName: null,
    officename: null
  };
  isAvatar = false;
  isAvatarDefault = false;
  urlAvatar: any;
  flatNodeMap = new Map<MenuFlatNode, MenuNode>();
  nestedNodeMap = new Map<MenuNode, MenuFlatNode>();
  selectedParent: MenuFlatNode | null = null;
  treeControl: FlatTreeControl<MenuFlatNode>;
  treeFlattener: MatTreeFlattener<MenuNode, MenuFlatNode>;
  dataSource: MatTreeFlatDataSource<MenuNode, MenuFlatNode>;
  displayedColumns: string[] = ['menuName'];

  constructor(
    private tokenService: TokenStorageService,
    private userService: UserService,
    private tblMenuService: TblMenuService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    this.treeFlattener = new MatTreeFlattener(
      this.transformer,
      this.getLevel,
      this.isExpandable,
      this.getChildren,
    );
    this.treeControl = new FlatTreeControl<MenuFlatNode>(this.getLevel, this.isExpandable);
    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
    this.dataChange.subscribe(data => {
      this.dataSource.data = data;
      this.treeControl.expandAll();
    });
  }

  ngOnInit(): void {
    this.loadData();
  }

  public isShowButton(btnCode: string): boolean {
    return this.tokenService.isShowButton(btnCode, this.activatedRoute);
  }

  loadData(): void {
    this.form = this.tokenService.getUser();
    this.urlAvatar = this.tokenService.getAvartarByUser();
    if (this.urlAvatar != null && this.urlAvatar != undefined && this.urlAvatar != '') {
      this.isAvatar = true;
    } else {
      this.isAvatarDefault = true;
    }
    this.initialize();
  }

  onSelectFile(event: any): void {
    if (event != null && event.target.files && event.target.files[0]) {
      var reader = new FileReader();
      reader.readAsDataURL(event.target.files[0]);
      reader.onload = (event) => {
        this.urlAvatar = event.target?.result;
        let base64result: any = event.target?.result?.toString().split(',')[1];
        if (base64result != null && base64result != undefined && base64result != '') {
          this.userService.uploadAvatar(this.tokenService.getUser().id, base64result).subscribe({
            next: data => {
              this.router.navigateByUrl('/user/user-info');
              Notify.success('Upload hình đại diện thành công !', {
                success: {
                  childClassName: 'notiflix-notify-success'
                }
              });
              this.isAvatarDefault = false;
              this.isAvatar = true;
              setTimeout(() => {
                this.tokenService.signOut();
                this.router.navigate(['/login']);
              }, 2000);
            },
            error: err => {
              Notify.failure('Upload hình đại diện thất bại !', {
                timeout: 3000,
                failure: {
                  childClassName: 'notiflix-notify-failure'
                }
              });
            }
          });
        }
      }
    }
  }

  buildFileTree(obj: { [key: string]: any }, level: number): MenuNode[] {
    return Object.keys(obj).reduce<MenuNode[]>((accumulator, key) => {
      const item = obj[key];
      const node = new MenuNode();
      node.menuName = obj[key].menuName;
      node.menuId = obj[key].menuId;
      node.parentId = obj[key].parentId;
      if (item != null) {
        if (typeof item === 'object' && item.children != undefined) {
          node.children = this.buildFileTree(item.children, level + 1);
        } else {
          node.menuName = item.menuName;
        }
      }
      return accumulator.concat(node);
    }, []);
  }
  // Tree //
  getLevel = (node: MenuFlatNode) => node.level;

  isExpandable = (node: MenuFlatNode) => node.expandable;

  getChildren = (node: MenuNode): MenuNode[] => node.children;

  hasChild = (_: number, _nodeData: MenuFlatNode) => _nodeData.expandable;

  hasNoContent = (_: number, _nodeData: MenuFlatNode) => _nodeData.menuName === '';

  transformer = (node: MenuNode, level: number) => {
    const existingNode = this.nestedNodeMap.get(node);
    const flatNode = existingNode && existingNode.menuName === node.menuName ? existingNode : new MenuFlatNode();
    flatNode.menuName = node.menuName;
    flatNode.level = level;
    flatNode.menuId = node.menuId;
    flatNode.parentId = node.parentId;
    flatNode.expandable = !!node.children?.length;
    this.flatNodeMap.set(flatNode, node);
    this.nestedNodeMap.set(node, flatNode);
    return flatNode;
  };

  getParentNode(node: MenuFlatNode): MenuFlatNode | null {
    const currentLevel = this.getLevel(node);
    if (currentLevel < 1) {
      return null;
    }
    const startIndex = this.treeControl.dataNodes.indexOf(node) - 1;
    for (let i = startIndex; i >= 0; i--) {
      const currentNode = this.treeControl.dataNodes[i];
      if (this.getLevel(currentNode) < currentLevel) {
        return currentNode;
      }
    }
    return null;
  }

  // Selectbox//
  dataChange = new BehaviorSubject<MenuNode[]>([]);
  get data(): MenuNode[] {
    return this.dataChange.value;
  }

  initialize() {
    this.tblMenuService.findAllToJson(this.tokenService.getUser().groupRoleId, -1, false).subscribe(rs => {
      const data = this.buildFileTree(rs, 0);
      this.dataChange.next(data);
    });
  }
}
