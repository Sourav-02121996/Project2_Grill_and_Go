/**
 * Data Loader
 * This file loads sample data from JSON files
 * Later, replace these functions with API calls to the backend
 */

// Base path for data files
const DATA_PATH = "../data/";

// Load employees data
async function loadEmployees() {
  try {
    const response = await fetch(DATA_PATH + "employees.json");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error loading employees:", error);
    return [];
  }
}

// Load orders data
async function loadOrders() {
  try {
    const response = await fetch(DATA_PATH + "orders.json");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error loading orders:", error);
    return { activeOrders: [], completedOrders: [] };
  }
}

// Load menu items
async function loadMenuItems() {
  try {
    const response = await fetch(DATA_PATH + "menu-items.json");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error loading menu items:", error);
    return { signatureSandwiches: [], combos: [] };
  }
}

// Load ingredients for customization
async function loadIngredients() {
  try {
    const response = await fetch(DATA_PATH + "ingredients.json");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error loading ingredients:", error);
    return { bread: [], proteins: [], veggies: [], sauces: [] };
  }
}

// Load dashboard statistics
async function loadDashboardStats() {
  try {
    const response = await fetch(DATA_PATH + "dashboard-stats.json");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error loading dashboard stats:", error);
    return {};
  }
}

// Load promotions
async function loadPromotions() {
  try {
    const response = await fetch(DATA_PATH + "promotions.json");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error loading promotions:", error);
    return { todayOnly: [], studentOffers: [] };
  }
}

// Export functions (when using modules)
// Later, these will be replaced with API calls like:
// async function loadEmployees() {
//   const response = await fetch('/api/employees');
//   return await response.json();
// }
