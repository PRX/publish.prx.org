import { BaseInvalid, BaseModel } from 'ngx-prx-styleguide';

/**
 * Make sure a relation exists
 */
export const RELATIONS = (msg?: string): BaseInvalid => {
  return <BaseInvalid> (key: string, models: BaseModel[], strict: boolean) => {
    if (strict) {
      if (!models || models.length === 0 || models.every(m => m.isDestroy)) {
        return msg || `${key} is required`;
      }
    }
    return null;
  };
};
