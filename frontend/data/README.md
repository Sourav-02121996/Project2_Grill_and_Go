# Sample Data Files

This folder contains all the sample/mock data used in the frontend for development and testing.

## Data Files:

### 1. **employees.json**
Contains sample employee data including:
- Employee ID, name, email, phone
- Role (admin/staff)
- Avatar emoji
- Join date

**Used in:**
- `admin/ManageEmployees.html`
- `admin/CreateRoster.html`

---

### 2. **orders.json**
Contains active and completed orders with:
- Order ID, customer info
- Items ordered with prices
- Order status (pending, preparing, ready, completed)
- Timestamps

**Used in:**
- `admin/OrderList.html`

---

### 3. **menu-items.json**
Contains pre-made sandwiches and combo meals:
- Signature sandwiches (6 items)
- Combo meals (3 items)
- Each with ID, name, description, price, category

**Used in:**
- `ReadyToOrder.html`

---

### 4. **ingredients.json**
Contains customization ingredients with prices:
- Bread options (4 types)
- Proteins (8 types)
- Veggies (6 types)
- Sauces (5 types)

**Used in:**
- `customize.html`

---

### 5. **dashboard-stats.json**
Contains dashboard statistics:
- Revenue, orders, employees
- Staff counts, shifts

**Used in:**
- `admin/AdminDashboard.html`

---

### 6. **promotions.json**
Contains promotional offers:
- Today Only offers (3 items)
- Student Offers (3 items)

**Used in:**
- `promotions.html`

---

## How to Use:

### Load data in your HTML files:

```html
<script src="../js/dataLoader.js"></script>
<script>
  // Load employees
  loadEmployees().then(employees => {
    console.log(employees);
    // Use the data to populate your page
  });
</script>
```

---

## Migration to Backend:

When you implement the backend with MongoDB, simply update the functions in `js/dataLoader.js` to call your API endpoints instead of loading JSON files.

**Example:**
```javascript
// Current (JSON file):
async function loadEmployees() {
  const response = await fetch('../data/employees.json');
  return await response.json();
}

// Future (API call):
async function loadEmployees() {
  const response = await fetch('http://localhost:5000/api/employees');
  return await response.json();
}
```

This way, your frontend code stays the same, only the data source changes!

