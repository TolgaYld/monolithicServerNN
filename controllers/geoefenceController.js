const knex = require('../db/db');
const createError = require('http-errors');

const getAllGeofences = async (req, res, next) => {
    const permission = await req.headers.permission;

    if (permission === process.env.PERMISSION_KEY_ADVERTISER || permission === process.env.PERMISSION_KEY_CUSTOMER || permission === process.env.PERMISSION_KEY_WORKER) {
        try {
            const allGeofences = await knex("Geofence").returning('*');
            res.json(allGeofences);
        } catch (error) {
            next(error);
        }
    } else {
        next(createError(401, 'Permission denied!'));
    }
};


const findOneGeofence = async (req, res, next) => {
    const permission = await req.headers.permission;

    if (permission === process.env.PERMISSION_KEY_ADVERTISER || permission === process.env.PERMISSION_KEY_CUSTOMER || permission === process.env.PERMISSION_KEY_WORKER) {
        try {
            const idGeofence = await knex("Geofence").where({ identifier: req.params.identifier }).returning('*');

            if (idGeofence.length !== 0) {
                res.json(idGeofence[0]);
            } else {
                res.status(404).json({
                    message: "Geofence not found!"
                });
            }
        } catch (error) {
            next(error);
        }
    } else {
        next(createError(401, 'Permission denied!'));
    }
};

const deleteOneGeofence = async (req, res, next) => {
    const permission = await req.headers.permission;

    if (permission === process.env.PERMISSION_KEY_ADVERTISER || permission === process.env.PERMISSION_KEY_CUSTOMER || permission === process.env.PERMISSION_KEY_WORKER) {
        try {
            const findGeofence = await knex("Geofence").where({ identifier: req.params.identifier }).returning('*');


            if (findGeofence.length !== 0) {

                try {
                    await knex("Geofence").where({ identifier: req.params.identifier }).del()
                } catch (error) {
                    console.log(error);
                }
                res.json({ message: "Geofence deleted" });
            }
        } catch (error) {
            next(error);
        }
    } else {
        next(createError(401, 'Permission denied!'));
    }
};

const updateOneGeofence = async (req, res, next) => {
    const permission = await req.headers.permission;

    if (permission === process.env.PERMISSION_KEY_ADVERTISER || permission === process.env.PERMISSION_KEY_CUSTOMER || permission === process.env.PERMISSION_KEY_WORKER) {
        try {
            const findGeofence = await knex("Geofence").where({ identifier: req.params.identifier }).returning('*');

            if (findGeofence.length !== 0) {
                try {
                    const updatedGeofence = await knex("Geofence").where({ identifier: req.params.identifier }).update(req.body).returning('*');


                    if (updatedGeofence.length !== 0) {
                        res.json(updatedGeofence);
                    }
                } catch (error) {
                    console.log(error);
                }
            } else {
                res.status(404).json({
                    message: "Geofence not found!"
                });
            }
        } catch (error) {
            next(error);
        }
    } else {
        next(createError(401, 'Permission denied!'));
    }
};

const createGeofence = async (req, res, next) => {
    const permission = await req.headers.permission;

    if (permission === process.env.PERMISSION_KEY_ADVERTISER || permission === process.env.PERMISSION_KEY_CUSTOMER || permission === process.env.PERMISSION_KEY_WORKER) {
        try {
            const newGeofence = await knex("Geofence").insert(req.body).returning('*');


            if (newGeofence.length !== 0) {
                res.json(newGeofence);
            }
        } catch (error) {
            next(error);
        }
    } else {
        next(createError(401, 'Permission denied!'));
    }
};

module.exports = {
    getAllGeofences,
    findOneGeofence,
    deleteOneGeofence,
    updateOneGeofence,
    createGeofence,
};