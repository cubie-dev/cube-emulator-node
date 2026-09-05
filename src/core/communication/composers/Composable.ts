import type { ComposableData } from '../ComposableData.ts';

export abstract class Composable {
    abstract getData(): ComposableData[];
}
