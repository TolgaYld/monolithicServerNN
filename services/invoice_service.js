// const knex = require('../db/db');
// const { DateTime } = require('luxon');
// const geoTz = require('geo-tz');
// const fs = require('fs');
// const path = require('path');
// const schedule = require('node-schedule');
// const SalesTax = require("sales-tax");
// const { Storage } = require("@google-cloud/storage");
// const stream = require('stream');
// const nodemailer = require("nodemailer");
// var jwt = require('jsonwebtoken');
// const expressLayouts = require('express-ejs-layouts');
// const ejs = require('ejs');
// const session = require('express-session');
// const flash = require('connect-flash');

// //SCHEMAS
// const customer = "Customer";
// const advertiser = "Advertiser";
// const qroffer = "QROFFER";
// const address = "Address";
// const invoice_address = "Invoice_Address";
// const invoice = "Invoice";
// const stad = "STAD"
// const report = "Report";
// const i_want_it_stad = "I_Want_It_STAD";
// const i_want_it_qroffer = "I_Want_It_QROFFER";
// const qroffer_subsubcategorys = "QROFFER_Subsubcategory";
// const category = "Category";
// const subCategory = "Subcategory";
// const subsubCategory = "Subsubcategory";
// const opening_hour = "Opening_Hour";
// const stad_subsubcategorys = "STAD_Subsubcategory";
// const favoriteAddresses = "Favorite_Addresses_Customer";
// const favoriteCategorys = "Favorite_Categorys_Customer";
// const wallet = "Wallet_Customer";
// const worker = "Worker";


// //Send Invoices

// const invoice_service = schedule.scheduleJob("0 3 3 * *", async () => {

//   let from = DateTime.now().minus({ month: 1, day: 3 });
//   let to = DateTime.now().minus({ day: 3 });


//   const findInvoices = await Invoice.findAll({
//     order: [
//       ['invoicenumber', 'DESC'],
//     ],
//   });


//   // let data = [];

//   let advertisements = [];
//   let qrAdvetisements = [];
//   let invoiceAddress;

//   let lastNumber;
//   if (findInvoices) {
//     lastNumber = findInvoices[0].invoicenumber;
//   } else {
//     lastNumber = 33692;
//   }
//   lastNumber++;




//   const findInvoiceAddresses = await Invoice_Address.findAll({
//     where: { is_deleted: false }
//   });

//   if (findInvoiceAddresses) {

//     for (let i = 0; i < findInvoiceAddresses.length; i++) {


//       const findAdvertiser = await Advertiser.findByPk(findInvoiceAddresses[i].id);
//       if (findAdvertiser) {
//         let salesTax = await SalesTax.getSalesTax(findInvoiceAddresses[i].country_code);

//         let rate = salesTax.rate;

//         const findAdvertisements = await Advertisement.findAll({

//           where: { in_invoice: false, is_deleted: true, Invoice_AddressId: findInvoiceAddresses[i].id, createdAt: { [Op.between]: [from, to] } },
//           order: [
//             ['createdAt', 'ASC'],
//           ],
//         });

//         const findQrAdvertisements = await Qr_Advertisement.findAll({
//           where: { in_invoice: false, is_deleted: true, Invoice_AddressId: findInvoiceAddresses[i].id, createdAt: { [Op.between]: [from, to] } },
//           order: [
//             ['createdAt', 'ASC'],
//           ],
//         });

//         if (findAdvertisements || findQrAdvertisements) {

//           if (findAdvertisements) {

//             for (let j = 0; j < findAdvertisements.length; j++) {
//               let advertisement = {
//                 id: findAdvertisements[j].id,
//                 shortDescription: findAdvertisements[j].shortDescription,
//                 fromDate: findAdvertisements[j].remaining_time_begin,
//                 toDate: findAdvertisements[j].remaining_time_end,
//                 price: findAdvertisements[j].price.toFixed(2),
//                 type: "STAD",
//                 taxPrice: (findAdvertisements[j].price * rate).toFixed(2),
//               }

