const bcrypt = require('bcrypt');
const { token, refreshToken } = require('../helpers/token');
const getUserId = require('../utils/getId');
var jwt = require('jsonwebtoken');
const nodemailer = require("nodemailer");
const knex = require('../db/db');
const validator = require('validator');
const confirmEmailTemplate = require('../template/confirmEmailCustomerTemplate');
// const resetPasswordEmailTemplate = require('../template/resetPasswordEmailCustomerTemplate')
var createError = require('http-errors');

///schemas
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


const hashNumber = 12;


const getAllWorker = async (req, res, next) => {
  const id = await getUserId(req);
  const permission = await req.headers.permission;
  if (permission === process.env.PERMISSION_KEY_WORKER) {
    if (id == null) {
      next(createError(401, 'Permission denied!'));
    } else {

      try {
        const findInWorkers = await knex(worker).where({ id: id }).returning('id');

        if (findInWorkers.length === 0) {
          next(createError(401, 'Permission denied!'));
        }
        else {
          try {
            const allWorker = await knex(worker).orderBy('created_at', 'desc').returning('*');
            res.json(allWorker);
          } catch (error) {
            next(error);
          }
        }
      } catch (error) {
        next(error);
      }
    }
  } else {
    next(createError(401, 'Permission denied!'));
  }
};

const findMe = async (req, res, next) => {
  const id = await getUserId(req);
  const permission = await req.headers.permission;
  if (permission === process.env.PERMISSION_KEY_WORKER) {
    if (id == null) {
      next(createError(401, 'Permission denied!'));
    } else {
      try {
        const findInWorkers = await knex(worker).where({ id: id }).returning('id');

        if (findInWorkers.length === 0) {
          next(createError(401, 'Permission denied!'));
        } else {

          res.json(findInWorkers[0]);

        }
      } catch (error) {
        next(error);
      }
    }
  } else {
    next(createError(401, 'Permission denied!'));
  }
};

const findWorkerPanel = async (req, res, next) => {
  const id = await getUserId(req);
  const permission = await req.headers.permission;
  if (permission === process.env.PERMISSION_KEY_WORKER) {
    if (id == null) {
      next(createError(401, 'Permission denied!'));
    } else {
      try {
        const findWorker = await knex(worker).where({ id: id }).returning('id');

        if (findWorker.length === 0) {
          next(createError(401, 'Permission denied!'));
        } else {

          const findedWorker = await knex(worker).where({ id: req.params.identifier }).returning('*');
          res.json(findedWorker[0]);

        }
      } catch (error) {
        next(error);
      }
    }
  } else {
    next(createError(401, 'Permission denied!'));
  }
};

const findWorkersEmail = async (req, res, next) => {
  const id = await getUserId(req);
  const permission = await req.headers.permission;
  if (permission === process.env.PERMISSION_KEY_WORKER) {
    if (id == null) {
      next(createError(401, 'Permission denied!'));
    } else {
      try {
        const findInWorkers = await knex(worker).where({ id: id }).returning('id');
        if (findInWorkers.length === 0) {
          next(createError(401, 'Permission denied!'));
        } else {
          try {
            const findEmail = await knex(worker).where({ email: req.body.email }).returning('*');

            if (findEmail.length === 0) {
              next(createError(400, "Bad Request"));
            } else {
              res.json(findEmail[0]);
            }
          } catch (error) {
            next(error);
          }
        }
      } catch (error) {
        next(createError(401, 'Permission denied!'));
      }
    }
  } else {
    next(createError(401, 'Permission denied!'));
  }
};

const createWorker = async (req, res, next) => {
  const permission = await req.headers.permission;
  if (permission === process.env.PERMISSION_KEY_WORKER) {
    try {
      const workerExist = await knex(worker).where({
        username: req.body.username
      }).returning('*');

      if (workerExist.length !== 0) {
        next(createError(406, 'Worker already Exists'));
      } else {
        const hashedPassword = await bcrypt.hash(req.body.password, hashNumber);
        try {
          const newWorker = await knex(worker).insert({
            ...req.body,
            password: hashedPassword,
          }).returning('*');

          if (newWorker.length === 0) {
            next(createError(400, 'Worker not created'));
          } else {

            res.json({
              worker: newWorker[0],
              token: token.generate(newWorker[0], '6h'),
              refreshToken: refreshToken.generate(newWorker[0], '12h')
            });
          }
        } catch (error) {
          next(error);
        }
      }
    } catch (error) {
      next(error);
    }
  } else {
    next(createError(401, 'Permission denied!'));
  }
};

const signInWorker = async (req, res, next) => {
  const permission = await req.headers.permission;
  if (permission === process.env.PERMISSION_KEY_WORKER) {
    try {
      const findWorker = await knex(worker).where({
        username: req.body.username
      }).returning('*')

      if (findWorker.length === 0) {
        next(createError(406, 'Wrong username or password!'));
      } else {


        const validPassword = await bcrypt.compare(req.body.password, findWorker[0].password);

        if (!validPassword) {
          next(createError(406, 'Wrong username or password!'));
        } else {
          res.json({
            token: token.generate(findWorker[0], '6h'),
            refreshToken: refreshToken.generate(findWorker[0], '12h'),
            worker: findWorker[0]
          });
        }
      }
    } catch (error) {
      next(error);
    }
  } else {
    next(createError(401, 'Permission denied!'));
  }
};

