import { SelectionModel } from '@angular/cdk/collections';
import { FlatTreeControl } from '@angular/cdk/tree';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from "@angular/forms";
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { ActivatedRoute, ParamMap, Router } from "@angular/router";
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import { BehaviorSubject } from 'rxjs';
import { TblMenuService } from '../../../../_services/menu.service';
import { TokenStorageService } from '../../../../_services/token-storage.service';
import { TblMenu } from '../../../../model/tblMenu';

export class MenuNode {
  children: MenuNode[];
  menuId: number;
  parentId: number;
  menuCode: string;
  menuName: string;
  description: string;
  status: string;
  icon: string;
  isShowDropDown: boolean;
  lstBtn: any[] = [];
  lstBtnSelected: any[] = [];
  dropdownList: any[] = [];
  selectedItems: any[] = [];
  dropdownSettings: IDropdownSettings = {};
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
  isShowDropDown: boolean;
  lstBtn: any[] = [];
  lstBtnSelected: any[] = [];
  dropdownList: any[] = [];
  selectedItems: any[] = [];
  dropdownSettings: IDropdownSettings = {};
}

@Component({
  selector: 'tree-permission-menu',
  templateUrl: './groupRole-permission.component.html'
})

export class GroupRolePermissionComponent implements OnInit {
  configPermissionForm: FormGroup;
  flatNodeMap = new Map<MenuFlatNode, MenuNode>();
  nestedNodeMap = new Map<MenuNode, MenuFlatNode>();
  selectedParent: MenuFlatNode | null = null;
  treeControl: FlatTreeControl<MenuFlatNode>;
  treeFlattener: MatTreeFlattener<MenuNode, MenuFlatNode>;
  dataSource: MatTreeFlatDataSource<MenuNode, MenuFlatNode>;
  checklistSelection = new SelectionModel<MenuFlatNode>(true);
  groupRoleId = 0;
  objectType = 1; // 1: GroupRole ; 2: Role
  listPermission: TblMenu[] = [];
  displayedColumns: string[] = ['menuName', 'menuId'];

  ngOnInit(): void {
    this.configPermissionForm = this.formBuilder.group({});
    this.activatedRoute.paramMap.subscribe((data: ParamMap) => {
      this.groupRoleId = Number(data.get('id'));
    });
    this.tblMenuService.getLstMenuByObjectId(this.groupRoleId, this.objectType).subscribe(rs => {
      this.listPermission = rs;
    });
    this.initialize();
  }

  public isShowButton(btnCode: string): boolean {
    return this.tokenService.isShowButton(btnCode, this.activatedRoute);
  }

