
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { CommandClickEventArgs, CommandModel, EditSettingsModel, FilterSettingsModel, PageSettingsModel } from '@syncfusion/ej2-angular-grids';
import { DataManager, GraphQLAdaptor, Query } from '@syncfusion/ej2-data';
import { Browser } from '@syncfusion/ej2-base';import { FileInfo, SelectedEventArgs, SuccessEventArgs, UploaderComponent } from '@syncfusion/ej2-angular-inputs';
import { Dialog, TooltipComponent, TooltipEventArgs } from '@syncfusion/ej2-angular-popups/public_api';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import  { stockStatusOptions , categoryData, brandData, tagsOptions}  from '../../src/data'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  public data!: DataManager;
  public detailsManager!: DataManager;
  public pageSettings!: PageSettingsModel;
  public editSettings?: EditSettingsModel;
  public toolbar?: string[];
  public commands?: CommandModel[];
  public dialogVisible: boolean = false;
  public rowData: any;
  public filterSettings!: FilterSettingsModel;
  public strm?:string;
  public productData: any = {};
  previewObjectUrl: string | undefined;

  constructor(private sanitizer: DomSanitizer) {}

  @ViewChild('grid') grid: any;
  @ViewChild('dialog') dialog: any;
  @ViewChild('tooltip')
  public tooltip?: TooltipComponent;
  @ViewChild('productForm')
  public productForm: FormGroup | undefined;
  currentImagePreview: string | null = null;          // for temporary preview URL
  currentImageBase64: string | null = null;           // optional: if you want to save as base64

  // If you're using @ViewChild for the uploader (optional but recommended)
  @ViewChild('productImageUploader') uploader?: UploaderComponent;

  public path: object = {
    saveUrl: 'https://services.syncfusion.com/angular/production/api/FileUploader/Save',
    removeUrl: 'https://services.syncfusion.com/angular/production/api/FileUploader/Remove'
  };

  stockStatusOptions = stockStatusOptions
  tagsOptions = tagsOptions
  brandData = brandData
  categoryData = categoryData
 

  ngOnInit(): void {
      // Main Grid Data
      this.data = new DataManager({
        url: 'http://localhost:4205/',
        adaptor: new GraphQLAdaptor({
          response: {
            result: 'getProducts.result',
            count: 'getProducts.count'
          },
          query: `
            query getProducts($datamanager: DataManagerInput) {
              getProducts(datamanager: $datamanager) {
                count
                result {
                  productId, productImage, productName, category, brand, rating, mrp, discount, stockQuantity, stockStatus
                }
              }
            }
          `,
          getMutation: function (action: any): string {
            
          if (action === 'insert') {
              return `mutation CreateProductMutation($value: ProductInput!) {
                createProduct(value: $value) {
                  productId, productName, category, brand, rating, mrp, discount, stockQuantity, stockStatus
                }
              }`;
            }

            
          if (action === 'update') {
              return `mutation UpdateProductMutation($key: String!, $keyColumn: String, $value: ProductInput!) {
                updateProduct(key: $key, keyColumn: $keyColumn, value: $value) {
                  productId, productName, category, brand, rating, mrp, discount, stockQuantity, stockStatus
                }
              }`;
            }
          else { 
            // Use this in your getMutation helper
            return `mutation RemoveProductMutation($key: String!, $keyColumn: String) {
              deleteProduct(key: $key, keyColumn: $keyColumn) {
                productId
                productName
                category
                description
                brand
                minimumOrderQuantity
                mrp
                discount
                stockQuantity
                stockStatus
              }
            }`;
              }
            }
        })
      });
    
      // Details DataManager
      this.detailsManager = new DataManager({
        url: 'http://localhost:4205/',
        adaptor: new GraphQLAdaptor({
          response: { result: 'getProductById' },
          query: `
            query GetProduct($datamanager: DataManagerInput) {
              getProductById(datamanager: $datamanager) {
                productId,productName,description,minimumOrderQuantity,manufacturer,tags,warrantyPeriod,returnPolicy,sellingPrice
              }
            }
          `
        })
      });

      this.filterSettings = { type: 'CheckBox' };
      this.pageSettings = { pageSize: 10 };
      this.editSettings = { allowAdding: true, allowDeleting: true, allowEditing: true, mode: 'Dialog' };
      this.toolbar = ['Search', 'Add', 'Delete', 'Update', 'Cancel'];
      this.commands = [{ buttonOption: { content: 'More Details', cssClass: 'e-primary' } }];
  }
 
  
  onFileSelected(args: SelectedEventArgs): void {

    const file= args?.filesData?.[0]?.rawFile;
    if (!file) { return; }

    // Revoke previous preview URL to avoid memory leak
    if (this.previewObjectUrl) {
      URL.revokeObjectURL(this.previewObjectUrl);
      this.previewObjectUrl = undefined;
    }

    // Create new preview URL
    const objectUrl = URL.createObjectURL(file as File);
    this.previewObjectUrl = objectUrl;

    // Option 2: sanitize (safer with some security policies)
    const safeUrl: SafeUrl = this.sanitizer.bypassSecurityTrustUrl(objectUrl);
    this.productData.productImage = safeUrl;

}

  discountAccessor = (field: string, data: any, column: any) => {
    const val = data[field];
    if (val == null) return val;
    return val > 1 ? val / 100 : val;
  };

  getQtyClass(qty: number): string {
    if (qty <= 0) return 'qty-zero';
    if (qty <= 5) return 'qty-low';
    return 'qty-ok';
  }

  getStatusClass(status: string): string {
    switch ((status || '').toLowerCase()) {
      case 'in stock': return 'status-in';
      case 'low': return 'status-low';
      case 'out of stock': return 'status-out';
      default: return 'status-unknown';
    }
  }
 
  
  actionBegin(args: any): void {
    if (args.requestType === 'beginEdit' || args.requestType === 'add') {
      // Keep one stable object reference
      this.productData = this.productData || {};
      Object.assign(this.productData, args.rowData);  // mutate, don't replace

      const query = new Query().addParams('id', args.rowData.productId);
      this.detailsManager.executeQuery(query)
        .then((res: any) => {
          // Merge into the same object so the existing controls update
          Object.assign(this.productData, res.result); // mutate, don't replace
        })
        .catch(err => console.error('Error fetching full product:', err));
    }

    if (args.requestType === 'save') {
      debugger
      this.productData['productImage'] = (this.strm != null) ? this.strm : this.productData['productImage'];
      if (this.productForm) {
        args.data = this.productData;
      } else {
        args.cancel = true;
      }
    }
  }

  actionComplete(args: any): void {
    if (args.requestType !== 'beginEdit' && args.requestType !== 'add') return;

    const formEl = args.form as HTMLFormElement;
    const formInst = (formEl as any)?.ej2_instances?.[0] || null;

    if (formInst) {
      // MRP ≥ 100
      formInst.removeRules?.('mrp');
      formInst.addRules?.('mrp', {
        required: [true, 'MRP is required'],
        min: [100, 'MRP must be at least 100']
      });

      // Quantity ≥ 1
      formInst.removeRules?.('stockQuantity');
      formInst.addRules?.('stockQuantity', {
        required: [true, 'Quantity is required'],
        number: [true, 'Quantity must be a valid number'],
        min: [1, 'Quantity must be at least 1']
      });

      // Discount in fraction scale: 0.01 – 1.00
      formInst.removeRules?.('discount');
      formInst.addRules?.('discount', {
        required: [true, 'Discount is required'],
        min: [0.01, 'Minimum allowed is 0.01 (1%)'],
        max: [1, 'Maximum allowed is 1 (100%)']
      });

      // Product ID editable only on Add
      if (args.requestType === 'beginEdit') {
        formInst.removeRules?.('productId');
      }
    }

    // Initial focus
    const nameInput = document.querySelector(
      '.e-dialog .edit-dialog-form [name="productName"]'
    ) as HTMLElement | null;
    nameInput?.focus();
  }


   onBeforeOpen = function(args: any): void {
      // setting maxHeight to the Dialog.
      args.maxHeight = '100rem';
  }

  // Optional but very useful for memory management
  ngOnDestroy(): void {
    if (this.currentImagePreview) {
      URL.revokeObjectURL(this.currentImagePreview);
    }
  }

  openDetailsDialog(details: any) {
    this.rowData = details;
    this.dialogVisible = true;
  }

    
 // Optional: only show tooltip when content is truncated
  private isTruncated(el: HTMLElement): boolean {
    return el.scrollWidth > el.clientWidth;
  }


  beforeRender(args: TooltipEventArgs): void {
      const target = args.target as HTMLElement;

      // Guard: ensure we're on a data cell in ProductName column only
      if (!target.classList.contains('e-rowcell') || !target.classList.contains('pn-cell')) {
        // Cancel if somehow triggered elsewhere
        (args as any).cancel = true;
        return;
      }

      // OPTIONAL: show tooltip only when text overflows
      if (!this.isTruncated(target)) {
        (args as any).cancel = true;
        return;
      }

      // Set tooltip content to the cell's visible text
      (this as any).tooltip.content = target.innerText?.trim() ?? '';
  }

public commandClick(args: CommandClickEventArgs): void {
  const productId = (args as any).rowData.productId; // e.g., "PROD000001"

  if (!productId) {
    console.error('Missing productId');
    return;
  }

  // Build Query and add variable named exactly "id"
  const query = new Query().addParams('id', productId);

  this.detailsManager.executeQuery(query)
    .then((res: any) => {
      this.openDetailsDialog({ ...args.rowData, ...res.result });
    })
    .catch(err => console.error('Error fetching details:', err));
  }

  public dialogClose(): void {
    this.dialogVisible = false;
  }

   onUploadSuccess(args: SuccessEventArgs) {
        if (args.operation === 'upload') {
            const fileBlob = (args.file as FileInfo).rawFile as Blob;
            const file = new File([fileBlob], (args.file as FileInfo).name);
            this.strm = this.getBase64(file);
        }
    }

    getBase64(file:File): any {
      debugger
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            this.strm = reader.result as string;
        };
    }
}
