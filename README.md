# Complete Guide: Setting Up a GraphQL Server and Integrating It with Syncfusion Angular Grid

This guide provides a **fully detailed, step‑by‑step, professionally formatted**, and easy‑to‑understand explanation of how to build a GraphQL backend and connect it with the Syncfusion Angular Grid using the GraphQLAdaptor.

It is written based **entirely on your original README content**, expanded and structured clearly.

---
# Table of Contents
1. Introduction to GraphQL
2. Understanding Syncfusion GraphQLAdaptor
3. Project Structure Overview
4. Setting Up the GraphQL Server
   - Step 1: Create Project Folder
   - Step 2: Install Dependencies
   - Step 3: Define Schema
   - Step 4: Create Database File
   - Step 5: Implement Resolvers
   - Step 6: Run the Server
5. Setting Up the Angular Client
   - Step 1: Create Angular App
   - Step 2: Install Syncfusion Packages
   - Step 3: Import Modules
   - Step 4: Add CSS References
   - Step 5: Configure DataManager
   - Step 6: Create Grid UI
   - Step 7: Run Application
6. Final Output

---
# 1. 📌 Introduction to GraphQL
GraphQL is a modern API query language that allows clients to request only the data they need. This eliminates over‑fetching and under‑fetching common in REST APIs.

### GraphQL supports:
- **Query** → Read data
- **Mutation** → Modify data (Create, Update, Delete)
- **Subscription** → Real‑time updates

---
# 2. 🔗 Syncfusion GraphQLAdaptor Overview
The `GraphQLAdaptor` in Syncfusion DataManager makes it possible for the Angular Grid to:

✔ Fetch data using GraphQL Query
✔ Insert, Update, Delete using GraphQL Mutations
✔ Support filtering, sorting, searching, paging on server‑side

This adaptor maps DataManager operations → GraphQL operations internally.

---
# 3. 📂 Project Structure Overview
```
graphql-angular-grid/
│
├── GraphQLServer/     # Backend GraphQL service
└── GridClient/         # Angular UI app with Syncfusion Grid
```

---
# 4. 🛠 Setting Up the GraphQL Server

## ✅ Step 1: Create GraphQL server folder
```bash
mkdir GraphQLServer
cd GraphQLServer
```

## ✅ Step 2: Install dependencies
Install **Graphpack**, a lightweight GraphQL server tool:
```bash
npm i graphpack
```
Include Syncfusion ej2-data package in `package.json`:
```json
{
  "dependencies": {
    "@syncfusion/ej2-data": "24.1.41"
  }
}
```

---
# 📘 Step 3: Define GraphQL Schema
The schema defines:
- Product model
- ReturnType structure
- Supported queries & mutations
- DataManagerInput structure for Grid Data Operations

Example (simplified, from your file):
```graphql
type Product {
  productId: String!
  productName: String
  category: String
  mrp: Float
  stockQuantity: Int
}

type ReturnType {
  result: [Product!]!
  count: Int!
}

type Query {
  getProducts(datamanager: DataManagerInput): ReturnType!
}

type Mutation {
  createProduct(value: ProductInput!): Product!
}
```

---
# 📦 Step 4: Create Database File
Your `db.js` contains:
```js
export const productDetails = [
   // initial product list
];
```
This acts like an in‑memory DB.

---
# ⚙️ Step 5: Implement Resolvers
Resolvers handle:

✔ Filtering using Syncfusion Predicate
✔ Searching
✔ Sorting
✔ Paging
✔ CRUD operations

Example (from your README):
```js
getProducts: (parent, { datamanager }) => {
  const query = new Query();
  if (datamanager.where) applyFilter();
  if (datamanager.sorted) applySorting();
  const filteredData = new DataManager(products).executeLocal(query);
  return { result: filteredData, count: filteredData.length };
}
```

Mutations use simple in‑memory update logic.

---
# ▶️ Step 6: Run GraphQL Server
```bash
npm install
npm run dev
```
Server example URL:
```
http://localhost:4205/
```

---
# 5. 🅰️ Setting Up the Angular Client

## ✅ Step 1: Create Angular app
```bash
ng new GridClient
cd GridClient
```

## ✅ Step 2: Install Syncfusion packages
```bash
npm install @syncfusion/ej2-angular-grids --save
npm install @syncfusion/ej2-data
```

## ✅ Step 3: Import Grid module
```ts
imports: [ BrowserModule, GridModule ]
```

## ✅ Step 4: Add CSS in styles.css
```css
@import '../node_modules/@syncfusion/ej2-base/styles/material.css';
@import '../node_modules/@syncfusion/ej2-angular-grids/styles/material.css';
```

---
# 📡 Step 5: Configure DataManager with GraphQLAdaptor
```ts
this.data = new DataManager({
  url: 'http://localhost:4205/',
  adaptor: new GraphQLAdaptor({
    response: {
      result: 'getProducts.result',
      count: 'getProducts.count'
    },
    query: `query getProducts($datamanager: DataManagerInput){ getProducts(datamanager: $datamanager){ count result { productId productName } }}`
  })
});
```

---
# 🖥 Step 6: Create Angular Grid UI
```html
<ejs-grid [dataSource]="data" allowPaging="true">
  <e-columns>
    <e-column field="productId" headerText="ID" isPrimaryKey="true"></e-column>
    <e-column field="productName" headerText="Product"></e-column>
  </e-columns>
</ejs-grid>
```

---
# ▶️ Step 7: Run Angular Application
```bash
ng serve
```
The Syncfusion Grid will now fetch, insert, update, delete, sort, filter, and page records using **GraphQL server**.

---
For additional guidance, best practices, and advanced configuration options, please refer to the official documentation(https://ej2.syncfusion.com/angular/documentation/grid/connecting-to-adaptors/graphql-adaptor#configure-graphql-server).