//               advertisements.push(advertisement);


//               await findAdvertisements[j].update({
//                 in_invoice: true
//               });
//             }
//           }
//           if (findQrAdvertisements) {
//             for (let k = 0; k < findQrAdvertisements.length; k++) {
//               let qrAdvertisement = {
//                 id: findQrAdvertisements[k].id,
//                 shortDescription: findQrAdvertisements[k].shortDescription,
//                 fromDate: findQrAdvertisements[k].remaining_time_begin,
//                 toDate: findQrAdvertisements[k].remaining_time_end,
//                 price: findQrAdvertisements[k].price.toFixed(2),
//                 type: "QROFFER",
//                 taxPrice: (findQrAdvertisements[k].price * rate).toFixed(2),
//               }

//               qrAdvetisements.push(qrAdvertisement);
//               await findQrAdvertisements[k].update({
//                 in_invoice: true
//               });
//             }
//           }

//         }

//         invoiceAddress = {
//           id: findInvoiceAddresses[i].id,
//           invoiceBig: "RECHNUNG",
//           company_name: findInvoiceAddresses[i].company_name,
//           gender: findInvoiceAddresses[i].gender,
//           firstname: findInvoiceAddresses[i].firstname,
//           lastname: findInvoiceAddresses[i].lastname,
//           street: findInvoiceAddresses[i].street,
//           postcode: findInvoiceAddresses[i].postcode,
//           city: findInvoiceAddresses[i].city,
//           country: findInvoiceAddresses[i].country,
//           floor: findInvoiceAddresses[i].floor == null ? "" : " Stock: " + findInvoiceAddresses[i].floor,
//           phone: findInvoiceAddresses[i].phone,
//           invoicenumber: "NNA-000" + lastNumber.toString(),
//           email: findInvoiceAddresses[i].email,
//           invoicenumberString: "Rechnungsnummer",
//           greeting: "Sehr geehrte/r Advertiser/in " + findInvoiceAddresses[i].firstname + " " + findInvoiceAddresses[i].lastname,
//           beginingText: "Vielen Dank für Ihr Vertrauen in die NowNow GmbH. Wir stellen Ihnen hiermit folgende Leistungen in Rechnung:",
//           lastText: "Wir werden den Gesamtbetrag von Ihrem Bankkonto mit der IBAN: " + findAdvertiser.iban + " abbuchen.",
//           sayCiao: "Mit freundlichen Grüßen",
//           percent: (rate * 100) + " %",
//           advertisements: advertisements,
//           qrAdvetisements: qrAdvetisements,
//         }

//         await data.push(invoiceAddress);


//         var options = {
//           convertTo: 'pdf' //can be docx, txt, ...
//         };

//         carbone.render('./template/NowNow_Rechnung.docx', data, options, async function (err, result) {
//           if (err) return console.log(err);

//           const storage = new Storage({ projectId: process.env.GCLOUD_PROJECT, credentials: { client_email: process.env.GCLOUD_CLIENT_EMAIL, private_key: process.env.GCLOUD_PRIVATE_KEY } });



//           const bucket = storage.bucket(process.env.GCS_BUCKET);

//           const findAddress = await Address.findByPk(findInvoiceAddresses[i].id);

//           let fileName = `${DateTime.now().year}-${(DateTime.now().month).toLocaleString("en-US", { minimumIntegerDigits: 2 })}_${findInvoiceAddresses[i].AdvertiserId}_${findAddress.id}.pdf`;
//           const blob = await bucket.file(fileName);



//           const passthroughStream = new stream.PassThrough();
//           passthroughStream.write(result);
//           passthroughStream.end();

//           async function streamFileUpload() {
//             passthroughStream.pipe(blob.createWriteStream()).on('finish', () => {
//               // The file upload is complete
//             });
//           }

