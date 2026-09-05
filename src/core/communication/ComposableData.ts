import type { Primitive } from '../support/helpers/Primitive.ts';
import type { Composable } from './composers/Composable.ts';

export type ComposableData = Primitive | Primitive[] | Record<string|number, Primitive> | Composable | ArrayBuffer;