const { body, param, validationResult } = require('express-validator/check');
const { matchedData } = require('express-validator/filter');

module.exports = app => {
  const Tasks = app.db.models.Tasks;

  app.route('/tasks')
    .all(app.auth.authenticate())

    /**
     * @api {get} /tasks Lista tarefas
     * @apiGroup Tarefas
     * @apiHeader {String} Authorization Token de usuário
     * @apiHeaderExample {json} Header
     *   { "Authorization": "JWT xyz.abc.123.hgf" }
     * @apiSuccess {Object[]} tasks Lista de tarefas
     * @apiSuccess {Number} tasks.id Id de registro
     * @apiSuccess {String} tasks.title Título da tarefa
     * @apiSuccess {Boolean} tasks.done Tarefa foi concluída?
     * @apiSuccess {Date} tasks.updated_at Data de atualização
     * @apiSuccess {Date} tasks.created_at Data de cadastro
     * @apiSuccessExample {json} Sucesso
     *   HTTP/1.1 200 OK
     *     [{
     *       "id": 1,
     *       "title": "Estudar",
     *       "done": false
     *       "updated_at": "2015-09-24T15:46:51.778Z",
     *       "created_at": "2015-09-24T15:46:51.778Z"
     *     }]
     */
    .get(async (req, res) => {
      try {
        const tasks = await Tasks.findAll({
          where: {
            user_id: req.user.id
          }
        });

        res.json(tasks);
      } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Unexpected error' });
      }
    })

    /**
     * @api {post} /tasks Cadastra uma tarefa
     * @apiGroup Tarefas
     * @apiHeader {String} Authorization Token de usuário
     * @apiHeaderExample {json} Header
     *   { "Authorization": "JWT xyz.abc.123.hgf" }
     * @apiParam {String} title Título da tarefa
     * @apiParamExample {json} Entrada
     *   { 
     *     "title": "Estudar"
     *   }
     * @apiSuccess {Number} id Id de registro
     * @apiSuccess {String} title Título da tarefa
     * @apiSuccess {Boolean} done=false Tarefa foi concluída? 
     * @apiSuccess {Date} updated_at Data de atualização
     * @apiSuccess {Date} created_at Data de cadastro
     * @apiSuccessExample {json} Sucesso
     *   HTTP/1.1 200 OK
     *   {
     *     "id": 1,
     *     "title": "Estudar",
     *     "done": false,
     *     "updated_at": "2015-09-24T15:46:51.778Z",
     *     "created_at": "2015-09-24T15:46:51.778Z"
     *   }
     */
    .post([
      body('title', 'Required field').exists(),
      body('title', 'Invalid length').isLength({ min: 1, max: 255 }).trim()
    ], async (req, res) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }

        let task = matchedData(req);
        task.user_id = req.user.id;

        task = await Tasks.create(task)

        task = await Tasks.findById(task.id, {
          attributes: ['id', 'title', 'done', 'updated_at', 'created_at']
        });

        res.json(task);
      } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Unexpected error' });
      }
    });

  app.route('/tasks/:id')
    .all(app.auth.authenticate())


    /**
     * @api {get} /tasks/:id Exibe uma tarefa
     * @apiGroup Tarefas
     * @apiHeader {String} Authorization Token de usuário
     * @apiHeaderExample {json} Header
     *   { "Authorization": "JWT xyz.abc.123.hgf" }
     * @apiParam {id} id Id da tarefa
     * @apiSuccess {Number} id Id de registro
     * @apiSuccess {String} title Título da tarefa
     * @apiSuccess {Boolean} done Tarefa foi concluída?
     * @apiSuccess {Date} updated_at Data de atualização
     * @apiSuccess {Date} created_at Data de cadastro
     * @apiSuccessExample {json} Sucesso
     *   HTTP/1.1 200 OK
     *     {
     *       "id": 1,
     *       "title": "Estudar",
     *       "done": false
     *       "updated_at": "2015-09-24T15:46:51.778Z",
     *       "created_at": "2015-09-24T15:46:51.778Z"
     *     }
     */
    .get([
      param('id', 'Not an integer').isInt()
    ], async (req, res) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }

        const task = await Tasks.findOne({
          where: {
            id: req.params.id,
            user_id: req.user.id
          },
          attributes: ['id', 'title', 'done', 'updated_at', 'created_at']
        });

        if (task) {
          res.json(task);
        } else {
          res.sendStatus(404);
        }
      } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Unexpected error' });
      }
    })

    /**
     * @api {put} /tasks/:id Atualiza uma tarefa
     * @apiGroup Tarefas
     * @apiHeader {String} Authorization Token de usuário
     * @apiHeaderExample {json} Header
     * { "Authorization": "JWT xyz.abc.123.hgf" }
     * @apiParam {id} id Id da tarefa
     * @apiParam {String} title Título da tarefa
     * @apiParam {Boolean} done Tarefa foi concluída?
     * @apiParamExample {json} Entrada
     *   {
     *     "title": "Trabalhar",
     *     "done": true 
     *   }
     * @apiSuccessExample {json} Sucesso
     *   HTTP/1.1 204 No Content
     */
    .put([
      param('id', 'Not an integer').isInt(),
      body('title', 'Required field').exists(),
      body('title', 'Invalid length').trim().isLength({ min: 1, max: 255 }),
      body('done', 'Required field').exists(),
      body('done', 'Not a boolean').isBoolean(),
    ], async (req, res) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }

        await Tasks.update(matchedData(req), {
          where: {
            id: req.params.id,
            user_id: req.user.id
          }
        });

        res.sendStatus(204);
      } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Unexpected error' });
      }
    })

    /**
    * @api {delete} /tasks/:id Exclui uma tarefa
    * @apiGroup Tarefas
    * @apiHeader {String} Authorization Token de usuário
    * @apiHeaderExample {json} Header
    *   { "Authorization": "JWT xyz.abc.123.hgf" }
    * @apiParam {id} id Id da tarefa
    * @apiSuccessExample {json} Sucesso
    *   HTTP/1.1 204 No Content
    */
    .delete([
      param('id', 'Not an integer').isInt()
    ], async (req, res) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }

        await Tasks.destroy({
          where: {
            id: req.params.id,
            user_id: req.user.id
          }
        });

        res.sendStatus(204);
      } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Unexpected error' });
      }
    });
};