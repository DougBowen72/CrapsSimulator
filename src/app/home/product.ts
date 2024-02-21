export class Product {
    ProductID: number = 0;
    ProductName: string = '';
    SupplierID?: number;
    CategoryID?: number;
    QuantityPerUnit?: string;
    UnitPrice: number = 0;
    UnitsInStock?: number;
    UnitsOnOrder?: number;
    ReorderLevel?: number;
    Discontinued?: boolean;
    Category: {
      CategoryID: number;
      CategoryName: string;
      Description?: string;
    } = {CategoryID: 0, CategoryName: '', Description: ''};
  }