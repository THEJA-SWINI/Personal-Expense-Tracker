
const API_URL = "http://localhost:5000/expenses";

const expenseForm = document.getElementById("expenseForm");
const expenseTableBody = document.getElementById("expenseTableBody");
const formMessage = document.getElementById("formMessage");
const tableMessage = document.getElementById("tableMessage");
const submitButton = document.getElementById("submitButton");

const titleInput = document.getElementById("title");
const categoryInput = document.getElementById("category");
const amountInput = document.getElementById("amount");
const dateInput = document.getElementById("expense_date");
const paymentInput = document.getElementById("payment_method");

const searchInput = document.getElementById("search");
const filterCategory = document.getElementById("filterCategory");
const filterPayment = document.getElementById("filterPayment");
const filterDate = document.getElementById("filterDate");
const clearFiltersButton = document.getElementById("clearFilters");

const categoryColors = [
    "#7157ed",
    "#ff9d5c",
    "#28b89a",
    "#4789ee",
    "#ed6b91",
    "#e0ad3c",
    "#8b70ce",
    "#6f829b"
];

let searchTimer;

// Format amounts in Indian Rupees
function formatCurrency(value) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(Number(value) || 0);
}

// Format SQL dates without timezone shifts
function formatDate(value) {
    if (!value) return "-";

    const dateString = typeof value === "string"
        ? value.slice(0, 10)
        : new Date(value).toISOString().slice(0, 10);

    const parts = dateString.split("-");

    if (parts.length !== 3) return dateString;

    return `${parts[2]}-${parts[1]}-${parts[0]}`;
}

// Today's date
document.getElementById("todayDate").textContent =
    new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });

// Default expense date
dateInput.value = [
    new Date().getFullYear(),
    String(new Date().getMonth() + 1).padStart(2, "0"),
    String(new Date().getDate()).padStart(2, "0")
].join("-");

// Display form messages safely
function showFormMessage(message, type) {
    formMessage.textContent = message;
    formMessage.className = `form-message ${type}-message`;
}

// Display table messages
function showTableMessage(message, type = "error") {
    tableMessage.textContent = message;
    tableMessage.className = `table-message ${type}-message`;
}

// Build query parameters from current filters
function getFilterParams() {
    const params = new URLSearchParams();

    if (searchInput.value.trim()) {
        params.set("search", searchInput.value.trim());
    }

    if (filterCategory.value) {
        params.set("category", filterCategory.value);
    }

    if (filterPayment.value) {
        params.set("payment_method", filterPayment.value);
    }

    if (filterDate.value) {
        params.set("date", filterDate.value);
    }

    return params.toString();
}

// Load all expenses or filtered expenses
async function loadExpenses() {
    expenseTableBody.innerHTML = `
        <tr><td colspan="7" class="empty-message">
            Loading expenses...
        </td></tr>
    `;

    try {
        const query = getFilterParams();
        const response = await fetch(
            `${API_URL}${query ? `?${query}` : ""}`
        );

        if (!response.ok) {
            throw new Error("Unable to retrieve expenses.");
        }

        const expenses = await response.json();
        renderExpenses(expenses);

        showTableMessage("", "success");
    } catch (error) {
        expenseTableBody.innerHTML = `
            <tr><td colspan="7" class="empty-message">
                Could not load expenses. Check that your backend is running.
            </td></tr>
        `;

        showTableMessage(error.message);
    }
}

// Render the expense table
function renderExpenses(expenses) {
    document.getElementById("recordCount").textContent =
        `${expenses.length} record${expenses.length === 1 ? "" : "s"}`;

    if (expenses.length === 0) {
        expenseTableBody.innerHTML = `
            <tr><td colspan="7" class="empty-message">
                No expenses found. Try changing your filters.
            </td></tr>
        `;
        return;
    }

    expenseTableBody.innerHTML = expenses.map(expense => `
        <tr>
            <td class="expense-id">#${Number(expense.expense_id)}</td>
            <td class="expense-title">${escapeHTML(expense.title)}</td>
            <td><span class="category-tag">${escapeHTML(expense.category)}</span></td>
            <td class="amount-cell">${formatCurrency(expense.amount)}</td>
            <td>${formatDate(expense.expense_date)}</td>
            <td><span class="payment-tag">${escapeHTML(expense.payment_method)}</span></td>
            <td>
                <button
                    class="delete-button"
                    data-id="${Number(expense.expense_id)}"
                    type="button">
                    Delete
                </button>
            </td>
        </tr>
    `).join("");
}

// Escape database strings before placing them in HTML
function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}

