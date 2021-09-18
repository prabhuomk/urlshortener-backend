import {  insertUser,getUser,updateUser,inserttoken,gettoken,deletetoken,inserttokens,gettokens,deletetokens,updateActiveStatus ,insertUrls,getUrls,listUrls, countUrls} from "../helper.js";

import {createConnection} from "../index.js";
import express, { response }  from 'express';
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";


import {sendEmail} from "../middleware/mail.js"

const router=express.Router();




router
.route("/signup")
.post(async (request,response)=>{
    
    const { email_id,firstname,lastname,password }= request.body;
    const client=await createConnection();
    const hashedPassword=await genPassword(password);
    const isActive="false"
    const pass=await insertUser(client,{email_id:email_id,firstname:firstname,lastname:lastname,password:hashedPassword,Account_Active:isActive})
    const token=jwt.sign({email_id:email_id},process.env.REKEY);
    const expiryDate= Date.now()+3600000;
    const store= await inserttokens(client,{tokenid:email_id,token:token,expiryDate:expiryDate});
    const link = `${process.env.BASE_URL}/account-activation/${email_id}/${token}`;
    const mail=  await sendEmail(email_id, "Account Activation", link);
    console.log(hashedPassword,pass);
    response.send({message:"account activation link is send to your mail id"});
    
});


router
.route("/activate_account/:email_id/:token")
.post(async (request,response)=>{
   
    const email_id=request.params.email_id;
    const token=request.params.token;
    const client=await createConnection();
    const tokens=await gettokens(client,{token:token});
    if(!tokens){
        response.send({message:"invalid token"})
    }else{
        if( Date.now()< tokens.expiryDate ){
        const updateStatus="true"
        const updateuserActiveStatus = await updateActiveStatus(client,email_id,updateStatus);
        const deletemytokens= await deletetokens(client,{token:token});
        response.send({message:"your account got activated"})

    } 
    else{
        response.send({message:"link got expired,try to sign up again"})
    }

} 
  
});



router
.route("/login")
.post(async (request,response)=>{
    const { email_id,password }= request.body;
    const client=await createConnection();
    const user=await getUser(client,{email_id:email_id});
    if(!user){
        response.send({message:"user not exist ,please sign up"})
    }else{
        if(user.Account_Active =="true"){
    console.log(user._id);
    
    const inDbStoredPassword=user.password;
    const isMatch= await bcrypt.compare(password,inDbStoredPassword);
    if(isMatch){
        const token=jwt.sign({id:user._id},process.env.KEY)
    
        response.send({message:"successfully login",token:token,email_id:email_id});
    }
    else{
        response.send({message:"invalid login"});

    } 
}
else{
    response.send({message:"account not yet Activated"});
} 
} 
});

router
.route("/forgetpassword")
.post(async (request,response)=>{
    const { email_id }= request.body;
    const client=await createConnection();
    const user=await getUser(client,{email_id});
    if(!user){
        response.send({message:"user not exist"})
    }else{

        const token=jwt.sign({id:user._id},process.env.REKEY);
        const expiryDate= Date.now()+3600000;
        const store= await inserttoken(client,{tokenid:user._id,token:token,expiryDate:expiryDate});
        const link = `${process.env.BASE_URL}/password-reset/${user._id}/${token}`;
       
      const mail=  await sendEmail(user.email_id, "Password reset", link);
    response.send({message:"link has been send to your email for password change"});

    } 
} 
    
);

router
.route("/resetpassword/:id/:token")
.post(async (request,response)=>{
    const { password }= request.body;
    const id=request.params.id;
    const token=request.params.token;
    const client=await createConnection();
    const tokens=await gettoken(client,{token:token});
    if(!tokens){
        response.send({message:"invalid token"})
    }else{
        if( Date.now()< tokens.expiryDate ){
        const hashedPassword=await genPassword(password);
        const updateuserpassword = await updateUser(client,id,hashedPassword);
        const deletetokens= await deletetoken(client,id);
        response.send({message:"password updated and token got deleted"})

    } 
    else{
        response.send({message:"link got expired"})
    }

} 
  
});


router.route("/urlshorter").post(async (request,response)=>{
    const {longUrl}=request.body;
    const shortUrl= await generateUrl();
    const count=0;
    const time= new Date();
    const client=await createConnection();
    const urlStoreage= await insertUrls(client,{longUrl:longUrl,shortUrl:shortUrl,timestamp:time,ClickCount:count});
    response.send({shortUrl:shortUrl});

});


router.route("/allUrl").get(async(request,response)=>{
    const client=  await createConnection();
    const myUrls =  await  listUrls(client,{});
    response.send(myUrls);
});

router.route("/countUrl").get(async(request,response)=>{
    const client=  await createConnection();
    const counts =  await  countUrls(client,[
        {
          $project: {
            month: { $month: "$timestamp" },
          },
        },
        {
          $group: {
            _id: "$month",
            total: { $sum: 1 },
          },
        },
      ])
    response.send({message:"month wise count of number of url created",counts});
});

router.route("myUrl/:shortUrl").get(async(request,response)=>{
    const shortUrl= request.params.shortUrl;
    const client=  await createConnection();
    const myShortUrl =  await  getUrls(client,{shortUrl:shortUrl});
    response.send(myShortUrl);
});







async function genPassword(password){
    
    const salt=await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password,salt);
    return hashedPassword;
}


 async function generateUrl() {
    var rndResult = "";
    var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var charactersLength = characters.length;

    for (var i = 0; i < 5; i++) {
        rndResult += characters.charAt(
            Math.floor(Math.random() * charactersLength)
        );
    }
    console.log(rndResult)
    return rndResult
}



export const userRouter=router;
