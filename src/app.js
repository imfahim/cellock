'use strict';

const express = require('express');
const app = express();

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

module.exports = (db) => {

    async function executeAll(query,values = null){
        return new Promise(function(resolve,reject){
            db.all(query,values, function(err,rows){
            if(err){
                console.log(err);
                return reject(err);
            }
            resolve(rows);
            });
        });
    }

    async function insertLastId(query,values = null){
        return new Promise(function(resolve,reject){
            db.run(query,values, function(err){
            if(err){
                console.log(err);
                return reject(err);
            }
            resolve(this.lastID);
            });
        });
    }

    function requiredCheck(values,res){
        for (var propName in values) {
            if (typeof propName === 'undefined' || values[propName].length < 1) {
                console.log("Iterating through prop with name", propName, " its value is ", values[propName])
                return res.send({
                    error_code: 'VALIDATION_ERROR',
                    message:propName +' must be a non empty'
                });
            }
        }    
    }

    function coordinatesCheck(start_lat,start_long,end_lat,end_long,res){
        if(isNaN(start_lat) || isNaN(start_long) || isNaN(end_lat) || isNaN(end_long)){
            return res.send({
                error_code: 'PARAMETER_ERROR',
                message: 'coordinates should be numbers'
            });
        }

        if (Number(start_lat) < -90 || Number(start_lat) > 90 || Number(start_long) < -180 || Number(start_long) > 180) {
            return res.send({
                error_code: 'VALIDATION_ERROR',
                message: 'Start latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively'
            });
        }

        if (Number(end_lat) < -90 || Number(end_lat) > 90 || Number(end_long) < -180 || Number(end_long) > 180) {
            return res.send({
                error_code: 'VALIDATION_ERROR',
                message: 'End latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively'
            });
        }
    }


    app.get('/health', (req, res) => res.send('Healthy'));

    app.post('/rides', jsonParser, async (req, res) => {
        const obj = req.body;
        coordinatesCheck(obj.start_lat,obj.start_long,obj.end_lat,obj.end_long,res);

        requiredCheck(obj,res);

        var values = Object.keys(obj)
            .map(function(key) {
                return obj[key];
            });
        
        await insertLastId('INSERT INTO Rides(startLat, startLong, endLat, endLong, riderName, driverName, driverVehicle) VALUES (?, ?, ?, ?, ?, ?, ?)', values)
        .then( async (lastID)=>{
            if(!isNaN(lastID)){
                const rows = await executeAll('SELECT * FROM Rides WHERE rideID = ?', lastID);
                return res.send(rows);
            }
        });
    });

    app.get('/rides', async (req, res) => {
        const page = typeof req.query.page == 'undefined'? 1 : parseInt(req.query.page);
        const size = typeof req.query.size == 'undefined'? 5 : parseInt(req.query.size);
        if(isNaN(page) || isNaN(size)){
            return res.send({
                error_code: 'PARAMETER_ERROR',
                message: 'parameter error'
            });
        }
        const offset = page == 1 ? 0 : (page-1)*size;
        var values = [size,offset];
        const rows = await executeAll('SELECT * FROM Rides ORDER BY rideID LIMIT ? OFFSET ?;', values);
        if (rows.length === 0) {
            return res.send({
                error_code: 'RIDES_NOT_FOUND_ERROR',
                message: 'Could not find any rides'
            });
        }
        else{
            return res.send(rows);
        }
    });

    app.get('/rides/:id', async (req, res) => {
        if(isNaN(req.params.id)){
            return res.send({
                error_code: 'PARAMETER_ERROR',
                message: 'parameter error'
            });
        }
        var values = [req.params.id];
        const rows = await executeAll(`SELECT * FROM Rides WHERE rideID=?`, values);
        if (rows.length === 0) {
            return res.send({
                error_code: 'RIDES_NOT_FOUND_ERROR',
                message: 'Could not find any rides'
            });
        }
        else{
            return res.send(rows);
        }
    });

    return app;
};
