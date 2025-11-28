import { Router } from 'express';
import { addDocument, searchDocuments, getVectorById } from '../controllers/vectorController';

const router = Router();

router.post('/add', addDocument);
router.post('/search', searchDocuments);
router.get('/vector/:id', getVectorById);

export default router;