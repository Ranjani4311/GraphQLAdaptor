import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
// import the GridModule for the Grid component
import { EditService, FilterService, GridModule, GroupService, PageService, ToolbarService, SortService, CommandColumnService } from '@syncfusion/ej2-angular-grids';
import { AppComponent } from './app.component';
import { RatingModule, NumericTextBoxModule ,UploaderModule  } from '@syncfusion/ej2-angular-inputs'
import { DialogModule } from '@syncfusion/ej2-angular-popups'
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DropDownListModule } from '@syncfusion/ej2-angular-dropdowns';
import { TooltipModule } from '@syncfusion/ej2-angular-popups'

@NgModule({
  //declaration of ej2-angular-grids module into NgModule
  imports: [BrowserModule, GridModule,RatingModule,TooltipModule, DialogModule, NumericTextBoxModule, FormsModule,CommonModule, DropDownListModule,UploaderModule],
  declarations: [AppComponent],
  bootstrap: [AppComponent],
  providers: [PageService, GroupService, EditService, FilterService, ToolbarService, SortService,CommandColumnService]
})
export class AppModule { }