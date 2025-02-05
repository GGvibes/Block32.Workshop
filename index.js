const express = require("express");
const pg = require("pg");

const client = new pg.Client(
  process.env.DATABASE_URL ||
    "postgres://postgres:juniper23@localhost/acme_ice_cream"
);

const app = express();

app.use(express.json());
app.use(require("morgan")("dev"));

//GET all flavors
app.get("/api/flavors", async (req, res, next) => {
  try {
    const SQL = `SELECT * FROM flavors ORDER BY created_at DESC`;
    const response = await client.query(SQL);
    res.send(response.rows);
  } catch (error) {
    next(error);
  }
});
//GET single flavor
// app.get("/api/flavors/:id", async (req, res, next) => {});
//POST new flavor
app.post("/api/flavors", async (req, res, next) => {
  try {
    console.log("POST request recieved", req.body);
    const SQL = `INSERT INTO flavors (name, is_favorite) VALUES ($1, $2) RETURNING *`;
    const response = await client.query(SQL, [req.body.name, req.body.is_favorite]);
    res.send(response.rows[0]);
  } catch (error) {
    next(error);
  }
});
//DELETE flavor
app.delete("/api/flavors/:id", async (req, res, next) => {
  try {
    const SQL = `
    DELETE from flavors
    WHERE id=$1;
    `;
    const response = await client.query(SQL, [req.params.id]);
    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
});
//PUT update flavor
app.put("/api/flavors/:id", async (req, res, next) => {
  try {
    console.log("PUT request received for ID:", req.params.id);
    const SQL = `
      UPDATE flavors
      SET name=$1, is_favorite=$2, updated_at=now()
      WHERE id = $3 RETURNING *;
      `;
  } catch (error) {
    next(error);
  }
});
const init = async () => {
  await client.connect();
  console.log("connected to db");
  let SQL = `
        DROP TABLE IF EXISTS flavors;
        CREATE TABLE flavors (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255),
            is_favorite BOOLEAN,
            created_at TIMESTAMP DEFAULT now(),
            updated_at TIMESTAMP DEFAULT now()
            );
        INSERT INTO flavors(name, is_favorite) VALUES('Strawberry', false);
        INSERT INTO flavors(name, is_favorite) VALUES('Superman', false);
        INSERT INTO flavors(name, is_favorite) VALUES('Chocolate Brownie Fudge Chunk', true);
        `;
  await client.query(SQL);
  console.log("tables created and data seeded");
  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`listening on port ${port}`));
};

init();
