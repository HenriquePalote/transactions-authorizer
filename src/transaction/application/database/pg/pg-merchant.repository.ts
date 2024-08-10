import { KnexWrapper } from '@app/common/database/knex.wrapper';
import { Injectable } from '@nestjs/common';
import { MerchantRepository } from '@app/transaction/domain/repository/merchant.repository';
import { Knex } from 'knex';

export interface MerchantSchema {
  identifier: string;
  name: string;
  mcc: string;
}

@Injectable()
export class PGMerchantRepository implements MerchantRepository {
  private readonly databaseClient: Knex;

  constructor(knewWrapper: KnexWrapper) {
    this.databaseClient = knewWrapper.getKnexClient();
  }

  async findMCC(identifier: string): Promise<string> {
    const result = await this.databaseClient
      .select<MerchantSchema>()
      .where({ identifier })
      .from('merchants')
      .first();
    const merchantData = result;
    return merchantData?.mcc;
  }
}
