import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import { config } from "dotenv";
import md5 from "md5";

config();


mongoose.connect("mongodb://0.0.0.0:27017/clientDB");

const userSchema = new mongoose.Schema({ email: String, password: String });


const userModel = mongoose.model("user", userSchema);


const app = express();

app
    .use(bodyParser.urlencoded({ extended: true }))
    .set("view engine", "ejs")


    .get("/", (req, res) => {
        res.render("home");
    })

    .get("/register", (req, res) => {
        res.render("register")
    })
    .get("/login", (req, res) => {
        res.render("login");
    })


    .post("/register", (req, res) => {

        const user = new userModel({
            email: req.body.email,
            password: md5(req.body.password)
        })
        user.save().
            then(res.render("secret"))
            .catch(err => console.log(err))
    })

    .post("/login", (req, res) => {
        const email = req.body.email;
        const password = md5(req.body.password);

        userModel.findOne({ email: email })
            .then(foundUser => {
                if (foundUser.password === password) {
                    res.render("secret")
                }
                else {
                    res.redirect("/login")
                }
            })
            .catch(err => console.log(err));

    })

    .listen("3000", (req, res) => {
        console.log("server running");
    })