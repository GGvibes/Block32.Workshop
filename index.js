const express = require("express");
const pg = require("pg");

const client = new pg.Client(
    process.env.DATABASE_URL || 
    "postgres://postgres:juniper23@localhost/acme_ice_cream"
)

const app = express();

app.use(express.json());
app.use(require("morgan")("dev"));


const init = async () => {
    await client.connect();
    console.log("connected to db");
    let SQL = `
        DROP TABLE IF EXISTS flavors;
        CREATE TABLE flavors (
            id SERIAL PRIMARY KEY,
            created_at TIMESTAMP DEFAULT now(),
            updated_at TIMESTAMP DEFAULT now(),
            txt VARCHAR(255) NOT NULL
            );
        INSERT INTO flavors(txt) VALUES('Strawberry');
        INSERT INTO flavors(txt) VALUES('Superman');
        INSERT INTO flavors(txt) VALUES('Chocolate Brownie Fudge Chunk');
        `;
    await client.query(SQL)
    console.log("tables created and data seeded");
    const port = process.env.PORT || 3000;
    app.listen(port, () => console.log(`listening on port ${port}`));
}

init();