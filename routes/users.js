const { body, param, validationResult } = require('express-validator/check');
const { matchedData } = require('express-validator/filter');

module.exports = app => {
  const Users = app.db.models.Users;

  app.route('/users')

    /**
     * @api {post} /users Cadastra novo usuário
     * @apiGroup Usuario
     * @apiParam {String} name Nome
     * @apiParam {String} email Email
     * @apiParam {String} password Senha
     * @apiParamExample {json} Entrada
     *   {
     *     "name": "User Bootcamp",
     *     "email": "user@mail.net",
     *     "password": "12345678"
     *   }
     * @apiSuccess {Number} id Id de registro 
     * @apiSuccess {String} name Nome
     * @apiSuccess {String} email Email
     * @apiSuccess {Date} updated_at Data de atualização
     * @apiSuccess {Date} created_at Data de cadastro
     * @apiSuccessExample {json} Sucesso
     * HTTP/1.1 200 OK
     *   {
     *     "id": 1,
     *     "name": "User Bootcamp",
     *     "email": "user@mail.net",
     *     "updated_at": "2015-09-24T15:46:51.778Z",
     *     "created_at": "2015-09-24T15:46:51.778Z"
     *   }
     */
    .post([
      body('name', 'Required field').exists(),
      body('name', 'Invalid length').isLength({ min: 1, max: 255 }).trim(),
      body('email', 'Required field').exists(),
      body('email', 'Invalid email').isEmail(),
      body('password', 'Required field').exists(),
      body('password', 'Invalid email').isLength({ min: 1, max: 12 }).trim(),
    ], async (req, res) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }

        const existingUser = await Users.findOne({
          where: {
            email: req.body.email
          }
        });

        if (existingUser) {
          return res.status(409).json('Email already in use');
        }

        let user = await Users.create(matchedData(req));

        user = await Users.findById(user.id, {
          attributes: ['id', 'name', 'email', 'created_at', 'updated_at']
        });

        res.json(user);
      } catch (error) {
        console.error(error)
        res.status(500).json({ msg: 'Unexpected error' });
      }
    })

    /**
     * @api {delete} /user Exclui usuário autenticado
     * @apiGroup Usuario
     * @apiHeader {String} Authorization Token de usuário
     * @apiHeaderExample {json} Header
     *    { "Authorization": "JWT xyz.abc.123.hgf" }
     * @apiSuccessExample {json} Sucesso
     *   HTTP/1.1 204 No Content
     */
    .delete(app.auth.authenticate(), async (req, res) => {
      try {
        await Users.destroy({
          where: {
            id: req.user.id
          }
        });

        res.sendStatus(204);
      } catch (error) {
        console.error(error)
        res.status(500).json({ msg: 'Unexpected error' });
      }
    });
};