const deleteWorker = async (req, res, next) => {
  const id = await getUserId(req);
  const permission = await req.headers.permission;
  if (permission === process.env.PERMISSION_KEY_WORKER) {
    if (id == null) {
      next(createError(401, 'Permission denied!'));
    } else {

      try {
        const findInWorkers = await knex(worker).where({ id: id }).returning('id');


        if (findInWorkers.length === 0) {
          next(createError(401, 'Permission denied!'));
        } else {
          const findWorker = await knex(worker).where({ id: req.body.id });

          if (findWorker.length === 0) {
            next(createError(404, 'Worker not found'));
          } else {
            res.json(findWorker[0]);
            try {
              await knex(worker).where({ id: req.body.id }).del();
            } catch (error) {
              next(error);
            }
          }
        }
      } catch (error) {
        next(error);
      }
    }
  } else {
    next(createError(401, 'Permission denied!'));
  }
};

const updateWorkerWithoutPassword = async (req, res, next) => {
  const id = await getUserId(req);
  const permission = await req.headers.permission;
  if (permission === process.env.PERMISSION_KEY_WORKER) {
    if (id == null) {
      next(createError(401, 'Permission denied!'));
    } else {
      try {
        const findInWorkers = await knex(worker).where({ id: id }).returning('id');

        if (findInWorkers.length === 0) {
          next(createError(401, 'Permission denied!'));
        } else {
          try {
            const updatedWorker = await knex(worker).where({
              id: id
            }).update({
              ...req.body
            }).returning('*')

            if (updatedWorker.length === 0) {
              next(createError(400, 'Error: Update Failed.'));
            } else {
              res.json({
                token: token.generate(updatedWorker[0], '6h'),
                refreshToken: refreshToken.generate(updatedWorker[0], '12h'),
                worker: updatedWorker[0]
              });
            }
          } catch (error) {
            next(error);
          }
        }
      } catch (error) {
        next(error);
      }
    }
  } else {
    next(createError(401, 'Permission denied!'));
  }
};

const updateWorkerWithoutPasswordInPanel = async (req, res, next) => {
  const id = await getUserId(req);
  const permission = await req.headers.permission;
  if (permission === process.env.PERMISSION_KEY_WORKER) {
    if (id == null) {
      next(createError(401, 'Permission denied!'));
    } else {

      try {
        const findInWorkers = await knex(worker).where({ id: id }).returning('id');


        if (findInWorkers.length === 0) {
          next(createError(401, 'Permission denied!'));
        } else {
          try {
            const updatedWorker = await knex(worker).where({
              id: req.body.id
            }).update({
              ...req.body
            }).returning('*')

            if (updatedWorker.length === 0) {
              next(createError(400, 'Error: Update Failed.'));
            } else {
              res.json({
                token: token.generate(updatedWorker[0], '6h'),
                refreshToken: refreshToken.generate(updatedWorker[0], '12h'),
                worker: updatedWorker[0]
              });
            }
          } catch (error) {
            next(error);
          }
        }
      } catch (error) {
        next(error);
      }
    }
  } else {
    next(createError(401, 'Permission denied!'));
  }
};

const updatePasswordWorker = async (req, res, next) => {
  const id = await getUserId(req);
  const permission = await req.headers.permission;
  if (permission === process.env.PERMISSION_KEY_WORKER) {
    if (id == null) {
      next(createError(401, 'Permission denied!'));
    } else {
      try {
        const findInWorkers = await knex(worker).where({ id: id }).returning('id');

        if (findInWorkers.length === 0) {
          next(createError(401, 'Permission denied!'));
        } else {
          try {
            const updatedPasswordWorker = await knex(worker)
              .where({
                id: id
              })
              .update({
                password: bcrypt.hash(req.body.password, hashNumber)
              })
              .returning('*');

            if (updatedPasswordWorker.length === 0) {
              next(createError(400, 'Error: Password Update failed'));
            } else {
              res.json({
                token: token.generate(updatedPasswordWorker[0], '6h'),
                refreshToken: refreshToken.generate(updatedPasswordWorker[0], '12h'),
                worker: updatedPasswordWorker[0]
              });
            }
          } catch (error) {
            next(error);
          }
        }
      } catch (error) {
        next(createError(404, 'Not found!'));
      }
    }
  } else {
    next(createError(401, 'Permission denied!'));
  }
};


module.exports = {
  getAllWorker,
  findMe,
  findWorkerPanel,
  findWorkersEmail,
  createWorker,
  signInWorker,
  deleteWorker,
  updateWorkerWithoutPassword,
  updateWorkerWithoutPasswordInPanel,
  updatePasswordWorker,
};