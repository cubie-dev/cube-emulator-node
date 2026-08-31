import { type Class } from '../Class';

export const isClass = (check: any): check is Class<any> => {
    return typeof check === 'function' &&
        check.prototype !== undefined &&
        check.prototype.constructor === check;
}
