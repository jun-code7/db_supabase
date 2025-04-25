// controllers/inventarioController.js
import db from '../db.js';

// CATEGORIAS
export const obtenerCategorias = async (req, res) => {
  const { rows } = await db.query('SELECT * FROM categorias');
  res.json(rows);
};

export const obtenerCategoriaPorId = async (req, res) => {
  const { id } = req.params;

  try {
    const { rows } = await db.query('SELECT * FROM categorias WHERE id = $1', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ mensaje: 'Categoría no encontrada' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Error al obtener la categoría:', error);
    res.status(500).json({ error: 'Error al obtener la categoría' });
  }
};


export const crearCategoria = async (req, res) => {
  const { nombre, descripcion } = req.body;

  if (!nombre || !descripcion) {
    return res.status(400).json({ error: 'Nombre y descripción son requeridos' });
  }

  try {
    const { rows } = await db.query(
      'INSERT INTO categorias (nombre, descripcion) VALUES ($1, $2) RETURNING *',
      [nombre, descripcion]
    );

    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Error al crear la categoría:', error);
    res.status(500).json({ error: 'Error al crear la categoría' });
  }
};


export const actualizarCategoria = async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion } = req.body;

  if (!nombre || !descripcion) {
    return res.status(400).json({ error: 'Nombre y descripción son requeridos para actualizar' });
  }

  try {
    const result = await db.query(
      'UPDATE categorias SET nombre = $1, descripcion = $2 WHERE id = $3 RETURNING *',
      [nombre, descripcion, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ mensaje: 'Categoría no encontrada' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error actualizando categoría:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
};

export const eliminarCategoria = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ error: 'ID de categoría requerido' });
  }

  try {
    const result = await db.query('DELETE FROM categorias WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ mensaje: 'Categoría no encontrada' });
    }

    res.json({ mensaje: 'Categoría eliminada correctamente', categoria: result.rows[0] });
  } catch (error) {
    console.error('Error eliminando categoría:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
};

  
  

// ITEMS
export const obtenerItems = async (req, res) => {
  const { categoria_id } = req.query; // 👈 Leemos el parámetro desde la URL

  try {
    let query = `
      SELECT i.*, c.nombre AS categoria_nombre
      FROM items i
      LEFT JOIN categorias c ON i.categoria_id = c.id
    `;
    const values = [];

    if (categoria_id) {
      query += ' WHERE i.categoria_id = $1'; // 👈 Agregamos filtro si viene el ID
      values.push(categoria_id); // 👈 Parametrizamos para evitar inyección SQL
    }

    const { rows } = await db.query(query, values);

    // Mapeamos los resultados para incluir el nombre de la categoría
    const itemsConCategoria = rows.map(item => ({
      ...item,
      categoria: {
        nombre: item.categoria_nombre
      }
    }));

    res.json(itemsConCategoria);
  } catch (error) {
    console.error('Error al obtener los ítems:', error);
    res.status(500).json({ error: 'Error al obtener los ítems' });
  }
};


// Crear un nuevo ítem
export const crearItem = async (req, res) => {
  const { nombre, descripcion, categoria_id, cantidad, estado } = req.body;

  // Validaciones básicas
  if (!nombre || !categoria_id || cantidad == null || !estado) {
    return res.status(400).json({ error: 'Faltan campos requeridos (nombre, categoria_id, cantidad, estado)' });
  }

  try {
    const { rows } = await db.query(
      'INSERT INTO items (nombre, descripcion, categoria_id, cantidad, estado) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [nombre, descripcion || '', categoria_id, cantidad, estado]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Error al crear el ítem:', error);
    res.status(500).json({ error: 'Error al crear el ítem' });
  }
};

// Actualizar un ítem existente

export const actualizarItem = async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, categoria_id, cantidad, estado } = req.body;

  if (!nombre || !categoria_id || cantidad == null || !estado) {
    return res.status(400).json({ error: 'Faltan campos requeridos para la actualización' });
  }

  try {
    const result = await db.query(
      'UPDATE items SET nombre = $1, descripcion = $2, categoria_id = $3, cantidad = $4, estado = $5 WHERE id = $6 RETURNING *',
      [nombre, descripcion || '', categoria_id, cantidad, estado, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ mensaje: 'Ítem no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error actualizando ítem:', error);
    res.status(500).json({ error: 'Error al actualizar el ítem' });
  }
};

// Eliminar un ítem
export const eliminarItem = async (req, res) => {
  const { id } = req.params;

  try {
    // Paso 1: Eliminar registros relacionados en historial_stock
    await db.query('DELETE FROM historial_stock WHERE item_id = $1', [id]);

    // Paso 2: Eliminar registros relacionados en movimientos_inventario
    await db.query('DELETE FROM movimientos_inventario WHERE item_id = $1', [id]);

    // Paso 3: Finalmente, eliminar el ítem
    await db.query('DELETE FROM items WHERE id = $1', [id]);

    res.json({ mensaje: 'Ítem eliminado correctamente' });
  } catch (error) {
    console.error('Error eliminando ítem:', error);
    res.status(500).json({ error: 'Error eliminando ítem' });
  }
};



// MOVIMIENTOS INVENTARIO

// export const obtenerMovimientos = async (req, res) => {
//   const { rows } = await db.query('SELECT * FROM movimientos_inventario');
//   res.json(rows);
// };  
// controllers/movimientosController.js

export const obtenerMovimientos = async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT m.*, i.nombre AS item_nombre
      FROM movimientos_inventario m
      JOIN items i ON m.item_id = i.id
      ORDER BY m.fecha_movimiento DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener movimientos:', error);
    res.status(500).json({ message: 'Error al obtener movimientos' });
  }
};


export const crearMovimiento = async (req, res) => {  
  const { item_id, tipo_movimiento, cantidad, observaciones} = req.body;

  if (!item_id || !tipo_movimiento || cantidad == null ||!observaciones){
    return res.status(400).json({ error: 'Faltan campos requeridos: id_item, tipo_movimiento y cantidad' });
  }

  try {
    const { rows } = await db.query(
      'INSERT INTO movimientos_inventario (item_id, tipo_movimiento, cantidad, observaciones )VALUES ($1, $2, $3, $4) RETURNING *',
      [item_id, tipo_movimiento, cantidad, observaciones]
    );
    res.status(201).json(rows[0]);
    } catch (error) {
      console.error('Error al crear movimiento:', error);
      res.status(500).json({ error: 'Error al registrar el movimiento de inventario' });
    }
};




  
  