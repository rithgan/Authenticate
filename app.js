var express=                require("express"),
    mongoose=               require("mongoose"),
    passport=               require("passport"),
    bodyParser=             require("body-parser"),
    LocalStrategy=          require("passport-local"),
    passportLocalMongoose=  require("passport-local-mongoose"),
    User=                   require("./models/user.js");             

mongoose.connect("mongodb://localhost/AuthData",{useNewUrlParser:true});
var app=express();
app.use(bodyParser.urlencoded({extended:true}));

app.use(require("express-session")({
    secret: 'Area 51 raid', //used to sign the session id cookie
    resave: false,
    saveUninitialized: false
}));

app.set("view engine","ejs");
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
//to serialize the user during session and deserialize when require
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//============
//  ROUTES
//============

app.get("/",(req,res)=>{
    res.render("home");
});

app.get("/secret",isLogin,(req,res)=>{
    res.render("secret");
});

//Auth Routes
//show sign up form
app.get("/register",function(req,res){
    res.render("register");
});

app.post("/register",function(req,res){
    User.register(new User({
        username: req.body.username
    }), req.body.password, 
    function(err, user){
        if(err){
            console.log(err);
            res.render("register");
        }
        passport.authenticate("local")(req,res,function(){
            res.redirect("secret");
        });
        // passport.authenticate('local'),function(req,res){
        //     res.redirect('secret');
        // }
    });
});

//Login Routes
app.get("/login",function(req,res){
    res.render("login");
});

//middleware is passport.authenticate
app.post("/login",passport.authenticate("local",{
    successRedirect: "/secret",
    failureRedirect: "/login"
}),function(req,res){
});

//Logout route
app.get("/logout", function(req,res){
    req.logout();
    res.redirect("/")
});

//definig a middleware
function isLogin(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login")
}

app.listen(3000, ()=>{
    console.log("server has started");
});