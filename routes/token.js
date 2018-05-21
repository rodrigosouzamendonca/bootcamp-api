const jwt = require('jwt-simple');
const { body, param, validationResult } = require('express-validator/check');

module.exports = app => {
  const Users = app.db.models.Users;
  const config = app.libs.config;

  /**
   * @api {post} /token Token autenticado
   * @apiGroup Credencial
   * @apiParam {String} email Email do usuário
   * @apiParam {String{8..12}} password Senha do usuário
   * @apiParamExample {json} Entrada
   *   {
   *     "email": "user@mail.net",
   *     "password": "12345678"
   *   }
   * @apiSuccess {String} token Token de usuário autenticado
   * @apiSuccessExample {json} Sucesso
   *   HTTP/1.1 200 OK
   *   { "token": "xyz.abc.123.hgf" }
   * @apiErrorExample {json} Erro de autenticação
   *   HTTP/1.1 401 Unauthorized
   */
  app.post('/token', [
    body('email', 'Required field').exists(),
    body('email', 'Invalid email').isEmail(),
    body('password', 'Required field').exists(),
    body('password', 'Invalid password').trim().isLength({ min: 8, max: 12 })
  ], async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const user = await Users.findOne({
        where: {
          email: req.body.email
        }
      });

      const payload = {
        id: user.id,
        name: user.name,
        email: user.email
      };

      if (user) {
        if (Users.isPassword(user.password, req.body.password)) {
          res.json({
            token: jwt.encode(payload, config.jwtSecret)
          });
        }
      } else {
        res.sendStatus(401);
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ msg: 'Unexpected error' });
    }
  });
};