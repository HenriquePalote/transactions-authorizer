export const retry = async <T>(
  maxTimes: number,
  callback: () => Promise<T>,
) => {
  let times = 0;
  while (true) {
    try {
      const result = await callback();
      return result;
    } catch (error) {
      times++;

      if (times >= maxTimes) {
        throw error;
      }
    }
  }
};