  constructor(
    private tokenService: TokenStorageService,
    private tblMenuService: TblMenuService,
    private router: Router,
    private formBuilder: FormBuilder,
    private activatedRoute: ActivatedRoute) {
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
      for (let item of this.treeControl.dataNodes) {
        let tblMenu = this.listPermission.find(tblMenu => tblMenu.menuId == Number(item.menuId));
        if (tblMenu != null && tblMenu != undefined) { this.treeControl.expandAll(); this.checklistSelection.toggle(item); this.checklistSelection.select(item); };
      }
    });
  }

  buildFileTree(obj: { [key: string]: any }, level: number): MenuNode[] {
    return Object.keys(obj).reduce<MenuNode[]>((accumulator, key) => {
      const item = obj[key];
      const node = new MenuNode();
      node.menuName = obj[key].menuName;
      node.menuId = obj[key].menuId;
      node.parentId = obj[key].parentId;
      node.lstBtn = obj[key].lstBtn;
      node.isShowDropDown = obj[key].lstBtn != null && obj[key].lstBtn != undefined && obj[key].lstBtn != '' && obj[key].lstBtn != ' ';
      node.dropdownSettings = {
        idField: 'btnCode',
        textField: 'btnName',
        allowSearchFilter: true,
        enableCheckAll: true,
        selectAllText: "Tất cả",
        unSelectAllText: "Tất cả",
        searchPlaceholderText: "Lọc nhanh",
        noDataAvailablePlaceholderText: "Không có bản ghi"
      };
      node.dropdownList = node.lstBtn;
      if (node.dropdownList != undefined) {
        for (let item of node.dropdownList) {
          if (item.isSelected) {
            node.selectedItems.push(item);
            node.lstBtnSelected.push(item);
          };
        }
      }
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
    flatNode.lstBtn = node.lstBtn;
    flatNode.isShowDropDown = node.isShowDropDown;
    flatNode.dropdownSettings = node.dropdownSettings;
    flatNode.dropdownList = node.dropdownList;
    flatNode.selectedItems = node.selectedItems;
    flatNode.lstBtnSelected = node.lstBtnSelected;
    this.flatNodeMap.set(flatNode, node);
    this.nestedNodeMap.set(node, flatNode);
    return flatNode;
  };

  /** Toggle the to-do menuName selection. Select/deselect all the descendants node */
  todoItemSelectionToggle(node: MenuFlatNode, isExpandArrow: boolean): void {
    if (isExpandArrow) {
      this.treeControl.toggle(node);
    }
    if (!isExpandArrow) {
      this.checklistSelection.toggle(node);
      const descendants = this.treeControl.getDescendants(node);
      this.checklistSelection.isSelected(node)
        ? this.checklistSelection.select(...descendants)
        : this.checklistSelection.deselect(...descendants);
      descendants.forEach(child => this.checklistSelection.isSelected(child));
      this.checkAllParentsSelection(node);
    }
  }

  /* Checks all the parents when a leaf node is selected/unselected */
  checkAllParentsSelection(node: MenuFlatNode): void {
    let parent: MenuFlatNode | null = this.getParentNode(node);
    while (parent) {
      this.checkRootNodeSelection(parent);
      parent = this.getParentNode(parent);
    }
  }

  /** Check root node checked state and change it accordingly */
  checkRootNodeSelection(node: MenuFlatNode): void {
    const nodeSelected = this.checklistSelection.isSelected(node);
    const descendants = this.treeControl.getDescendants(node);
    const descAllSelected =
      descendants.length > 0 &&
      descendants.every(child => {
        return this.checklistSelection.isSelected(child);
      });
    this.checklistSelection.select(node);
  }

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
    this.tblMenuService.findAllToJson(this.groupRoleId, -1, true).subscribe(rs => {
      const data = this.buildFileTree(rs, 0);
      this.dataChange.next(data);
    });
  }

  onItemSelect(item: any, node: MenuFlatNode) {
    node.lstBtnSelected.push(item);
  }

  onSelectAll(item: any, node: MenuFlatNode) {
    node.lstBtnSelected = [];
    for (let item of node.dropdownList) {
      node.lstBtnSelected.push(item);
    }
  }

  onItemDeSelect(item: any, node: MenuFlatNode) {
    node.lstBtnSelected = node.lstBtnSelected.filter(tmp => tmp.btnCode != item.btnCode);
  }

  onDeSelectAll(item: any, node: MenuFlatNode) {
    node.lstBtnSelected = [];
  }

  configPermission() {
    console.log(this.checklistSelection.selected);
    const arrMenu = [] as TblMenu[];
    this.checklistSelection.selected.forEach(row => row.menuId != null && row.menuId != undefined ? arrMenu.push(
      new TblMenu(row.menuId, row.menuName, row.menuCode, row.parentId != null ? row.parentId : -1, row.description, row.status, row.icon, JSON.stringify(row.lstBtnSelected))) : "");
    this.tblMenuService.configPermission(-1, this.groupRoleId, JSON.stringify(arrMenu)).subscribe({
      next: data => {
        Notify.success('Cấu hình phân quyền thành công !', {
          success: {
            childClassName: 'notiflix-notify-success',
          },
        });
        this.router.navigateByUrl('/groupRole/groupRole-manager');
      },
      error: err => {
        Notify.failure(err.error.message != null ? err.error.message : 'Cấu hình phân quyền thất bại !', {
          timeout: 3000,
          failure: {
            childClassName: 'notiflix-notify-failure',
          }
        });
      }
    });
  }
}