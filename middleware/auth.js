import jwt from "jsonwebtoken";

export const auth=(request,response,next)=>{
    try{
        const token=request.header("x-auth-token");
        jwt.verify(token,"thisismytoken");
        next();
    }
    catch(err){
        response.status(401).send({message:"invalid token"})
    }
        next();
   
}