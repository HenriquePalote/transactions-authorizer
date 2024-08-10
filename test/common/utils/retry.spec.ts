import { retry } from '@app/common/utils/retry';

describe('retry', () => {
  it('should return callback return when callback executes with succes', async () => {
    const result = await retry(5, async () => {
      return 'callbackResult';
    });

    expect(result).toBe('callbackResult');
  });

  it("should try 5 times and throw error when callback doesn't execute with success", async () => {
    let times = 0;
    const callback = async () => {
      times++;
      throw new Error('callbackError');
    };

    await expect(retry(5, callback)).rejects.toEqual(
      new Error('callbackError'),
    );
    expect(times).toBe(5);
  });
});
