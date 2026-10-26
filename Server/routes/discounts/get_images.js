const db = require('../../config/connection');
const Logger = require('../../config/logging.js')
const fs = require("fs");
const { isDigits } = require('../middleware/validate');

module.exports = (req, res) => {
    if(req.params.imgId){
        if(!isDigits(req.params.imgId)) return res.status(400).json({ message: 'Invalid image id' })
        try {
            var sqlquery = `SELECT * FROM Images where images_id = ${req.params.imgId};`            
            db.connection.query(sqlquery, (err, result) =>{
                if (err || !result || result.length === 0) {
                    Logger.log(1, err || `Image ${req.params.imgId} not found`)
                    res.status(err ? 500 : 404).json({ message: 'Image not found' })
                } else {
                    res.setHeader('content-type', 'image/jpeg');
                    var s = fs.readFileSync(result[0].path);
                    var string = Buffer.from(s).toString('base64')
                    
                    res.status(200).send(string) 
                }
            })
        } catch (err) {
            Logger.log(1, err)
        }
    }
    else{
        var sqlquery = `SELECT * 
                        FROM Images;`            
            db.connection.query(sqlquery, (err, result) =>{
                if (err) {
                    Logger.log(1, err)
                    res.status(500).json({ message: 'Could not load images' })
                } else {
                    res.status(200).send(result)
                }
            })
    }
    
}; 
