import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

interface TransactionDTO {
  title: string,
  value: number;
  type: 'income'| 'outcome';
  category_id: string;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(transactions?: TransactionDTO[]): Promise<Balance> {

    let transactionsList: TransactionDTO[] = [];

    transactionsList = transactions ? transactions : await this.find();

    const balance = transactionsList.reduce(
      (accumulator: Balance, transaction: TransactionDTO) => {
        switch (transaction.type) {
          case 'income':
            accumulator.income += Number(transaction.value);
            break;
          case 'outcome':
            accumulator.outcome += Number(transaction.value);
            break;
          default:
            break;
        }
        accumulator.total = accumulator.income - accumulator.outcome;
        return accumulator;
      },
      {
        income: 0,
        outcome: 0,
        total: 0,
      },
    );

    return balance;
  }
}

export default TransactionsRepository;
