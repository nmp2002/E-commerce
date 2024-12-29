export class TblUserPermission {
    id?: number;
    userId?: string;
    userName?: string;
    active?: number;
    officecode?: string;
    officename?: string;
    officetype?: string;

    constructor(officecode: string, officename: string, officetype: string) {
        this.officecode = officecode;
        this.officename = officename;
        this.officetype = officetype;
    }
}
