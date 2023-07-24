import express from "express";
import { UserModel } from "../DAO/models/users.model.js";
import { isAdmin, isUser } from "../middlewares/auth.js";


export const authRouter = express.Router();


authRouter.get("/profile", isUser, (req,res) => {
    const user = {email: req.session.email, isAdmin: req.session.isAdmin};
    return res.render("profile", {user: user});
});

authRouter.get("/logout", (req, res) => {
    req.session.destroy((error) => {
        if(error) {
            return res.status(500).render("error", {error: "Session is not closed"});
        }
        return res.redirect("/auth/login");
    });
});

authRouter.get("/administration", isUser, isAdmin, (req, res) => {
    return res.send("data");
});

authRouter.get("/login", (req, res) => {
    return res.render("login", {});
});

authRouter.get("/products", async (req, res) => {
    try {
        const user = UserModel.findOne({email: req.session.email});
        if(user) {
            const userData = {
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                isAdmin: user.isAdmin,
            };  

            return res.render("products", {user: userData});
        }else {
            return res.render("products", {user: null});
        }
    } catch (error) {
        console.log(error);
        return res.render('products', { user: null, error: 'Error retrieving user data' });
    }
});

authRouter.post("/login", async (req, res) => {
    try {
        const {email, password} = req.body;
        if(!email || !password) {
            return res.status(400).render("error", {error: "Complete the Email and Password"});
        }
        const isAdmin = email === "adminCoder@coder.com" && password === "adminCod3r123";
        if(isAdmin) {
            req.session.email = email;
            req.session.isAdmin = true;
            return res.redirect("/products");
        }
        const foundUser = await UserModel.findOne({email: email});
        if(foundUser && foundUser.password === password){
            req.session.email = foundUser.email;
            req.session.isAdmin = foundUser.isAdmin;
            return req.session.save(() => {
                return res.redirect("/products");
            });
        }else {
            return res.status(401).render("error", {error: "Invalid Email or Password" });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({status: "error", message: "Internal Error"});
    }
});

authRouter.get("/register", (req, res) => {
    return res.render("register", {});
});


authRouter.post('/register', async (req, res) => {
    const {email, password, firstName, lastName} = req.body;
    if (!email || !password || !firstName || !lastName) {
        return res.status(400).render('error', {error: 'Missing fields'});
    }
    const isAdmin = email === 'adminCoder@coder.com' && password === 'adminCod3r123';
    try {
        await UserModel.create({email: email, password: password, firstName: firstName, lastName: lastName, isAdmin: isAdmin});
        req.session.email = email;
        req.session.isAdmin = isAdmin;

        return res.redirect('/auth/profile');
    } catch (error) {
        console.log(error);
        return res.status(400).render('error', { error: 'User could not be created. Try another email'});
    }
});

