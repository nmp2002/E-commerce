export class TblActionLog {
    id?: number;
    tableName?: string;
    columnName?: string;
    columnId?: number;
    actionType?: string;
    previous?: string;
    next?: string;
    description?: string;
    createdby?: string;
    createdDate?: Date;
    createdDateStr?: string;
}
