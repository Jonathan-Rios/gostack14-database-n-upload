import { Router } from 'express';
import { getRepository } from 'typeorm';
import Category from '../models/Category';

const categoriesRouter = Router();

categoriesRouter.get('/', async (request, response) => {
  // TODO
  const categoriesRepository = getRepository(Category);
  const categories = await categoriesRepository.find();

  return response.json(categories);
});

export default categoriesRouter;
