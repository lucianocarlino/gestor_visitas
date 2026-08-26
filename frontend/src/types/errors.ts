/**
 * Semantic Domain Exceptions for Visit Manager
 * Adheres strictly to SDD and Clean Code specifications
 */

export abstract class DomainError extends Error {
  public abstract readonly statusCode: number;
  public readonly code: string;

  constructor(message: string, code: string) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ValidationError extends DomainError {
  public readonly statusCode = 400;
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR');
  }
}

export class NotFoundError extends DomainError {
  public readonly statusCode = 404;
  constructor(entity: string, identifier: string | number) {
    super(`${entity} with identifier '${identifier}' not found`, 'NOT_FOUND');
  }
}

export class InsufficientStockError extends DomainError {
  public readonly statusCode = 409;
  constructor(item: string, available: number, requested: number) {
    super(
      `Insufficient stock for '${item}'. Available: ${available}, Requested: ${requested}`,
      'INSUFFICIENT_STOCK'
    );
  }
}

export class ConflictError extends DomainError {
  public readonly statusCode = 409;
  constructor(message: string) {
    super(message, 'CONFLICT_ERROR');
  }
}

export class AuthenticationError extends DomainError {
  public readonly statusCode = 401;
  constructor(message: string = 'Authentication required') {
    super(message, 'AUTHENTICATION_ERROR');
  }
}

export class ExternalSyncError extends DomainError {
  public readonly statusCode = 502;
  constructor(provider: string, details: string) {
    super(`External synchronization failed for ${provider}: ${details}`, 'EXTERNAL_SYNC_ERROR');
  }
}
