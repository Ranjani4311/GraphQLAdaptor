# Complete Guide: Setting Up a GraphQL Server and Integrating It with Syncfusion Angular Grid

This guide provides a **fully detailed, step‑by‑step, professionally formatted**, and easy‑to‑understand explanation of how to build a GraphQL backend and connect it with the Syncfusion Angular Grid using the GraphQLAdaptor.

---
# Table of Contents
1. Introduction
2. What is GraphQL?
3. What is Syncfusion Data Grid?
4. How to Connect Syncfusion Angular Grid to GraphQL
5. Application Overview
6. Prerequisites
7. Step-by-Step Configuration
      - Folder Structure
      - Server Setup (GraphQL Backend)
      - Client Setup (Angular Frontend)
8. How to Run the Server and Application
9. FAQ
10. Common Mistakes and How to Avoid Them

---
# 1.  Introduction 
This documentation provides a complete, beginner-friendly guide to integrating the Syncfusion Angular Grid with a GraphQL backend using the official GraphQLAdaptor. The focus is on building an Employee Expense Tracker application, where the grid handles server-driven operations like paging, sorting, filtering, searching, and CRUD (Create, Read, Update, Delete) via GraphQL queries and mutations.

The integration ensures efficient data handling for large datasets by offloading processing to the server. We'll use Apollo Server for the backend and Angular for the frontend. This setup is optimized for maintainability and performance in 2025/2026 development practices.

By the end of this guide, you'll have a fully functional app ready to run.

---
# 2. What is GraphQL?
GraphQL is a query language for APIs and a runtime for fulfilling those queries with your existing data. Developed by Facebook in 2012 and open-sourced in 2015, it allows clients to request exactly the data they need, avoiding over-fetching or under-fetching common in REST APIs.

  - Key Features:
    - Flexible Queries: Clients define the response structure.
    - Strong Typing: Uses a schema to define data types, queries, and mutations.
    - Efficient: Supports paging, filtering, and sorting via custom resolvers.
    - Real-Time: Can include subscriptions for live updates (not covered here).


In this app, GraphQL serves as the backend API, with queries for fetching expenses and mutations for CRUD operations. The server processes grid states (e.g., sort order) to return optimized results.

---
# 3. What is Syncfusion?

Syncfusion is a leading provider of UI components and tools for web, mobile, and desktop applications, supporting frameworks like Angular, React, and .NET. The Syncfusion Angular Grid (EJ2 Grid or ejs-grid) is a high-performance data table component that displays tabular data with features like:

  - Paging, sorting, filtering, searching, grouping.
  - Inline/dialog editing for CRUD.
  - Exporting, virtualization, and customizable themes (e.g., Material).

Syncfusion components are enterprise-grade, customizable, and include a DataManager abstraction layer for data sources.


# 4. How to Connect Syncfusion Angular Grid to GraphQL

