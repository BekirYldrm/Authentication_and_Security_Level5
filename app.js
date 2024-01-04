import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import { config } from "dotenv";
config();
import session from "express-session";
import passport from "passport";
import PassportLocalMongoose from "passport-local-mongoose";


const app = express();

app
    .use(bodyParser.urlencoded({ extended: true }))
    .set("view engine", "ejs")
    .use(session({ secret: process.env.SECRET, resave: false, saveUninitialized: false }))
    .use(passport.initialize())
    .use(passport.session())


mongoose.connect("mongodb://0.0.0.0:27017/clientDB");
const userSchema = new mongoose.Schema({ username: String, password: String });
userSchema.plugin(PassportLocalMongoose);
const userModel = mongoose.model("user", userSchema);


passport.use(userModel.createStrategy());
passport.serializeUser(userModel.serializeUser());
passport.deserializeUser(userModel.deserializeUser());


app
    .get("/", (req, res) => {
        res.render("home");
    })

    .get("/register", (req, res) => {
        res.render("register")
    })

    .get("/login", (req, res) => {
        res.render("login");
    })

    .get("/logout", (req, res) => {
        req.logout(err => {
            if (err) {
                return next(err);
            } else {
                res.redirect('/');
            }

        })
    })

    .get("/secret", (req, res) => {
        if (req.isAuthenticated()) {
            res.render("secret");
        } else {
            res.redirect("/login");
        }

    })


    .post("/register", (req, res) => {
        userModel.register({ username: req.body.username }, req.body.password, (err, userModel) => {
            if (err) {
                res.redirect("/register");
            }
            else {
                passport.authenticate("local")(req, res, () => {
                    res.redirect("/secret");
                })
            }
        })
    })

    .post("/login", (req, res) => {

        const user = new userModel({ username: req.body.username, password: req.body.password })

        req.login(user, err => {
            if (err) {
                res.redirect("/login");
            }
            else {
                passport.authenticate("local")(req, res, () => {
                    res.redirect("/secret");
                })
            }
        })


    })

    .listen("3000", (req, res) => {
        console.log("server running");
    })