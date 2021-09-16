import dotenv from "dotenv";
dotenv.config({ path: './config.env' });

import path from "path";
import express, { Express } from "express";
import bodyParser from "body-parser";
import sqlite3 from "sqlite3";
import { v4 } from "uuid";

const port = process.env.PORT || 3000;
const app = express();
const BASE_FOLDER = path.dirname(__dirname);
const STATIC_FOLDER = path.join(BASE_FOLDER, "static");
app.use(express.static(STATIC_FOLDER));
app.use(bodyParser.urlencoded({
    extended: true
}));


const TABLE_NAME = "feedback01";
const db = new sqlite3.Database(path.join(BASE_FOLDER, ".sqlite"));
db.run(`CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (id TEXT PRIMARY KEY, feedback TEXT, createdAt TEXT);`);

db.on("close", ()=>{
    console.log("DB closed");
});

app.get("/", (req, res)=>{
    res.sendFile(path.join(STATIC_FOLDER, "index.html"));
});

app.post("/", (req, res)=>{
    const { feedback=null } = req.body;
    db.serialize(()=>{
        const query = `INSERT INTO ${TABLE_NAME} VALUES ("${v4()}", "${feedback}", "${new Date()}");`;
        console.log("Query: ", query);
        db.run(query,
        (error: Error)=>{
            if(error){
                res.send(`
                    <h1>Something went wrond, please try again!</h1>
                    <a href="/">Home</a>
                    <a href="/all-feedbacks">Past feedbacks</a>
                `);
            } else 
                res.send(`
                    <h1>Thanks for the feedback</h1>
                    <a href="/">Home</a>
                    <a href="/all-feedbacks">Past feedbacks</a>
                `);
        });
    });
});

app.get("/all-feedbacks", (req, res) => {
    db.serialize(()=> {
        db.all(`SELECT * FROM ${TABLE_NAME};`,
            (error: Error, rows: any[])=>{
                if(error){
                    res.send(`
                        <h1>Something went wrong, please try again!</h1>
                        <a href="/">Home</a>
                    `);
                } else 
                    res.send(`
                        <h1>List of feedbacks</h1>
                        <ul>
                            ${rows.map((row)=>`<li>(${(new Date(row.createdAt)).toUTCString()})  ${row.feedback}</li>`)}
                        </ul>
                        <a href="/">Home</a>
                    `);
            });
    });
});


//Server Startup
app.listen(port, () => {
	console.log(`App is runnning in ${process.env.NODE_ENV} environment on port ${port}`);
});