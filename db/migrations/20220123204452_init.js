const { DateTime } = require("luxon");
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('Advertiser', table => {
        table.uuid('id').defaultTo(knex.raw('gen_random_uuid()')).primary();
        table.integer("sevdesk_id");
        table.string("gender");
        table.string("firstname");
        table.string("lastname");
        table.string('email').notNullable().unique();
        table.string('password').notNullable();
        table.string("company_name");
        table.string("company_street");
        table.string("company_postcode");
        table.string("company_city");
        table.string("company_country");
        table.double("company_latitude");
        table.double("company_longitude");
        table.string("phone");
        table.boolean('official').notNullable().defaultTo(false);
        table.boolean('terms_accepted').notNullable().defaultTo(false);
        table.date("birth_date");
        table.string("tax_id");
        table.string("company_registration_number");
        table.string("iban");
        table.string("bic");
        table.boolean("show_popup").notNullable().defaultTo(true);
        table.boolean("is_online").notNullable().defaultTo(true);
        table.boolean("is_active").defaultTo(true);
        table.boolean("is_deleted").defaultTo(false);
        table.boolean("is_banned").defaultTo(false);
        table.boolean("email_confirmed").defaultTo(false);
        table.boolean("autoplay").defaultTo(true);
        table.string('provider').notNullable().defaultTo('Local');
        table.string('provider_id');
        table.string("others");
        table.uuid("last_update_from_user_id");
        table.timestamps(true, true);
    })

        .createTable("Customer", table => {
            table.uuid('id').defaultTo(knex.raw('gen_random_uuid()')).notNullable().primary();
            table.string("gender");
            table.string("firstname");
            table.string("lastname");
            table.string('email').notNullable().unique();
            table.string('password').notNullable();
            table.double('latitude');
            table.double('longitude');
            table.boolean("is_online").notNullable().defaultTo(true);
            table.boolean("is_active").defaultTo(true);
            table.boolean("is_deleted").defaultTo(false);
            table.boolean("is_banned").defaultTo(false);
            table.boolean("email_confirmed").defaultTo(false);
            table.double('display_radius');
            table.double('push_notification_radius');
            table.boolean("autoplay").defaultTo(true);
            table.boolean('terms_accepted').notNullable().defaultTo(false);
            table.datetime('family_flatrate_stad').notNullable().defaultTo(DateTime.now().plus({ days: 30, minutes: 30 }).toUTC().toISO());
            table.datetime('family_flatrate_qroffer').notNullable().defaultTo(DateTime.now().plus({ days: 30, minutes: 30 }).toUTC().toISO());
            table.string('provider').notNullable().defaultTo('local');
            table.string('provider_id');
            table.string("others");
            table.uuid('last_update_from_user_id');
            table.timestamps(true, true);
        })

        .createTable('Advertiser_Employee', table => {
            table.uuid('id').defaultTo(knex.raw('gen_random_uuid()')).primary();
            table.string("gender")
            table.string('permission');
            table.string('email').notNullable();
            table.string('password').notNullable();
            table.string("firstname")
            table.string("lastname");
            table.string("phone");
            table.date("birth_date");
            table.string("tax_id");
            table.string("company_registration_number");
            table.string("iban");
            table.string("bic");
            table.boolean("autoplay").defaultTo(true);
            table.boolean("is_active").defaultTo(true);
            table.boolean("is_deleted").defaultTo(false);
            table.boolean("is_banned").defaultTo(false);
            table.boolean("email_confirmed").defaultTo(false);
            table.string("others");
            table.uuid('advertiser_id').references('id').inTable('Advertiser').onUpdate('CASCADE').onDelete('CASCADE').notNullable();
            table.uuid("last_update_from_user_id");
            table.timestamps(true, true);
        })

        .createTable("Category", table => {
            table.uuid('id').defaultTo(knex.raw('gen_random_uuid()')).notNullable().primary();
            table.string('name').notNullable().unique();
            table.string('color').notNullable().unique();
            table.boolean('is_active').notNullable().defaultTo(false);
            table.boolean('is_deleted').notNullable().defaultTo(false);
            table.string('others');
            table.uuid('last_update_from_user_id');
            table.timestamps(true, true);
        })

        .createTable("Subcategory", table => {
            table.uuid('id').defaultTo(knex.raw('gen_random_uuid()')).notNullable().primary();
            table.string('name').notNullable();
            table.string('color');
            table.boolean('must_pick_subsubcategory').notNullable().defaultTo(false);
            table.boolean('is_active').notNullable().defaultTo(false);
            table.boolean('is_deleted').notNullable().defaultTo(false);
            table.string('others');
            table.uuid('last_update_from_user_id');
            table.uuid('category_id').references('id').inTable('Category').onUpdate('CASCADE').onDelete('CASCADE').notNullable();
            table.timestamps(true, true);
        })

        .createTable("Subsubcategory", table => {
            table.uuid('id').defaultTo(knex.raw('gen_random_uuid()')).notNullable().primary();
            table.string('name').notNullable();
            table.string('color');
            table.boolean('is_active').notNullable().defaultTo(false);
            table.boolean('is_deleted').notNullable().defaultTo(false);
            table.string('others');
            table.uuid('last_update_from_user_id');
            table.uuid('category_id').references('id').inTable('Category').onUpdate('CASCADE').onDelete('CASCADE').notNullable();
            table.uuid('subcategory_id').references('id').inTable('Subcategory').onUpdate('CASCADE').onDelete('CASCADE').notNullable();
            table.timestamps(true, true);
        })

        .createTable("Address", table => {
            table.uuid('id').defaultTo(knex.raw('gen_random_uuid()')).notNullable().primary();
            table.string("company_name");
            table.string("name");
            table.double("latitude").notNullable();
            table.double('longitude').notNullable();
            table.string('street').notNullable();
            table.string('postcode');
            table.string('city').notNullable();
            table.string('country').notNullable();
            table.string('floor');
            table.specificType('timezone', 'CHARACTER VARYING[]').notNullable();
            table.string('country_code').notNullable();
            table.specificType('media', 'CHARACTER VARYING[]').notNullable();
            table.datetime('family_flatrate_stad').notNullable().defaultTo(DateTime.now().plus({ days: 30, minutes: 30 }).toUTC().toISO());
            table.datetime('family_flatrate_qroffer').notNullable().defaultTo(DateTime.now().plus({ days: 30, minutes: 30 }).toUTC().toISO());
            table.boolean('official').notNullable().defaultTo(false);
            table.string('homepage', 600);
            table.string('facebook');
            table.string('instagram');
            table.string('youtube');
            table.string('pinterest');
            table.string('google_my_business', 600);
            table.string('tiktok', 600);
            table.string('phone', 120);
            table.string("iban");
            table.string("vat");
            table.boolean('is_active').notNullable().defaultTo(false);
            table.boolean('is_deleted').notNullable().defaultTo(false);
            table.boolean('active_stad').notNullable().defaultTo(false);
            table.boolean('active_qroffer').notNullable().defaultTo(false);
            table.integer('active_qroffer_value').notNullable().defaultTo(0).unsigned();
            table.string('qroffer_short_description');
            table.string('others');
            table.uuid('last_update_from_user_id');
            table.uuid('advertiser_id').references('id').inTable('Advertiser').onUpdate('CASCADE').onDelete('CASCADE').notNullable();
            table.uuid('category_id').references('id').inTable('Category').onUpdate('CASCADE').notNullable();
            table.uuid('subcategory_id').references('id').inTable('Subcategory').onUpdate('CASCADE').notNullable();
            table.uuid('subsubcategory_id').references('id').inTable('Subsubcategory').onUpdate('CASCADE').nullable();
            //INVOICE ID
            table.timestamps(true, true);
        })

        .createTable("Invoice_Address", table => {
            table.uuid('id').defaultTo(knex.raw('gen_random_uuid()')).notNullable().primary();
            table.string("company_name");
            table.string("name");
            table.string("gender").notNullable();
            table.string("firstname").notNullable();
            table.string("lastname").notNullable();
            table.string("email").notNullable();
            table.double("latitude").notNullable();
            table.double('longitude').notNullable();
            table.string('street').notNullable();
            table.string('postcode');
            table.string('city').notNullable();
            table.string('country').notNullable();
            table.string('floor');
            table.specificType('timezone', 'CHARACTER VARYING[]').notNullable();
            table.string('country_code').notNullable();
            table.datetime('family_flatrate_to_stad');
            table.datetime('family_flatrate_to_qroffer');
            table.string("vat");
            table.string('phone', 120);
            table.boolean('is_deleted').notNullable().defaultTo(false);
            table.boolean('want_letter').notNullable().defaultTo(false);
            table.boolean('want_email').notNullable().defaultTo(true);
            table.string('others');
            table.uuid('last_update_from_user_id');
            table.uuid('address_id').references('id').inTable('Address').notNullable().onUpdate('CASCADE').onDelete('CASCADE');
            table.uuid('advertiser_id').references('id').inTable('Advertiser').notNullable().onUpdate('CASCADE').onDelete('CASCADE');
            table.timestamps(true, true);
        })

        .createTable("Invoice", table => {
            table.uuid('id').defaultTo(knex.raw('gen_random_uuid()')).notNullable().primary();
            table.bigInteger('invoicenumber').notNullable();
            table.string("company_name");
            table.string("gender").notNullable();
            table.string("firstname").notNullable();
            table.string("lastname").notNullable();
            table.string("email").notNullable();
            table.double("latitude");
            table.double('longitude');
            table.string('street').notNullable();
            table.string('postcode');
            table.string('city').notNullable();
            table.string('country').notNullable();
            table.boolean('is_done');
            table.boolean('is_deleted').notNullable().defaultTo(false);
            table.string('others');
            table.uuid('last_update_from_user_id');
            table.uuid('address_id').references('id').inTable('Address').notNullable();
            table.uuid('invoice_address_id').references('id').inTable('Invoice_Address').notNullable().onUpdate('CASCADE');
            table.uuid('advertiser_id').references('id').inTable('Advertiser').notNullable().onUpdate('CASCADE');
            table.timestamps(true, true);
        })

        .alterTable('Address', table => {
            table.uuid('invoice_address_id').references('id').inTable('Invoice_Address').nullable().onUpdate('CASCADE');
        })

        .createTable("STAD", table => {
            table.uuid('id').defaultTo(knex.raw('gen_random_uuid()')).notNullable().primary();
            table.string('title');
            table.double('latitude').notNullable();
            table.double('longitude').notNullable();
            table.string('short_description').notNullable();
            table.string('long_description', 1000);
            table.decimal('price', null).notNullable();
            table.decimal('tax_price', null).nullable();
            table.decimal('gross', null).nullable();
            table.string('type', 33).notNullable().defaultTo('STAD')
            table.specificType('media', 'CHARACTER VARYING[]').notNullable();
            table.datetime('begin').nullable();
            table.datetime('end').nullable();
            table.integer('duration').nullable();
            table.double('display_radius').notNullable();
            table.double('push_notification_radius').notNullable();
            table.boolean('is_active').notNullable().defaultTo(false);
            table.boolean('is_paused').notNullable().defaultTo(false);
            table.boolean('is_banned').notNullable().defaultTo(false);
            table.boolean('is_deleted').notNullable().defaultTo(false);
            table.boolean('is_archive').notNullable().defaultTo(false);
            table.boolean('completely_deleted').notNullable().defaultTo(false);
            table.boolean('in_invoice').notNullable().defaultTo(false);
            table.datetime('invoice_date');
            table.string('others');
            table.uuid('last_update_from_user_id');
            table.uuid('address_id').references('id').inTable('Address').onUpdate('CASCADE').onDelete('CASCADE').notNullable();
            table.uuid('advertiser_id').references('id').inTable('Advertiser').onUpdate('CASCADE').onDelete('CASCADE').notNullable();
            table.uuid('category_id').references('id').inTable('Category').onUpdate('CASCADE').notNullable();
            table.uuid('subcategory_id').references('id').inTable('Subcategory').onUpdate('CASCADE').notNullable();
            table.uuid('invoice_address_id').references('id').inTable('Invoice_Address').onUpdate('CASCADE').notNullable();
            table.uuid('invoice_id').references('id').inTable('Invoice').onUpdate('CASCADE').nullable();
            table.timestamps(true, true);
        })

        .createTable("QROFFER", table => {
            table.uuid('id').defaultTo(knex.raw('gen_random_uuid()')).notNullable().primary();
            table.string('title');
            table.double('latitude').notNullable();
            table.double('longitude').notNullable();
            table.string('short_description').notNullable();
            table.string('long_description', 1000);
            table.decimal('price', null).notNullable();
            table.decimal('tax_price', null).nullable();
            table.decimal('gross', null).nullable();
            table.string('type', 33).notNullable().defaultTo('QROFFER');
            table.specificType('media', 'CHARACTER VARYING[]');
            table.datetime('begin');
            table.datetime('end');
            table.integer('duration').nullable();
            table.datetime('expiry_date');
            table.double('display_radius').notNullable();
            table.double('push_notification_radius').notNullable();
            table.boolean('started').notNullable().defaultTo(false);
            table.boolean('is_active').notNullable().defaultTo(false);
            table.boolean('is_paused').notNullable().defaultTo(false);
            table.boolean('is_banned').notNullable().defaultTo(false);
            table.boolean('is_deleted').notNullable().defaultTo(false);
            table.boolean('is_archive').notNullable().defaultTo(false);
            table.boolean('completely_deleted').notNullable().defaultTo(false);
            table.integer('live_qr_value').notNullable().unsigned().defaultTo(0);
            table.integer('qr_value').notNullable().unsigned();
            table.integer('redeemed_qr_value').notNullable().unsigned().defaultTo(0);
            table.boolean('is_expired').notNullable().defaultTo(false);
            table.boolean('in_invoice').notNullable().defaultTo(false);
            table.datetime('invoice_date');
            table.string('others');
            table.uuid('last_update_from_user_id');
            table.uuid('address_id').references('id').inTable('Address').onUpdate('CASCADE').onDelete('CASCADE').notNullable();
            table.uuid('advertiser_id').references('id').inTable('Advertiser').onUpdate('CASCADE').onDelete('CASCADE').notNullable();
            table.uuid('category_id').references('id').inTable('Category').onUpdate('CASCADE').notNullable();
            table.uuid('subcategory_id').references('id').inTable('Subcategory').onUpdate('CASCADE').notNullable();
            table.uuid('invoice_address_id').references('id').inTable('Invoice_Address').onUpdate('CASCADE').notNullable();
            table.uuid('invoice_id').references('id').inTable('Invoice').onUpdate('CASCADE').nullable();
            table.timestamps(true, true);
        })

        .createTable("STAD_Subsubcategory", table => {
            table.uuid('id').defaultTo(knex.raw('gen_random_uuid()')).notNullable().primary();
            table.uuid('stad_id').references('id').inTable('STAD').onUpdate('CASCADE').onDelete('CASCADE').notNullable();
            table.uuid('subsubcategory_id').references('id').inTable('Subsubcategory').onUpdate('CASCADE').notNullable();
            table.boolean('is_active').notNullable().defaultTo(false);
            table.boolean('is_banned').notNullable().defaultTo(false);
            table.boolean('is_deleted').notNullable().defaultTo(false);
            table.boolean('is_archive').notNullable().defaultTo(false);
            table.string('others');
            table.uuid('last_update_from_user_id');
            table.timestamps(true, true);
        })

        .createTable("QROFFER_Subsubcategory", table => {
            table.uuid('id').defaultTo(knex.raw('gen_random_uuid()')).notNullable().primary();
            table.uuid('qroffer_id').references('id').inTable('QROFFER').onUpdate('CASCADE').onDelete('CASCADE').notNullable();
            table.uuid('subsubcategory_id').references('id').inTable('Subsubcategory').onUpdate('CASCADE').notNullable();
            table.boolean('is_active').notNullable().defaultTo(false);
            table.boolean('is_banned').notNullable().defaultTo(false);
            table.boolean('is_deleted').notNullable().defaultTo(false);
            table.boolean('is_archive').notNullable().defaultTo(false);
            table.string('others');
            table.uuid('last_update_from_user_id');
            table.timestamps(true, true);
        })

        .createTable("STAD_Notification", table => {
            table.uuid('id').defaultTo(knex.raw('gen_random_uuid()')).notNullable().primary();
            table.uuid('stad_id').references('id').inTable('STAD').onUpdate('CASCADE').onDelete('CASCADE').notNullable();
            table.uuid('customer_id').references('id').inTable('Customer').onUpdate('CASCADE').onDelete('CASCADE').notNullable();
            table.string('others');
            table.uuid('last_update_from_user_id');
            table.timestamps(true, true);
        })

        .createTable("QROFFER_Notification", table => {
            table.uuid('id').defaultTo(knex.raw('gen_random_uuid()')).notNullable().primary();
            table.uuid('qroffer_id').references('id').inTable('QROFFER').onUpdate('CASCADE').onDelete('CASCADE').notNullable();
            table.uuid('customer_id').references('id').inTable('Customer').onUpdate('CASCADE').onDelete('CASCADE').notNullable();
            table.string('others');
            table.uuid('last_update_from_user_id');
            table.timestamps(true, true);
        })

        .createTable("Report", table => {
            table.uuid('id').defaultTo(knex.raw('gen_random_uuid()')).notNullable().primary();
            table.string('reason').notNullable();
            table.boolean('is_done').notNullable().defaultTo(false);
            table.boolean('advertiser_is_banned').notNullable().defaultTo(false);
            table.boolean('customer_is_banned').notNullable().defaultTo(false);
            table.string('declaration_nn_team', 999);
            table.uuid('qroffer_id').references('id').inTable('QROFFER').onUpdate('CASCADE').nullable();
            table.uuid('stad_id').references('id').inTable('STAD').onUpdate('CASCADE').nullable();
            table.uuid('advertiser_id').references('id').inTable('Advertiser').onUpdate('CASCADE').notNullable();
            table.uuid('customer').references('id').inTable('Customer').onUpdate('CASCADE').notNullable();
            table.boolean('is_deleted').notNullable().defaultTo(false);
            table.string('others');
            table.uuid('last_update_from_user_id');
            table.timestamps(true, true);
        })

        .createTable("Wallet_Customer", table => {
            table.uuid('id').defaultTo(knex.raw('gen_random_uuid()')).notNullable().primary();
            table.uuid('qroffer_id').references('id').inTable('QROFFER').onUpdate('CASCADE').onDelete('CASCADE').notNullable();
            table.uuid('customer_id').references('id').inTable('Customer').onUpdate('CASCADE').onDelete('CASCADE').notNullable();
            table.boolean('redeemed').notNullable().defaultTo(false);
            table.boolean('notified').notNullable().defaultTo(false);
            table.boolean('notify').notNullable().defaultTo(true);
            table.datetime('expiry_date').notNullable();
            table.boolean('is_expired').notNullable().defaultTo(false);
            table.boolean('is_deleted_customer').notNullable().defaultTo(false);
            table.boolean('is_deleted_advertiser').notNullable().defaultTo(false);
            table.uuid('advertiser_id').references('id').inTable('Advertiser').onUpdate('CASCADE').onDelete('CASCADE').notNullable();
            table.uuid('address_id').references('id').inTable('Address').onUpdate('CASCADE').onDelete('CASCADE').notNullable();
            table.boolean('is_deleted').notNullable().defaultTo(false);
            table.string('others');
            table.uuid('last_update_from_user_id');
            table.timestamps(true, true);
        })

        .createTable("Employee_Addresses", table => {
            table.uuid('id').defaultTo(knex.raw('gen_random_uuid()')).notNullable().primary();
            table.uuid('address_id').references('id').inTable('Address').onUpdate('CASCADE').onDelete('CASCADE').notNullable();
            table.uuid('employee_id').references('id').inTable('Advertiser_Employee').onUpdate('CASCADE').onDelete('CASCADE').notNullable();
            table.boolean('is_deleted').notNullable().defaultTo(false);
            table.string('others');
            table.uuid('advertiser_id').references('id').inTable('Advertiser').onUpdate('CASCADE').onDelete('CASCADE').notNullable();
            table.uuid('last_update_from_user_id');
            table.timestamps(true, true);
        })

        .createTable("Favorite_Addresses_Customer", table => {
            table.uuid('id').defaultTo(knex.raw('gen_random_uuid()')).notNullable().primary();
            table.uuid('address_id').references('id').inTable('Address').onUpdate('CASCADE').onDelete('CASCADE');
            table.uuid('customer_id').references('id').inTable('Customer').onUpdate('CASCADE').onDelete('CASCADE');
            table.boolean('is_deleted').notNullable().defaultTo(false);
            table.string('others');
            table.uuid('last_update_from_user_id');
            table.timestamps(true, true);
        })

        .createTable("Favorite_Advertiser_Customer", table => {
            table.uuid('id').defaultTo(knex.raw('gen_random_uuid()')).notNullable().primary();
            table.uuid('advertiser_id').references('id').inTable('Advertiser').onUpdate('CASCADE').onDelete('CASCADE');
            table.uuid('customer_id').references('id').inTable('Customer').onUpdate('CASCADE').onDelete('CASCADE');
            table.boolean('is_deleted').notNullable().defaultTo(false);
            table.string('others');
            table.uuid('last_update_from_user_id');
            table.timestamps(true, true);
        })

        .createTable("Favorite_Categorys_Customer", table => {
            table.uuid('id').defaultTo(knex.raw('gen_random_uuid()')).notNullable().primary();
            table.uuid('subsubcategory_id').references('id').inTable('Subsubcategory').onUpdate('CASCADE').onDelete('CASCADE');
            table.uuid('subcategory_id').references('id').inTable('Subcategory').onUpdate('CASCADE').onDelete('CASCADE');
            table.uuid('category_id').references('id').inTable('Category').onUpdate('CASCADE').onDelete('CASCADE');
            table.uuid('customer_id').references('id').inTable('Customer').onUpdate('CASCADE').onDelete('CASCADE');
            table.boolean('is_deleted').notNullable().defaultTo(false);
            table.string('others');
            table.uuid('last_update_from_user_id');
            table.timestamps(true, true);
        })

        .createTable("Geofence", table => {
            table.uuid('identifier').notNullable().primary();
            table.double('radius').notNullable();
            table.double('latitude').notNullable();
            table.double('longitude').notNullable();
            table.boolean('notify_on_entry').notNullable().defaultTo(true);
            table.boolean('notify_on_exit').notNullable().defaultTo(false);
            table.boolean('notify_on_dwell').notNullable().defaultTo(true);
            table.integer('loiteringDelay');
            table.boolean('is_deleted').notNullable().defaultTo(false);
            table.timestamps(true, true);
        })

        .createTable("I_Want_It_QROFFER", table => {
            table.uuid('id').defaultTo(knex.raw('gen_random_uuid()')).notNullable().primary();
            table.uuid('qroffer_id').references('id').inTable('QROFFER').onUpdate('CASCADE').onDelete('CASCADE');
            table.uuid('customer_id').references('id').inTable('Customer').onUpdate('CASCADE').onDelete('CASCADE');
            table.boolean('is_deleted').notNullable().defaultTo(false);
            table.string('others');
            table.uuid('last_update_from_user_id');
            table.timestamps(true, true);
        })

        .createTable("I_Want_It_STAD", table => {
            table.uuid('id').defaultTo(knex.raw('gen_random_uuid()')).notNullable().primary();
            table.uuid('stad_id').references('id').inTable('STAD').onUpdate('CASCADE').onDelete('CASCADE');
            table.uuid('customer_id').references('id').inTable('Customer').onUpdate('CASCADE').onDelete('CASCADE');
            table.boolean('is_deleted').notNullable().defaultTo(false);
            table.string('others');
            table.uuid('last_update_from_user_id');
            table.timestamps(true, true);
        })

        .createTable("Cold_Call", table => {
            table.uuid('id').defaultTo(knex.raw('gen_random_uuid()')).notNullable().primary();
            table.string("name_of_store").notNullable();
            table.string("gender");
            table.string("firstname");
            table.string("lastname");
            table.string("email");
            table.double("latitude");
            table.double('longitude');
            table.string('street').notNullable();
            table.string('postcode');
            table.string('city').notNullable();
            table.string('country');
            table.string('phone', 120);
            table.boolean('accept_status').notNullable();
            table.boolean('is_deleted').notNullable().defaultTo(false);
            table.string('others');
            table.uuid('last_update_from_user_id');
            table.timestamps(true, true);
        })

        .createTable("Opening_Hour", table => {
            table.uuid('id').defaultTo(knex.raw('gen_random_uuid()')).notNullable().primary();
            table.tinyint('day').notNullable().unsigned();
            table.tinyint('day_from').notNullable().unsigned();
            table.time('time_from').notNullable();
            table.specificType('time_to_duration', 'smallint').notNullable().unsigned();
            table.tinyint('day_to').notNullable().unsigned();
            table.boolean('is_deleted').notNullable().defaultTo(false);
            table.uuid('advertiser_id').references('id').inTable('Advertiser').notNullable().onUpdate('CASCADE').onDelete('CASCADE');
            table.uuid('address_id').references('id').inTable('Address').notNullable().onUpdate('CASCADE').onDelete('CASCADE');
            table.string('others');
            table.uuid('last_update_from_user_id');
            table.timestamps(true, true);
        })

        .createTable("Worker", table => {
            table.uuid('id').defaultTo(knex.raw('gen_random_uuid()')).notNullable().primary();
            table.string('worker_number').unique();
            table.string('graduation');
            table.string("gender");
            table.string("firstname");
            table.string("lastname");
            table.string('username').notNullable().unique();
            table.string('email').unique();
            table.string('password').notNullable();
            table.boolean("is_active").defaultTo(true);
            table.boolean("is_deleted").defaultTo(false);
            table.boolean("is_banned").defaultTo(false);
            table.boolean("email_confirmed").defaultTo(false);
            table.boolean("is_admin").defaultTo(false);
            table.string("others");
            table.uuid('last_update_from_user_id');
            table.timestamps(true, true);
        })
        .createTable("knex_tables", table => {
            table.uuid('id').defaultTo(knex.raw('gen_random_uuid()')).notNullable().primary();
            table.boolean('active').notNullable();
            table.timestamps(true, true);
        })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema
        .dropTableIfExists("Worker")
        .dropTableIfExists("Opening_Hour")
        .dropTableIfExists("Cold_Call")
        .dropTableIfExists("I_Want_It_STAD")
        .dropTableIfExists("I_Want_It_QROFFER")
        .dropTableIfExists("Geofence")
        .dropTableIfExists("Favorite_Subsubategorys_Customer")
        .dropTableIfExists("Favorite_Subcategorys_Customer")
        .dropTableIfExists("Favorite_Categorys_Customer")
        .dropTableIfExists("Favorite_Advertiser_Customer")
        .dropTableIfExists("Favorite_Addresses_Customer")
        .dropTableIfExists('Wallet_Customer')
        .dropTableIfExists('Report')
        .dropTableIfExists('QROFFER_Subsubcategory')
        .dropTableIfExists("STAD_Subsubcategory")
        .dropTableIfExists("QROFFER")
        .dropTableIfExists("STAD")
        .dropTableIfExists("Invoice")
        .dropTableIfExists("Invoice_Address")
        .dropTableIfExists("Address")
        .dropTableIfExists("Subsubcategory")
        .dropTableIfExists("Subcategory")
        .dropTableIfExists("Category")
        .dropTableIfExists("Customer")
        .dropTableIfExists("Advertiser")
};
