const express = require('express');
const cors = require('cors'); // CORS es para permitir el acceso a la API desde el frontend ya que actuan en distintos dominios (localhost:3000 y localhost:5173)
const { Pool } = require('pg');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors()); // habilita CORS
app.use(express.json()); // para leer el json del body

//Conexión a PostgreSQL

const pool = new Pool({
host: 'localhost',
user: 'postgres',
password: 'Admin',
database: 'likeme',
allowExitOnIdle: true
});

// Rutas

// Obtener todos los posts | GET

app.get('/posts', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM posts ORDER BY id DESC');
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al obtener los posts');
    } // error 500: 'Internal Server Error'
});

// Agregar un nuevo post | POST

app.post('/posts', async (req, res) => {
    try {
        const { titulo, url, descripcion } = req.body;
        const result = await pool.query(
            "INSERT INTO posts (titulo, img, descripcion, likes) VALUES ($1, $2, $3, 0) RETURNING *", [titulo, url, descripcion]
            // returning *: devuelve el post que se acaba de insertar
            // el 0 es el valor inicial de likes, se usará en el siguiente desafío
        );
        res.status(201).json(result.rows[0]); // 201: 'Created'
    } catch (error) {
        console.error(error);
        res.status(500).send("Error al agregar el post");
    }
});

// Modificar un post con ID | PUT

app.put('/posts/like/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            'UPDATE posts SET likes = likes +1 WHERE id = $1 RETURNING *', [id]
        );
        if (result.rowCount === 0) { // si no se encontró el post con el id, se devuelve error 'Not Found'
            return res.status(404).send('Post no encontrado');
        }
        res.json(result.rows[0]); // devuelve el post actualizado
    } catch (error) {
        console.error(error);
        res.status(500).send("Error al dar like al post");
    }
});

// Eliminar un post con ID | DELETE

app.delete('/posts/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM posts WHERE id = $1', [id]);
        if (result.rowCount === 0) {
            return res.status(404).send('Post no encontrado');
        }
        res.status(204).send(); // 204: implica éxito, pero no devuelve contenido (ya que se eliminó el post)
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al eliminar el post');
    }
});

// Iniciar servidor

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

// comprobar servidor

app.get("/", (req, res) => {
  res.send("Servidor funcionando");
});