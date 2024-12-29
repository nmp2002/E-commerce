export class TblMenu {
    menuId?: number;
    parentId?: number;
    menuCode?: string;
    menuName?: string;
    description?: string;
    status?: string;
    icon?: string;
    url?: string;
    color?: string;
    text?: string;
    orderNumber?: number;
    lstBtn?: string;
    title?: string;

    constructor(menuId: number, menuName: string, menuCode: string,
        parentId: number, description: string, status: string, icon: string, lstBtn: string) {
        this.menuId = menuId;
        this.menuName = menuName;
        this.menuCode = menuCode;
        this.parentId = parentId;
        this.description = description;
        this.status = status;
        this.icon = icon;
        this.lstBtn = lstBtn;
    }
}

