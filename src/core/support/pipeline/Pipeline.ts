import { Container } from 'inversify';
import { type Class } from '../Class';

export type Destination<TOut, TFinal> = (value: TOut) => Promise<TFinal | null>;

// TIn:    what this pipe receives
// TOut:   what it passes to next()
// TInner: what next() returns (the inner chain's result)
// TOuter: what handle() returns to its caller (defaults to TInner for pass-through pipes)
export interface PipeClass<TIn, TOut, TInner, TOuter = TInner> {
    handle(input: TIn, next: Destination<TOut, TInner>): Promise<TOuter | null>;
}

export class PipelineBuilder<TCurrent, TInner, TOuter> {
    public constructor(
        private readonly container: Container,
        private readonly runner: (destination: Destination<TCurrent, TInner>) => Promise<TOuter | null>,
    ) {}

    // Regular pipe: passes TInner through unchanged (TOuter stays the same)
    public pipe<TNext>(
        pipeClass: Class<PipeClass<TCurrent, TNext, TInner>>,
    ): PipelineBuilder<TNext, TInner, TOuter> {
        return new PipelineBuilder<TNext, TInner, TOuter>(
            this.container,
            (destination) =>
                this.runner((current) =>
                    this.container
                        .get<PipeClass<TCurrent, TNext, TInner>>(pipeClass)
                        .handle(current, destination)
                ),
        );
    }

    // Wrapping pipe: transforms TInner → TNewInner for the inner chain, while TOuter stays fixed
    public wrap<TNext, TNewInner>(
        pipeClass: Class<PipeClass<TCurrent, TNext, TNewInner, TInner>>,
    ): PipelineBuilder<TNext, TNewInner, TOuter> {
        return new PipelineBuilder<TNext, TNewInner, TOuter>(
            this.container,
            (destination) =>
                this.runner((current) =>
                    this.container
                        .get<PipeClass<TCurrent, TNext, TNewInner, TInner>>(pipeClass)
                        .handle(current, destination)
                ),
        );
    }

    public then(destination: Destination<TCurrent, TInner>): Promise<TOuter | null> {
        return this.runner(destination);
    }
}

export class Pipeline<TInitial, TFinal> {
    public constructor(private readonly container: Container) {}

    public send(payload: TInitial): PipelineBuilder<TInitial, TFinal, TFinal> {
        return new PipelineBuilder<TInitial, TFinal, TFinal>(
            this.container,
            (destination) => destination(payload),
        );
    }
}
