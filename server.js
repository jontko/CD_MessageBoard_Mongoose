const express = require("express");
const app = express();
const mongoose = require('mongoose');
const flash = require('express-flash');
const session = require('express-session');
    app.use(session({
    secret: 'keyboardkitteh',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000 }
}))

app.use(flash());
app.use(express.static(__dirname + "/static"));
app.use(express.urlencoded({extended: true}));
    
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

mongoose.connect('mongodb://localhost/name_of_your_DB', {useNewUrlParser: true});


// Models
const CommentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 1},
    comment: {
        type: String,
        required: true,
        maxlength: 140,
    }
    },{timestamps: true});
const Comment = mongoose.model('Comment', CommentSchema);

const PstSchema = new mongoose.Schema({
    name: {
        type: String, 
        required: true, 
        minlength:3
    },
    message: {
        type:String, 
        required: true, 
        minlength: 10,
        maxlenght: 140
    },
    comment: [CommentSchema] 
    }, {timestamps: true});
const Pst = mongoose.model('Post', PstSchema);


// Routes
app.get('/', (req, res) => {
    Pst.find()
    .then (allPosts => res.render("index",{pst:allPosts}))
    .catch (err => res.json(err));
});

app.get('/delete/:id', (req,res) => {
    console.log('*'.repeat(20),'reached delete method',"*".repeat(20));
    console.log('*'.repeat(20), req.params ,"*".repeat(20));
    Pst.remove({_id: req.params.id})
    .then (deletedPost=>{
        res.redirect('/');
        })
        .catch(err => res.json(err));
    });

app.post('/submit', (req, res) =>{
    console.log('*'.repeat(20),'reached submit method',"*".repeat(20));
    console.log('*'.repeat(20), req.body ,"*".repeat(20));
    const pst = new Pst()
    pst.name = req.body.name
    pst.message = req.body.message
    pst.save()
        .then (newPst =>{
            res.redirect('/');
        })
        .catch (err => {
            for (var key in err.errors) {
                req.flash('messages', err.errors[key].message);
            }
            res.redirect('/')});
});

app.post('/comment', (req, res) =>{
    console.log('*'.repeat(20), 'comment route reached',"*".repeat(20));
    console.log('*'.repeat(20), req.body,"*".repeat(20));
    const comment = new Comment()
    comment.comment = req.body.CommentMessage
    comment.name = req.body.CommentName
    comment.save()
        .then (newCom =>{
            console.log(newCom);
           Pst.findOneAndUpdate (
                {_id:req.body.id},
                {$push: {comment: newCom}
            })
                .then(updatedMessage => {
                    res.redirect('/');
                })
                .catch(err2 => {
                    for (var key in err2.errors) {
                        req.flash('messages', err2.errors[key].message);
                    }
                    res.redirect('/')});
                })
                .catch (err => {
                    for (var key in err.errors) {
                        req.flash('messages', err.errors[key].message);
                    }
                    res.redirect('/')});
                });

app.listen(4200, () => console.log("listening on port 4200"));