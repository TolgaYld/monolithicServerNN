const knex = require('../db/db');
const { DateTime } = require('luxon');
const geoTz = require('geo-tz');
const fs = require('fs');
const path = require('path');
const schedule = require('node-schedule');
const SalesTax = require("sales-tax");
const { Storage } = require("@google-cloud/storage");
const stream = require('stream');
const nodemailer = require("nodemailer");
var jwt = require('jsonwebtoken');


//SCHEMAS
const customer = "Customer";
const advertiser = "Advertiser";
const qroffer = "QROFFER";
const address = "Address";
const invoice_address = "Invoice_Address";
const invoice = "Invoice";
const stad = "STAD"
const report = "Report";
const i_want_it_stad = "I_Want_It_STAD";
const i_want_it_qroffer = "I_Want_It_QROFFER";
const qroffer_subsubcategorys = "QROFFER_Subsubcategory";
const category = "Category";
const subCategory = "Subcategory";
const subsubCategory = "Subsubcategory";
const opening_hour = "Opening_Hour";
const stad_subsubcategorys = "STAD_Subsubcategory";
const favoriteAddresses = "Favorite_Addresses_Customer";
const favoriteCategorys = "Favorite_Categorys_Customer";
const wallet = "Wallet_Customer";
const worker = "Worker";