// Load summary values from MySQL through the API
async function loadSummary() {
    try {
        const response = await fetch(`${API_URL}/summary`);

        if (!response.ok) {
            throw new Error("Unable to load summary.");
        }

        const summary = await response.json();

        document.getElementById("totalAmount").textContent =
            formatCurrency(summary.total_amount);

        document.getElementById("highestExpense").textContent =
            formatCurrency(summary.highest_expense);

        document.getElementById("averageExpense").textContent =
            formatCurrency(summary.average_expense);

        document.getElementById("totalExpenses").textContent =
            Number(summary.total_expenses);
    } catch (error) {
        console.error("Summary error:", error);
    }
}

// Load category-wise totals from the API
async function loadCategorySummary() {
    const container = document.getElementById("categorySummary");

    try {
        const response = await fetch(`${API_URL}/category-summary`);

        if (!response.ok) {
            throw new Error("Unable to load category summary.");
        }

        const categories = await response.json();

        if (categories.length === 0) {
            container.innerHTML = `
                <p class="empty-message">No category data available yet.</p>
            `;
            return;
        }

        const grandTotal = categories.reduce(
            (sum, item) => sum + Number(item.total_amount), 0
        );

        container.innerHTML = categories.map((item, index) => {
            const amount = Number(item.total_amount);
            const percentage = grandTotal > 0
                ? (amount / grandTotal) * 100
                : 0;

            const color = categoryColors[index % categoryColors.length];

            return `
                <div class="category-item">
                    <div class="category-info">
                        <span class="category-name">
                            <span class="category-dot"
                                style="--bar-color:${color}"></span>
                            ${escapeHTML(item.category)}
                        </span>
                        <span class="category-amount">
                            ${formatCurrency(amount)}
                        </span>
                    </div>
                    <div class="progress-track">
                        <div class="progress-fill"
                            style="--bar-color:${color};width:${percentage}%">
                        </div>
                    </div>
                </div>
            `;
        }).join("");
    } catch (error) {
        container.innerHTML = `
            <p class="empty-message">Could not load category summary.</p>
        `;
        console.error("Category summary error:", error);
    }
}

// Add an expense to the database
expenseForm.addEventListener("submit", async event => {
    event.preventDefault();

    const amount = Number(amountInput.value);

    if (!Number.isFinite(amount) || amount <= 0) {
        showFormMessage("Please enter an amount greater than zero.", "error");
        return;
    }

    const expense = {
        title: titleInput.value.trim(),
        category: categoryInput.value,
        amount,
        expense_date: dateInput.value,
        payment_method: paymentInput.value
    };

    submitButton.disabled = true;
    submitButton.textContent = "Adding expense...";

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(expense)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Failed to add expense.");
        }

        expenseForm.reset();

        dateInput.value = [
            new Date().getFullYear(),
            String(new Date().getMonth() + 1).padStart(2, "0"),
            String(new Date().getDate()).padStart(2, "0")
        ].join("-");

        showFormMessage("Expense added successfully!", "success");

        await refreshDashboard();
    } catch (error) {
        showFormMessage(error.message, "error");
    } finally {
        submitButton.disabled = false;
        submitButton.innerHTML = "<span>＋</span> Add Expense";
    }
});

// Delete an expense
expenseTableBody.addEventListener("click", async event => {
    const button = event.target.closest(".delete-button");

    if (!button) return;

    const id = button.dataset.id;

    if (!confirm("Are you sure you want to delete this expense?")) {
        return;
    }

    button.disabled = true;
    button.textContent = "Deleting...";

    try {
        const response = await fetch(`${API_URL}/${encodeURIComponent(id)}`, {
            method: "DELETE"
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Failed to delete expense.");
        }

        showTableMessage("Expense deleted successfully.", "success");

        await refreshDashboard();
    } catch (error) {
        showTableMessage(error.message);
        button.disabled = false;
        button.textContent = "Delete";
    }
});

// Search by title with a small delay
searchInput.addEventListener("input", () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(loadExpenses, 300);
});

// Apply filters
filterCategory.addEventListener("change", loadExpenses);
filterPayment.addEventListener("change", loadExpenses);
filterDate.addEventListener("change", loadExpenses);

// Reset filters
clearFiltersButton.addEventListener("click", () => {
    searchInput.value = "";
    filterCategory.value = "";
    filterPayment.value = "";
    filterDate.value = "";
    loadExpenses();
});

// Refresh all dashboard data
async function refreshDashboard() {
    await Promise.all([
        loadExpenses(),
        loadSummary(),
        loadCategorySummary()
    ]);
}

// Initial page load
refreshDashboard();