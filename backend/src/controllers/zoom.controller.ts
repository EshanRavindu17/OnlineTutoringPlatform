import { Request, Response } from 'express';
import { getZak } from '../services/zoom.service';


export const getZoomZakController= async (req: Request, res: Response)=>{

    const oldUrl = req.body.oldUrl;
    try{
        const response = await getZak(oldUrl);
        return res.status(200).json(response);
    }
    catch(error){
       return res.status(500).json({error:"Failed to get Zak"});
    }

}