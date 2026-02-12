/**
 * Structured Logging Module
 *
 * Provides consistent logging across all StackShift components:
 * - Log levels (debug, info, warn, error)
 * - Structured context for each log entry
 * - Environment-aware output (JSON in production, pretty in dev)
 * - Silent mode for testing
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  component: string;
  message: string;
  context?: Record<string, unknown>;
}

export interface Logger {
  debug(message: string, context?: Record<string, unknown>): void;
  info(message: string, context?: Record<string, unknown>): void;
  warn(message: string, context?: Record<string, unknown>): void;
  error(message: string, context?: Record<string, unknown>): void;
  child(component: string): Logger;
}

/**
 * Log level priority (higher = more important)
 */
const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

/**
 * ANSI color codes for pretty printing
 */
const COLORS = {
  reset: '\x1b[0m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

/**
 * Get the current log level from environment
 */
function getMinLogLevel(): LogLevel {
  const envLevel = process.env.STACKSHIFT_LOG_LEVEL?.toLowerCase();
  if (envLevel && envLevel in LOG_LEVEL_PRIORITY) {
    return envLevel as LogLevel;
  }
  // Default to 'info' in production, 'debug' in development
  return process.env.NODE_ENV === 'production' ? 'info' : 'debug';
}

/**
 * Check if we should output JSON (for production/CI)
 */
function useJsonOutput(): boolean {
  return (
    process.env.STACKSHIFT_LOG_FORMAT === 'json' ||
    process.env.NODE_ENV === 'production' ||
    process.env.CI === 'true'
  );
}

/**
 * Check if logging is disabled (for tests)
 */
function isLoggingDisabled(): boolean {
  return (
    process.env.STACKSHIFT_LOG_SILENT === 'true' ||
    (process.env.NODE_ENV === 'test' && process.env.STACKSHIFT_LOG_LEVEL === undefined)
  );
}

/**
 * Format a log entry as JSON
 */
function formatJson(entry: LogEntry): string {
  return JSON.stringify(entry);
}

/**
 * Format a log entry for human-readable output
 */
function formatPretty(entry: LogEntry): string {
  const { timestamp, level, component, message, context } = entry;

  // Level colors
  const levelColors: Record<LogLevel, string> = {
    debug: COLORS.gray,
    info: COLORS.blue,
    warn: COLORS.yellow,
    error: COLORS.red,
  };

  const levelColor = levelColors[level];
  const levelStr = level.toUpperCase().padEnd(5);

  // Format timestamp (just time portion for readability)
  const time = timestamp.split('T')[1]?.split('.')[0] || timestamp;

  let output = `${COLORS.dim}${time}${COLORS.reset} ${levelColor}${levelStr}${COLORS.reset} ${COLORS.cyan}[${component}]${COLORS.reset} ${message}`;

  // Add context if present
  if (context && Object.keys(context).length > 0) {
    const contextStr = Object.entries(context)
      .map(([key, value]) => {
        const valueStr = typeof value === 'object' ? JSON.stringify(value) : String(value);
        return `${COLORS.dim}${key}=${COLORS.reset}${valueStr}`;
      })
      .join(' ');
    output += ` ${contextStr}`;
  }

  return output;
}

/**
 * Create a logger instance for a component
 *
 * @param component Name of the component (e.g., 'analyze', 'gap-analyzer')
 * @returns Logger instance
 */
export function createLogger(component: string): Logger {
  const minLevel = getMinLogLevel();
  const useJson = useJsonOutput();
  const silent = isLoggingDisabled();

  function log(level: LogLevel, message: string, context?: Record<string, unknown>): void {
    // Skip if silent or below minimum level
    if (silent || LOG_LEVEL_PRIORITY[level] < LOG_LEVEL_PRIORITY[minLevel]) {
      return;
    }

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      component,
      message,
      context,
    };

    const formatted = useJson ? formatJson(entry) : formatPretty(entry);

    // Use appropriate console method
    switch (level) {
      case 'error':
        console.error(formatted);
        break;
      case 'warn':
        console.warn(formatted);
        break;
      default:
        console.log(formatted);
    }
  }

  return {
    debug: (message, context) => log('debug', message, context),
    info: (message, context) => log('info', message, context),
    warn: (message, context) => log('warn', message, context),
    error: (message, context) => log('error', message, context),
    child: (childComponent: string) => createLogger(`${component}:${childComponent}`),
  };
}

/**
 * Create a silent logger (useful for testing)
 */
export function createSilentLogger(): Logger {
  const noop = () => {};
  return {
    debug: noop,
    info: noop,
    warn: noop,
    error: noop,
    child: () => createSilentLogger(),
  };
}

/**
 * Create a logger that collects entries (useful for testing)
 */
export function createCollectingLogger(): Logger & { entries: LogEntry[] } {
  const entries: LogEntry[] = [];

  function log(level: LogLevel, message: string, context?: Record<string, unknown>): void {
    entries.push({
      timestamp: new Date().toISOString(),
      level,
      component: 'test',
      message,
      context,
    });
  }

  return {
    entries,
    debug: (message, context) => log('debug', message, context),
    info: (message, context) => log('info', message, context),
    warn: (message, context) => log('warn', message, context),
    error: (message, context) => log('error', message, context),
    child: () => createCollectingLogger(),
  };
}

/**
 * Default logger for quick access
 */
export const logger = createLogger('stackshift');
