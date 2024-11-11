import { Logger, Injectable, Inject } from "@nestjs/common";
import * as winston from "winston";
import * as DailyRotateFile from "winston-daily-rotate-file";
import * as moment from "moment";
import * as fs from "fs";
import * as path from "path";
import { ConfigurationService } from "../config/config.service";

@Injectable()
export class LoggingService extends Logger {
  private timeStampFormat = "YYYY-MM-DDTHH:mm:ss.SSSZ";
  private LOG_PATH: string;
  private silent: boolean;
  private LOG_LEVEL: string;
  private opt: any;
  private logger: any;

  constructor(private readonly config: ConfigurationService) {
    super();
    this.LOG_LEVEL = config.get("LOG_LEVEL");
    this.silent = config.get("ENABLE_LOGGING") ? false : true;
    this.LOG_PATH = config.get("LOG_PATH");

    const errorStackTracerFormat = winston.format((info) => {
      if (info.error instanceof Error) {
        info.message = `${info.message} ${info.error.stack}`;
      }
      return info;
    });

    this.opt = {
      filename: path.join(this.LOG_PATH, "%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      level: this.LOG_LEVEL,
      maxSize: "20m",
      maxFiles: "7d",
      silent: this.silent,
    };

    this.logger = winston.createLogger({
      format: winston.format.combine(
        winston.format.timestamp({ format: this.timeStampFormat }),
        errorStackTracerFormat(),
        winston.format.simple()
      ),
      transports: [
        new winston.transports.Console(),
        new DailyRotateFile(this.opt),
      ],
    });

    if (this.silent) {
      this.logger.transports.forEach((t) => (t.silent = true));
    }
  }

  log(message: string) {
    const logMessage = {
      message,
      level: "debug",
      timestamp: moment().format(this.timeStampFormat),
      service: "admin-service",
    };
    fs.appendFile(
      path.join(this.LOG_PATH, moment().format("YYYY-MM-DD") + ".log"),
      JSON.stringify(logMessage) + "\n",
      (err) => {
        if (err) throw err;
        console.log("File saved: log");
      }
    );
    super.log(message);
    this.logger.debug(message);
  }

  error(message: string, trace: any) {
    const logMessage = {
      message,
      trace: JSON.stringify(trace),
      level: "error",
      timestamp: moment().format(this.timeStampFormat),
      service: "auth-service",
    };
    fs.appendFile(
      path.join(this.LOG_PATH, moment().format("YYYY-MM-DD") + ".log"),
      JSON.stringify(logMessage) + "\n",
      (err) => {
        if (err) throw err;
        console.log("File saved: error");
      }
    );
    super.error(message, trace);
    this.logger.error(message, { error: trace });
  }

  warn(message: string) {
    const logMessage = {
      message,
      level: "warn",
      timestamp: moment().format(this.timeStampFormat),
      service: "admin-service",
    };
    fs.appendFile(
      path.join(this.LOG_PATH, moment().format("YYYY-MM-DD") + ".log"),
      JSON.stringify(logMessage) + "\n",
      (err) => {
        if (err) throw err;
        console.log("File saved: warn");
      }
    );
    super.warn(message);
    this.logger.warn(message);
  }
}
