import { type Class } from '../types/Class';

export const isClass = (check: any): check is Class<any> => {
    return typeof check === 'function' &&
        check.prototype !== undefined &&
        check.prototype.constructor === check;
}
