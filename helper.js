import mongodb from "mongodb";




export async function insertUser(client, user) {
    const result = await client.db("urlShortner").collection("user").insertOne(user);
    console.log("successfully pass inserted", result);
    return result;
}

export async function getUser(client, filter) {
    const result = await client.db("urlShortner").collection("user").findOne(filter);
    console.log("successfully matched", result);
    return result;
}

export async function updateUser(client, _id,password) {
    const result = await client.db("urlShortner").collection("user").updateOne({ _id:new mongodb.ObjectId(_id) },{$set:{password:password}});
    console.log("successfully new password updated", result);
    return result;
}

export async function updateActiveStatus(client,email_id,updateStatus) {
    const result = await client.db("urlShortner").collection("user").updateOne({ email_id:email_id },{$set:{Account_Active:updateStatus}});
    console.log("successfully new password updated", result);
    return result;
}

export async function inserttokens(client, user) {
    const result = await client.db("urlShortner").collection("tokens_a").insertOne(user);
    console.log("successfully pass inserted", result);
    return result;
}

export async function gettokens(client, filter) {
    const result = await client.db("urlShortner").collection("tokens_a").findOne(filter);
    console.log("successfully matched", result);
    return result;
}


export async function deletetokens(client,token){
    const results= await client.db("urlShortner").collection("tokens_a").deleteOne(token);
    console.log("successfully token is deleted",results);
    return results;
}

export async function inserttoken(client, user) {
    const result = await client.db("urlShortner").collection("tokens").insertOne(user);
    console.log("successfully pass inserted", result);
    return result;
}

export async function gettoken(client, filter) {
    const result = await client.db("urlShortner").collection("tokens").findOne(filter);
    console.log("successfully matched", result);
    return result;
}


export async function deletetoken(client,tokenid){
    const results= await client.db("urlShortner").collection("tokens").deleteOne({tokenid:new mongodb.ObjectId(tokenid)});
    console.log("successfully token is deleted",results);
    return results;
}


export async function insertUrls(client, url) {
    const result = await client.db("urlShortner").collection("urlStorage").insertOne(url);
    console.log("successfully url inserted", result);
    return result;
}

export async function getUrls(client, filter) {
    const result = await client.db("urlShortner").collection("urlStorage").findOne(filter);
    console.log("successfully matched", result);
    return result;
}

export async function listUrls(client, filter) {
    const results = await client.db("urlShortner").collection("urlStorage").find(filter).toArray();
    console.log("successfully all data got", results);
    return results;
}


export async function countUrls(client, filter) {
    const results = await client.db("urlShortner").collection("urlStorage").aggregate(filter).toArray();
    console.log("successfully all data got count",results);
    return results;
}

