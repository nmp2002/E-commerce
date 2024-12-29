export class TblMenuBtn {
    id?: number;
    btnCode?: string;
    btnName?: string;
    menuId?: number;
    menuName?: string;
    description?: string;
    status?: string;
    icon?: string;

    constructor(btnCode: string, btnName: string, menuId: number,
        description: string, status: string, icon: string) {
        this.btnCode = btnCode;
        this.btnName = btnName;
        this.menuId = menuId;
        this.description = description;
        this.status = status;
        this.icon = icon;
    }
}