The connection uses Syncfusion's GraphQLAdaptor, which translates grid actions (e.g., paging) into GraphQL variables. The process:
   1. Grid triggers an action → DataManager serializes state into datamanager variable.
   2. GraphQLAdaptor sends GraphQL request to the server.
   3. Server applies operations (using Syncfusion's server-side libraries for consistency) and returns { result, count }.
   4. Grid renders the data.

This enables server-side processing, ideal for large datasets. No need for custom adaptors unless you require advanced features like Apollo Client caching.

# 5. Application Overview

The E-Commerce is a web app for View the Product Details:

  - Features:
    - Display products in a grid with paging/sorting/filtering/search.
    - CRUD operations via dialog editing.
    - Server-side processing for efficiency.
  - Stack:
    - Backend: Node.js, TypeScript, GraphQL.
    - Frontend: Angular (standalone), Syncfusion EJ2 Grid, GraphQLAdaptor.
  - Data Flow: Grid → DataManager → GraphQLAdaptor → GraphQL Server → Processed Data Back to Grid.

Sample data includes fields like productId, productName, MRP, category, brand etc

# 6.Prerequisites

  - Node.js: LTS version (e.g., v20.x or later).

  - npm/yarn: For package management.

  - Angular CLI: Install globally with npm i -g @angular/cli@latest. · Syncfusion License: Free trial from syncfusion.com.

  - TypeScript: For server-side code.

  - Basic knowledge of Angular, GraphQL, and terminal commands.


# 7.Step-by-Step Configuration

  ## Folder Structure
  
  Organize your project as follows for clarity:

  ```
├── GraphQLServer/
│   ├── src/
│   │   ├── db.js
│   │   ├── resolvers.js
│   │   └── schema.graphql
│   ├── package.json
│
├── GridClient/
   ├── src/
   │   ├── app/
   │   │   ├── app.component.css
   │   │   ├── app.component.html
   │   │   ├── app.component.spec.ts
   │   │   ├── app.component.ts
   │   │   └── app.module.ts
   │   ├── assets/
   |   |   |_productImages
   |   |   
   │   └── data.ts
   ├── index.html
   ├── main.ts
   ├── styles.css
   ├── tsconfig.json
   ├── package.json

  ```

# Server Setup (GraphQL Backend)

##  Step 1: Create GraphQL server folder
```bash
mkdir GraphQLServer
cd GraphQLServer
```

## Step 2: Install dependencies
Install **Graphpack**, a lightweight GraphQL server tool:
```bash
npm i graphpack
npm install -D typescript ts-node @types/node
```
Include Syncfusion ej2-data package in `package.json`:
```json
{
  "dependencies": {
    "@syncfusion/ej2-data": "*"
  }
}
```

## Step 3:  Configure TypeScript (tsconfig.json):
```JSON
{
  "compileOnSave": false,
  "compilerOptions": {
    "baseUrl": "./",
    "outDir": "./dist/out-tsc",
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "sourceMap": true,
    "declaration": false,
    "downlevelIteration": true,
    "experimentalDecorators": true,
    "moduleResolution": "node",
    "importHelpers": true,
    "target": "ES2022",
    "module": "ES2022",
    "useDefineForClassFields": false,
    "lib": [
      "ES2022",
      "dom"
    ]
  },
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true
  }
}
```

## Step 4: Define Schema (src/schema.graphql)

```graphql
scalar JSON

#Grid Sort direction
input Sort {
    name: String
    direction: String
} 

# --- Aggregates ---
input AggregateInput {
  field: String!
  type: String!      # e.g., "sum", "avg", "min", "max", "count"
}

# --- Syncfusion DataManager payload ---
input DataManagerInput {
  skip: Int
  take: Int
  sorted: [Sort]
  group: [String!]
  table: String
  select: [String!]
  where: String       # JSON string (Syncfusion predicate array)
  search: String      # JSON string (Syncfusion search params)
  requiresCounts: Boolean
  aggregates: [AggregateInput!]
  params: String
}

# --- Product input (for mutations) ---
input ProductInput {
  productId: String!
  productName: String
  category: String
  brand: String
  sellingPrice: Float
  mrp: Float
  discount: Float
  stockQuantity: Int
  stockStatus: String
  rating: Float
  productImage: String    
  description: String        
  minimumOrderQuantity: Int   
  manufacturer: String     
  tags: String              
  warrantyPeriod: Int      
  returnPolicy: String  
}

# --- Product type (catalog fields) ---
type Product {
  productId: String!
  productImage: String
  productName: String
  category: String
  brand: String
  sellingPrice: Float
  mrp: Float
  discount: Float
  stockQuantity: Int
  stockStatus: String
  rating: Float
  description: String
  minimumOrderQuantity: Int
  manufacturer: String
  tags: String
  warrantyPeriod: Int
  returnPolicy: String
}

# --- Return type for Grid paging ---
type ReturnType {
  result: [Product!]!
  count: Int!
  aggregates: String
}

type Query {
  getProducts(datamanager: DataManagerInput): ReturnType!
  getProductById(datamanager: DataManagerInput): Product
}

type Mutation {
  createProduct(value: ProductInput!): Product!
  updateProduct(key: String!, keyColumn: String, value: ProductInput!): Product
  deleteProduct(key: String!, keyColumn: String): Product!
}

```

---
## Step 6: Implement Resolvers (src/resolvers.ts):


```ts
import { productDetails } from "./db";
import { DataUtil, Query, DataManager, Predicate } from "@syncfusion/ej2-data";

DataUtil.serverTimezoneOffset = 0;

const resolvers = {
  Query: {
    // Main query used by the grid (supports paging, sorting, filtering, searching)
    getProducts: (parent, { datamanager }, context, info) => {
      console.log('getProducts called with:', datamanager);

      let orders = [...productDetails];
      const query = new Query();
      // 1. Filtering
      const performFiltering = (filterString) => {
        const parsed = JSON.parse(filterString);

        // Some filter UIs send an array of groups; commonly you want the first group
        // Adjust this if your payload is different
        const group = Array.isArray(parsed) ? parsed[0] : parsed;

        // Guard
        if (!group || !Array.isArray(group.predicates) || group.predicates.length === 0) {
          return query; // nothing to apply
        }

        const condition = (group.condition || 'and').toLowerCase(); // 'and' | 'or'
        const ignoreCase = group.ignoreCase !== undefined ? !!group.ignoreCase : true;

        // Build a combined Predicate chain
        let combined = null;

        group.predicates.forEach(p => {
          // If the format nests groups, handle recursively
          if (p.isComplex && Array.isArray(p.predicates)) {
            // Recursively build nested group predicate
            const nested = buildGroupPredicate(p, ignoreCase);
            if (nested) {
              combined = combined
                ? (condition === 'or' ? combined.or(nested) : combined.and(nested))
                : nested;
            }
            return;
          }

          // Leaf predicate
          const pred = new Predicate(p.field, p.operator, p.value, ignoreCase);
          combined = combined
            ? (condition === 'or' ? combined.or(pred) : combined.and(pred))
            : pred;
        });

        // Clear previous where clauses if needed (optional depending on your lifecycle)
        // query.queries = query.queries.filter(q => q.fn !== 'where');

        if (combined) {
          query.where(combined);
        }

        return query;
      };
      // Helper for nested groups
      function buildGroupPredicate(group, ignoreCase) {
        const condition = (group.condition || 'and').toLowerCase();
        let combined = null;

        group.predicates.forEach(p => {
          let node;
          if (p.isComplex && Array.isArray(p.predicates)) {
            node = buildGroupPredicate(p, ignoreCase);
          } else {
            node = new Predicate(p.field, p.operator, p.value, ignoreCase);
          }
          if (node) {
            combined = combined
              ? (condition === 'or' ? combined.or(node) : combined.and(node))
              : node;
          }
        });

        return combined;
      }
  
      // 2. Searching (uncomment when you want to support grid search)
      const performSearching = (searchParam) => {
        const { fields, key } = JSON.parse(searchParam)[0];
        query.search(key, fields);
      }
      // 3. Sorting
     const performSorting = (sorted) => {
        for (let i = 0; i < sorted.length; i++) {
          const { name, direction } = sorted[i];
          query.sortBy(name, direction);
        }
      }

      // Apply all operations
      if (datamanager.where) {
        performFiltering(datamanager.where);
      }
      if (datamanager.search) {
        performSearching(datamanager.search);
      }
      if (datamanager.sorted) {
        performSorting(datamanager.sorted);
      }

      // Execute filtering/sorting/search first
      const filteredData = new DataManager(orders).executeLocal(query);

      // Total count after filtering
      const count = filteredData.length;

      // 4. Paging
      let result = filteredData;

      if (datamanager.take !== undefined) {
        const skip = datamanager.skip || 0;
        const take = datamanager.take;

        query.page(skip / take + 1, take);
        result = new DataManager(filteredData).executeLocal(query);
      }

      return {
        result,
        count
      };
    },

    getProductById: (parent, { datamanager }) => {
      console.log('getProductById called with datamanager:', datamanager);

      let id = null;
      if (datamanager && datamanager.params) {
        try {
          const paramsObj = JSON.parse(datamanager.params);
          id = paramsObj.id;
        } catch (e) {
          console.error('Failed to parse params:', datamanager.params);
        }
      }

      if (!id) return null;

      const product = productDetails.find(p => p.productId === id);
      return product || null;
    }

  },

  Mutation: {
    createProduct: (parent, { value }, context, info) => {
      const newProduct = value;
      productDetails.push(newProduct);
      return newProduct;
    },
    updateProduct: (parent, { key, keyColumn, value }, context, info) => {
      const product = productDetails.find(p => p.productId === key);
      if (!product) throw new Error("Product not found");

      Object.assign(product, value);
      return product;
    },
     
    deleteProduct: (parent, { key, keyColumn = 'productId' }, context, info) => {
      const idx = productDetails.findIndex(p => String(p[keyColumn]) === String(key));
      if (idx === -1) throw new Error('Product not found');
      const [deleted] = productDetails.splice(idx, 1);
      return deleted;
    }

  }
};

export default resolvers;
```
## Step-by-Step Client Setup (Angular + GraphQLAdaptor)

### Step 1: Create Angular app
```bash
ng new GridClient
cd GridClient
```

### Step 2: Install Syncfusion packages
```bash
npm install @syncfusion/ej2-angular-grids --save
npm install @syncfusion/ej2-data
```

### Step 3: Import Grid module
```ts
imports: [ BrowserModule, GridModule ]
```

### Step 4: Add CSS in styles.css
```css
@import '../node_modules/@syncfusion/ej2-base/styles/tailwind.css';  
@import '../node_modules/@syncfusion/ej2-buttons/styles/tailwind.css';  
@import '../node_modules/@syncfusion/ej2-calendars/styles/tailwind.css';  
@import '../node_modules/@syncfusion/ej2-dropdowns/styles/tailwind.css';  
@import '../node_modules/@syncfusion/ej2-inputs/styles/tailwind.css';  
@import '../node_modules/@syncfusion/ej2-navigations/styles/tailwind.css';
@import '../node_modules/@syncfusion/ej2-popups/styles/tailwind.css';
@import '../node_modules/@syncfusion/ej2-splitbuttons/styles/tailwind.css';
@import '../node_modules/@syncfusion/ej2-notifications/styles/tailwind.css';
@import '../node_modules/@syncfusion/ej2-angular-grids/styles/tailwind.css';
```

---
### Step 5: Configure DataManager with GraphQLAdaptor
```ts
this.data = new DataManager({
  url: 'http://localhost:4205/',
  adaptor: new GraphQLAdaptor({
    response: {
      result: 'getProducts.result',
      count: 'getProducts.count'
    },
    query: `query getProducts($datamanager: DataManagerInput){ getProducts(datamanager: $datamanager){ count result {  productId, productImage, productName, category, brand, rating, mrp, discount, stockQuantity, stockStatus} }}`
  })
});
```

---
### Step 6: Create Angular Grid UI
```html
<ejs-grid [dataSource]='data' [allowPaging]="true" [allowSorting]="true" [allowFiltering]="true"
  [pageSettings]="pageSettings" [editSettings]="editSettings" [toolbar]="toolbar" (commandClick)="commandClick($event)" [filterSettings]="filterSettings" (actionBegin)="actionBegin($event)" (actionComplete)="actionComplete($event)">
  <e-columns>
      <e-column field='productId' headerText='Product ID' textAlign='Right' width=150 isPrimaryKey='true' [template]="idTemplate"></e-column>
      <e-column field='productName' headerText="Product" width="260" [template]="productTemplate"  [customAttributes]="{ class: 'pn-cell' }"></e-column>
      <e-column field='category' headerText='Category' width=120  [customAttributes]="{ class: 'pn-cell' }"></e-column>
      <e-column field='brand' headerText='Brand' width=120></e-column>
      <e-column field="rating" headerText="Rating" width="150" [template]="ratingTmpl"  textAlign="Right"></e-column>
      <e-column field='mrp' headerText='MRP' width=120 [format]="{ format: 'C2', currency: 'INR' }" textAlign="Right"></e-column>
      <e-column field='discount' headerText='Discount' width=110 [format]="{ format: 'P0' }"  textAlign="Right"
     ></e-column>
      <e-column field='stockQuantity' headerText='Quantity' width=110 [template]="stockQtyTmpl"  textAlign="Right" [allowFiltering]="false"></e-column>
      <e-column field='stockStatus' headerText='Stock Status' width=150  [template]="stockStatusTmpl"></e-column> 
      <e-column headerText='Commands' width=150 [commands]='commands'></e-column> 
  </e-columns>
  </ejs-grid>
```

## How to Run the Server and Client Application
### Run the Server:
- Run the below commands to install the depency packages of server and run the sevrer
	```bash
    cd server
    npm install
    npm start
	```
- Access at `http://localhost:4000/`.

### Run the Client:
- Execute the below commands to install the depencies of client application and run it
	```bash
	cd client
	npm install
	npm start
	```
- Open http://localhost:4200/ in your browser.
- Verify: Load data, page/sort/filter, add/edit/delete expenses.


The Syncfusion Grid will now fetch, insert, update, delete, sort, filter, and page records using **GraphQL server**.


## FAQ
**Q: How to add authentication?**\
**A:** Add headers to DataManager: { headers: [{ key: 'Authorization', value: 'Bearer TOKEN' }] }.

**Q: Does it support batch editing?**\
**A:** No, only single-record CRUD. Custom implementation needed for batch.

**Q: How to handle large datasets?**\
**A:** Server-side processing is built-in; ensure server uses efficient queries (e.g., database pagination).

**Q: Can I use Apollo Client caching with GraphQLAdaptor?**\
**A:** Not directly. For Apollo features (cache, links, auth), use a custom UrlAdaptor wired to Apollo Client instead of GraphQLAdaptor.

## Common Mistakes & How to Fix Them
1. Mismatch in Response Paths: Grid shows no data. Fix: Ensure response.result and response.count match server output.
2. Bad Request Errors During CRUD Operations: 
	- Cause: The server returns values that do not match the expected data types or schema definitions.
	- Fix 
		- Your request and response types match the schema (REST or GraphQL).
		- No nullable fields violate non-null constraints.

4. Complex filters don't work → Fix: Implement filtering on server using @syncfusion/ej2-data Query + Predicate

---
For additional guidance, best practices, and advanced configuration options, please refer to the official documentation(https://ej2.syncfusion.com/angular/documentation/grid/connecting-to-adaptors/graphql-adaptor#configure-graphql-server).