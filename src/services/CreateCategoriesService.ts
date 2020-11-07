import { getRepository, getCustomRepository } from 'typeorm';
import Category from '../models/Category';


class CreateCategoriesService {
  public async execute(title: string): Promise<Category> {

    const categoriesRepository = getRepository(Category);

    let category = await categoriesRepository.findOne({
      where: { title: title },
    });

    if (!category) {
      category = categoriesRepository.create({ title: title });
      await categoriesRepository.save(category);
    }

    return category;
  }
}

export default CreateCategoriesService;
