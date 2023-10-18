const { HttpError } = require('../helpers');

const validateBody = schema => {
  const func = (req, res, next) => {
    if (!Object.keys(req.body).length) {
      if (req.method === 'PATCH' && req.originalUrl === '/users') {
        next(HttpError(400, 'missing field subscription'));
      }

      if (req.method === 'PATCH') {
        next(HttpError(400, 'missing field favorite'));
      }

      next(HttpError(400, 'missing fields'));
    }

    const { error } = schema.validate(req.body);
    if (error) {
      next(HttpError(400, error.details[0].message));
    }
    next();
  };
  return func;
};

module.exports = validateBody;