const start = async function asyncInvervall() {
    let flag = false;
    setInterval(async () => {
        if (!flag) {
            flag = true;


            let now = DateTime.now().toUTC().toISO().toString();
            ///////////////////////////////QROFFER



            try {
                const findQroffer = await knex(qroffer).where({
                    is_deleted: false,
                    is_archive: false,
                    completely_deleted: false
                })
                    .where('begin', '<=', now)

                    .returning('*');


                if (findQroffer.length !== 0) {

                    for (let i = 0; i < findQroffer.length; i++) {

                        try {
                            const findAddress = await knex(address).where({ id: findQroffer[i].address_id }).returning('*');

                            const timezone = await findAddress[0].timezone[0];


                            let begin = await DateTime.fromJSDate(findQroffer[i].begin, "dd.mm.yyyy - hh:ss").setZone(timezone);
                            let end = await DateTime.fromJSDate(findQroffer[i].end, "dd.mm.yyyy - hh:ss").setZone(timezone);






                            let tzNow = DateTime.now().setZone(timezone);


                            try {
                                const findOpeningHours = await knex(opening_hour)
                                    .where({
                                        address_id: findQroffer[i].address_id
                                    })
                                    .returning('*')


                                let weekListTimeFrom = [];
                                let weekListTimeTo = [];


                                if (tzNow < end) {

                                    for (let j = 0; j < findOpeningHours.length; j++) {

                                        if (findOpeningHours[j].day == tzNow.minus({ days: 1 }).weekday) {

                                            let getFromTime = findOpeningHours[j].time_from;
                                            let fromTime = getFromTime.split(':');
                                            let fromTimeHour = Number(fromTime[0]);
                                            let fromTimeMinute = Number(fromTime[1]);
                                            let timeFromOpeningHour;
                                            if (findOpeningHours[j].day_from == tzNow.weekday) {
                                                timeFromOpeningHour = DateTime.fromObject({ year: tzNow.year, month: tzNow.month, day: tzNow.day, hour: fromTimeHour, minute: fromTimeMinute, }, { zone: tzNow.zoneName });
                                            }
                                            if (findOpeningHours[j].day_from == tzNow.minus({ days: 1 }).weekday) {
                                                timeFromOpeningHour = DateTime.fromObject({ year: tzNow.year, month: tzNow.month, day: tzNow.day, hour: fromTimeHour, minute: fromTimeMinute, }, { zone: tzNow.zoneName }).minus({ days: 1 });
                                            }
                                            let timeToOpeningHour = timeFromOpeningHour.plus({ minutes: findOpeningHours[j].time_to_duration });
                                            weekListTimeFrom.push(timeFromOpeningHour);
                                            weekListTimeTo.push(timeToOpeningHour);
                                        }

                                        if (findOpeningHours[j].day == tzNow.weekday) {

                                            let getFromTime = findOpeningHours[j].time_from;
                                            let fromTime = getFromTime.split(':');
                                            let fromTimeHour = Number(fromTime[0]);
                                            let fromTimeMinute = Number(fromTime[1]);
                                            let timeFromOpeningHour;
                                            if (findOpeningHours[j].day_from == tzNow.weekday) {
                                                timeFromOpeningHour = DateTime.fromObject({ year: tzNow.year, month: tzNow.month, day: tzNow.day, hour: fromTimeHour, minute: fromTimeMinute }, { zone: tzNow.zoneName });
                                            }
                                            if (findOpeningHours[j].day_from == tzNow.plus({ days: 1 }).weekday) {
                                                timeFromOpeningHour = DateTime.fromObject({ year: tzNow.year, month: tzNow.month, day: tzNow.day, hour: fromTimeHour, minute: fromTimeMinute, }, { zone: tzNow.zoneName }).plus({ days: 1 });
                                            }
                                            let timeToOpeningHour = timeFromOpeningHour.plus({ minutes: findOpeningHours[j].time_to_duration });

                                            weekListTimeFrom.push(timeFromOpeningHour);
                                            weekListTimeTo.push(timeToOpeningHour);

                                        }


                                        if (findOpeningHours[j].day == tzNow.plus({ days: 1 }).weekday) {

                                            let getFromTime = findOpeningHours[j].time_from;
                                            let fromTime = getFromTime.split(':');
                                            let fromTimeHour = Number(fromTime[0]);
                                            let fromTimeMinute = Number(fromTime[1]);
                                            let timeFromOpeningHour;
                                            if (findOpeningHours[j].day_from == tzNow.plus({ days: 1 }).weekday) {
                                                timeFromOpeningHour = DateTime.fromObject({ year: tzNow.year, month: tzNow.month, day: tzNow.day, hour: fromTimeHour, minute: fromTimeMinute, }, { zone: tzNow.zoneName }).plus({ days: 1 });
                                            }
                                            if (findOpeningHours[j].day_from == tzNow.plus({ days: 2 }).weekday) {
                                                timeFromOpeningHour = DateTime.fromObject({ year: tzNow.year, month: tzNow.month, day: tzNow.day, hour: fromTimeHour, minute: fromTimeMinute, }, { zone: tzNow.zoneName }).plus({ days: 2 });
                                            }
                                            let timeToOpeningHour = timeFromOpeningHour.plus({ minutes: findOpeningHours[j].time_to_duration });
                                            weekListTimeFrom.push(timeFromOpeningHour);
                                            weekListTimeTo.push(timeToOpeningHour);
                                        }

                                        if (findOpeningHours[j].day == tzNow.plus({ days: 2 }).weekday) {

                                            let getFromTime = findOpeningHours[j].time_from;
                                            let fromTime = getFromTime.split(':');
                                            let fromTimeHour = Number(fromTime[0]);
                                            let fromTimeMinute = Number(fromTime[1]);
                                            let timeFromOpeningHour;
                                            if (findOpeningHours[j].day_from == tzNow.plus({ days: 2 }).weekday) {
                                                timeFromOpeningHour = DateTime.fromObject({ year: tzNow.year, month: tzNow.month, day: tzNow.day, hour: fromTimeHour, minute: fromTimeMinute, }, { zone: tzNow.zoneName }).plus({ days: 2 });
                                            }
                                            if (findOpeningHours[j].day_from == tzNow.plus({ days: 3 }).weekday) {
                                                timeFromOpeningHour = DateTime.fromObject({ year: tzNow.year, month: tzNow.month, day: tzNow.day, hour: fromTimeHour, minute: fromTimeMinute, }, { zone: tzNow.zoneName }).plus({ days: 3 });
                                            }
                                            let timeToOpeningHour = timeFromOpeningHour.plus({ minutes: findOpeningHours[j].time_to_duration });
                                            weekListTimeFrom.push(timeFromOpeningHour);
                                            weekListTimeTo.push(timeToOpeningHour);
                                        }

                                        if (findOpeningHours[j].day == tzNow.plus({ days: 3 }).weekday) {

                                            let getFromTime = findOpeningHours[j].time_from;
                                            let fromTime = getFromTime.split(':');
                                            let fromTimeHour = Number(fromTime[0]);
                                            let fromTimeMinute = Number(fromTime[1]);
                                            let timeFromOpeningHour;
                                            if (findOpeningHours[j].day_from == tzNow.plus({ days: 3 }).weekday) {
                                                timeFromOpeningHour = DateTime.fromObject({ year: tzNow.year, month: tzNow.month, day: tzNow.day, hour: fromTimeHour, minute: fromTimeMinute, }, { zone: tzNow.zoneName }).plus({ days: 3 });
                                            }
                                            if (findOpeningHours[j].day_from == tzNow.plus({ days: 4 }).weekday) {
                                                timeFromOpeningHour = DateTime.fromObject({ year: tzNow.year, month: tzNow.month, day: tzNow.day, hour: fromTimeHour, minute: fromTimeMinute, }, { zone: tzNow.zoneName }).plus({ days: 4 });
                                            }
                                            let timeToOpeningHour = timeFromOpeningHour.plus({ minutes: findOpeningHours[j].time_to_duration });
                                            weekListTimeFrom.push(timeFromOpeningHour);
                                            weekListTimeTo.push(timeToOpeningHour);
                                        }

                                        if (findOpeningHours[j].day == tzNow.plus({ days: 4 }).weekday) {

                                            let getFromTime = findOpeningHours[j].time_from;
                                            let fromTime = getFromTime.split(':');
                                            let fromTimeHour = Number(fromTime[0]);
                                            let fromTimeMinute = Number(fromTime[1]);
                                            let timeFromOpeningHour;
                                            if (findOpeningHours[j].day_from == tzNow.plus({ days: 4 }).weekday) {
                                                timeFromOpeningHour = DateTime.fromObject({ year: tzNow.year, month: tzNow.month, day: tzNow.day, hour: fromTimeHour, minute: fromTimeMinute, }, { zone: tzNow.zoneName }).plus({ days: 4 });
                                            }
                                            if (findOpeningHours[j].day_from == tzNow.plus({ days: 5 }).weekday) {
                                                timeFromOpeningHour = DateTime.fromObject({ year: tzNow.year, month: tzNow.month, day: tzNow.day, hour: fromTimeHour, minute: fromTimeMinute, }, { zone: tzNow.zoneName }).plus({ days: 5 });
                                            }
                                            let timeToOpeningHour = timeFromOpeningHour.plus({ minutes: findOpeningHours[j].time_to_duration });
                                            weekListTimeFrom.push(timeFromOpeningHour);
                                            weekListTimeTo.push(timeToOpeningHour);
                                        }

                                        if (findOpeningHours[j].day == tzNow.plus({ days: 5 }).weekday) {

                                            let getFromTime = findOpeningHours[j].time_from;
                                            let fromTime = getFromTime.split(':');
                                            let fromTimeHour = Number(fromTime[0]);
                                            let fromTimeMinute = Number(fromTime[1]);
                                            let timeFromOpeningHour;
                                            if (findOpeningHours[j].day_from == tzNow.plus({ days: 5 }).weekday) {
                                                timeFromOpeningHour = DateTime.fromObject({ year: tzNow.year, month: tzNow.month, day: tzNow.day, hour: fromTimeHour, minute: fromTimeMinute, }, { zone: tzNow.zoneName }).plus({ days: 5 });
                                            }
                                            if (findOpeningHours[j].day_from == tzNow.plus({ days: 6 }).weekday) {
                                                timeFromOpeningHour = DateTime.fromObject({ year: tzNow.year, month: tzNow.month, day: tzNow.day, hour: fromTimeHour, minute: fromTimeMinute, }, { zone: tzNow.zoneName }).plus({ days: 6 });
                                            }
                                            let timeToOpeningHour = timeFromOpeningHour.plus({ minutes: findOpeningHours[j].time_to_duration });
                                            weekListTimeFrom.push(timeFromOpeningHour);
                                            weekListTimeTo.push(timeToOpeningHour);
                                        }

                                        if (findOpeningHours[j].day == tzNow.plus({ days: 6 }).weekday) {

                                            let getFromTime = findOpeningHours[j].time_from;
                                            let fromTime = getFromTime.split(':');
                                            let fromTimeHour = Number(fromTime[0]);
                                            let fromTimeMinute = Number(fromTime[1]);
                                            let timeFromOpeningHour;
                                            if (findOpeningHours[j].day_from == tzNow.plus({ days: 6 }).weekday) {
                                                timeFromOpeningHour = DateTime.fromObject({ year: tzNow.year, month: tzNow.month, day: tzNow.day, hour: fromTimeHour, minute: fromTimeMinute, }, { zone: tzNow.zoneName }).plus({ days: 6 });
                                            }
                                            if (findOpeningHours[j].day_from == tzNow.plus({ days: 7 }).weekday) {
                                                timeFromOpeningHour = DateTime.fromObject({ year: tzNow.year, month: tzNow.month, day: tzNow.day, hour: fromTimeHour, minute: fromTimeMinute, }, { zone: tzNow.zoneName }).plus({ days: 7 });
                                            }
                                            let timeToOpeningHour = timeFromOpeningHour.plus({ minutes: findOpeningHours[j].time_to_duration });
                                            weekListTimeFrom.push(timeFromOpeningHour);
                                            weekListTimeTo.push(timeToOpeningHour);
                                        }

                                        if (findOpeningHours[j].day == tzNow.plus({ days: 7 }).weekday) {

                                            let getFromTime = findOpeningHours[j].time_from;
                                            let fromTime = getFromTime.split(':');
                                            let fromTimeHour = Number(fromTime[0]);
                                            let fromTimeMinute = Number(fromTime[1]);
                                            let timeFromOpeningHour;
                                            if (findOpeningHours[j].day_from == tzNow.plus({ days: 7 }).weekday) {
                                                timeFromOpeningHour = DateTime.fromObject({ year: tzNow.year, month: tzNow.month, day: tzNow.day, hour: fromTimeHour, minute: fromTimeMinute, }, { zone: tzNow.zoneName }).plus({ days: 7 });
                                            }
                                            if (findOpeningHours[j].day_from == tzNow.plus({ days: 8 }).weekday) {
                                                timeFromOpeningHour = DateTime.fromObject({ year: tzNow.year, month: tzNow.month, day: tzNow.day, hour: fromTimeHour, minute: fromTimeMinute, }, { zone: tzNow.zoneName }).plus({ days: 8 });
                                            }
                                            let timeToOpeningHour = timeFromOpeningHour.plus({ minutes: findOpeningHours[j].time_to_duration });
                                            weekListTimeFrom.push(timeFromOpeningHour);
                                            weekListTimeTo.push(timeToOpeningHour);
                                        }

                                    }

                                    weekListTimeFrom.sort((a, b) => a - b);
                                    weekListTimeTo.sort((a, b) => a - b);

                                    let disabledDatesFrom = [];
                                    let disabledDatesTo = [];


                                    for (let k = 0; k < weekListTimeFrom.length; k++) {
                                        const from = weekListTimeTo[k];
                                        const to = weekListTimeFrom[k + 1];
                                        if (k != weekListTimeFrom.length - 1) {
                                            disabledDatesFrom.push(from);
                                            disabledDatesTo.push(to);

                                        }

                                    }

                                    disabledDatesFrom.sort((a, b) => a - b);
                                    disabledDatesTo.sort((a, b) => a - b);


                                    //OPEN/Start

                                    for (let l = 0; l < weekListTimeFrom.length; l++) {
                                        const openFrom = weekListTimeFrom[l];
                                        const openTo = weekListTimeTo[l];


                                        if (tzNow >= openFrom && tzNow <= openTo) {

                                            if (findQroffer[i].started) {
                                                if (!findQroffer[i].is_active) {
                                                    try {
                                                        await knex(qroffer).where({
                                                            id: findQroffer[i].id
                                                        }).update({
                                                            is_active: true,
                                                            is_paused: false,
                                                        });
                                                    } catch (e) {
                                                        throw new Error(e);
                                                    }
                                                }
                                            } else {
                                                if (!findQroffer[i].is_active) {
                                                    try {
                                                        await knex(address).where({
                                                            id: findQroffer[i].address_id
                                                        }).update({
                                                            active_qroffer: true,
                                                            active_qroffer_value: !findQroffer[i].started ? findAddress[0].active_qroffer_value + 1 : findAddress[0].active_qroffer_value,
                                                        });
                                                    } catch (e) {
                                                        throw new Error(e);
                                                    }

                                                    try {
                                                        await knex(qroffer).where({
                                                            id: findQroffer[i].id
                                                        }).update({
                                                            is_active: true,
                                                            is_paused: false,
                                                            started: true,
                                                        });
                                                    } catch (e) {
                                                        throw new Error(e);
                                                    }
                                                }
                                            }
                                        }
                                    }



                                    //CLOSE/Stop/Disable

                                    for (let m = 0; m < disabledDatesFrom.length; m++) {
                                        const disabledFrom = disabledDatesFrom[m];
                                        const disabledTo = disabledDatesTo[m];

                                        if (tzNow > disabledFrom && tzNow < disabledTo) {
                                            //catch an invalid date error!
                                            if (end > disabledFrom && end <= disabledTo) {
                                                if (findQroffer[i].is_active) {
                                                    if (findAddress[0].active_qroffer_value > 0) {
                                                        try {

                                                            await knex(address).where({
                                                                id: findQroffer[i].address_id
                                                            }).update({
                                                                active_qroffer_value: findAddress[0].active_qroffer_value - 1
                                                            });
                                                        } catch (e) {
                                                            throw new Error(e);
                                                        }
                                                    }
                                                    const queryAddress = await knex(address)
                                                        .where({
                                                            id: findQroffer[i].address_id
                                                        })
                                                        .returning('*');
                                                    if (queryAddress[0].active_qroffer_value == 0) {
                                                        try {
                                                            await knex(address).where({
                                                                id: findQroffer[i].address_id
                                                            }).update({
                                                                active_qroffer: false,
                                                            });
                                                        } catch (error) {
                                                            throw new Error(error);
                                                        }
                                                    }
                                                    try {
                                                        await knex(qroffer).where({
                                                            id: findQroffer[i].id
                                                        }).update({
                                                            is_deleted: true,
                                                            is_active: false,
                                                        });
                                                    } catch (e) {
                                                        throw new Error(e);
                                                    }

                                                    if (findQroffer[i].short_description == findAddress[0].qroffer_short_description) {

                                                        try {
                                                            const findActiveQroffer = await knex(qroffer).where({
                                                                address_id: findAddress[0].id,
                                                                advertiser_id: findQroffer[i].advertiser_id,
                                                                is_deleted: false,
                                                                is_active: true,
                                                            }).orderBy('created_at', 'desc')
                                                                .returning('*');


                                                            if (findActiveQroffer.length !== 0) {
                                                                try {
                                                                    await knex(address).where({
                                                                        id: findQroffer[i].address_id
                                                                    }).update({
                                                                        qroffer_short_description: findActiveQroffer[0].short_description,
                                                                    });
                                                                } catch (e) {
                                                                    throw new Error(e);
                                                                }
                                                            } else {
                                                                try {
                                                                    await knex(address).where({
                                                                        id: findQroffer[i].address_id
                                                                    }).update({
                                                                        qroffer_short_description: null,
                                                                    });
                                                                } catch (e) {
                                                                    throw new Error(e);
                                                                }
                                                            }
                                                        } catch (error) {
                                                            console.log(error);
                                                        }
                                                    }
                                                }
                                            }
                                            if (end > disabledFrom && end > disabledTo) {
                                                try {
                                                    await knex(qroffer).where({
                                                        id: findQroffer[i].id
                                                    }).update({
                                                        is_active: false,
                                                        is_paused: true,
                                                    });
                                                } catch (e) {
                                                    throw new Error(e);
                                                }
                                            }
                                        }
                                    }

                                } else {
                                    if (findQroffer[i]) {
                                        if (findAddress[0].active_qroffer_value > 0) {
                                            try {

                                                await knex(address).where({
                                                    id: findAddress[0].id
                                                }).update({
                                                    active_qroffer_value: findAddress[0].active_qroffer_value - 1
                                                });
                                            } catch (e) {
                                                throw new Error(e);
                                            }
                                        }
                                        const queryAddress = await knex(address)
                                            .where({
                                                id: findQroffer[i].address_id
                                            })
                                            .returning('*');
                                        if (queryAddress[0].active_qroffer_value == 0) {
                                            try {
                                                await knex(address).where({
                                                    id: findAddress[0].id
                                                }).update({
                                                    active_qroffer: false,
                                                });
                                            } catch (error) {
                                                throw new Error(error);
                                            }
                                        }
                                        try {
                                            await knex(qroffer).where({
                                                id: findQroffer[i].id
                                            }).update({
                                                is_deleted: true,
                                                is_active: false,
                                            });
                                        } catch (e) {
                                            throw new Error(e);
                                        }

                                        if (findQroffer[i].short_description == findAddress[0].qroffer_short_description) {

                                            try {
                                                const findActiveQroffer = await knex(qroffer).where({
                                                    address_id: findAddress[0].id,
                                                    advertiser_id: findQroffer[i].advertiser_id,
                                                    is_deleted: false,
                                                    is_active: true,
                                                }).orderBy('created_at', 'desc')
                                                    .returning('*');

                                                if (findActiveQroffer.length !== 0) {
                                                    try {
                                                        await knex(address).where({
                                                            id: findQroffer[i].address_id
                                                        }).update({
                                                            qroffer_short_description: findActiveQroffer[0].short_description,
                                                        });
                                                    } catch (e) {
                                                        throw new Error(e);
                                                    }
                                                } else {
                                                    try {
                                                        await knex(address).where({
                                                            id: findQroffer[i].address_id
                                                        }).update({
                                                            qroffer_short_description: null,
                                                        });
                                                    } catch (e) {
                                                        throw new Error(e);
                                                    }
                                                }
                                            } catch (error) {
                                                console.log(error);
                                            }
                                        }
                                    }
                                }
                            } catch (error) {
                                console.log(error);
                            }
                        } catch (error) {
                            console.log(error);
                        }
                    }
                }

                flag = false;
            } catch (error) {
                console.log(error);
            }
        }
    }, 333);
}

module.exports = {
    start
}