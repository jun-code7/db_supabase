// routes/inventario.js
import express from 'express';
import {
  obtenerCategorias,
  crearCategoria,
  obtenerItems,
  crearItem,
  obtenerMovimientos,
  crearMovimiento,
  actualizarItem,
  eliminarItem,
  actualizarCategoria,
  eliminarCategoria
} from '../controllers/inventarioController.js';

const router = express.Router();

// Categorías
router.get('/categorias', obtenerCategorias);
router.post('/categorias', crearCategoria);
router.put('/categorias/:id', actualizarCategoria);
router.delete('/categorias/:id', eliminarCategoria);


// Items
router.get('/items', obtenerItems);
router.post('/items', crearItem);
router.put('/items/:id', actualizarItem); 
router.delete('/items/:id', eliminarItem); 

// Movimientos de inventario
router.get('/movimientos', obtenerMovimientos);
router.post('/movimientos', crearMovimiento);


export default router;
