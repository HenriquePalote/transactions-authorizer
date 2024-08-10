export abstract class MerchantRepository {
  abstract findMCC(identifier: string): Promise<string>;
}
