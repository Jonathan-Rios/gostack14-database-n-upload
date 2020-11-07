import { Router } from 'express';

import transactionsRouter from './transactions.routes';
import categoriesRouter from './categories.routes';

const routes = Router();

routes.use('/transactions', transactionsRouter);
routes.use('/categories', categoriesRouter);

export default routes;
