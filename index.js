import express from 'express';
import pool from './db.js';

const app = express();
app.use(express.json()); // Para parsear JSON en las peticiones

// Endpoint para obtener todos los items
app.get('/itemses', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM items');
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener items:', error);
    res.status(500).json({ error: 'Error al obtener items' });
  }
});

// Endpoint para agregar un nuevo item
app.post('/items', async (req, res) => {
  const { nombre, descripcion, categoria_id, cantidad, estado } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO items (nombre, descripcion, categoria_id, cantidad, estado) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [nombre, descripcion, categoria_id, cantidad, estado]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al insertar item:', error);
    res.status(500).json({ error: 'Error al insertar item' });
  }
});

// Endpoint para actualizar un item
app.put('/items/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, categoria_id, cantidad, estado } = req.body;
  try {
    const result = await pool.query(
      'UPDATE items SET nombre = $1, descripcion = $2, categoria_id = $3, cantidad = $4, estado = $5 WHERE id = $6 RETURNING *',
      [nombre, descripcion, categoria_id, cantidad, estado, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Item no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al actualizar item:', error);
    res.status(500).json({ error: 'Error al actualizar item' });
  }
});

// Endpoint para eliminar un item
app.delete('/items/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM items WHERE id = $1', [id]);
    res.json({ message: 'Item eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar item:', error);
    res.status(500).json({ error: 'Error al eliminar item' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
