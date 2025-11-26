
import express from "express";
import cors from "cors";
import mysql from "mysql2";
import bodyParser from "body-parser";
import dotenv from "dotenv";
dotenv.config();


const app = express();
app.use(cors());
app.use(bodyParser.json());

const db = mysql.createConnection({
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  port: process.env.MYSQLPORT
});

// const db = mysql.createConnection({
//   host: process.env.MYSQLHOST,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
//   port: process.env.MYSQLPORT
// });


db.connect((err) => {
  if (err) console.log("DB Error:", err);
  else console.log("MySQL Connected!");
});

// SAVE JSON INTO DB
app.post("/upload-json", (req, res) => {
  const { file_name, json_data } = req.body;

  const jsonString = JSON.stringify(json_data);

  db.query(
    "INSERT INTO uploaded_files (file_name, json_data) VALUES (?, ?)",
    [file_name, jsonString],
    (err) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ message: "Database insert failed" });
      }
      res.json({ message: "Excel data saved successfully!" });
    }
  );
});

// HISTORY LIST API
app.get("/history", (req, res) => {
  db.query("SELECT id, file_name, uploaded_at FROM uploaded_files ORDER BY uploaded_at DESC",
    (err, result) => {
      if (err) return res.status(500).json({ message: "Failed to load history" });
      res.json(result);
    }
  );
});

// VIEW JSON API
app.get("/history/:id", (req, res) => {
  const fileId = req.params.id;

  db.query("SELECT json_data FROM uploaded_files WHERE id = ?", [fileId], 
    (err, result) => {
      if (err || result.length === 0) {
        return res.status(500).json({ message: "Failed to load file data" });
      }
      res.json(JSON.parse(result[0].json_data));
    }
  );
});

app.listen(5001, () => console.log("Server running on port 5001"));
