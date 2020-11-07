import path from 'path';
import csvParse from 'csv-parse';
import fs from 'fs';
import { getRepository, getCustomRepository } from 'typeorm';
import Transaction from '../models/Transaction';
import Category from '../models/Category';
import TransactionsRepository from '../repositories/TransactionsRepository';
import AppError from '../errors/AppError';

interface CSVTransaction {
  title: string,
  value: number;
  type: 'income'| 'outcome';
  category: string;
}
interface ImportedDTO {
  importedTransactions: CSVTransaction[],
  importedCategories: string[],
}

class ImportTransactionsService {
  async loadCSV(filePath: string): Promise<ImportedDTO> {
    const readCSVStream = fs.createReadStream(filePath);

    const parseStream = csvParse({
      from_line: 2,
      ltrim: true,
      rtrim: true,
    });

    const parseCSV = readCSVStream.pipe(parseStream);

    const transactions: CSVTransaction[] = [];
    const categories: string[] = [];

    parseCSV.on('data', line => {
      const [title, type, value, category] = line.map((cell: string) =>
       cell.trim()
      );

      if ( !title || !type || !value ) return;

      categories.push(category);
      transactions.push({ title, type, value, category });
    });

    await new Promise(resolve => {
      parseCSV.on('end', resolve);
    });

    return { importedTransactions: transactions , importedCategories: categories };
  }

  async execute(): Promise<Transaction[]> {
    const csvFilePath = path.resolve( __dirname, '..', '..', 'tmp', 'import_template.csv');
    const { importedTransactions, importedCategories } = await this.loadCSV(csvFilePath);

    const categoriesRepository = getRepository(Category);
    const transactionsRepository = getCustomRepository(TransactionsRepository);


    const allCategories = await categoriesRepository.find();

    const existentCategoriesTitle = allCategories.map(
      ( category: Category ) => category.title,
    );

    const filteredCategories = importedCategories
      .filter( category => ! existentCategoriesTitle.includes(category))
      .filter( (value, index, self ) => self.indexOf(value) === index );

    const newCategory = categoriesRepository.create(
      filteredCategories.map (title => ({
        title,
      })),
    );

    await categoriesRepository.save(newCategory);

    const newAllCategories = [ ...allCategories, ...newCategory];

    const transactions = importedTransactions.map((transaction) => {

      const category = newAllCategories.find((category) => {
        if (category.title === transaction.category ) return category
      })

      if ( ! category ) throw new AppError('Internal Service Error.');

      return {
        title: transaction.title,
        type: transaction.type,
        value: transaction.value,
        category_id: category.id,
      }
    })

    const { total: newBalace } = await transactionsRepository.getBalance(transactions);
    const { total: balance} = await transactionsRepository.getBalance(transactions);

    if ( (newBalace + balance) < 0 ) {
      throw new AppError('Insuficient resources to do that trasaction.');
    }

    let newTransactions = transactionsRepository.create(transactions);
    await transactionsRepository.save(newTransactions);

    return newTransactions;
  }
}

export default ImportTransactionsService;
