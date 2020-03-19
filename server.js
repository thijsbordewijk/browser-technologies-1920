const express = require("express")
const session = require("express-session")
const app = express()
require('dotenv').config()

//const mongo = require('./modules/mongo')

const MongoClient = require('mongodb').MongoClient;
const uri = process.env.MONGO_URI

async function checkHash (req, res, hash) { 
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    try {
        await client.connect()
        const db = client.db('users')
        const hashData = await db.collection('user').findOne({hash: hash})

        let userData = hashData
        if(hashData === null) {
            await db.collection('user').insertOne({
                hash: hash
            })
            userData = await db.collection('user').findOne({hash: hash})
        }

        req.session.user = userData
        
        console.log(hash, req.session.user)
    } catch(e) { 
        console.error(e)
    } finally {
        await client.close()
    }
}

app.use(session({
	resave: false,
	saveUninitialized: true,
	secret: process.env.SESSION
}))

app.use(express.static('public'))
    .set("view engine", "ejs")
    .get('/', (req, res) => {
        console.log(req.params)
        res.render('index')
    })
    .get('/enquete/:id', async (req, res) => {
        const hash = req.params.id
        const data = await checkHash(req, res, hash)
        res.render('index')
    })

const port = 9090
app.listen(port, () => console.log(`Server is gestart op poort: ${port}`))