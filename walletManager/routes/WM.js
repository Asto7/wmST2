const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const {ensureAuthenticated} = require('../helpers/auth');

// load helper


// load schema
require('../models/wm');
const To = mongoose.model('WM');
require('../models/User');
const User = mongoose.model('users');
// Todo Index Page

// /WM/settle/{{id}}
router.get('/acc',ensureAuthenticated, (req,res)=>{res.render('WM/acc',{acc:req.user.acc});});

router.post('/acc',ensureAuthenticated, (req,res)=>{
  if((+req.body.a)==req.body.a)
{  req.user.acc=(+req.user.acc)+(+req.body.a);
  req.user.save().then(function(result){
    req.flash('success_msg','Wallet Successfully Updated ')
      res.redirect('/WM');
  });
}
else
{
  req.flash('error_msg','Enter a Valid Amount');
  res.redirect('/WM/acc');
}
});





router.get('/profile',ensureAuthenticated, (req,res)=>{
  res.render('WM/profile',{WM:req.user.track,Acc:req.user.acc});
});


router.post('/settle/:id', ensureAuthenticated, (req,res) => {

for(var i=0;i<req.user.loan.length;i++)
{
  if(req.user.loan[i]._id==req.params.id)
    break;
}

if(req.user.loan[i]._id==req.params.id&&req.user.loan[i].Amount<req.user.acc)
{
req.user.acc-=req.user.loan[i].Amount;
// req.user.track.push(req.user.loan[i]);
User.findOne({email:req.user.loan[i].email}).then(result=>{
  result.acc=+result.acc+(+req.user.loan[i].Amount);
  result.track.push({title:req.user.loan[i].title,email:req.user.email,Amount:req.user.loan[i].Amount});

result.save().then(function(result) {

  req.user.loan.splice(i,1);
  req.user.save().then(function(result){
    res.render('WM/settle');

  });

})
});

}

else
{ req.flash('error_msg', "Sorry you have only "+req.user.acc+"  Balance in your Account");
  res.redirect('/WM/settle');}
});


router.get('/', ensureAuthenticated, (req,res) => {
  To.find({user: req.user.id}).sort({creationDate:'descending'}).then(WM => {
    res.render('WM/index', {
      WM:WM
    })
  }) // find something in DB
});

router.get('/settle', ensureAuthenticated, (req,res) => {
  // To.find({user: req.user.id}).sort({creationDate:'descending'}).then(WM => {
  // console.log(req.user.loan);
    res.render('WM/settle',{WM:req.user.loan});
 // find something in DB
});


// add form
router.get('/add', ensureAuthenticated, (req,res) => {
  res.render('WM/add');
});

// edit form
router.get('/edit/:id', ensureAuthenticated, (req,res) => {
  To.findOne({
    _id: req.params.id
  }).then(wm => {
    if (wm.user != req.user.id) {
      req.flash('error_msg', 'Not authorized');
      res.redirect('/WM');
    } else {
     res.render('WM/edit', {
       wm: wm
     });
   };
  })
});

router.get('/split', ensureAuthenticated, (req,res) => {
  res.render('WM/split');
});

router.post('/split', ensureAuthenticated, (req,res) => {
  let errors = [];


  if (!req.body.email) {
    errors.push({
      text: 'Please add Email of the other User'
    })
  }

  if (!req.body.title) {
    errors.push({
      text: 'Please add title'
    })
  }

  if (!req.body.Amount) {

  errors.push({
    text: 'Please add Amount'
  })
}
// require('./users.js').b
if(req.user.email==req.body.email)
{
  errors.push({
    text: 'This is your Email!!!Please provide your mate Email'
  });

}

User.findOne({email:req.body.email}).then(function(result){



if(result){
  // require('./users').b
  var date=new Date();
  // console.log(date);
    result.loan.push({email:req.user.email,Amount:req.body.Amount,requestDate:date,title:req.body.title});

    result.save().then(function(err,result){
    })

}

else {
  errors.push({
    text: 'No such user Exist'
  });
}


if (errors.length > 0) {
// console.log(errors);
  res.render('WM/split', {

  errors: errors,
  title: req.body.title,
  email: req.body.email,
  Amount: req.body.Amount
});
}

else {
  console.log(errors);
  const newUser = {
    email: req.body.email,
  };

  // new To(newUser).save().then(wm => {
  // console.log(result);

    req.flash('success_msg', 'Successfully Send');
    res.redirect('/WM');
  // })

}



});



});


// process  form
router.post('/', ensureAuthenticated, (req,res) => {
  let errors = [];

  if (!req.body.title) {
    errors.push({
      text: 'Please add title'
    })
  }
  if (!req.body.details) {
    errors.push({
      text: 'Please add some details'
    })
  }
  if (!req.body.Amount) {
    errors.push({
      text: 'Please add Amount'
    })
  }

  if (req.user.acc<req.body.Amount) {
    errors.push({
      text: "Pardon Me, but you don't have that much cash"
    })
  }

  if (!(+req.body.Amount==req.body.Amount)) {
    errors.push({
      text: 'Please add valid Amount'
    })
  }
  if (errors.length > 0) {
    res.render('WM/add', {
      errors: errors,
      title: req.body.title,
      details: req.body.details,
      Amount: req.body.Amount
    });
  } else {
    const newUser = {
      title: req.body.title,
      details: req.body.details,
      user: req.user.id,
      Amount: req.body.Amount
    };
    new To(newUser).save().then(wm => {
      req.user.acc-=req.body.Amount;
      req.user.save().then(function(result){
        req.flash('success_msg', 'Added Successfully');
        res.redirect('/WM');
      })

    })
  }
});

// edit form process
router.put('/:id', ensureAuthenticated, (req,res) => {
if(+req.body.Amount==req.body.Amount){
  To.findOne({
    _id: req.params.id
  }).then(wm => {
    // new values
if(((+req.user.acc)+(+wm.Amount)-req.body.Amount)>=0)
{
     req.user.acc=(+req.user.acc)+(+wm.Amount);
    wm.title = req.body.title;
    wm.details = req.body.details;
    wm.Amount = req.body.Amount;
    req.user.acc=(+req.user.acc)-(+wm.Amount);

    wm.save().then( wm => {
      req.user.save().then(function(r){
        req.flash('success_msg', 'Updated Successfully');
        res.redirect('/WM');
      })});
    }

    else{
    req.flash('error_msg', "Sorry you can't enter that Amount as it is beyond your wallet");
    res.render('WM/edit',{wm:{id:req.params.id,title:req.body.title,Amount:req.body.Amount,details:req.body.details}});
}
  });
}
else {
  // console.log(req.body)
  req.flash('error_msg', 'Enter a Valid Amount');
  res.render('WM/edit',{wm:{id:req.params.id,title:req.body.title,Amount:req.body.Amount,details:req.body.details}});
}

});

// delete
router.delete('/:id', ensureAuthenticated, (req,res) => {

To.findOne({_id: req.params.id}).then(result=>{
  // console.log(result);
req.user.acc=+req.user.acc+(+result.Amount)
// console.log(req.user);
req.user.save().then(function(){
  To.remove({
    _id: req.params.id
  }).then(() => {
    req.flash('success_msg', 'Removed Succcessfully');
    res.redirect('/WM');
  })
})})

});



module.exports = router;
