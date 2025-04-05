import { Table as AntTable, TablePaginationConfig } from "antd";

interface TableProps  {    
    columns:any;
    dataSource:any;
    virtual?:boolean
    pagination?:false | TablePaginationConfig | undefined
    scroll?:({
        x?: number | true | string;
        y?: number | string;
    } & {
        scrollToFirstRowOnChange?: boolean;
    }) | undefined
}
export default function Table(props :TableProps){
    return <AntTable {...props} rowKey="id" size="small"/>
}