//           await streamFileUpload().catch(console.error);
//           // [END storage_stream_file_upload]

//           await fs.writeFileSync(`./docs/${fileName}`, result);
//           let transporter = nodemailer.createTransport({
//             host: process.env.MAIL_SERVICE,
//             auth: {
//               user: process.env.MAIL_USER,
//               pass: process.env.MAIL_PW
//             }
//           });


//           let mailOptions = {
//             from: 'NowNow - No Reply! <no_reply@nownow.de>',
//             to: findInvoiceAddresses[i].email,
//             subject: `Deine Now Now Rechnung: ${(DateTime.now().month).toLocaleString("en-US", { minimumIntegerDigits: 2 })}/${DateTime.now().year}`,
//             html: `<!doctype html>
//             <html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">

//             <head>
//               <title>
//               </title>
//               <!--[if !mso]><!-->
//               <meta http-equiv="X-UA-Compatible" content="IE=edge">
//               <!--<![endif]-->
//               <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
//               <meta name="viewport" content="width=device-width, initial-scale=1">
//               <style type="text/css">
//                 #outlook a {
//                   padding: 0;
//                 }

//                 body {
//                   margin: 0;
//                   padding: 0;
//                   -webkit-text-size-adjust: 100%;
//                   -ms-text-size-adjust: 100%;
//                 }

//                 table,
//                 td {
//                   border-collapse: collapse;
//                   mso-table-lspace: 0pt;
//                   mso-table-rspace: 0pt;
//                 }

//                 img {
//                   border: 0;
//                   height: auto;
//                   line-height: 100%;
//                   outline: none;
//                   text-decoration: none;
//                   -ms-interpolation-mode: bicubic;
//                 }

//                 p {
//                   display: block;
//                   margin: 13px 0;
//                 }
//               </style>
//               <!--[if mso]>
//                     <noscript>
//                     <xml>
//                     <o:OfficeDocumentSettings>
//                       <o:AllowPNG/>
//                       <o:PixelsPerInch>96</o:PixelsPerInch>
//                     </o:OfficeDocumentSettings>
//                     </xml>
//                     </noscript>
//                     <![endif]-->
//               <!--[if lte mso 11]>
//                     <style type="text/css">
//                       .mj-outlook-group-fix { width:100% !important; }
//                     </style>
//                     <![endif]-->
//               <!--[if !mso]><!-->
//               <link href="https://fonts.googleapis.com/css?family=Ubuntu:300,400,500,700" rel="stylesheet" type="text/css">
//               <style type="text/css">
//                 @import url(https://fonts.googleapis.com/css?family=Ubuntu:300,400,500,700);
//               </style>
//               <!--<![endif]-->
//               <style type="text/css">
//                 @media only screen and (min-width:480px) {
//                   .mj-column-per-100 {
//                     width: 100% !important;
//                     max-width: 100%;
//                   }

//                   .mj-column-per-33-33333333333333 {
//                     width: 33.33333333333333% !important;
//                     max-width: 33.33333333333333%;
//                   }
//                 }
//               </style>
//               <style media="screen and (min-width:480px)">
//                 .moz-text-html .mj-column-per-100 {
//                   width: 100% !important;
//                   max-width: 100%;
//                 }

//                 .moz-text-html .mj-column-per-33-33333333333333 {
//                   width: 33.33333333333333% !important;
//                   max-width: 33.33333333333333%;
//                 }
//               </style>
//               <style type="text/css">
//                 @media only screen and (max-width:480px) {
//                   table.mj-full-width-mobile {
//                     width: 100% !important;
//                   }

//                   td.mj-full-width-mobile {
//                     width: auto !important;
//                   }
//                 }
//               </style>
//             </head>

