import { Observable } from 'rxjs';

export interface ValidationMetadata {
  duration: number;
  format: string;
  bitrate: number;
  frequency: number;
}

export interface AudioValidation {
  validate(): Observable<ValidationMetadata>;
}
