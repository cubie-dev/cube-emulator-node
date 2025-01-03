import { Class } from 'utility-types';

export const isClass = (check: any): check is Class<any> => {
    return typeof check === 'function' &&
        check.prototype !== undefined &&
        check.prototype.constructor === check;
}