//             <body style="word-spacing:normal;background-color:#d7dde5;">
//               <div style="background-color:#d7dde5;">
//                 <table align="center" background="https://res.cloudinary.com/ds7kynxmg/image/upload/v1630154480/imgs/qcrkh2qblntrsuadzyai.jpg" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:url('https://res.cloudinary.com/ds7kynxmg/image/upload/v1630154480/imgs/qcrkh2qblntrsuadzyai.jpg') center top / cover no-repeat;background-position:center top;background-repeat:no-repeat;background-size:cover;width:100%;">
//                   <tbody>
//                     <tr>
//                       <td>
//                         <!--[if mso | IE]><v:rect style="mso-width-percent:1000;" xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false"><v:fill origin="0, -0.5" position="0, -0.5" src="https://res.cloudinary.com/ds7kynxmg/image/upload/v1630154480/imgs/qcrkh2qblntrsuadzyai.jpg" type="frame" size="1,1" aspect="atleast" /><v:textbox style="mso-fit-shape-to-text:true" inset="0,0,0,0"><table align="center" border="0" cellpadding="0" cellspacing="0" class="" role="presentation" style="width:600px;" width="600" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]-->
//                         <div style="margin:0px auto;max-width:600px;">
//                           <div style="line-height:0;font-size:0;">
//                             <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;">
//                               <tbody>
//                                 <tr>
//                                   <td style="direction:ltr;font-size:0px;padding:20px 0;text-align:center;">
//                                     <!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" style="vertical-align:middle;width:600px;" ><![endif]-->
//                                     <div class="mj-column-per-100 mj-outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:middle;width:100%;">
//                                       <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:middle;" width="100%">
//                                         <tbody>
//                                           <tr>
//                                             <td align="center" style="font-size:0px;padding:10px 25px;padding-top:103px;padding-bottom:10px;word-break:break-word;">
//                                               <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:14px;line-height:1;text-align:center;color:#ffffff;"><span style="font-size: 30px; line-height: 30px;">Ihre Rechnung für den Monat: ${(DateTime.now().month).toLocaleString("en-US", { minimumIntegerDigits: 2 })}.${DateTime.now().year}</span><br /><br />Store: ${findInvoiceAddresses[i].company_name}, ${findInvoiceAddresses[i].street}, ${findInvoiceAddresses[i].postcode}, ${findInvoiceAddresses[i].city}, ${findInvoiceAddresses[i].country}</div>
//                                             </td>
//                                           </tr>
//                                         </tbody>
//                                       </table>
//                                     </div>
//                                     <!--[if mso | IE]></td></tr></table><![endif]-->
//                                   </td>
//                                 </tr>
//                               </tbody>
//                             </table>
//                           </div>
//                         </div>
//                         <!--[if mso | IE]></td></tr></table></v:textbox></v:rect><![endif]-->
//                       </td>
//                     </tr>
//                   </tbody>
//                 </table>
//                 <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#ffffff;background-color:#ffffff;width:100%;">
//                   <tbody>
//                     <tr>
//                       <td>
//                         <!--[if mso | IE]><table align="center" border="0" cellpadding="0" cellspacing="0" class="" role="presentation" style="width:600px;" width="600" bgcolor="#ffffff" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]-->
//                         <div style="margin:0px auto;max-width:600px;">
//                           <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;">
//                             <tbody>
//                               <tr>
//                                 <td style="direction:ltr;font-size:0px;padding:20px 0;text-align:center;">
//                                   <!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" style="vertical-align:top;width:199.99999999999997px;" ><![endif]-->
//                                   <div class="mj-column-per-33-33333333333333 mj-outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
//                                     <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
//                                       <tbody>
//                                         <tr>
//                                           <td align="center" style="font-size:0px;padding:10px 25px;word-break:break-word;">
//                                             <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;border-spacing:0px;">
//                                               <tbody>
//                                                 <tr>
//                                                   <td style="width:50px;">
//                                                     <img alt="" height="auto" src="https://res.cloudinary.com/ds7kynxmg/image/upload/v1630154746/imgs/omhstmw4m9x3w20hvv1d.png" style="border:0;display:block;outline:none;text-decoration:none;height:auto;width:100%;font-size:13px;" width="50" />
//                                                   </td>
//                                                 </tr>
//                                               </tbody>
//                                             </table>
//                                           </td>
//                                         </tr>
//                                         <tr>
//                                           <td align="center" style="font-size:0px;padding:10px 25px;padding-bottom:30px;word-break:break-word;">
//                                             <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:11px;line-height:1;text-align:center;color:#9da3a3;"><span style="font-size: 14px; color: #6bb03e">STAD</span><br /><br />Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque eleifend sagittis nunc, et fermentum est ullamcorper dignissim.</div>
//                                           </td>
//                                         </tr>
//                                       </tbody>
//                                     </table>
//                                   </div>
//                                   <!--[if mso | IE]></td><td class="" style="vertical-align:top;width:199.99999999999997px;" ><![endif]-->
//                                   <div class="mj-column-per-33-33333333333333 mj-outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
//                                     <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
//                                       <tbody>
//                                         <tr>
//                                           <td align="center" style="font-size:0px;padding:10px 25px;word-break:break-word;">
//                                             <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;border-spacing:0px;">
//                                               <tbody>
//                                                 <tr>
//                                                   <td style="width:50px;">
//                                                     <img alt="" height="auto" src="https://res.cloudinary.com/ds7kynxmg/image/upload/v1630154768/imgs/avlni23nj1t0czafnhvx.png" style="border:0;display:block;outline:none;text-decoration:none;height:auto;width:100%;font-size:13px;" width="50" />
//                                                   </td>
//                                                 </tr>
//                                               </tbody>
//                                             </table>
//                                           </td>
//                                         </tr>
//                                         <tr>
//                                           <td align="center" style="font-size:0px;padding:10px 25px;padding-bottom:30px;word-break:break-word;">
//                                             <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:11px;line-height:1;text-align:center;color:#9da3a3;"><span style="font-size: 14px; color: #6bb03e">QROFFER</span><br /><br />Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque eleifend sagittis nunc, et fermentum est ullamcorper dignissim.</div>
//                                           </td>
//                                         </tr>
//                                       </tbody>
//                                     </table>
//                                   </div>
//                                   <!--[if mso | IE]></td><td class="" style="vertical-align:top;width:199.99999999999997px;" ><![endif]-->
//                                   <div class="mj-column-per-33-33333333333333 mj-outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
//                                     <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
//                                       <tbody>
//                                         <tr>
//                                           <td align="center" style="font-size:0px;padding:10px 25px;word-break:break-word;">
//                                             <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;border-spacing:0px;">
//                                               <tbody>
//                                                 <tr>
//                                                   <td style="width:50px;">
//                                                     <img alt="" height="auto" src="https://res.cloudinary.com/ds7kynxmg/image/upload/v1630154768/imgs/t0n5ro5ix84doyfbvzqs.png" style="border:0;display:block;outline:none;text-decoration:none;height:auto;width:100%;font-size:13px;" width="50" />
//                                                   </td>
//                                                 </tr>
//                                               </tbody>
//                                             </table>
//                                           </td>
//                                         </tr>
//                                         <tr>
//                                           <td align="center" style="font-size:0px;padding:10px 25px;padding-top:3px;padding-bottom:30px;word-break:break-word;">
//                                             <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:11px;line-height:1;text-align:center;color:#9da3a3;"><span style="font-size: 14px; color: #6bb03e">24/7 Support</span><br /><br />Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque eleifend sagittis nunc, et fermentum est ullamcorper dignissim.</div>
//                                           </td>
//                                         </tr>
//                                       </tbody>
//                                     </table>
//                                   </div>
//                                   <!--[if mso | IE]></td></tr></table><![endif]-->
//                                 </td>
//                               </tr>
//                             </tbody>
//                           </table>
//                         </div>
//                         <!--[if mso | IE]></td></tr></table><![endif]-->
//                       </td>
//                     </tr>
//                   </tbody>
//                 </table>
//                 <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#6bb03e;background-color:#6bb03e;width:100%;">
//                   <tbody>
//                     <tr>
//                       <td>
//                         <!--[if mso | IE]><table align="center" border="0" cellpadding="0" cellspacing="0" class="" role="presentation" style="width:600px;" width="600" bgcolor="#6bb03e" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]-->
//                         <div style="margin:0px auto;max-width:600px;">
//                           <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;">
//                             <tbody>
//                               <tr>
//                                 <td style="direction:ltr;font-size:0px;padding:20px 0;text-align:center;">
//                                   <!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" style="vertical-align:middle;width:600px;" ><![endif]-->
//                                   <div class="mj-column-per-100 mj-outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:middle;width:100%;">
//                                     <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:middle;" width="100%">
//                                       <tbody>
//                                         <tr>
//                                           <td align="center" style="font-size:0px;padding:10px 25px;padding-bottom:10px;word-break:break-word;">
//                                             <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:18px;line-height:1;text-align:center;color:#ffffff;">Warum NowNow?</div>
//                                           </td>
//                                         </tr>
//                                         <tr>
//                                           <td align="center" style="font-size:0px;padding:10px 25px;padding-top:20px;padding-right:100px;padding-bottom:20px;padding-left:100px;word-break:break-word;">
//                                             <p style="border-top:solid 1px #ffffff;font-size:1px;margin:0px auto;width:100%;">
//                                             </p>
//                                             <!--[if mso | IE]><table align="center" border="0" cellpadding="0" cellspacing="0" style="border-top:solid 1px #ffffff;font-size:1px;margin:0px auto;width:400px;" role="presentation" width="400px" ><tr><td style="height:0;line-height:0;"> &nbsp;
//             </td></tr></table><![endif]-->
//                                           </td>
//                                         </tr>
//                                         <tr>
//                                           <td align="center" style="font-size:0px;padding:10px 25px;padding-bottom:25px;word-break:break-word;">
//                                             <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:11px;line-height:1;text-align:center;color:#ffffff;">Erklärung warum wir: Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.</div>
//                                           </td>
//                                         </tr>
//                                       </tbody>
//                                     </table>
//                                   </div>
//                                   <!--[if mso | IE]></td></tr></table><![endif]-->
//                                 </td>
//                               </tr>
//                             </tbody>
//                           </table>
//                         </div>
//                         <!--[if mso | IE]></td></tr></table><![endif]-->
//                       </td>
//                     </tr>
//                   </tbody>
//                 </table>
//                 <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#ffffff;background-color:#ffffff;width:100%;">
//                   <tbody>
//                     <tr>
//                       <td>
//                         <!--[if mso | IE]><table align="center" border="0" cellpadding="0" cellspacing="0" class="" role="presentation" style="width:600px;" width="600" bgcolor="#ffffff" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]-->
//                         <div style="margin:0px auto;max-width:600px;">
//                           <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;">
//                             <tbody>
//                               <tr>
//                                 <td style="direction:ltr;font-size:0px;padding:20px 0;text-align:center;">
//                                   <!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" style="vertical-align:top;width:199.99999999999997px;" ><![endif]-->
//                                   <div class="mj-column-per-33-33333333333333 mj-outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
//                                     <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
//                                       <tbody>
//                                         <tr>
//                                           <td align="center" style="font-size:0px;padding:10px 25px;word-break:break-word;">
//                                             <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;border-spacing:0px;">
//                                               <tbody>
//                                                 <tr>
//                                                   <td style="width:149px;">
//                                                     <img alt="" height="auto" src="https://res.cloudinary.com/ds7kynxmg/image/upload/v1630155038/imgs/sitbmwiuqxuovsxentl2.png" style="border:0;display:block;outline:none;text-decoration:none;height:auto;width:100%;font-size:13px;" width="149" />
//                                                   </td>
//                                                 </tr>
//                                               </tbody>
//                                             </table>
//                                           </td>
//                                         </tr>
//                                       </tbody>
//                                     </table>
//                                   </div>
//                                   <!--[if mso | IE]></td><td class="" style="vertical-align:top;width:199.99999999999997px;" ><![endif]-->
//                                   <div class="mj-column-per-33-33333333333333 mj-outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
//                                     <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
//                                       <tbody>
//                                         <tr>
//                                           <td align="left" style="font-size:0px;padding:10px 25px;padding-top:0px;word-break:break-word;">
//                                             <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:11px;line-height:1;text-align:left;color:#ffffff;"><span style="font-size: 9px; color: #9da3a3">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque eleifend sagittis nunc, et fermentum est ullamcorper dignissim.</div>
//                                           </td>
//                                         </tr>
//                                       </tbody>
//                                     </table>
//                                   </div>
//                                   <!--[if mso | IE]></td><td class="" style="vertical-align:top;width:199.99999999999997px;" ><![endif]-->
//                                   <div class="mj-column-per-33-33333333333333 mj-outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
//                                     <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
//                                       <tbody>
//                                         <tr>
//                                           <td align="left" style="font-size:0px;padding:10px 25px;padding-top:0px;word-break:break-word;">
//                                             <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:9px;line-height:1;text-align:left;color:#9da3a3;"><span style="font-size: 9px; color: #9da3a3"></span><br /><br />Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque eleifend sagittis nunc, et fermentum est ullamcorper dignissim.</div>
//                                           </td>
//                                         </tr>
//                                       </tbody>
//                                     </table>
//                                   </div>
//                                   <!--[if mso | IE]></td><td class="" style="vertical-align:top;width:199.99999999999997px;" ><![endif]-->
//                                   <div class="mj-column-per-33-33333333333333 mj-outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
//                                     <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
//                                       <tbody>
//                                         <tr>
//                                           <td align="left" style="font-size:0px;padding:10px 25px;padding-top:0px;word-break:break-word;">
//                                             <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:11px;line-height:1;text-align:left;color:#ffffff;"><span style="font-size: 9px; color: #9da3a3">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque eleifend sagittis nunc, et fermentum est ullamcorper dignissim.</div>
//                                           </td>
//                                         </tr>
//                                       </tbody>
//                                     </table>
//                                   </div>
//                                   <!--[if mso | IE]></td></tr></table><![endif]-->
//                                 </td>
//                               </tr>
//                             </tbody>
//                           </table>
//                         </div>
//                         <!--[if mso | IE]></td></tr></table><![endif]-->
//                       </td>
//                     </tr>
//                   </tbody>
//                 </table>
//               </div>
//             </body>

//             </html>`,
//             attachments: [{ filename: fileName, path: `./docs/${fileName}` }]
//           }


//           await transporter.sendMail(mailOptions, async (error, info) => {
//             if (error) {
//               console.log("**********************olmadi email: " + error.toString());
//             } else {


//               console.log("************gönderildi");
//               await info

//               await transporter.close();

//               const directory = './docs';

//               fs.readdir(directory, (err, files) => {
//                 if (err) throw err;

//                 for (const file of files) {
//                   fs.unlink(path.join(directory, file), err => {
//                     if (err) throw err;
//                   });
//                 }
//               });
//             }
//           });

//         });
//         await Invoice.create({
//           AdvertiserId: findInvoiceAddresses[i].AdvertiserId,
//           Invoice_AddressId: findInvoiceAddresses[i].id,
//           is_done: true,
//         });

//         lastNumber++;


//       }
//     }
//   }

// });

// module.exports = {
//   invoice_service
// }