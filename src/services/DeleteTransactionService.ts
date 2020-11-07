import { getRepository } from "typeorm";
import Transaction from "../models/Transaction";

class DeleteTransactionService {
  public async execute( id: string ): Promise<void> {
    const transactionsRepository = getRepository(Transaction);
    await transactionsRepository.delete(id);
  }
}

export default DeleteTransactionService;
