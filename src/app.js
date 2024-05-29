require('dotenv').config()
const express = require("express")
const path = require("path")
const app = express();
const hbs = require("hbs");
const jwt= require("jsonwebtoken");

const cookieParser=require("cookie-parser");
const register = require("./conn");
const Auth=require("./middleware/auth");
const auth = require('./middleware/auth');

const template_path = path.join(__dirname, "../templates");
const publicPath = path.join(__dirname, "../public");


app.use(express.static(publicPath))
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.set("view engine", "hbs");
app.set("views", template_path);



app.get("/", (req, res) => {
    res.render("home");
}) 

app.get("/index", auth,(req, res) => {
    // console.log(`the cookie is ${req.cookies.jwt}`);
    res.render("index");
})


app.get("/register",(req,res)=>{
    res.render("register");
})
app.get("/login",(req,res)=>{
    res.render("login");
})


app.get("/logout",auth, async(req,res)=>
{
    try{
        res.clearCookie("jwt");
        console.log("logout successfully");
        await req.user.save();
        res.status(200).render("home");
    }
    catch(error)
    {
        res.status(500).send(error); 
    }
}
)
    app.post('/register',async(req, res)=>{
        // const {name, email, password,cpassword} = req.body;
        // console.log(req.body.cpassword)
    
        // try{
        //     if(password===cpassword){
        //         const user = new register({
        //             name,
        //             email,
        //             password,
        //             cpassword,
        //         })
                
        //         const token=await user.generateAuthToken();
        //         console.log("Token is="+token);
    
        //         res.cookie("jwt", token, {
        //         expires:new Date(Date.now() + 50000),
        //         httpOnly:true,
        //     });
    
        //     console.log(cookie);
            
        //         await user.save();
        //         // res.status(200).send({
        //         //     message: "succesfull"
        //         // })
        //         res.status(201).render("index");
        //     }
        // }catch (error){
        //     res.status(500).send({
        //         message:"server is not working"
        //     })
        // }
        const { name, email, password, cpassword } = req.body;
    
      try {
        if (password === cpassword) {
          const user = new register({ name, email, password, cpassword });
          const token = await user.generateAuthToken();
          console.log("Token is: " + token);
    
          res.cookie("jwt", token, {
            expires: new Date(Date.now() + 50000),
            httpOnly: true,
          });
    
          await user.save();
          res.status(201).render("index", { username: user.name });
        } else {
          res.status(400).send("Password does not match");
        }
      } catch (error) {
        res.status(500).send("Server Error");
      }
    
    
    });
    

app.post("/login",async(req,res)=>{
    try{
        const {email, password}=req.body;
        const usermail=await register.findOne({email:email});
        
        const token=await usermail.generateAuthToken();
        console.log("Token is"+token);

        res.cookie("jwt", token, {
            expires:new Date(Date.now() + 50000),
            httpOnly:true,
        });

        if(usermail.password===password )
        {
            res.status(201).render("index");
        }
        else{
            res.send("password is not matching");
        }
    }catch(error)
    {  
            res.status(500).send(error);
    }
})


app.listen(3000, () => {
    console.log("Server running in port 3000");
})