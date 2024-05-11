export class EnvironmentUtil {
  public static isDevMode(): boolean {
    return process.env.NODE_ENV === 'development';
  }
}
