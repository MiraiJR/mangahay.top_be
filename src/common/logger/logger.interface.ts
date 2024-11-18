type LogLevel = 'error' | 'warn' | 'info';

export interface LoggerInterface {
  timestamp: Date;
  message: string;
  level: LogLevel;
  error_code: string;
  back_trace: string;
  root_cause: string;
}
