export class Helpers {
  static firstLetterUppercase(str: string): string {
    const valueString = str.toLowerCase();
    return valueString
      .split(' ')
      .map((value: string) => `${value.charAt(0).toUpperCase()}${value.slice(1).toLowerCase()}`)
      .join(' ');
  }
  static lowerCase(str: string): string {
    return str.toLowerCase();
  }
  static generateRandomIntegers(length: number, min = 0, max = 100): number[] {
    const result: number[] = [];
    for (let i = 0; i < length; i++) {
      const randomInt = Math.floor(Math.random() * (max - min + 1)) + min;
      result.push(randomInt);
    }
    return result;
  }
}
