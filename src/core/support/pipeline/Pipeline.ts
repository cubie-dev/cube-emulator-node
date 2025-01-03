import { Container } from 'inversify';
import { Class } from 'utility-types';
import { isClass } from '../helpers/isClass';

export type Destination<T, R> = (event: T) => Promise<R | R[] | null>;
export type PipeFunction<T, R> = (event: T, next: Destination<T, R>) => Promise<R | R[] | null>;
export interface PipeClass<T, R> {
    handle(event: T, next: Destination<T, R>): Promise<R | R[] | null>;
}

export class Pipeline<T, R> {
    private payload: T;
    private pipes: Array<PipeFunction<T, R>|Class<PipeClass<T, R>>> = [];

    public constructor(
        private container: Container
    ) {}

    public send(payload: T): this {
        this.payload = payload;

        return this;
    }

    public through(pipes: Array<PipeFunction<T, R>|Class<PipeClass<T, R>>>): this {
        this.pipes = pipes;

        return this;
    }

    private runPipe() {
        return (initial, pipe: PipeFunction<T, R>) => {
            return (event: T) => {
                return pipe(event, initial);
            }
        }
    }

    public async then(destination: Destination<T, R>): Promise<R | R[] | null> {
        const pipeline = this.pipes
            .reverse()
            .reduce<Destination<T, R>>(
                (initial: Destination<T, R>, pipe: PipeFunction<T, R>) => {
                    return (event: T) => {
                        if (isClass(pipe)) {
                            return this.container
                                .resolve<PipeClass<T, R>>(pipe)
                                .handle(event, initial);
                        }

                        return pipe(event, initial);
                    };
                },
                (event: T) => destination(event)
            );

        return await pipeline(this.payload);
    }
}
