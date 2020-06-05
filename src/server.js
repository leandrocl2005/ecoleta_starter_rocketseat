const express = require("express")
const app = express()

const db = require("./database/db")

app.use(express.static("public"))

// allow req.body
app.use(express.urlencoded({extended: true}))

const nunjucks = require("nunjucks")
nunjucks.configure("src/views", {
    express: app,
    noCache: true,
})

app.get("/", (req, res) => {
    res.render("index.html")
})

app.get("/create-point", (req, res) => {
    res.render("create-point.html")
})

app.get("/search-results", (req, res) => {

    const search = req.query.search

    if (search == "") {
        return res.render("search-results.html", {total: 0})        
    }

    db.all(`
        SELECT * FROM places
        WHERE city LIKE '%${search}%'
    `, function(err, rows) {
        if (err) {
            return console.log(err)
        }
        const total = rows.length
        res.render("search-results.html", {
            places: rows,
            total
        })
    })
    
})

app.post("/savepoint", function(req, res){
    const query = `
        INSERT INTO places (
            image,
            name,
            address,
            address2,
            state,
            city,
            items
        ) VALUES (?,?,?,?,?,?,?);
    `

    const values = [
        req.body.image,
        req.body.name,
        req.body.address,
        req.body.address2,
        req.body.state,
        req.body.city,
        req.body.items
    ]

    function afterInsert(err) { // don't use arrow funcs
        if (err) {
            return res.send("Erro no cadastro!")
        }
        return res.render("/create-point.html", {saved: true})
    }   

    db.run(query, values, afterInsert)
})

app.listen(3000)