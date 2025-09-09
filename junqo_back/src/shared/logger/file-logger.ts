import { Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export class FileLogger extends Logger {
  private logPath: string;

  constructor(context?: string) {
    super(context);
    this.logPath = process.env.LOG_PATH || '/var/log/junqo/back.log';

    // Ensure log directory exists
    const logDir = path.dirname(this.logPath);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  private writeToFile(message: string, level: string) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${level}] ${this.context ? `[${this.context}] ` : ''}${message}\n`;

    try {
      fs.appendFileSync(this.logPath, logEntry);
    } catch (error) {
      // Fallback to console if file writing fails
      console.error('Failed to write to log file:', error);
      console.log(logEntry.trim());
    }
  }

  log(message: any, context?: string) {
    super.log(message, context);
    this.writeToFile(message, 'LOG');
  }

  error(message: any, trace?: string, context?: string) {
    super.error(message, trace, context);
    this.writeToFile(`${message} ${trace ? `\nTrace: ${trace}` : ''}`, 'ERROR');
  }

  warn(message: any, context?: string) {
    super.warn(message, context);
    this.writeToFile(message, 'WARN');
  }

  debug(message: any, context?: string) {
    super.debug(message, context);
    this.writeToFile(message, 'DEBUG');
  }

  verbose(message: any, context?: string) {
    super.verbose(message, context);
    this.writeToFile(message, 'VERBOSE');
  }
}
