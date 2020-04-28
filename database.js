const { Pool } = require('pg')


const pool = new Pool({   
    user: 'postgres',
    host: 'localhost',
    database: 'verge',
    password: '1996',
    port: 5432,
})
pool.on("connect", () => {
    console.log("connected to db successfully");
});
pool.on("error", (err) => {
    console.log("could not connect database", err);
});

module.exports = pool