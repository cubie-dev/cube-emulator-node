import type { Primitive } from '../support/helpers/Primitive.ts';
import { Composable } from './composers/Composable.ts';

export type ComposableData = Primitive | Primitive[] | Record<string|number, Primitive> | Composable | ArrayBuffer;

export function isComposable(item: ComposableData): item is Composable {
    return item instanceof Composable;
}

export function isMap(item: ComposableData): item is Record<string|number, Primitive> {
    return typeof item === 'object'
        && item !== null
        && !Array.isArray(item)
        && !(item instanceof Composable)
        && !(item instanceof ArrayBuffer);
}