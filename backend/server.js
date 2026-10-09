
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const db = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

// 1. Add Expense
app.post("/expenses", async (req, res) => {
    try {
        const {
            title,
            category,
            amount,
            expense_date,
            payment_method
        } = req.body;

        if (
            !title ||
            !category ||
            amount === undefined ||
            amount === null ||
            amount === "" ||
            !Number.isFinite(Number(amount)) ||
            Number(amount) <= 0 ||
            !expense_date ||
            !payment_method
        ) {
            return res.status(400).json({
                message: "Please provide valid values for all fields."
            });
        }

        const [result] = await db.execute(
            `INSERT INTO expenses
            (title, category, amount, expense_date, payment_method)
            VALUES (?, ?, ?, ?, ?)`,
            [
                title.trim(),
                category,
                Number(amount),
                expense_date,
                payment_method
            ]
        );

        res.status(201).json({
            message: "Expense added successfully!",
            expense_id: result.insertId
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to add expense."
        });
    }
});

// 2. View and Filter Expenses
app.get("/expenses", async (req, res) => {
    try {
        const { search, category, payment_method, date } = req.query;

        let sql = "SELECT * FROM expenses WHERE 1=1";
        const values = [];

        if (search) {
            sql += " AND title LIKE ?";
            values.push(`%${search}%`);
        }

        if (category) {
            sql += " AND category = ?";
            values.push(category);
        }

        if (payment_method) {
            sql += " AND payment_method = ?";
            values.push(payment_method);
        }

        if (date) {
            sql += " AND expense_date = ?";
            values.push(date);
        }

        sql += " ORDER BY expense_date DESC, expense_id DESC";

        const [rows] = await db.execute(sql, values);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to retrieve expenses."
        });
    }
});

// 3. Expense Summary
app.get("/expenses/summary", async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT
                COALESCE(SUM(amount), 0) AS total_amount,
                COALESCE(MAX(amount), 0) AS highest_expense,
                COALESCE(AVG(amount), 0) AS average_expense,
                COUNT(*) AS total_expenses
            FROM expenses
        `);

        res.json(rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to retrieve expense summary."
        });
    }
});

// 4. Category-wise Summary
app.get("/expenses/category-summary", async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT
                category,
                SUM(amount) AS total_amount
            FROM expenses
            GROUP BY category
            ORDER BY total_amount DESC
        `);

        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to retrieve category summary."
        });
    }
});

// 5. Delete Expense
app.delete("/expenses/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                message: "Invalid expense ID."
            });
        }

        const [result] = await db.execute(
            "DELETE FROM expenses WHERE expense_id = ?",
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Expense not found."
            });
        }

        res.json({
            message: "Expense deleted successfully!"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to delete expense."
        });
    }
});

// Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
